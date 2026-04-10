/**
 * GH7.ai Dead-Letter Queue
 *
 * Başarısız tarama sonuçlarını kaydeder ve retry mekanizması sunar.
 * Exponential backoff ile nextRetryAt hesaplar.
 */

import { prisma } from "@/lib/db";

interface EnqueueInput {
  scanId: string;
  promptId: string;
  platform: string;
  error: string;
  payload?: Record<string, unknown>;
}

const BASE_RETRY_DELAY_MS = 5 * 60 * 1000; // 5 dakika

export async function enqueueFailedResult(input: EnqueueInput): Promise<void> {
  const nextRetryAt = new Date(Date.now() + BASE_RETRY_DELAY_MS);

  await prisma.failedResult.create({
    data: {
      scanId: input.scanId,
      promptId: input.promptId,
      platform: input.platform,
      error: input.error,
      payload: input.payload ? JSON.parse(JSON.stringify(input.payload)) : undefined,
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt,
    },
  });
}

export async function getRetryableResults() {
  return prisma.failedResult.findMany({
    where: {
      resolvedAt: null,
      nextRetryAt: { lte: new Date() },
      retryCount: { lt: 3 },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
}

export async function markResolved(id: string): Promise<void> {
  await prisma.failedResult.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });
}

export async function incrementRetry(id: string): Promise<void> {
  const record = await prisma.failedResult.findUnique({ where: { id } });
  if (!record) return;

  const newCount = record.retryCount + 1;
  // Exponential backoff: 5min, 20min, 80min
  const delay = BASE_RETRY_DELAY_MS * Math.pow(4, newCount);
  const nextRetryAt = new Date(Date.now() + delay);

  await prisma.failedResult.update({
    where: { id },
    data: {
      retryCount: newCount,
      nextRetryAt: newCount < record.maxRetries ? nextRetryAt : null,
    },
  });
}

export async function getFailedResultStats() {
  const [pending, resolved, exhausted] = await Promise.all([
    prisma.failedResult.count({
      where: { resolvedAt: null, retryCount: { lt: 3 } },
    }),
    prisma.failedResult.count({
      where: { resolvedAt: { not: null } },
    }),
    prisma.failedResult.count({
      where: { resolvedAt: null, retryCount: { gte: 3 } },
    }),
  ]);
  return { pending, resolved, exhausted };
}
