/**
 * Niş sorgu runner — Brief N v4 Aşama 4.
 *
 * Bir TrackedQuery (category=NICHE) için 5 AI platformunu paralel dener,
 * her platform için analizi çalıştırır ve TrackingResult kayıtlarını yazar.
 *
 * Binary skorlama: mentioned: true/false.
 * Context: `mentionContext` — markanın geçtiği kısa alıntı.
 *
 * Kullanım (Aşama 7 onboarding + Brief I haftalık cron tetikleyecek):
 *   await runNicheQueryOnAllPlatforms(trackedQuery, brandAliases);
 */

import { prisma } from "@/lib/db";
import { getAvailableProviders } from "@/lib/ai/provider-registry";
import { analyzeResponse } from "@/lib/ai/analyzer";
import type { AIProvider } from "@/lib/ai/providers/base";
import type { AIResponse } from "@/lib/ai/types";

export type NicheRunInput = {
  trackedQueryId: string;
  query: string;
  brandName: string;
  brandAliases?: string[]; // brand.aliases JSON — Brief N "kullanıcı alias kullanıyor" edge case
};

export type NicheRunOutcome = {
  platform: string;
  mentioned: boolean;
  mentionContext: string | null;
  error?: string;
};

export type NicheRunSummary = {
  trackedQueryId: string;
  totalPlatforms: number;
  mentionedCount: number;
  outcomes: NicheRunOutcome[];
};

async function runOnPlatform(
  provider: AIProvider,
  query: string,
  brandName: string,
): Promise<NicheRunOutcome> {
  try {
    const response: AIResponse = await provider.sendPrompt(query);
    if (response.error) {
      return {
        platform: provider.platform,
        mentioned: false,
        mentionContext: null,
        error: response.error,
      };
    }

    const analysis = await analyzeResponse(response.content, brandName, query);

    return {
      platform: provider.platform,
      mentioned: analysis.mentioned,
      mentionContext: analysis.mentionContext ?? analysis.excerpt ?? null,
    };
  } catch (err) {
    return {
      platform: provider.platform,
      mentioned: false,
      mentionContext: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Bir NICHE sorgusunu 5 platformda çalıştırır ve TrackingResult yazar.
 * Platform hataları tek sorgunun başarısızlığı olarak yazılır — exception fırlatmaz.
 */
export async function runNicheQueryOnAllPlatforms(
  input: NicheRunInput,
): Promise<NicheRunSummary> {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error("Hiçbir AI provider mevcut değil (env eksik olabilir)");
  }

  const outcomes = await Promise.all(
    providers.map((p) => runOnPlatform(p, input.query, input.brandName)),
  );

  // Her platform için TrackingResult yaz (batch insert)
  const now = new Date();
  await prisma.trackingResult.createMany({
    data: outcomes.map((o) => ({
      trackedQueryId: input.trackedQueryId,
      platform: o.platform,
      checkedAt: now,
      mentioned: o.mentioned,
      mentionContext: o.mentionContext,
    })),
  });

  const mentionedCount = outcomes.filter((o) => o.mentioned).length;

  return {
    trackedQueryId: input.trackedQueryId,
    totalPlatforms: providers.length,
    mentionedCount,
    outcomes,
  };
}

/**
 * Bir markanın tüm açık (unlockedAt!=null, archivedAt=null) NICHE sorgularını
 * çalıştırır. Aşama 7 onboarding'in ilk tarama adımı + Brief I haftalık cron
 * bu fonksiyonu tetikler.
 */
export async function runAllNicheQueriesForBrand(
  brandId: string,
): Promise<{
  summaries: NicheRunSummary[];
  totalMentions: number;
  totalChecks: number;
}> {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { name: true },
  });
  if (!brand) throw new Error(`Brand not found: ${brandId}`);

  const queries = await prisma.trackedQuery.findMany({
    where: {
      brandId,
      category: "NICHE",
      archivedAt: null,
      unlockedAt: { not: null },
    },
    orderBy: { orderIndex: "asc" },
  });

  const summaries: NicheRunSummary[] = [];
  let totalMentions = 0;
  let totalChecks = 0;

  for (const q of queries) {
    if (!q.query) continue;
    const summary = await runNicheQueryOnAllPlatforms({
      trackedQueryId: q.id,
      query: q.query,
      brandName: brand.name,
    });
    summaries.push(summary);
    totalMentions += summary.mentionedCount;
    totalChecks += summary.totalPlatforms;
  }

  return { summaries, totalMentions, totalChecks };
}
