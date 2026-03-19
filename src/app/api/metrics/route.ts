import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { calculateAllMetrics } from "@/lib/metrics";
import { buildCorrelationTimeline } from "@/lib/metrics/correlation";

/**
 * GET /api/metrics
 *
 * Returns all 8 metrics for the current user's brand.
 * Auth required, plan-gated (Pro+).
 *
 * Query params:
 *   ?days=14  — lookback period in days (default: 30, max: 90)
 */
export async function GET(request: Request) {
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

  // Plan gate: metrics require Pro+
  if (!limits.mentionRate) {
    return NextResponse.json(
      { error: "Metrics is a PRO+ feature", code: "PLAN_REQUIRED" },
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

  // Parse lookback days from query params
  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get("days") ?? "30");
  const days = Math.max(7, Math.min(90, isNaN(daysParam) ? 30 : daysParam));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Fetch all prompt results for the brand within the lookback period
  const allResults = await prisma.promptResult.findMany({
    where: {
      scan: { brandId: brand.id, status: "completed" },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch prompts for question type analysis and google ranking
  const prompts = await prisma.prompt.findMany({
    where: { brandId: brand.id },
  });

  // Calculate all 8 metrics
  const metrics = calculateAllMetrics(allResults, prompts, brand.name);

  // Build correlation timeline
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

  return NextResponse.json({
    brandId: brand.id,
    brandName: brand.name,
    period: { days, since: since.toISOString() },
    metrics,
    correlation: {
      events: correlation.events,
      insights: correlation.insights,
    },
  });
}
