import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

/** Calculate ISO week number for a given date */
function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
  );
}

/**
 * GET /api/scan/trend
 * Returns weekly trend data for the last 4 weeks.
 *
 * Response format:
 * {
 *   weeks: [
 *     { week: 12, rates: { chatgpt: 0.5, claude: 0.3, gemini: 0.4 } },
 *     { week: 11, rates: { chatgpt: 0.4, claude: 0.35, gemini: 0.3 } },
 *     ...
 *   ]
 * }
 *
 * Calculates from prompt_results using scanWeek field.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user profile and plan
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });

  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  if (!limits.trendView) {
    return NextResponse.json(
      { error: "Trend view is a PRO+ feature", code: "PLAN_REQUIRED" },
      { status: 403 },
    );
  }

  // Get user's default brand
  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id },
    orderBy: { isDefault: "desc" },
    select: { id: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "No brand found" }, { status: 404 });
  }

  // Determine last 4 week numbers
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const weekNumbers = [
    currentWeek,
    currentWeek - 1,
    currentWeek - 2,
    currentWeek - 3,
  ].filter((w) => w > 0);

  // Fetch all prompt results for this brand in the last 4 weeks
  const results = await prisma.promptResult.findMany({
    where: {
      scanWeek: { in: weekNumbers },
      scan: { brandId: brand.id, status: "completed" },
    },
    select: { platform: true, mentioned: true, scanWeek: true },
  });

  // Group by week and platform
  const weekData: Record<number, Record<string, { total: number; mentioned: number }>> = {};

  for (const week of weekNumbers) {
    weekData[week] = {};
  }

  for (const r of results) {
    const week = r.scanWeek!;
    if (!weekData[week]) weekData[week] = {};
    if (!weekData[week][r.platform]) {
      weekData[week][r.platform] = { total: 0, mentioned: 0 };
    }
    weekData[week][r.platform].total++;
    if (r.mentioned) weekData[week][r.platform].mentioned++;
  }

  // Build response
  const weeks = weekNumbers.map((week) => {
    const platforms = weekData[week] ?? {};
    const rates: Record<string, number> = {};

    for (const [platform, counts] of Object.entries(platforms)) {
      rates[platform] =
        counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) / 100 : 0;
    }

    return { week, rates };
  });

  return NextResponse.json({
    brandId: brand.id,
    currentWeek,
    weeks,
  });
}
