import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

/**
 * GET /api/scan/share-of-voice
 * Returns share of voice — how often each competitor is mentioned vs the user.
 *
 * Response format:
 * {
 *   user: 40,
 *   competitors: [
 *     { name: "ABC Corp", share: 35 },
 *     { name: "XYZ Ltd", share: 25 },
 *   ]
 * }
 *
 * Calculation:
 * - Counts how many times the user's brand is mentioned across all prompt results
 * - Counts how many times each competitor name appears in the `competitors` array
 * - Normalizes to percentages (total = 100)
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

  if (!limits.shareOfVoice) {
    return NextResponse.json(
      { error: "Share of voice is a PRO+ feature", code: "PLAN_REQUIRED" },
      { status: 403 },
    );
  }

  // Get user's default brand
  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id },
    orderBy: { isDefault: "desc" },
    select: { id: true, name: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "No brand found" }, { status: 404 });
  }

  // Get known competitors for this brand
  const competitors = await prisma.competitor.findMany({
    where: { brandId: brand.id },
    select: { name: true },
  });

  // Get the latest completed scan
  const latestScan = await prisma.scan.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
    select: { id: true, completedAt: true },
  });

  if (!latestScan) {
    return NextResponse.json({ error: "No completed scans" }, { status: 404 });
  }

  // Fetch all prompt results for this scan
  const allResults = await prisma.promptResult.findMany({
    where: { scanId: latestScan.id },
    select: { mentioned: true, competitors: true },
  });

  const totalPrompts = allResults.length;
  if (totalPrompts === 0) {
    return NextResponse.json({
      brandId: brand.id,
      scanId: latestScan.id,
      user: 0,
      competitors: [],
    });
  }

  // Count user brand mentions
  const userMentions = allResults.filter((r) => r.mentioned).length;

  // Count competitor mentions from the `competitors` string array in each result
  const competitorMentions: Record<string, number> = {};
  for (const comp of competitors) {
    competitorMentions[comp.name] = 0;
  }

  for (const result of allResults) {
    const mentionedCompetitors = (result.competitors ?? []) as string[];
    for (const compName of mentionedCompetitors) {
      // Match against known competitors (case-insensitive)
      const known = competitors.find(
        (c) => c.name.toLowerCase() === compName.toLowerCase(),
      );
      if (known) {
        competitorMentions[known.name] = (competitorMentions[known.name] ?? 0) + 1;
      }
    }
  }

  // Calculate share of voice as percentages
  const totalMentions =
    userMentions + Object.values(competitorMentions).reduce((a, b) => a + b, 0);

  if (totalMentions === 0) {
    return NextResponse.json({
      brandId: brand.id,
      scanId: latestScan.id,
      scanDate: latestScan.completedAt,
      user: 0,
      competitors: competitors.map((c) => ({ name: c.name, share: 0 })),
    });
  }

  const userShare = Math.round((userMentions / totalMentions) * 100);
  const competitorShares = competitors.map((c) => ({
    name: c.name,
    share: Math.round(((competitorMentions[c.name] ?? 0) / totalMentions) * 100),
  }));

  // Sort competitors by share descending
  competitorShares.sort((a, b) => b.share - a.share);

  return NextResponse.json({
    brandId: brand.id,
    scanId: latestScan.id,
    scanDate: latestScan.completedAt,
    totalPrompts,
    totalMentions,
    user: userShare,
    competitors: competitorShares,
  });
}
