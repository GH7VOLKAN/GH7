import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPro } from "@/lib/plans";
import { deepCompetitorResearch, generateMonthlyReport } from "@/lib/ai/monthly-report";

export const maxDuration = 300; // 5 min max for Vercel Pro

/**
 * Cron: Monthly report — runs 1st of every month at 06:00 UTC
 * For each PRO+ profile:
 *   1. Run deep competitor research
 *   2. Generate monthly GEO report with Opus
 *   3. Store as notification
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

  const brands = await prisma.brand.findMany({
    where: {
      profile: {
        plan: { in: paidPlans },
      },
    },
    include: {
      profile: {
        select: { plan: true },
      },
    },
  });

  const proProfiles = brands.filter((b) => isPro(b.profile?.plan ?? "free"));

  console.log(
    `[monthly-report] Monthly report triggered for ${proProfiles.length} profiles`,
  );

  let generated = 0;
  let failed = 0;
  const results: Array<{ brandId: string; brandName: string; status: string }> = [];

  for (const brand of proProfiles) {
    try {
      // Get competitors from DB
      const competitors = await prisma.competitor.findMany({
        where: { brandId: brand.id },
        select: { name: true, domain: true },
        take: 10,
      });

      if (competitors.length === 0) {
        console.log(`[monthly-report] Skipping brand ${brand.id} — no competitors`);
        results.push({ brandId: brand.id, brandName: brand.name, status: "skipped_no_competitors" });
        continue;
      }

      // Run deep competitor research via Sonar (2 queries per competitor)
      const competitorResearch = await deepCompetitorResearch(
        brand.id,
        competitors,
        brand.sector ?? "",
        brand.city ?? "",
      );

      // Get mention data (latest scores)
      const latestScore = await prisma.scoreHistory.findFirst({
        where: { brandId: brand.id },
        orderBy: { date: "desc" },
      });
      const mentionData = {
        mentionScore: latestScore?.mentionScore ?? 0,
        readinessScore: latestScore?.readinessScore ?? 0,
      };

      // Get checklist progress
      const checklistItems = await prisma.checklistItem.findMany({
        where: { brandId: brand.id },
        select: { status: true },
      });
      const checklistProgress = {
        completed: checklistItems.filter((i) => i.status === "complete").length,
        total: checklistItems.length,
      };

      // Generate monthly report with Opus
      const report = await generateMonthlyReport(
        {
          id: brand.id,
          name: brand.name,
          domain: brand.domain,
          type: brand.type,
          sector: brand.sector,
          city: brand.city,
        },
        competitorResearch,
        mentionData,
        checklistProgress,
      );

      // Save as notification with type "monthly_report"
      const now = new Date();
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "monthly_report",
          title: "Aylık GEO Durum Raporu",
          message: report,
          data: {
            month: now.toISOString().slice(0, 7),
            competitorCount: competitorResearch.length,
            mentionScore: mentionData.mentionScore,
            readinessScore: mentionData.readinessScore,
            checklistProgress,
          },
        },
      });

      generated++;
      results.push({ brandId: brand.id, brandName: brand.name, status: "generated" });
      console.log(`[monthly-report] Report generated for ${brand.name} (${brand.id})`);
    } catch (error) {
      failed++;
      console.error(`[monthly-report] Failed for brand ${brand.id}:`, error);
      results.push({ brandId: brand.id, brandName: brand.name, status: "failed" });
    }
  }

  return NextResponse.json({
    success: true,
    totalProfiles: proProfiles.length,
    reportsGenerated: generated,
    reportsFailed: failed,
    results,
  });
}
