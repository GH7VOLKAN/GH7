import { Redis } from "@upstash/redis";
import { normalizeTurkish } from "@/lib/utils/turkish";

/**
 * Upstash Redis client — serverless-friendly, connection-pooled.
 *
 * Env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Falls back to a no-op stub if not configured (dev mode).
 */

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[redis] UPSTASH_REDIS_REST_URL or TOKEN not set — caching disabled");
    return null;
  }

  _redis = new Redis({ url, token });
  return _redis;
}

// ── Cache helpers ─────────────────────────────────────

const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Get a cached value by key. Returns null if not found or Redis unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (err) {
    console.error("[redis] cacheGet error:", err);
    return null;
  }
}

/**
 * Set a cached value with TTL (default 7 days).
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL,
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.error("[redis] cacheSet error:", err);
  }
}

/**
 * Delete a cached value.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.error("[redis] cacheDel error:", err);
  }
}

/**
 * Generate a SHA256-based cache key from input components.
 * Türkçe karakter aware: "İstanbul" ve "istanbul" aynı key'e düşer.
 *
 * CRITICAL: Bu fonksiyon değişirse eski cache'ler invalid olur.
 * Admin endpoint /api/admin/cache/clear ile temizlenebilir.
 */
export function makeCacheKey(prefix: string, ...parts: string[]): string {
  // Lazy require for crypto (Node.js native)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto");
  const raw = parts.map((p) => normalizeTurkish(p).trim()).join(":");
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 16);
  return `${prefix}:${hash}`;
}
