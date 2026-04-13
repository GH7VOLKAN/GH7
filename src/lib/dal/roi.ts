import { prisma } from "@/lib/db";
import { cache } from "react";
import { PLATFORM_TRAFFIC } from "@/lib/roi/benchmarks";

export interface RoiEstimate {
  estimatedMonthlyVisits: number;
  previousMonthlyVisits: number;
  trendPercent: number;
  perPlatform: Record<string, { mentions: number; visits: number }>;
  totalMentions: number;
}

/**
 * Estimate AI-driven monthly traffic based on mention counts and platform benchmarks.
 *
 * Uses a simple model: mentions × platform benchmark = estimated visits.
 * Compares current scan with previous scan to show trend.
 */
export const getRoiEstimate = cache(async (brandId: string): Promise<RoiEstimate> => {
  const scans = await prisma.scan.findMany({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 2,
    select: { id: true },
  });

  if (scans.length === 0) {
    return {
      estimatedMonthlyVisits: 0,
      previousMonthlyVisits: 0,
      trendPercent: 0,
      perPlatform: {},
      totalMentions: 0,
    };
  }

  // Current scan mentions
  const currentResults = await prisma.promptResult.findMany({
    where: { scanId: scans[0].id, mentioned: true },
    select: { platform: true },
  });

  const perPlatform: Record<string, { mentions: number; visits: number }> = {};
  let currentTraffic = 0;

  for (const r of currentResults) {
    if (!perPlatform[r.platform]) {
      perPlatform[r.platform] = { mentions: 0, visits: 0 };
    }
    perPlatform[r.platform].mentions++;
    const visits = PLATFORM_TRAFFIC[r.platform] ?? 20;
    perPlatform[r.platform].visits += visits;
    currentTraffic += visits;
  }

  // Previous scan for trend comparison
  let previousTraffic = 0;
  if (scans.length >= 2) {
    const prevResults = await prisma.promptResult.findMany({
      where: { scanId: scans[1].id, mentioned: true },
      select: { platform: true },
    });
    for (const r of prevResults) {
      previousTraffic += PLATFORM_TRAFFIC[r.platform] ?? 20;
    }
  }

  const trendPercent =
    previousTraffic > 0
      ? Math.round(((currentTraffic - previousTraffic) / previousTraffic) * 100)
      : 0;

  return {
    estimatedMonthlyVisits: currentTraffic,
    previousMonthlyVisits: previousTraffic,
    trendPercent,
    perPlatform,
    totalMentions: currentResults.length,
  };
});
