import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { runSiteAudit } from "@/lib/ai/site-auditor";
import { runPersonalAudit } from "@/lib/ai/personal-auditor";
import { persistAuditResults } from "@/lib/ai/audit-persister";
import { generateActionPlan } from "@/lib/ai/action-plan-generator";
import { checkPromptFreshness } from "@/lib/ai/prompt-freshness";
import { verifyChecklistItems } from "@/lib/ai/checklist-verifier";
import { deepCompetitorResearch, generateMonthlyReport } from "@/lib/ai/monthly-report";
import { isPro, getPlanLimits } from "@/lib/plans";
import { processExpiredPlans } from "@/lib/iyzico/activate-plan";

export const maxDuration = 300; // 5 min max for Vercel Pro

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header automatically)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    where: {
      autoScan: true,
      scanInterval: { not: "manual" },
    },
    include: {
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
      prompts: {
        where: { isActive: true },
        select: { id: true },
      },
      profile: {
        select: { plan: true },
      },
    },
  });

  const now = Date.now();
  let triggered = 0;

  for (const brand of brands) {
    // Skip brands with no active prompts
    if (brand.prompts.length === 0) continue;

    // Free plan'lar otomatik tarama yapamaz
    const plan = brand.profile?.plan ?? "free";
    if (plan === "free") continue;

    // Plan bazlı frekans kontrolü — plan'ın izin verdiği frekansı uygula
    const planLimits = getPlanLimits(plan);
    const effectiveInterval = planLimits.scanFrequency === "once" ? "manual" : planLimits.scanFrequency;
    if (effectiveInterval === "manual") continue;

    const lastScan = brand.scans[0];
    const lastScanTime = lastScan?.completedAt?.getTime() ?? 0;
    const hoursSince = (now - lastScanTime) / (1000 * 60 * 60);

    // Pzt=1, Sal=2, Car=3, Per=4, Cum=5, Cmt=6, Paz=0
    const dayOfWeek = new Date(now).getUTCDay();
    const isScanDay = [1, 3, 5].includes(dayOfWeek); // Pzt, Car, Cum

    const shouldScan =
      (effectiveInterval === "daily" && hoursSince > 23) ||
      (effectiveInterval === "thrice_weekly" && isScanDay && hoursSince > 20);

    if (!shouldScan) continue;

    try {
      const scan = await prisma.scan.create({
        data: { brandId: brand.id, status: "pending", type: "scheduled" },
      });

      // Execute sequentially to respect rate limits
      await executeScan(scan.id, brand.id);

      // Run audit after scan — firma: site audit, kisisel: personal audit
      try {
        const auditResult = brand.type === "kisisel"
          ? await runPersonalAudit({
              name: brand.name,
              domain: brand.domain,
              profession: brand.profession,
              city: brand.city,
              sector: brand.sector,
              specialties: brand.specialties,
            })
          : await runSiteAudit(brand.domain);

        await persistAuditResults(brand.id, auditResult);

        // Pro+ icin AI aksiyon plani uret (non-fatal)
        if (isPro(plan)) {
          try {
            const latestScore = await prisma.scoreHistory.findFirst({
              where: { brandId: brand.id },
              orderBy: { date: "desc" },
            });
            const mentionScore = latestScore?.mentionScore ?? 0;

            await generateActionPlan(
              {
                id: brand.id,
                name: brand.name,
                domain: brand.domain,
                type: brand.type as "firma" | "kisisel",
                sector: brand.sector,
                city: brand.city,
                profession: brand.profession,
                specialties: brand.specialties,
              },
              auditResult,
              mentionScore,
            );
          } catch (actionErr) {
            console.error(`[auto-scan] Action plan failed for brand ${brand.id}:`, actionErr);
          }
        }
      } catch (auditErr) {
        console.error(`[auto-scan] Audit failed for brand ${brand.id}:`, auditErr);
      }

      triggered++;
    } catch (error) {
      console.error(
        `[auto-scan] Failed for brand ${brand.id}:`,
        error,
      );
    }
  }

  // ── Weekly: Gelişim Planı otomatik doğrulama (Pazartesi) ──
  const dayOfWeekNow = new Date(now).getUTCDay();
  let checklistResults = { verified: 0, changed: 0 };
  if (dayOfWeekNow === 1) {
    for (const brand of brands) {
      const plan = brand.profile?.plan ?? "free";
      if (!isPro(plan)) continue;
      try {
        const result = await verifyChecklistItems(brand.id);
        checklistResults.verified += result.verified;
        checklistResults.changed += result.changed;
        if (result.changed > 0) {
          console.log(`[auto-scan] Checklist verified for ${brand.id}: ${result.changed}/${result.verified} items changed`);
        }
      } catch (err) {
        console.error(`[auto-scan] Checklist verify failed for ${brand.id}:`, err);
      }
    }
  }

  // ── Monthly: Soru güncellik kontrolü (ayın 1'i) ──
  const dayOfMonth = new Date(now).getUTCDate();
  let freshnessResults = { checked: 0, stale: 0 };
  if (dayOfMonth === 1) {
    for (const brand of brands) {
      const plan = brand.profile?.plan ?? "free";
      if (!isPro(plan)) continue;
      try {
        const prompts = await prisma.prompt.findMany({
          where: { brandId: brand.id, isActive: true },
          select: { id: true, text: true },
        });
        const result = await checkPromptFreshness(
          prompts,
          brand.sector ?? "",
          brand.city ?? "",
        );
        freshnessResults.checked += result.checkedCount;
        freshnessResults.stale += result.staleCount;

        // Güncelliğini yitirmiş soruları işaretle
        for (const r of result.results) {
          if (r.isStale) {
            await prisma.prompt.update({
              where: { id: r.promptId },
              data: {
                tags: {
                  push: "guncel-degil",
                },
              },
            });
          }
        }

        if (result.staleCount > 0) {
          console.log(`[auto-scan] Freshness check for ${brand.id}: ${result.staleCount}/${result.checkedCount} stale`);
        }
      } catch (err) {
        console.error(`[auto-scan] Freshness check failed for ${brand.id}:`, err);
      }
    }
  }

  // ── Monthly: Derin rakip araştırması + Aylık GEO Durum Raporu (ayın 1'i) ──
  let monthlyReportResults = { generated: 0, failed: 0 };
  if (dayOfMonth === 1) {
    for (const brand of brands) {
      const plan = brand.profile?.plan ?? "free";
      if (!isPro(plan)) continue;

      try {
        // Get competitors from DB
        const competitors = await prisma.competitor.findMany({
          where: { brandId: brand.id },
          select: { name: true, domain: true },
          take: 10,
        });

        if (competitors.length === 0) continue;

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
        await prisma.notification.create({
          data: {
            brandId: brand.id,
            type: "monthly_report",
            title: "Aylık GEO Durum Raporu",
            message: report,
            data: {
              month: new Date(now).toISOString().slice(0, 7),
              competitorCount: competitorResearch.length,
              mentionScore: mentionData.mentionScore,
              readinessScore: mentionData.readinessScore,
              checklistProgress,
            },
          },
        });

        monthlyReportResults.generated++;
        console.log(`[auto-scan] Monthly report generated for ${brand.id}`);
      } catch (err) {
        monthlyReportResults.failed++;
        console.error(`[auto-scan] Monthly report failed for ${brand.id}:`, err);
      }
    }
  }

  // Process expired plans and grace periods
  let planResults = { checked: 0, graceStarted: 0, deactivated: 0 };
  try {
    planResults = await processExpiredPlans();
    if (planResults.checked > 0) {
      console.log(`[auto-scan] Plan check: ${planResults.graceStarted} grace started, ${planResults.deactivated} deactivated`);
    }
  } catch (planErr) {
    console.error("[auto-scan] Plan expiry check failed:", planErr);
  }

  return NextResponse.json({
    success: true,
    brandsChecked: brands.length,
    scansTriggered: triggered,
    checklistVerification: checklistResults,
    promptFreshness: freshnessResults,
    monthlyReport: monthlyReportResults,
    planExpiry: planResults,
  });
}
