/**
 * Kategori sorgu runner — Brief N v4 Aşama 5.
 *
 * Bir TrackedQuery (CATEGORY) için 5 platform paralel funnel drill,
 * calculateCategoryPoints, TrackingResult batch insert. runAllUnlocked
 * toplu tetikleyici Aşama 7 onboarding + Brief I cron kullanır.
 *
 * Platform × funnel paralelliği: 10 kategori × 5 platform × 3 adım = 150
 * AI çağrısı max (erken durma sayesinde tipik 60-80). Maliyet kontrolü
 * için eşik sistemi (thresholds.ts) sadece unlocked kategori sorguları
 * çalıştırır.
 */

import { prisma } from "@/lib/db";
import { getAvailableProviders } from "@/lib/ai/provider-registry";
import type { AIProvider } from "@/lib/ai/providers/base";
import { runCategoryFunnel, type FunnelResult } from "./category-funnel";
import { calculateCategoryPoints } from "@/lib/scoring/brand-health-v4";

export type CategoryRunInput = {
  trackedQueryId: string;
  step1: string;
  step2: string;
  step3: string;
  brandName: string;
};

export type CategoryRunSummary = {
  trackedQueryId: string;
  totalPlatforms: number;
  foundAnywhere: boolean;
  totalPoints: number;
  maxPossible: number;
  results: FunnelResult[];
};

async function runFunnelForPlatform(
  provider: AIProvider,
  input: CategoryRunInput,
): Promise<FunnelResult> {
  return runCategoryFunnel({
    provider,
    step1Query: input.step1,
    step2Query: input.step2,
    step3Query: input.step3,
    brandName: input.brandName,
  });
}

/**
 * Bir CATEGORY TrackedQuery için 5 platformda funnel çalıştırır,
 * TrackingResult kayıtlarını yazar. Her platform için ayrı kayıt.
 */
export async function runCategoryQueryOnAllPlatforms(
  input: CategoryRunInput,
): Promise<CategoryRunSummary> {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error("Hiçbir AI provider mevcut değil");
  }

  const results = await Promise.all(
    providers.map((p) => runFunnelForPlatform(p, input)),
  );

  const now = new Date();
  await prisma.trackingResult.createMany({
    data: results.map((r) => {
      const points = calculateCategoryPoints(r.foundAtStep, r.rank);
      return {
        trackedQueryId: input.trackedQueryId,
        platform: r.platform,
        checkedAt: now,
        foundAtStep: r.foundAtStep,
        rank: r.rank,
        listLength: r.listLength,
        points,
        competitors: r.extractedBrands.map((name) => ({ name })),
        sources: [],
        conversation: r.conversation as unknown as object,
      };
    }),
  });

  const totalPoints = results.reduce(
    (acc, r) => acc + calculateCategoryPoints(r.foundAtStep, r.rank),
    0,
  );
  const maxPossible = results.length * 5; // 5 platform × 5 max puan
  const foundAnywhere = results.some((r) => r.foundAtStep !== null);

  return {
    trackedQueryId: input.trackedQueryId,
    totalPlatforms: results.length,
    foundAnywhere,
    totalPoints,
    maxPossible,
    results,
  };
}

/**
 * Marka için UNLOCKED + ARCHIVE OLMAYAN tüm CATEGORY sorgularını
 * çalıştırır. Eşik altı kategori sorgular (unlockedAt=null) atlanır.
 *
 * Aşama 7 onboarding + Brief I cron bu fonksiyonu tetikler.
 */
export async function runAllUnlockedCategoryQueriesForBrand(
  brandId: string,
): Promise<{
  summaries: CategoryRunSummary[];
  totalPoints: number;
  maxPossible: number;
}> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { name: true },
  });
  if (!brand) throw new Error(`Brand not found: ${brandId}`);

  const queries = await prisma.trackedQuery.findMany({
    where: {
      brandId,
      category: "CATEGORY",
      archivedAt: null,
      unlockedAt: { not: null },
    },
    orderBy: { orderIndex: "asc" },
  });

  const summaries: CategoryRunSummary[] = [];
  let totalPoints = 0;
  let maxPossible = 0;

  for (const q of queries) {
    if (!q.step1Query || !q.step2Query || !q.step3Query) continue;
    const summary = await runCategoryQueryOnAllPlatforms({
      trackedQueryId: q.id,
      step1: q.step1Query,
      step2: q.step2Query,
      step3: q.step3Query,
      brandName: brand.name,
    });
    summaries.push(summary);
    totalPoints += summary.totalPoints;
    maxPossible += summary.maxPossible;
  }

  return { summaries, totalPoints, maxPossible };
}
