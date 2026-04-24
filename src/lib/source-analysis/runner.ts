/**
 * Source analysis runner — Brief N v4 Aşama 6.
 *
 * Orchestrator:
 *  1. Given extracted source URLs + brand + competitors
 *  2. Check DB cache (24h SourceAnalysis.cachedUntil)
 *  3. Cache miss → fetch URL + analyze + upsert SourceAnalysis
 *  4. Return aggregated outcomes
 *
 * Kullanım:
 *   - Category funnel runner'ından sonra: her TrackingResult için extract
 *     ve analyze
 *   - Marka başına toplu: runSourceAnalysisForBrand(brandId)
 *   - İlgili scoring: scoreSourceDominance(sources)
 */

import { prisma } from "@/lib/db";
import {
  extractSourcesFromResponse,
  extractDomain,
  type ExtractedSource,
} from "./source-extractor";
import { fetchSource } from "./url-fetcher";
import {
  analyzeFetchedSource,
  type SourceAnalysisOutcome,
} from "./source-analyzer";
import type { AIResponse } from "@/lib/ai/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

export type SourceRunInput = {
  brandId: string;
  brandName: string;
  brandAliases?: string[];
  competitors: Array<{ name: string }>;
};

export type AnalyzedSource = SourceAnalysisOutcome & {
  url: string;
  domain: string;
  sourceAnalysisId: string;
};

// ─────────────────────────────────────────────────────
// Tek URL'nin cache-aware analizi
// ─────────────────────────────────────────────────────

async function ensureAnalyzed(
  input: SourceRunInput,
  url: string,
  discoveredVia?: string | null,
  discoveredAtStep?: number | null,
): Promise<AnalyzedSource> {
  const domain = extractDomain(url);
  const now = new Date();

  // Cache hit?
  const existing = await prisma.sourceAnalysis.findUnique({
    where: { brandId_url: { brandId: input.brandId, url } },
  });

  if (
    existing &&
    existing.cachedUntil &&
    existing.cachedUntil > now &&
    existing.status === "analyzed"
  ) {
    return {
      sourceAnalysisId: existing.id,
      url: existing.url,
      domain: existing.domain,
      status: existing.status as "analyzed" | "unreachable",
      mentionsBrand: existing.mentionsBrand,
      mentionedCompetitors: Array.isArray(existing.mentionedCompetitors)
        ? (existing.mentionedCompetitors as string[])
        : [],
      qualitySignals: (existing.qualitySignals as AnalyzedSource["qualitySignals"]) ?? {
        hasImages: false,
        hasReviews: false,
        hasRating: false,
        textLength: 0,
      },
    };
  }

  // Miss — fetch + analyze
  const fetchResult = await fetchSource(url);
  const outcome = analyzeFetchedSource(
    fetchResult,
    input.brandName,
    input.brandAliases ?? [],
    input.competitors,
  );

  const cachedUntil = new Date(now.getTime() + CACHE_TTL_MS);

  const record = await prisma.sourceAnalysis.upsert({
    where: { brandId_url: { brandId: input.brandId, url } },
    create: {
      brandId: input.brandId,
      url,
      domain,
      discoveredVia: discoveredVia ?? undefined,
      discoveredAtStep: discoveredAtStep ?? undefined,
      mentionsBrand: outcome.mentionsBrand,
      mentionedCompetitors: outcome.mentionedCompetitors,
      qualitySignals: outcome.qualitySignals,
      status: outcome.status,
      analyzedAt: outcome.status === "analyzed" ? now : null,
      cachedUntil,
    },
    update: {
      mentionsBrand: outcome.mentionsBrand,
      mentionedCompetitors: outcome.mentionedCompetitors,
      qualitySignals: outcome.qualitySignals,
      status: outcome.status,
      analyzedAt: outcome.status === "analyzed" ? now : null,
      cachedUntil,
      // Eski discoveredVia'yı bozma — sadece ilk keşifte set
    },
    select: { id: true, url: true, domain: true },
  });

  return {
    sourceAnalysisId: record.id,
    url: record.url,
    domain: record.domain,
    status: outcome.status,
    mentionsBrand: outcome.mentionsBrand,
    mentionedCompetitors: outcome.mentionedCompetitors,
    qualitySignals: outcome.qualitySignals,
    reason: outcome.reason,
  };
}

