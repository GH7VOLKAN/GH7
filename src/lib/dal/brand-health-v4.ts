/**
 * Brief N v4 Aşama 8 — Brand Health v4 DAL.
 *
 * Marka için güncel 3 audit boyutu + 3 görünürlük katmanı skorlarını
 * DB'den hesaplayıp döner. Scoring engine'deki saf fonksiyonları besler.
 * Dashboard home ve detay sayfaları bu DAL'ı çağırır.
 */

import { prisma } from "@/lib/db";
import {
  scoreAuditBoyut,
  scoreNicheVisibility,
  scoreCategoryDominance,
  scoreSourceDominance,
  calculateHealthScore,
  type HealthComponents,
  type HealthScore,
  type AuditItemStatus,
} from "@/lib/scoring/brand-health-v4";
import { getNextThreshold } from "@/lib/scoring/thresholds";

export type BrandHealthSnapshot = {
  score: HealthScore;
  nextThreshold: ReturnType<typeof getNextThreshold>;
  /** Audit madde detayları — UI için */
  audit: {
    siteInternalPassed: number;
    siteInternalTotal: number;
    authoritySignalsPassed: number;
    authoritySignalsTotal: number;
    externalSourcePassed: number;
    externalSourceTotal: number;
  };
  visibility: {
    nicheMentions: number;
    nicheChecks: number;
    categoryPoints: number;
    categoryMaxPossible: number;
    sourceAnalyzedCount: number;
    sourceMentionedCount: number;
    sourceUnreachableCount: number;
  };
};

/** Brand'in en son Audit'indeki item status'larını boyuta göre gruplar. */
async function getAuditBoyutStatuses(
  brandId: string,
): Promise<{
  SITE_INTERNAL: AuditItemStatus[];
  AUTHORITY_SIGNALS: AuditItemStatus[];
  EXTERNAL_SOURCES: AuditItemStatus[];
}> {
  const latestAudit = await prisma.audit.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true },
  });

  const empty = {
    SITE_INTERNAL: [] as AuditItemStatus[],
    AUTHORITY_SIGNALS: [] as AuditItemStatus[],
    EXTERNAL_SOURCES: [] as AuditItemStatus[],
  };

  if (!latestAudit) return empty;

  const items = await prisma.auditItem.findMany({
    where: {
      auditId: latestAudit.id,
      boyut: { not: null },
    },
    select: { boyut: true, status: true },
  });

  const grouped = { ...empty };
  for (const it of items) {
    if (!it.boyut) continue;
    const key = it.boyut as keyof typeof grouped;
    if (!(key in grouped)) continue;
    grouped[key].push(it.status as AuditItemStatus);
  }
  return grouped;
}

async function getNicheVisibilityData(brandId: string): Promise<{
  mentions: number;
  checks: number;
}> {
  // Son 7 gündeki NICHE TrackingResult'lar
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const results = await prisma.trackingResult.findMany({
    where: {
      checkedAt: { gte: weekAgo },
      trackedQuery: { brandId, category: "NICHE", archivedAt: null },
    },
    select: { mentioned: true },
  });

  const checks = results.length;
  const mentions = results.filter((r) => r.mentioned === true).length;
  return { mentions, checks };
}

async function getCategoryDominanceData(brandId: string): Promise<{
  points: number;
  maxPossible: number;
}> {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const results = await prisma.trackingResult.findMany({
    where: {
      checkedAt: { gte: weekAgo },
      trackedQuery: {
        brandId,
        category: "CATEGORY",
        archivedAt: null,
        unlockedAt: { not: null },
      },
    },
    select: { points: true },
  });

  // Max: her TrackingResult için 5 puan
  const maxPossible = results.length * 5;
  const points = results.reduce((acc, r) => acc + (r.points ?? 0), 0);
  return { points, maxPossible };
}

