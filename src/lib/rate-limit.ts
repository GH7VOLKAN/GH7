/**
 * GH7.ai — Database-backed rate limiter
 * Uses the rate_limits table via Prisma for sliding-window rate limiting.
 */

import { prisma } from "@/lib/db";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and enforce a rate limit for the given key.
 *
 * @param key        Unique key (e.g. "sms:905551234567" or "ip:1.2.3.4:lead")
 * @param limit      Maximum requests within the window
 * @param windowMinutes  Window duration in minutes
 * @returns          Whether the request is allowed, remaining count, and reset time
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMinutes: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const nextReset = new Date(now.getTime() + windowMinutes * 60 * 1000);

  // Find existing record
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < windowStart) {
    // No record or expired window — reset counter
    await prisma.rateLimit.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        windowStart: now,
        expiresAt: nextReset,
      },
      update: {
        count: 1,
        windowStart: now,
        expiresAt: nextReset,
      },
    });
    return { allowed: true, remaining: limit - 1, resetAt: nextReset };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.expiresAt };
  }

  // Increment counter
  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: limit - existing.count - 1,
    resetAt: existing.expiresAt,
  };
}
