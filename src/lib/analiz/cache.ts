/**
 * 7-günlük domain-bazlı analiz cache'i.
 *
 * Akış: /api/analiz/run çağrıldığında önce bu cache'e bakılır.
 *  - HIT → cached: true olarak aynı sonuç döner, API maliyeti sıfır
 *  - MISS → gerçek analiz çalışır, sonuç 7 gün cache'lenir
 *
 * Pro kullanıcıları bypass edebilmeli (kendi sitelerindeki değişikliği hemen
 * ölçmek isterler). Bu kontrol çağıran route'ta yapılır.
 */

import { Redis } from "@upstash/redis";
import type { AnalysisResult, DetectResult, Door } from "./types";
import { normalizeDomain } from "./domain";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 gün
const DETECT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 gün

let redisSingleton: Redis | null = null;

function getRedis(): Redis | null {
  if (redisSingleton) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

function cacheKey(yourDomain: string, productId: string, competitorDomain: string) {
  const y = normalizeDomain(yourDomain);
  const c = normalizeDomain(competitorDomain);
  return `analiz:v1:${y}::${productId}::${c}`;
}

export async function getCachedAnalysis(
  yourDomain: string,
  productId: string,
  competitorDomain: string,
): Promise<AnalysisResult | null> {
  const redis = getRedis();
  if (!redis) return null;
  const key = cacheKey(yourDomain, productId, competitorDomain);
  const value = await redis.get<AnalysisResult>(key);
  if (!value) return null;
  return { ...value, cached: true };
}

export async function setCachedAnalysis(
  yourDomain: string,
  productId: string,
  competitorDomain: string,
  result: AnalysisResult,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const key = cacheKey(yourDomain, productId, competitorDomain);
  await redis.set(key, result, { ex: TTL_SECONDS });
}

// ─── Detect (domain → products + competitors) cache ────────
// Site değişmez kabul edildiği sürece 7 gün tek Perplexity çağrısı yeter.

function detectCacheKey(door: Door, domain: string) {
  return `analiz:detect:v1:${door}:${normalizeDomain(domain)}`;
}

export async function getCachedDetect(
  door: Door,
  domain: string,
): Promise<DetectResult | null> {
  const redis = getRedis();
  if (!redis) return null;
  return await redis.get<DetectResult>(detectCacheKey(door, domain));
}

export async function setCachedDetect(
  door: Door,
  domain: string,
  result: DetectResult,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(detectCacheKey(door, domain), result, {
    ex: DETECT_TTL_SECONDS,
  });
}
