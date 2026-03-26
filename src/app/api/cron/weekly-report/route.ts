import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { sendWeeklyReportEmail } from "@/lib/email/resend";
import { calculateAllMetrics } from "@/lib/metrics";
import { buildCorrelationTimeline } from "@/lib/metrics/correlation";
import type { WeeklyReportData } from "@/lib/metrics/types";

export const maxDuration = 120; // 2 min — Opus needs more time

/** Calculate ISO week number for a given date */
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
}

/** Get Anthropic client for Opus calls */
let _opusClient: Anthropic | null = null;
function getOpusClient(): Anthropic {
  if (!_opusClient) {
    const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("No Anthropic API key configured");
    _opusClient = new Anthropic({ apiKey, timeout: 60_000 });
  }
  return _opusClient;
}

/**
 * Call Opus to generate a comprehensive weekly summary from all metrics.
 * Returns structured WeeklyReportData.
 */
async function generateOpusWeeklySummary(
  brandName: string,
  metrics: ReturnType<typeof calculateAllMetrics>,
  correlationInsights: Array<{ event: string; metric: string; confidence: string; description: string }>,
  checklistProgress: { total: number; completed: number; percent: number },
  previousScore: number,
): Promise<WeeklyReportData> {
  const client = getOpusClient();

  const { mentionRateTrend, positionTrend, platformPerformance, shareOfVoice, sentimentTracking } = metrics;

  // Build platform breakdown string
  const platformBreakdown = platformPerformance.platforms
    .map((p) => `${p.platform}: %${p.mentionRate} mention rate, avg pos ${p.avgPosition}`)
    .join("\n");

  // Build share of voice string
  const sovStr = [
    `${shareOfVoice.brand.name}: %${shareOfVoice.brand.sharePercent}`,
    ...shareOfVoice.competitors.slice(0, 5).map((c) => `${c.name}: %${c.sharePercent}`),
  ].join(", ");

  // Build correlations string
  const correlationStr = correlationInsights.length > 0
    ? correlationInsights.map((c) => `- ${c.event} → ${c.metric} (guven: ${c.confidence})`).join("\n")
    : "Bu hafta belirgin korelasyon tespit edilmedi.";

  const currentMentionRate = Math.round(mentionRateTrend.current.rate * 100);
  const prevMentionRate = mentionRateTrend.previous
    ? Math.round(mentionRateTrend.previous.rate * 100)
    : currentMentionRate;

  const prompt = `Sen GH7.ai'nin haftalik rapor yazarisin. ${brandName} markasi icin bu haftanin verilerini analiz et.

BU HAFTAKI VERILER:
- ${mentionRateTrend.current.total} yanit analizi
- Mention rate: %${currentMentionRate} (gecen hafta: %${prevMentionRate})
- Mention rate degisim: ${mentionRateTrend.changePercent > 0 ? "+" : ""}${mentionRateTrend.changePercent}%
- Ortalama pozisyon: ${positionTrend.current.avgPosition} (gecen hafta: ${positionTrend.previous?.avgPosition ?? "N/A"})
- 1. sira sayisi: ${positionTrend.current.first}, 2. sira: ${positionTrend.current.second}, 3. sira: ${positionTrend.current.third}
- Sentiment: ${sentimentTracking.trend} (pozitif: ${sentimentTracking.current.pozitif}, notr: ${sentimentTracking.current.notr}, negatif: ${sentimentTracking.current.negatif})
- Platform bazli:
${platformBreakdown}
- Share of voice: ${sovStr}
- Korelasyonlar:
${correlationStr}
- Gelisim plani ilerleme: ${checklistProgress.completed}/${checklistProgress.total} (%${checklistProgress.percent})

HAFTALIK OZET RAPOR URET. Asagidaki JSON formatinda yanit ver (baska bir sey yazma):
{
  "weeklyScore": number,
  "previousScore": number,
  "trend": "rising" | "falling" | "stable",
  "highlights": ["en az 2, en fazla 5 madde"],
  "concerns": ["varsa endise edilen noktalar"],
  "correlations": [{"event": "olay", "metric": "metrik degisimi", "confidence": "high|medium|low"}],
  "nextActions": ["en az 2, en fazla 5 somut adim"]
}

KURALLAR:
- Doktor abi dili — profesyonel ama samimi
- Somut isimler ver (platform adi, rakip adi, soru kategorisi)
- weeklyScore: 0-100 arasi, mention rate ve pozisyon verilerinden hesapla
- previousScore: gecen haftanin skoru (${previousScore})
- trend: bu hafta gecen haftaya gore rising/falling/stable
- highlights: bu haftanin en iyi gelismeleri
- concerns: dikkat edilmesi gereken noktalar (yoksa bos array)
- correlations: tespit edilen korelasyonlar (sadece veri destekliyorsa)
- nextActions: gelecek hafta icin somut, uygulanabilir adimlar
- Motivasyon ver, ama gercekci ol`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Opus response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as WeeklyReportData;

    // Validate and sanitize
    return {
      weeklyScore: Math.max(0, Math.min(100, parsed.weeklyScore ?? 0)),
      previousScore: parsed.previousScore ?? previousScore,
      trend: (["rising", "falling", "stable"].includes(parsed.trend) ? parsed.trend : "stable") as "rising" | "falling" | "stable",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 5) : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns.slice(0, 5) : [],
      correlations: Array.isArray(parsed.correlations)
        ? parsed.correlations.slice(0, 5).map((c) => ({
            event: String(c.event ?? ""),
            metric: String(c.metric ?? ""),
            confidence: (["high", "medium", "low"].includes(c.confidence) ? c.confidence : "low") as "high" | "medium" | "low",
          }))
        : [],
      nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions.slice(0, 5) : [],
    };
  } catch (error) {
    console.error("[weekly-report] Opus summary generation failed:", error);

    // Fallback: generate basic report without Opus
    return {
      weeklyScore: currentMentionRate,
      previousScore,
      trend: mentionRateTrend.changePercent > 2 ? "rising" : mentionRateTrend.changePercent < -2 ? "falling" : "stable",
      highlights: [
        `Bu hafta ${mentionRateTrend.current.total} yanit analiz edildi.`,
        `Mention rate: %${currentMentionRate}.`,
      ],
      concerns: [],
      correlations: [],
      nextActions: ["Gelisim planindaki adimlara devam edin."],
    };
  }
}

