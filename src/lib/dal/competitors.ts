import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey } from "@/lib/types";

export interface CompetitorRowData {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
  // AI discovery metadata
  reason: string | null;
  products: string[];
  relevance: string;
  source: string;
}

export interface CompetitorDetailData {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
}

// Deep detail for competitor dialog
export interface CompetitorPromptAppearance {
  promptText: string;
  platform: string;
  excerpt: string;
  userMentionedToo: boolean;
}

export interface CompetitorDeepDetail {
  promptAppearances: CompetitorPromptAppearance[];
  sharedSources: string[];
  competitorOnlySources: string[];
}

export const getCompetitorsData = cache(async (brandId: string) => {
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const competitors = await prisma.competitor.findMany({
    where: { brandId },
    orderBy: { mentionScore: "desc" },
  });

  // Latest scores for the user brand
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });

  const userMentionScore = latestScore?.mentionScore ?? 0;
  const userReadinessScore = latestScore?.readinessScore ?? 0;

  // Compute user's per-platform scores from latest completed scan
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const userPlatforms: Record<PlatformKey, number> = { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 };

  if (latestScan) {
    const scanResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
    });

    const platCounts: Record<string, { mentioned: number; total: number }> = {
      chatgpt: { mentioned: 0, total: 0 },
      claude: { mentioned: 0, total: 0 },
      gemini: { mentioned: 0, total: 0 },
      perplexity: { mentioned: 0, total: 0 },
    };

    for (const r of scanResults) {
      if (!platCounts[r.platform]) continue;
      platCounts[r.platform].total++;
      if (r.mentioned) platCounts[r.platform].mentioned++;
    }

    for (const [plat, counts] of Object.entries(platCounts)) {
      userPlatforms[plat as PlatformKey] =
        counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) : 0;
    }
  }

  const rows: CompetitorRowData[] = [
    {
      id: "user",
      name: brand?.name ?? "Siz",
      domain: brand?.domain ?? "",
      isUser: true,
      mentionScore: userMentionScore,
      readinessScore: userReadinessScore,
      platforms: userPlatforms,
      reason: null,
      products: [],
      relevance: "direct",
      source: "user",
    },
    ...competitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      isUser: false,
      mentionScore: c.mentionScore,
      readinessScore: c.readinessScore,
      platforms: (c.platforms as Record<PlatformKey, number>) ?? {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
      },
      reason: c.reason,
      products: c.products ?? [],
      relevance: c.relevance ?? "direct",
      source: c.source ?? "manual",
    })),
  ];

  // Populate readiness gaps from audit checks that are failing/partial
  const failingChecks = await prisma.auditCheck.findMany({
    where: {
      category: { brandId },
      status: { in: ["fail", "partial"] },
    },
    include: { category: true },
    orderBy: { score: "asc" },
  });

  const readinessGaps = failingChecks.map(
    (c) => `${c.label}: ${c.recommendation ?? c.detail ?? "İyileştirme gerekli"}`
  );

  // Top source pages from source domains
  const sources = await prisma.sourceDomain.findMany({
    where: { brandId },
    orderBy: { usagePercent: "desc" },
    take: 5,
  });

  const topSourcePages = sources.map((s) => ({
    path: s.domain,
    promptCount: s.urls.length,
  }));

  // Detail for top competitor
  const topCompetitor = competitors[0];
  const detail: CompetitorDetailData | null = topCompetitor
    ? {
        name: topCompetitor.name,
        mentionScore: topCompetitor.mentionScore,
        userMentionScore,
        readinessGaps,
        topSourcePages,
      }
    : null;

  // Count AI-discovered vs manual
  const aiDiscoveredCount = competitors.filter((c) => c.source === "ai_discovered").length;
  const manualCount = competitors.filter((c) => c.source === "manual").length;

  return {
    rows,
    detail,
    userMentionScore,
    userReadinessScore,
    aiDiscoveredCount,
    manualCount,
    totalResults: latestScan ? await prisma.promptResult.count({ where: { scanId: latestScan.id } }) : 0,
    totalMentions: latestScan ? await prisma.promptResult.count({ where: { scanId: latestScan.id, mentioned: true } }) : 0,
  };
});

/**
 * Get deep detail for a competitor — called client-side via server action
 */
export async function getCompetitorDeepDetail(
  brandId: string,
  competitorName: string,
): Promise<CompetitorDeepDetail> {
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true },
  });

  if (!latestScan) {
    return { promptAppearances: [], sharedSources: [], competitorOnlySources: [] };
  }

  // Find prompt results where competitor name appears in excerpt
  const allResults = await prisma.promptResult.findMany({
    where: { scanId: latestScan.id },
    include: { prompt: { select: { text: true } } },
  });

  const nameLower = competitorName.toLowerCase();
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const brandNameLower = brand?.name.toLowerCase() ?? "";

  const promptAppearances: CompetitorPromptAppearance[] = [];

  for (const r of allResults) {
    if (r.excerpt?.toLowerCase().includes(nameLower)) {
      promptAppearances.push({
        promptText: r.prompt.text,
        platform: r.platform,
        excerpt: r.excerpt,
        userMentionedToo: r.mentioned, // user brand also mentioned in same result
      });
    }
  }

  // Source comparison: find citation URLs from competitor vs user results
  const competitorCitationDomains = new Set<string>();
  const userCitationDomains = new Set<string>();

  for (const r of allResults) {
    const citations = Array.isArray(r.citations) ? (r.citations as string[]) : [];
    for (const url of citations) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, "");
        if (r.excerpt?.toLowerCase().includes(nameLower)) {
          competitorCitationDomains.add(domain);
        }
        if (r.mentioned) {
          userCitationDomains.add(domain);
        }
      } catch {
        // ignore invalid URLs
      }
    }
  }

  const sharedSources = [...competitorCitationDomains].filter((d) => userCitationDomains.has(d));
  const competitorOnlySources = [...competitorCitationDomains].filter((d) => !userCitationDomains.has(d));

  return { promptAppearances, sharedSources, competitorOnlySources };
}
