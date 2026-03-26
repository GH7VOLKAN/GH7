import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // Graceful fallback — cache disabled
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Generic cache wrapper with graceful fallback.
 * If Redis is not configured, always calls the fetcher.
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<{ data: T; cached: boolean; cachedAt?: string }> {
  const r = getRedis();

  if (r) {
    try {
      const cached = await r.get<{ data: T; cachedAt: string }>(key);
      if (cached) {
        return { data: cached.data, cached: true, cachedAt: cached.cachedAt };
      }
    } catch (err) {
      console.warn("[cache] Redis get failed, falling back:", err);
    }
  }

  const fresh = await fetcher();

  if (r) {
    try {
      await r.setex(key, ttlSeconds, JSON.stringify({ data: fresh, cachedAt: new Date().toISOString() }));
    } catch (err) {
      console.warn("[cache] Redis set failed:", err);
    }
  }

  return { data: fresh, cached: false };
}

/**
 * Invalidate a cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.del(key);
    } catch (err) {
      console.warn("[cache] Redis del failed:", err);
    }
  }
}

/**
 * Cache key factory
 */
export const cacheKeys = {
  platformQuery: (platform: string, query: string) =>
    `q:${platform}:${Buffer.from(query).toString("base64url").slice(0, 40)}`,

  pageSpeed: (domain: string) => `ps:${domain}`,

  sonarAnalysis: (domain: string) => `sonar:${domain}`,

  competitorData: (brandId: string) => `comp:${brandId}`,
};
