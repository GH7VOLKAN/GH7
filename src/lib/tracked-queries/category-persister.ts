/**
 * Kategori sorgu persister — Brief N v4 Aşama 5.
 *
 * TrackedQuery (category=CATEGORY) idempotent yazma:
 *  - Mevcut açık kayıtları archivedAt ile soft-delete
 *  - Yeni 10 kategori funnel'ını orderIndex 1-10 olarak yazar
 *  - unlockedAt DEĞİŞTİRMEZ — eşik sistemi (thresholds.ts) sonradan set eder
 *
 * Aşama 7 onboarding generate + persist akışını kullanır. Aşama 8 /
 * Brief I cron skor eşiği aşıldıkça ek sorguları unlock eder (ayrı
 * fonksiyon: `unlockCategoryQueries`).
 */

import { prisma } from "@/lib/db";
import type { GeneratedCategoryFunnel } from "./category-generator";
import { getUnlockedCategoryQueryCount } from "@/lib/scoring/thresholds";

export type PersistCategoryResult = {
  created: number;
  archived: number;
  trackedQueryIds: string[];
};

const DIFFICULTY_MAP = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export async function persistCategoryQueries(
  brandId: string,
  queries: GeneratedCategoryFunnel[],
): Promise<PersistCategoryResult> {
  if (queries.length === 0) {
    return { created: 0, archived: 0, trackedQueryIds: [] };
  }

  // Arşivle mevcut CATEGORY sorgularını
  const existing = await prisma.trackedQuery.findMany({
    where: { brandId, category: "CATEGORY", archivedAt: null },
    select: { id: true },
  });
  let archived = 0;
  if (existing.length > 0) {
    const res = await prisma.trackedQuery.updateMany({
      where: { id: { in: existing.map((e) => e.id) } },
      data: { archivedAt: new Date() },
    });
    archived = res.count;
  }

  // Yenileri oluştur — orderIndex çakışmalarını negatife kaydır
  const now = new Date();
  const trackedQueryIds: string[] = [];
  for (let i = 0; i < queries.length && i < 10; i++) {
    const q = queries[i];
    const targetOrder = i + 1; // 1-10

    const collision = await prisma.trackedQuery.findFirst({
      where: { brandId, category: "CATEGORY", orderIndex: targetOrder },
    });
    if (collision) {
      await prisma.trackedQuery.update({
        where: { id: collision.id },
        data: {
          orderIndex: -(Math.abs(collision.orderIndex) + 1000000),
        },
      });
    }

    const created = await prisma.trackedQuery.create({
      data: {
        brandId,
        category: "CATEGORY",
        difficulty: DIFFICULTY_MAP[q.difficulty] ?? "MEDIUM",
        orderIndex: targetOrder,
        step1Query: q.step1,
        step2Query: q.step2,
        step3Query: q.step3,
        // unlockedAt null — eşik sistemi set eder
        approvedAt: now,
      },
      select: { id: true },
    });
    trackedQueryIds.push(created.id);
  }

  return { created: trackedQueryIds.length, archived, trackedQueryIds };
}

/**
 * Mevcut curved health skoruna göre kategori sorguları unlock eder.
 * Brief N v4 eşik sistemi: 50/60/70/80/90/100 → 5/6/7/8/9/10 sorgu açık.
 *
 * - İlk N sorguyu (orderIndex ASC) unlockedAt=now yapar
 * - Fazla açık olanlar varsa dokunmaz (regression yok — bir kez açılan
 *   açık kalır)
 * - Yeni unlocked sayısını döner
 */
export async function unlockCategoryQueries(
  brandId: string,
  curvedHealthScore: number,
): Promise<{ newlyUnlocked: number; totalUnlocked: number }> {
  const targetUnlocked = getUnlockedCategoryQueryCount(curvedHealthScore);

  if (targetUnlocked === 0) {
    return { newlyUnlocked: 0, totalUnlocked: 0 };
  }

  // İlk targetUnlocked adet active kayıt
  const candidates = await prisma.trackedQuery.findMany({
    where: {
      brandId,
      category: "CATEGORY",
      archivedAt: null,
      orderIndex: { gte: 1, lte: targetUnlocked },
    },
    orderBy: { orderIndex: "asc" },
    select: { id: true, unlockedAt: true, orderIndex: true },
  });

  const toUnlock = candidates.filter((c) => c.unlockedAt === null);
  if (toUnlock.length === 0) {
    const totalUnlocked = candidates.length;
    return { newlyUnlocked: 0, totalUnlocked };
  }

  const now = new Date();
  await prisma.trackedQuery.updateMany({
    where: { id: { in: toUnlock.map((c) => c.id) } },
    data: { unlockedAt: now },
  });

  // Güncel total (newly + previously)
  const totalUnlocked = candidates.length;
  return { newlyUnlocked: toUnlock.length, totalUnlocked };
}
