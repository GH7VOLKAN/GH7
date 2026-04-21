/**
 * POST /api/analiz/run
 *
 * Aşama 5 (ana motor): 2-endpoint mimarisinin çalışan yarısı.
 * Detect'ten gelen ürünler + kullanıcının seçtiği illerle sorgu üretir,
 * 5 AI'a paralel gönderir, cevapları parse eder, rakip adaylarını çıkarır.
 *
 * Input:
 *   {
 *     domain: string,
 *     brandName?: string,
 *     door: "firma" | "kisi" | "eticaret" | "yurtdisi",
 *     sector?: string,
 *     products: string[],          // kullanıcının onayladığı 1-3 ürün (name listesi)
 *     cities?: string[],           // firma/kişi için
 *     targetMarket?: string,       // yurtdisi için
 *     targetLanguage?: string,     // yurtdisi için
 *     forceRefresh?: boolean,      // Pro: cache bypass
 *   }
 *
 * Output:
 *   {
 *     yourDomain, yourBrandName,
 *     queries: [{id, text, answers: [{provider, text, mentionedYou, mentionedCompetitors, ...}]}],
 *     userMentions: {totalMentions, byQuery: {q1: [providers], ...}},
 *     candidateCompetitors: [{name, mentionCount, queryIds, providers}],
 *     generatedAt, cached
 *   }
 *
 * Cache: run:v2:<domain>::<hash(door+products+cities+targetMarket)>, 7 gün.
 * 43-madde audit SCOPE DIŞI — ayrı endpoint olacak.
 */

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { generateRunQueries, type QueryGenDoor } from "@/lib/ai/query-generator-v2";
import { fanoutQueries } from "@/lib/ai/multi-ai-fanout";
import { extractCompetitorsFromAnswers } from "@/lib/ai/competitor-extractor";
import { isValidDomain, normalizeDomain, brandNameFromDomain } from "@/lib/analiz/domain";
import type { RunResult, QueryResult, QueryAnswer } from "@/lib/analiz/types";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  domain?: string;
  brandName?: string;
  door?: string;
  sector?: string;
  products?: string[];
  cities?: string[];
  targetMarket?: string;
  targetLanguage?: string;
  forceRefresh?: boolean;
};

const VALID_DOORS = ["firma", "kisi", "eticaret", "yurtdisi"] as const;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { domain, door, products, forceRefresh } = body;

  // Validation
  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json({ error: "Geçersiz domain" }, { status: 400 });
  }
  if (!door || !VALID_DOORS.includes(door as QueryGenDoor)) {
    return NextResponse.json({ error: "Geçersiz door" }, { status: 400 });
  }
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json({ error: "En az bir ürün gerekli" }, { status: 400 });
  }
  if (products.length > 3) {
    return NextResponse.json(
      { error: "En fazla 3 ürün (free tier)" },
      { status: 400 },
    );
  }

  const normalizedDomain = normalizeDomain(domain);
  const brandName = body.brandName || brandNameFromDomain(normalizedDomain);
  const typedDoor = door as QueryGenDoor;

  // ─── Cache key ─────────────────────────────────────────
  const cacheKey = buildCacheKey({
    domain: normalizedDomain,
    door: typedDoor,
    products,
    cities: body.cities,
    targetMarket: body.targetMarket,
  });

  // ─── Cache HIT? ────────────────────────────────────────
  if (!forceRefresh) {
    const cached = await readCache(cacheKey);
    if (cached) {
      console.log(`[run] Cache HIT: ${cacheKey}`);
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  const t0 = Date.now();

  // ─── Step 1: Query generation ──────────────────────────
  console.log(`[run] Step 1/3: generating queries (${typedDoor}, ${products.length} products)`);
  const queries = await generateRunQueries({
    door: typedDoor,
    brandDomain: normalizedDomain,
    brandName,
    sector: body.sector,
    products,
    cities: body.cities,
    targetMarket: body.targetMarket,
    targetLanguage: body.targetLanguage,
  });

  if (queries.length === 0) {
    return NextResponse.json(
      { error: "Sorgu üretilemedi (query generator hatası)" },
      { status: 500 },
    );
  }

  console.log(`[run] Step 1/3 done: ${queries.length} queries in ${Date.now() - t0}ms`);

  // ─── Step 2: Fanout 5 AI ───────────────────────────────
  const t1 = Date.now();
  console.log(`[run] Step 2/3: fanout to 5 AI providers (${queries.length * 5} calls)`);
  const fanoutResults = await fanoutQueries(queries);
  console.log(`[run] Step 2/3 done in ${Date.now() - t1}ms`);

  // ─── Step 3: Extract competitors (Opus okur) ───────────
  const t2 = Date.now();
  console.log(`[run] Step 3/3: extracting competitors from answers`);
  const { candidates, userMentions } = await extractCompetitorsFromAnswers(
    fanoutResults,
    brandName,
    normalizedDomain,
  );
  console.log(`[run] Step 3/3 done in ${Date.now() - t2}ms — ${candidates.length} candidates, ${userMentions.totalMentions} user mentions`);

  // ─── Enrich answers with mention flags ─────────────────
  const enrichedQueries: QueryResult[] = fanoutResults.map((q) => {
    const userProvsForThisQuery = userMentions.byQuery[q.queryId] ?? [];

    const enrichedAnswers: QueryAnswer[] = q.answers.map((a) => {
      const mentionedYou = userProvsForThisQuery.includes(a.provider);

      // Hangi rakipler bu cevapta? Opus'un çıkardığı listeye göre.
      const mentionedCompetitors = candidates
        .filter(
          (c) =>
            c.queryIds.includes(q.queryId) &&
            c.providers.includes(a.provider),
        )
        .map((c) => c.name);

      return {
        provider: a.provider,
        text: a.text,
        error: a.error,
        latencyMs: a.latencyMs,
        mentionedYou,
        mentionedCompetitors,
      };
    });

    return {
      id: q.queryId,
      text: q.queryText,
      answers: enrichedAnswers,
    };
  });

  const result: RunResult = {
    yourDomain: normalizedDomain,
    yourBrandName: brandName,
    queries: enrichedQueries,
    userMentions,
    candidateCompetitors: candidates,
    generatedAt: new Date().toISOString(),
    cached: false,
  };

  console.log(`[run] Total: ${Date.now() - t0}ms`);

  // ─── Cache write ───────────────────────────────────────
  await writeCache(cacheKey, result);

  return NextResponse.json(result);
}

// ═══════════════════════════════════════════════════════════
// Cache helpers (local — run için ayrı prefix)
// ═══════════════════════════════════════════════════════════

function buildCacheKey(params: {
  domain: string;
  door: string;
  products: string[];
  cities?: string[];
  targetMarket?: string;
}): string {
  const normalized = JSON.stringify({
    door: params.door,
    products: [...params.products].sort(),
    cities: params.cities ? [...params.cities].sort() : [],
    targetMarket: params.targetMarket ?? "",
  });
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
  return `run:v2:${params.domain}::${hash}`;
}

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  if (redisSingleton) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

async function readCache(key: string): Promise<RunResult | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return (await redis.get<RunResult>(key)) ?? null;
  } catch (err) {
    console.warn("[run/cache] read failed:", err);
    return null;
  }
}

async function writeCache(key: string, value: RunResult): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, value, { ex: 60 * 60 * 24 * 7 });
  } catch (err) {
    console.warn("[run/cache] write failed:", err);
  }
}
