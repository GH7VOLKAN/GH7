/**
 * POST /api/analiz/analyze — Shazam flow'un tek endpoint'i.
 */

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { runAnalyzePipeline } from "@/lib/ai/analyze-pipeline";
import { prisma } from "@/lib/db";
import type { AnalyzeInput, AnalyzeResult, Door } from "@/lib/analiz/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const TTL_SECONDS = 60 * 60 * 24 * 7;
const VALID_DOORS: Door[] = ["firma", "kisi", "eticaret", "yurtdisi"];

export async function POST(req: Request) {
  let body: Partial<AnalyzeInput> & { profileId?: string };
  try {
    body = (await req.json()) as Partial<AnalyzeInput> & { profileId?: string };
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { door, domain, fullName, city, targetMarket, targetLanguage, forceRefresh, profileId } = body;

  if (!door || !VALID_DOORS.includes(door)) {
    return NextResponse.json({ error: "Geçersiz door" }, { status: 400 });
  }

  if ((door === "firma" || door === "eticaret" || door === "yurtdisi") && !domain) {
    return NextResponse.json({ error: "Domain gerekli" }, { status: 400 });
  }

  if (door === "kisi" && (!fullName || !city)) {
    return NextResponse.json(
      { error: "Kişi için ad soyad ve şehir gerekli" },
      { status: 400 },
    );
  }

  if (door === "yurtdisi" && !targetMarket) {
    return NextResponse.json(
      { error: "Yurt dışı için hedef pazar gerekli" },
      { status: 400 },
    );
  }

  const input: AnalyzeInput = {
    door,
    domain: domain?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, ""),
    fullName: fullName?.trim(),
    city: city?.trim(),
    targetMarket: targetMarket?.trim(),
    targetLanguage: targetLanguage?.trim(),
    forceRefresh,
  };

  const cacheKey = buildCacheKey(input);

  if (!input.forceRefresh) {
    const cached = await readCache(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  try {
    const result = await runAnalyzePipeline(input);

    // Profile'ı güncelle: ücretsiz analiz kullanıldı işareti
    if (profileId) {
      try {
        await prisma.profile.update({
          where: { id: profileId },
          data: {
            freeAuditUsed: true,
            freeAuditUsedAt: new Date(),
          },
        });
        console.log(`[analyze] Profile ${profileId} freeAuditUsed=true`);
      } catch (err) {
        console.error("[analyze] Profile update failed:", err);
        // Analiz sonucu etkilenmesin, sadece log
      }
    }

    await writeCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze] pipeline failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildCacheKey(input: AnalyzeInput): string {
  const normalized = JSON.stringify({
    door: input.door,
    domain: input.domain ?? "",
    fullName: input.fullName ?? "",
    city: input.city ?? "",
    targetMarket: input.targetMarket ?? "",
    targetLanguage: input.targetLanguage ?? "",
  });
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 12);
  return `analyze:v3:${input.door}:${hash}`;
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

async function readCache(key: string): Promise<AnalyzeResult | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    return (await redis.get<AnalyzeResult>(key)) ?? null;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: AnalyzeResult): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(key, value, { ex: TTL_SECONDS });
  } catch {
    // silent
  }
}
