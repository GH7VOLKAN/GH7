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
}

export interface CompetitorDetailData {
  name: string;
  mentionScore: number;
  userMentionScore: number;
  readinessGaps: string[];
  topSourcePages: { path: string; promptCount: number }[];
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

  const rows: CompetitorRowData[] = [
    {
      id: "user",
      name: brand?.name ?? "Siz",
      domain: brand?.domain ?? "",
      isUser: true,
      mentionScore: userMentionScore,
      readinessScore: userReadinessScore,
      platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
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

  return { rows, detail, userMentionScore, userReadinessScore };
});
