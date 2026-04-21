/**
 * Perplexity/AI çağrılarının sonuçlarını cache'leyen yardımcı modül.
 *
 * 2 cache alanı:
 *   1) Product competitors (7 gün)  — key: competitors:v1:<domain>::<productId>
 *   2) Full analysis (7 gün)        — key: analiz:v1:<domain>::<productId>::<competitor>
 *
 * Upstash env yoksa silent fail — dev ortamı bozulmaz.
 * Pro kullanıcılar `forceRefresh: true` ile bypass edebilmeli (caller sorumluluğu).
 */

import { Redis } from "@upstash/redis";
import type { AnalysisResult } from "./types";
import { normalizeDomain } from "./domain";
import type { ProductCompetitorsResult } from "@/lib/ai/product-competitors";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 gün

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  if (redisSingleton) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

// ═══════════════════════════════════════════════════════════
// Analysis cache (existing)
// ═══════════════════════════════════════════════════════════

function analysisKey(yourDomain: string, productId: string, competitorDomain: string) {
  const y = normalizeDomain(yourDomain);
  const c = normalizeDomain(competitorDomain);
  return `analiz:v1:${y}::${productId}::${c}`;
}

export async function getCachedAnalysis(
  yourDomain: string,
  productId: string,
  competitorDomain: string,
): Promise<AnalysisResult | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const value = await redis.get<AnalysisResult>(
      analysisKey(yourDomain, productId, competitorDomain),
    );
    if (!value) return null;
    return { ...value, cached: true };
  } catch (err) {
    console.warn("[cache] analysis read failed:", err);
    return null;
  }
}

export async function setCachedAnalysis(
  yourDomain: string,
  productId: string,
  competitorDomain: string,
  result: AnalysisResult,
): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(
      analysisKey(yourDomain, productId, competitorDomain),
      result,
      { ex: TTL_SECONDS },
    );
  } catch (err) {
    console.warn("[cache] analysis write failed:", err);
  }
}

// ═══════════════════════════════════════════════════════════
// Product competitors cache (new)
// ═══════════════════════════════════════════════════════════

function productCompetitorsKey(yourDomain: string, productId: string) {
  const y = normalizeDomain(yourDomain);
  return `competitors:v1:${y}::${productId}`;
}

export async function getCachedProductCompetitors(
  yourDomain: string,
  productId: string,
): Promise<ProductCompetitorsResult | null> {
  try {
    const redis = getRedis();
    if (!redis) return null;
    const value = await redis.get<ProductCompetitorsResult>(
      productCompetitorsKey(yourDomain, productId),
    );
    return value ?? null;
  } catch (err) {
    console.warn("[cache] product competitors read failed:", err);
    return null;
  }
}

export async function setCachedProductCompetitors(
  yourDomain: string,
  productId: string,
  result: ProductCompetitorsResult,
): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.set(
      productCompetitorsKey(yourDomain, productId),
      result,
      { ex: TTL_SECONDS },
    );
  } catch (err) {
    console.warn("[cache] product competitors write failed:", err);
  }
}