/**
 * Cron: Weekly report — runs every Friday at 18:00 UTC
 *
 * Schedule (from spec):
 *   06:00 Tarama baslar → 5 platforma sorular gonderilir
 *   06:05 Yanitlar gelir → Sonnet analiz
 *   ~08:00 Tamamlanir → DB guncellenir → dashboard guncel
 *   18:00 Cuma: Opus haftalik ozet uretir → e-posta gonderilir
 *
 * For each PRO+ profile:
 *   1. Collect ALL prompt results from the week (Sonnet analyses)
 *   2. Calculate all 8 metrics
 *   3. Build correlation timeline
 *   4. Send everything to Opus for comprehensive weekly summary
 *   5. Store the report as notification + send email
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

  // Date range: last 7 days for current week, 14 days for previous week comparison
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let sent = 0;
  let failed = 0;
  const results: Array<{
    brandId: string;
    brandName: string;
    weeklyScore: number;
    trend: string;
    emailSent: boolean;
    opusUsed: boolean;
  }> = [];

  for (const brand of brands) {
    try {
      // 1. Collect ALL prompt results from the last 14 days (current + previous week)
      const allResults = await prisma.promptResult.findMany({
        where: {
          scan: { brandId: brand.id, status: "completed" },
          createdAt: { gte: fourteenDaysAgo },
        },
        orderBy: { createdAt: "asc" },
      });

      // Get prompts for this brand (needed for question type analysis and google ranking)
      const prompts = await prisma.prompt.findMany({
        where: { brandId: brand.id },
      });

      // 2. Calculate all 8 metrics
      const metrics = calculateAllMetrics(allResults, prompts, brand.name);

      // 3. Build correlation timeline
      const checklistItems = await prisma.checklistItem.findMany({
        where: { brandId: brand.id },
      });

      const sourceDomains = await prisma.sourceDomain.findMany({
        where: { brandId: brand.id },
      });

      const correlation = buildCorrelationTimeline(
        checklistItems,
        allResults,
        sourceDomains,
      );

      // Get checklist progress
      const totalChecklist = checklistItems.length;
      const completedChecklist = checklistItems.filter((c) => c.userMarkedDone).length;
      const checklistProgress = {
        total: totalChecklist,
        completed: completedChecklist,
        percent: totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0,
      };

      // Get previous week's score
      const previousScoreRecord = await prisma.scoreHistory.findFirst({
        where: {
          brandId: brand.id,
          date: { lte: sevenDaysAgo },
        },
        orderBy: { date: "desc" },
      });
      const previousScore = previousScoreRecord?.mentionScore ?? 0;

      // 4. Send everything to Opus for comprehensive weekly summary
      const opusReport = await generateOpusWeeklySummary(
        brand.name,
        metrics,
        correlation.insights,
        checklistProgress,
        previousScore,
      );

      // 5. Store the report as notification
      await prisma.notification.create({
        data: {
          brandId: brand.id,
          type: "weekly_report",
          title: "Haftalik GEO Raporu",
          message: opusReport.highlights.join(" ") || `Hafta ${currentWeek}: Gorunurluk ${opusReport.weeklyScore}/100`,
          data: {
            week: currentWeek,
            score: opusReport.weeklyScore,
            previousScore: opusReport.previousScore,
            trend: opusReport.trend,
            highlights: opusReport.highlights,
            concerns: opusReport.concerns,
            correlations: opusReport.correlations,
            nextActions: opusReport.nextActions,
            metrics: {
              mentionRate: Math.round(metrics.mentionRateTrend.current.rate * 100),
              avgPosition: metrics.positionTrend.current.avgPosition,
              bestPlatform: metrics.platformPerformance.bestPlatform,
              totalResults: metrics.mentionRateTrend.current.total,
              sentimentTrend: metrics.sentimentTracking.trend,
            },
          },
        },
      });

      // 6. Send email (respect user preference)
      const email = brand.profile?.email;
      const wantsReport = brand.profile?.emailWeeklyReport !== false;
      if (!email || !wantsReport) {
        console.warn(`[weekly-report] No email or opted-out for brand ${brand.id}, skipping email`);
        results.push({
          brandId: brand.id,
          brandName: brand.name,
          weeklyScore: opusReport.weeklyScore,
          trend: opusReport.trend,
          emailSent: false,
          opusUsed: true,
        });
        failed++;
        continue;
      }

      const change = opusReport.weeklyScore - opusReport.previousScore;
      await sendWeeklyReportEmail(email, brand.name, {
        score: opusReport.weeklyScore,
        change,
        topPlatform: metrics.platformPerformance.bestPlatform ?? "N/A",
        highlights: opusReport.highlights.slice(0, 3),
        nextActions: opusReport.nextActions.slice(0, 3),
      });

      sent++;
      results.push({
        brandId: brand.id,
        brandName: brand.name,
        weeklyScore: opusReport.weeklyScore,
        trend: opusReport.trend,
        emailSent: true,
        opusUsed: true,
      });
    } catch (error) {
      console.error(`[weekly-report] Failed for brand ${brand.id}:`, error);
      failed++;
      results.push({
        brandId: brand.id,
        brandName: brand.name,
        weeklyScore: 0,
        trend: "stable",
        emailSent: false,
        opusUsed: false,
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
