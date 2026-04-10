import { prisma } from "@/lib/db";
import { cache } from "react";

export interface CorrelationEvent {
  actionId: string;
  actionTitle: string;
  actionDate: string; // ISO
  scoreBefore: number;
  scoreAfter: number;
  scoreDelta: number;
  daysToEffect: number;
  confidence: "yuksek" | "orta" | "dusuk";
}

export interface ChartPoint {
  date: string; // YYYY-MM-DD
  mentionScore: number;
  readinessScore: number;
}

export interface ActionMarker {
  date: string; // YYYY-MM-DD
  title: string;
}

export interface CorrelationData {
  correlations: CorrelationEvent[];
  verifiedImpacts: number;
  avgResponseDays: number;
  overallConfidence: string;
  chartData: ChartPoint[];
  actionMarkers: ActionMarker[];
  totalCompletedActions: number;
  totalScoreEntries: number;
}

export const getCorrelationData = cache(async (brandId: string): Promise<CorrelationData> => {
  // 1. Get completed ActionTasks ordered by updatedAt
  const completedActions = await prisma.actionTask.findMany({
    where: { brandId, completed: true },
    orderBy: { updatedAt: "asc" },
    select: { id: true, title: true, updatedAt: true },
  });

  // 2. Get ScoreHistory entries ordered by date
  const scoreHistory = await prisma.scoreHistory.findMany({
    where: { brandId },
    orderBy: { date: "asc" },
  });

  // 3. Correlate: for each completed action, find score change within 7 days
  const correlations: CorrelationEvent[] = [];
  const WINDOW_DAYS = 7;

  for (const action of completedActions) {
    const actionTime = action.updatedAt.getTime();
    const windowEnd = actionTime + WINDOW_DAYS * 24 * 60 * 60 * 1000;

    // Find closest score BEFORE the action
    const scoreBefore = scoreHistory
      .filter((s) => s.date.getTime() <= actionTime)
      .pop();

    // Find closest score AFTER the action (within window)
    const scoreAfter = scoreHistory.find(
      (s) => s.date.getTime() > actionTime && s.date.getTime() <= windowEnd
    );

    if (scoreBefore && scoreAfter) {
      const delta = scoreAfter.mentionScore - scoreBefore.mentionScore;
      if (delta > 0) {
        const daysToEffect = Math.round(
          (scoreAfter.date.getTime() - actionTime) / (1000 * 60 * 60 * 24)
        );
        correlations.push({
          actionId: action.id,
          actionTitle: action.title,
          actionDate: action.updatedAt.toISOString(),
          scoreBefore: scoreBefore.mentionScore,
          scoreAfter: scoreAfter.mentionScore,
          scoreDelta: delta,
          daysToEffect: Math.max(1, daysToEffect),
          confidence: delta >= 5 ? "yuksek" : delta >= 2 ? "orta" : "dusuk",
        });
      }
    }
  }

  // 4. Compute summary stats
  const verifiedImpacts = correlations.length;
  const avgResponseDays =
    correlations.length > 0
      ? Math.round(
          correlations.reduce((sum, c) => sum + c.daysToEffect, 0) /
            correlations.length
        )
      : 0;
  const overallConfidence =
    correlations.length >= 3
      ? "Yüksek"
      : correlations.length >= 1
        ? "Orta"
        : "Düşük";

  // 5. Chart data
  const chartData: ChartPoint[] = scoreHistory.map((s) => ({
    date: s.date.toISOString().split("T")[0],
    mentionScore: s.mentionScore,
    readinessScore: s.readinessScore,
  }));

  const actionMarkers: ActionMarker[] = completedActions.map((a) => ({
    date: a.updatedAt.toISOString().split("T")[0],
    title: a.title,
  }));

  return {
    correlations,
    verifiedImpacts,
    avgResponseDays,
    overallConfidence,
    chartData,
    actionMarkers,
    totalCompletedActions: completedActions.length,
    totalScoreEntries: scoreHistory.length,
  };
});
