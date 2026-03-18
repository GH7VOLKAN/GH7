import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

/**
 * GET /api/scan/mention-rate
 * Returns mention rate per platform for the current user's active brand.
 *
 * Response format:
 * {
 *   chatgpt: { rate: 0.67, total: 3, mentioned: 2 },
 *   claude:  { rate: 0.50, total: 4, mentioned: 2 },
 *   ...
 * }
 *
 * Calculates from the latest completed scan's prompt_results.
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

  if (!limits.mentionRate) {
    return NextResponse.json(
      { error: "Mention rate is a PRO+ feature", code: "PLAN_REQUIRED" },
      { status: 403 },
    );
  }

  // Get user's default brand (or first brand)
  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id },
    orderBy: { isDefault: "desc" },
    select: { id: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "No brand found" }, { status: 404 });
  }

  // Get the latest completed scan
  const latestScan = await prisma.scan.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true, completedAt: true },
  });

  if (!latestScan) {
    return NextResponse.json({ error: "No completed scans" }, { status: 404 });
  }

  // Aggregate mention rate per platform
  const allResults = await prisma.promptResult.findMany({
    where: { scanId: latestScan.id },
    select: { platform: true, mentioned: true },
  });

  const platforms: Record<string, { total: number; mentioned: number }> = {};

  for (const r of allResults) {
    if (!platforms[r.platform]) {
      platforms[r.platform] = { total: 0, mentioned: 0 };
    }
    platforms[r.platform].total++;
    if (r.mentioned) platforms[r.platform].mentioned++;
  }

  const mentionRates: Record<string, { rate: number; total: number; mentioned: number }> = {};
  for (const [platform, counts] of Object.entries(platforms)) {
    mentionRates[platform] = {
      rate: counts.total > 0 ? Math.round((counts.mentioned / counts.total) * 100) / 100 : 0,
      total: counts.total,
      mentioned: counts.mentioned,
    };
  }

  return NextResponse.json({
    brandId: brand.id,
    scanId: latestScan.id,
    scanDate: latestScan.completedAt,
    mentionRates,
  });
}
