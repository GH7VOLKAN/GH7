import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyReportEmail } from "@/lib/email/resend";

export const maxDuration = 60;

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
        select: { email: true, plan: true },
      },
    },
  });

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
    emailSent: boolean;
  }> = [];

  for (const brand of brands) {
    try {
      // 1. Current mentionScore from latest scoreHistory
      const latestScore = await prisma.scoreHistory.findFirst({
        where: { brandId: brand.id },
        orderBy: { date: "desc" },
      });

      const currentScore = latestScore?.mentionScore ?? 0;

      // 2. Score from 7 days ago
      const oldScore = await prisma.scoreHistory.findFirst({
        where: {
          brandId: brand.id,
          date: { lte: sevenDaysAgo },
        },
        orderBy: { date: "desc" },
      });

      const change = currentScore - (oldScore?.mentionScore ?? 0);

      // 3. Top platform — which AI mentions them most from latest scan results
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

      // 4. Send email
      const email = brand.profile?.email;
      if (!email) {
        console.warn(`[weekly-report] No email for brand ${brand.id}, skipping`);
        results.push({
          brandId: brand.id,
          brandName: brand.name,
          score: currentScore,
          change,
          topPlatform,
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
        emailSent: false,
      });
    }
  }

  return NextResponse.json({
    success: true,
    brandsChecked: brands.length,
    emailsSent: sent,
    emailsFailed: failed,
    results,
  });
}
