/**
 * Niş sorguları TrackedQuery tablosuna yazan persister — Brief N v4 Aşama 4.
 *
 * Kural: Brand başına NICHE kategori için orderIndex 1-10 arası benzersiz.
 * Yeniden çalıştırıldığında (regenerate) eski kayıtları archivedAt
 * işaretleyip yenilerini oluşturur.
 */

import { prisma } from "@/lib/db";
import type { GeneratedNicheQuery } from "./niche-generator";

export type PersistNicheResult = {
  created: number;
  archived: number;
  trackedQueryIds: string[];
};

export async function persistNicheQueries(
  brandId: string,
  queries: GeneratedNicheQuery[],
): Promise<PersistNicheResult> {
  if (queries.length === 0) {
    return { created: 0, archived: 0, trackedQueryIds: [] };
  }

  // Mevcut NICHE sorgularını arşivle (idempotent — yeniden üretim)
  const existing = await prisma.trackedQuery.findMany({
    where: {
      brandId,
      category: "NICHE",
      archivedAt: null,
    },
    select: { id: true },
  });

  let archived = 0;
  if (existing.length > 0) {
    const result = await prisma.trackedQuery.updateMany({
      where: { id: { in: existing.map((e) => e.id) } },
      data: { archivedAt: new Date() },
    });
    archived = result.count;
  }

  // Yenileri oluştur
  const now = new Date();
  const trackedQueryIds: string[] = [];
  for (let i = 0; i < queries.length && i < 10; i++) {
    const q = queries[i];
    // @@unique(brandId, category, orderIndex) constraint'i var — arşivlenmiş
    // aynı orderIndex'li kayıtları upsert ile temizle
    const existingAtIndex = await prisma.trackedQuery.findFirst({
      where: { brandId, category: "NICHE", orderIndex: i + 1 },
    });
    if (existingAtIndex) {
      // Unique constraint'i ihlal etmemek için orderIndex'i negatife kaydır
      await prisma.trackedQuery.update({
        where: { id: existingAtIndex.id },
        data: {
          orderIndex: -(Math.abs(existingAtIndex.orderIndex) + 1000000),
        },
      });
    }

    const created = await prisma.trackedQuery.create({
      data: {
        brandId,
        category: "NICHE",
        orderIndex: i + 1,
        query: q.query,
        unlockedAt: now, // Niş sorgular her zaman açık
        approvedAt: now,
      },
      select: { id: true },
    });
    trackedQueryIds.push(created.id);
  }

  return { created: trackedQueryIds.length, archived, trackedQueryIds };
}
