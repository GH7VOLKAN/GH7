import { prisma } from "@/lib/db";
import { cache } from "react";
import type { Priority } from "@/lib/types";

export interface ActionTaskData {
  id: string;
  priority: Priority;
  title: string;
  impact: string;
  source: string;
  detail: string | null;
  completed: boolean;
  raasEligible: boolean;
  // AI action plan fields
  description: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
  canWeDoIt: boolean;
  selfServiceSteps: string[];
}

export interface SituationAnalysis {
  mentionScore: number;
  totalPrompts: number;
  mentionedCount: number;
  topPlatform: string | null;
  weakPlatform: string | null;
  competitorCount: number;
  topCompetitor: string | null;
  topCompetitorScore: number;
  auditScore: number | null;
  auditPassCount: number;
  auditFailCount: number;
  sourceCount: number;
  topSourceDomain: string | null;
}

export const getActionsData = cache(async (brandId: string) => {
  const tasks = await prisma.actionTask.findMany({
    where: { brandId },
    orderBy: [{ completed: "asc" }, { priority: "asc" }, { createdAt: "asc" }],
  });

  const actionTasks: ActionTaskData[] = tasks.map((t) => ({
    id: t.id,
    priority: t.priority as Priority,
    title: t.title,
    impact: t.impact,
    source: t.source,
    detail: t.detail,
    completed: t.completed,
    raasEligible: t.raasEligible,
    description: t.description,
    difficulty: t.difficulty,
    estimatedTime: t.estimatedTime,
    canWeDoIt: t.canWeDoIt,
    selfServiceSteps: (t.selfServiceSteps as string[]) ?? [],
  }));

  const completedCount = actionTasks.filter((t) => t.completed).length;
  const totalCount = actionTasks.length;
  const raasEligibleCount = actionTasks.filter((t) => t.raasEligible).length;

  return { actionTasks, completedCount, totalCount, raasEligibleCount };
});

export const getSituationAnalysis = cache(async (brandId: string): Promise<SituationAnalysis> => {
  // ── Mention score from latest score history
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });
  const mentionScore = latestScore?.mentionScore ?? 0;

  // ── Prompt stats from last completed scan
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  let totalPrompts = 0;
  let mentionedCount = 0;
  let topPlatform: string | null = null;
  let weakPlatform: string | null = null;

  if (lastScan) {
    const results = await prisma.promptResult.findMany({
      where: { scanId: lastScan.id },
    });
    totalPrompts = results.length;
    mentionedCount = results.filter((r) => r.mentioned).length;

    // Platform breakdown
    const platformStats: Record<string, { m: number; t: number }> = {};
    for (const r of results) {
      if (!platformStats[r.platform]) platformStats[r.platform] = { m: 0, t: 0 };
      platformStats[r.platform].t++;
      if (r.mentioned) platformStats[r.platform].m++;
    }

    let topRate = -1;
    let weakRate = 101;
    for (const [plat, s] of Object.entries(platformStats)) {
      const rate = s.t > 0 ? (s.m / s.t) * 100 : 0;
      if (rate > topRate) { topRate = rate; topPlatform = plat; }
      if (rate < weakRate) { weakRate = rate; weakPlatform = plat; }
    }
  }

  // ── Competitor stats
  const competitors = await prisma.competitor.findMany({
    where: { brandId },
    orderBy: { mentionScore: "desc" },
  });
  const competitorCount = competitors.length;
  const topCompetitor = competitors[0]?.name ?? null;
  const topCompetitorScore = competitors[0]?.mentionScore ?? 0;

  // ── Site audit stats
  const auditChecks = await prisma.auditCheck.findMany({
    where: { category: { brandId } },
  });
  let auditScore: number | null = null;
  let auditPassCount = 0;
  let auditFailCount = 0;
  if (auditChecks.length > 0) {
    auditPassCount = auditChecks.filter((c) => c.status === "pass").length;
    auditFailCount = auditChecks.filter((c) => c.status === "fail").length;
    auditScore = Math.round((auditPassCount / auditChecks.length) * 100);
  }

  // ── Source domains
  const sourceCount = await prisma.sourceDomain.count({ where: { brandId } });
  const topSource = await prisma.sourceDomain.findFirst({
    where: { brandId },
    orderBy: { usagePercent: "desc" },
  });
  const topSourceDomain = topSource?.domain ?? null;

  return {
    mentionScore,
    totalPrompts,
    mentionedCount,
    topPlatform,
    weakPlatform,
    competitorCount,
    topCompetitor,
    topCompetitorScore,
    auditScore,
    auditPassCount,
    auditFailCount,
    sourceCount,
    topSourceDomain,
  };
});

export async function toggleActionComplete(taskId: string, completed: boolean) {
  return prisma.actionTask.update({
    where: { id: taskId },
    data: { completed },
  });
}