async function getSourceDominanceData(brandId: string): Promise<{
  analyzed: number;
  mentioned: number;
  unreachable: number;
  summaries: Array<{
    status: "analyzed" | "unreachable" | "pending";
    mentionsBrand: boolean;
    mentionedCompetitors: string[];
  }>;
}> {
  const sources = await prisma.sourceAnalysis.findMany({
    where: { brandId },
    select: {
      status: true,
      mentionsBrand: true,
      mentionedCompetitors: true,
    },
  });

  const summaries = sources.map((s) => ({
    status: s.status as "analyzed" | "unreachable" | "pending",
    mentionsBrand: s.mentionsBrand,
    mentionedCompetitors: Array.isArray(s.mentionedCompetitors)
      ? (s.mentionedCompetitors as string[])
      : [],
  }));

  const analyzed = summaries.filter((s) => s.status === "analyzed").length;
  const mentioned = summaries.filter(
    (s) => s.status === "analyzed" && s.mentionsBrand,
  ).length;
  const unreachable = summaries.filter((s) => s.status === "unreachable").length;

  return { analyzed, mentioned, unreachable, summaries };
}

/**
 * Marka için tam sağlık skoru snapshot'ı. DB'yi tarar, scoring engine
 * fonksiyonlarını çağırır. Trend + competitor şimdilik 0 (Brief I cron
 * haftalık karşılaştırma yapınca hesaplanacak).
 */
export async function getBrandHealthSnapshot(
  brandId: string,
): Promise<BrandHealthSnapshot> {
  const [boyutStatuses, niche, category, source] = await Promise.all([
    getAuditBoyutStatuses(brandId),
    getNicheVisibilityData(brandId),
    getCategoryDominanceData(brandId),
    getSourceDominanceData(brandId),
  ]);

  // Audit boyut skorları (max 20/20/15)
  const siteInternalAudit = scoreAuditBoyut(boyutStatuses.SITE_INTERNAL, 20);
  const authoritySignalsAudit = scoreAuditBoyut(
    boyutStatuses.AUTHORITY_SIGNALS,
    20,
  );
  const externalSourceAudit = scoreAuditBoyut(
    boyutStatuses.EXTERNAL_SOURCES,
    15,
  );

  // Görünürlük skorları
  const nicheVisibility = scoreNicheVisibility(niche.mentions, niche.checks);
  const categoryDominance = scoreCategoryDominance(
    category.points,
    Math.max(category.maxPossible, 1),
  );
  const sourceDominance = scoreSourceDominance(source.summaries);

  const components: HealthComponents = {
    siteInternalAudit,
    authoritySignalsAudit,
    externalSourceAudit,
    nicheVisibility,
    categoryDominance,
    sourceDominance,
    trend: 0,
    competitor: 0,
  };

  const score = calculateHealthScore(components);
  const nextThreshold = getNextThreshold(score.curved);

  return {
    score,
    nextThreshold,
    audit: {
      siteInternalPassed: boyutStatuses.SITE_INTERNAL.filter(
        (s) => s === "passed",
      ).length,
      siteInternalTotal: boyutStatuses.SITE_INTERNAL.length,
      authoritySignalsPassed: boyutStatuses.AUTHORITY_SIGNALS.filter(
        (s) => s === "passed",
      ).length,
      authoritySignalsTotal: boyutStatuses.AUTHORITY_SIGNALS.length,
      externalSourcePassed: boyutStatuses.EXTERNAL_SOURCES.filter(
        (s) => s === "passed",
      ).length,
      externalSourceTotal: boyutStatuses.EXTERNAL_SOURCES.length,
    },
    visibility: {
      nicheMentions: niche.mentions,
      nicheChecks: niche.checks,
      categoryPoints: category.points,
      categoryMaxPossible: category.maxPossible,
      sourceAnalyzedCount: source.analyzed,
      sourceMentionedCount: source.mentioned,
      sourceUnreachableCount: source.unreachable,
    },
  };
}
