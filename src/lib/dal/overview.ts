import { prisma } from "@/lib/db";
import { cache } from "react";
import type { PlatformKey, Sentiment } from "@/lib/types";

export interface RecentMention {
  id: string;
  platform: PlatformKey;
  timeAgo: string;
  prompt: string;
  excerpt: string;
  position: string;
  sentiment: Sentiment;
  citations: string[];
  scanDate: string;
}

export interface DashboardOverview {
  mentionScore: number;
  mentionTrend: number;
  readinessScore: number;
  readinessTrend: number;
  activePromptCount: number;
  totalSourceCount: number;
  lastScanDate: string | null;
  lastScanTimeAgo: string | null;
  totalMentionCount: number;
  totalResultCount: number;
  recentMentions: RecentMention[];
  visibilityData: {
    name: string;
    isUser: boolean;
    platforms: Record<PlatformKey, number>;
  }[];
  priorityActions: { title: string; impact: string }[];
  scoreHistory: { date: string; mentionScore: number; readinessScore: number }[];
  topCompetitorName: string | null;
  topCompetitorGap: number;
}

export const getOverviewData = cache(async (brandId: string): Promise<DashboardOverview> => {
  // Get latest two score history entries for trend calculation
  const scores = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "desc" },
    take: 2,
  });

  const latest = scores[0];
  const prev = scores[1];

  const mentionScore = latest?.mentionScore ?? 0;
  const readinessScore = latest?.readinessScore ?? 0;
  const mentionTrend = prev ? mentionScore - prev.mentionScore : 0;
  const readinessTrend = prev ? readinessScore - prev.readinessScore : 0;

  // Active prompts count
  const activePromptCount = await prisma.prompt.count({
    where: { brandId, isActive: true },
  });

  // Source domains count
  const totalSourceCount = await prisma.sourceDomain.count({
    where: { brandId },
  });

  // Recent mentions (latest scan results where mentioned = true)
  const latestScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const lastScanDate = latestScan?.completedAt?.toISOString() ?? null;
  const lastScanTimeAgo = latestScan?.completedAt ? getTimeAgo(latestScan.completedAt) : null;

  let recentMentions: RecentMention[] = [];
  let totalMentionCount = 0;
  let totalResultCount = 0;

  if (latestScan) {
    const allResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
    });
    totalResultCount = allResults.length;
    totalMentionCount = allResults.filter((r) => r.mentioned).length;

    const results = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id, mentioned: true },
      include: { prompt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const scanDate = latestScan.completedAt?.toISOString().split("T")[0] ?? "";

    recentMentions = results.map((r) => ({
      id: r.id,
      platform: r.platform as PlatformKey,
      timeAgo: getTimeAgo(r.createdAt),
      prompt: r.prompt.text,
      excerpt: r.excerpt ?? "",
      position: r.position ?? "bahsediliyor",
      sentiment: (r.sentiment ?? "nötr") as Sentiment,
      citations: Array.isArray(r.citations) ? (r.citations as string[]) : [],
      scanDate,
    }));
  }

  // Competitor visibility data
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const competitors = await prisma.competitor.findMany({ where: { brandId } });

  const visibilityData: DashboardOverview["visibilityData"] = [
    {
      name: brand?.name ?? "Siz",
      isUser: true,
      platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
    },
    ...competitors.map((c) => ({
      name: c.name,
      isUser: false,
      platforms: (c.platforms as Record<PlatformKey, number>) ?? {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
      },
    })),
  ];

  // Priority actions (incomplete, high priority)
  const actions = await prisma.actionTask.findMany({
    where: { brandId, completed: false, priority: "high" },
    take: 3,
  });
  const priorityActions = actions.map((a) => ({
    title: a.title,
    impact: a.impact,
  }));

  // Score history for chart
  const history = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "asc" },
    take: 90, // last ~3 months
  });
  const scoreHistory = history.map((h) => ({
    date: h.date.toISOString().split("T")[0],
    mentionScore: h.mentionScore,
    readinessScore: h.readinessScore,
  }));

  // Top competitor for overview cards
  const topCompetitor = competitors.sort((a, b) => b.mentionScore - a.mentionScore)[0] ?? null;
  const topCompetitorName = topCompetitor?.name ?? null;
  const topCompetitorGap = topCompetitor ? topCompetitor.mentionScore - mentionScore : 0;

  return {
    mentionScore,
    mentionTrend,
    readinessScore,
    readinessTrend,
    activePromptCount,
    totalSourceCount,
    lastScanDate,
    lastScanTimeAgo,
    totalMentionCount,
    totalResultCount,
    recentMentions,
    visibilityData,
    priorityActions,
    scoreHistory,
    topCompetitorName,
    topCompetitorGap,
  };
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} saat önce`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} gün önce`;
}
