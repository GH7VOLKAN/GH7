import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyReportEmail } from "@/lib/email/resend";

export const maxDuration = 60;

/** Calculate ISO week number for a given date */
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
}

/** Mention rate per platform: { chatgpt: { rate, total, mentioned }, ... } */
async function calculateMentionRateByPlatform(
  brandId: string,
  weekNumber: number,
): Promise<Record<string, { rate: number; total: number; mentioned: number }>> {
  const results = await prisma.promptResult.findMany({
    where: {
      scanWeek: weekNumber,
      scan: { brandId, status: "completed" },
    },
    select: { platform: true, mentioned: true },
  });

  const platforms: Record<string, { total: number; mentioned: number }> = {};

  for (const r of results) {
    if (!platforms[r.platform]) {
      platforms[r.platform] = { total: 0, mentioned: 0 };
    }
    platforms[r.platform].total++;
    if (r.mentioned) platforms[r.platform].mentioned++;
  }

  const rates: Record<string, { rate: number; total: number; mentioned: number }> = {};
  for (const [platform, counts] of Object.entries(platforms)) {
    rates[platform] = {
      rate: counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) / 100 : 0,
      total: counts.total,
      mentioned: counts.mentioned,
    };
  }

  return rates;
}

/**
 * Cron: Weekly report — runs every Friday at 18:00 UTC
 * For each PRO+ profile:
 *   1. Calculate mention rate per platform for current week
 *   2. Compare with previous week
 *   3. Store weekly summary as notification
 *   4. Send email report
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header automatically)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paidPlans = ["pro", "business", "agency"];

  // Find all brands with paid plans
  const brands = await prisma.brand.findMany({
    where: {
      profile: {
        plan: { in: paidPlans },
      },
    },
    include: {
      profile: {
        select: { email: true, plan: true, emailWeeklyReport: true },
      },
    },
  });

  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const previousWeek = currentWeek - 1;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let sent = 0;
  let failed = 0;
  const results: Array<{
    brandId: string;
    brandName: string;
    score: number;
    change: number;
    topPlatform: string;
    mentionRates: Record<string, { rate: number; total: number; mentioned: number }>;
    weekOverWeekChange: Record<string, number>;
    emailSent: boolean;
  }> = [];

  for (const brand of brands) {
    try {
      // 1. Calculate mention rate per platform for current and previous week
      const currentRates = await calculateMentionRateByPlatform(brand.id, currentWeek);
      const previousRates = await calculateMentionRateByPlatform(brand.id, previousWeek);

      // 2. Calculate week-over-week change per platform
      const weekOverWeekChange: Record<string, number> = {};
      const allPlatforms = new Set([
        ...Object.keys(currentRates),
        ...Object.keys(previousRates),
      ]);
      for (const platform of allPlatforms) {
        const curr = currentRates[platform]?.rate ?? 0;
        const prev = previousRates[platform]?.rate ?? 0;
        weekOverWeekChange[platform] = Math.round((curr - prev) * 100) / 100;
      }

      // 3. Current mentionScore from latest scoreHistory
      const latestScore = await prisma.scoreHistory.findFirst({
        where: { brandId: brand.id },
        orderBy: { date: "desc" },
      });

      const currentScore = latestScore?.mentionScore ?? 0;

      // 4. Score from 7 days ago
      const oldScore = await prisma.scoreHistory.findFirst({
        where: {
          brandId: brand.id,
          date: { lte: sevenDaysAgo },
        },
        orderBy: { date: "desc" },
      });

      const change = currentScore - (oldScore?.mentionScore ?? 0);

      // 5. Top platform — which AI mentions them most from latest scan results
      const latestScan = await prisma.scan.findFirst({
        where: { brandId: brand.id, status: "completed" },
        orderBy: { completedAt: "desc" },
        select: { id: true },
      });

      let topPlatform = "N/A";

      if (latestScan) {
        const platformCounts = await prisma.promptResult.groupBy({
          by: ["platform"],
          where: {
            scanId: latestScan.id,
            mentioned: true,
          },
          _count: { platform: true },
          orderBy: { _count: { platform: "desc" } },
          take: 1,
        });

        if (platformCounts.length > 0) {
          topPlatform = platformCounts[0].platform;
        }
      }

      // 6. Store weekly summary as notification
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "weekly_report",
          title: "Haftalık GEO Raporu",
          message: `Hafta ${currentWeek}: Görünürlük ${currentScore}/100 (${change >= 0 ? "+" : ""}${change}). En iyi platform: ${topPlatform}.`,
          data: {
            week: currentWeek,
            score: currentScore,
            change,
            topPlatform,
            mentionRates: currentRates,
            weekOverWeekChange,
          },
        },
      });

      // 7. Send email (respect user preference)
      const email = brand.profile?.email;
      const wantsReport = brand.profile?.emailWeeklyReport !== false; // default true
      if (!email || !wantsReport) {
        console.warn(`[weekly-report] No email or opted-out for brand ${brand.id}, skipping email`);
        results.push({
          brandId: brand.id,
          brandName: brand.name,
          score: currentScore,
          change,
          topPlatform,
          mentionRates: currentRates,
          weekOverWeekChange,
          emailSent: false,
        });
        failed++;
        continue;
      }

      await sendWeeklyReportEmail(email, brand.name, {
        score: currentScore,
        change,
        topPlatform,
      });

      sent++;
      results.push({
        brandId: brand.id,
        brandName: brand.name,
        score: currentScore,
        change,
        topPlatform,
        mentionRates: currentRates,
        weekOverWeekChange,
        emailSent: true,
      });
    } catch (error) {
      console.error(`[weekly-report] Failed for brand ${brand.id}:`, error);
      failed++;
      results.push({
        brandId: brand.id,
        brandName: brand.name,
        score: 0,
        change: 0,
        topPlatform: "N/A",
        mentionRates: {},
        weekOverWeekChange: {},
        emailSent: false,
      });
    }
  }

  return NextResponse.json({
    success: true,
    week: currentWeek,
    brandsChecked: brands.length,
    emailsSent: sent,
    emailsFailed: failed,
    results,
  });
}