// ─────────────────────────────────────────────────────
// Bulk: çoklu URL paralel
// ─────────────────────────────────────────────────────

export async function analyzeSources(
  input: SourceRunInput,
  sources: ExtractedSource[],
  context?: { trackedQueryId?: string; step?: number },
): Promise<AnalyzedSource[]> {
  // Paralellik sınırı: 5 — çok yüksek paralellik bot blokuna takılır
  const PARALLEL = 5;
  const results: AnalyzedSource[] = [];

  for (let i = 0; i < sources.length; i += PARALLEL) {
    const chunk = sources.slice(i, i + PARALLEL);
    const chunkResults = await Promise.all(
      chunk.map((s) =>
        ensureAnalyzed(
          input,
          s.url,
          context?.trackedQueryId ?? null,
          context?.step ?? null,
        ),
      ),
    );
    results.push(...chunkResults);
  }

  return results;
}

// ─────────────────────────────────────────────────────
// Response → kaynak analizi (funnel step'i sırasında)
// ─────────────────────────────────────────────────────

export async function analyzeSourcesForResponse(
  input: SourceRunInput,
  response: AIResponse,
  context?: { trackedQueryId?: string; step?: number },
): Promise<AnalyzedSource[]> {
  const sources = extractSourcesFromResponse(response);
  if (sources.length === 0) return [];
  return analyzeSources(input, sources, context);
}

// ─────────────────────────────────────────────────────
// Marka için tüm TrackingResult.sources JSON alanlarından analiz
// ─────────────────────────────────────────────────────

/**
 * Marka için son haftadaki tüm kategori TrackingResult kayıtlarından
 * kaynakları toplayıp analiz eder. Aşama 7 onboarding + Brief I cron
 * tetikleyecek.
 */
export async function runSourceAnalysisForBrand(
  brandId: string,
): Promise<{ analyzed: number; unreachable: number; total: number }> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: {
      name: true,
      competitors: {
        select: { name: true },
      },
    },
  });
  if (!brand) throw new Error(`Brand not found: ${brandId}`);

  // Son 7 gündeki kategori tracking result'lardan sources topla
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const results = await prisma.trackingResult.findMany({
    where: {
      checkedAt: { gte: weekAgo },
      trackedQuery: { brandId, category: "CATEGORY" },
    },
    select: {
      id: true,
      trackedQueryId: true,
      sources: true,
    },
  });

  const urlToTrackedQuery = new Map<string, { trackedQueryId: string }>();
  for (const r of results) {
    const srcs = r.sources as Array<{ url?: string }> | null;
    if (!Array.isArray(srcs)) continue;
    for (const s of srcs) {
      if (typeof s?.url === "string" && !urlToTrackedQuery.has(s.url)) {
        urlToTrackedQuery.set(s.url, { trackedQueryId: r.trackedQueryId });
      }
    }
  }

  if (urlToTrackedQuery.size === 0) {
    return { analyzed: 0, unreachable: 0, total: 0 };
  }

  const input: SourceRunInput = {
    brandId,
    brandName: brand.name,
    competitors: brand.competitors,
  };

  const sources: ExtractedSource[] = [...urlToTrackedQuery.keys()].map((url) => ({
    url,
    domain: extractDomain(url),
    platform: "aggregate",
  }));

  const outcomes = await analyzeSources(input, sources);

  const analyzed = outcomes.filter((o) => o.status === "analyzed").length;
  const unreachable = outcomes.filter((o) => o.status === "unreachable").length;
  return { analyzed, unreachable, total: outcomes.length };
}
