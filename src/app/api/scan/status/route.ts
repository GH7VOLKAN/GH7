import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/scan/status?brandId=xxx
 * Returns current scan progress for a brand (not a specific scanId).
 * Used by the AnalysisBanner to show progressive loading state.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get("brandId");

  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  // Verify ownership
  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
  });

  if (!brand) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check for running/pending scan
  const activeScan = await prisma.scan.findFirst({
    where: { brandId, status: { in: ["running", "pending"] } },
    orderBy: { startedAt: "desc" },
    include: { _count: { select: { results: true } } },
  });

  if (!activeScan) {
    // Check if there's a recently completed scan (within last 30 seconds)
    const recentScan = await prisma.scan.findFirst({
      where: {
        brandId,
        status: "completed",
        completedAt: { gte: new Date(Date.now() - 30_000) },
      },
      orderBy: { completedAt: "desc" },
    });

    if (recentScan) {
      return NextResponse.json({
        status: "completed" as const,
        completed: 0,
        total: 0,
        phase: "completed" as const,
      });
    }

    return NextResponse.json({
      status: "idle" as const,
      completed: 0,
      total: 0,
      phase: "idle" as const,
    });
  }

  // Count total expected results
  const promptCount = await prisma.prompt.count({
    where: { brandId, isActive: true },
  });
  const totalExpected = promptCount * 5; // 5 platforms
  const resultCount = activeScan._count.results;

  // Determine phase
  let phase: "scanning" | "audit" | "checklist" = "scanning";
  if (activeScan.status === "running" && resultCount >= totalExpected && totalExpected > 0) {
    // Scan results done, likely in audit/action plan phase
    const hasAudit = await prisma.auditCategory.count({ where: { brandId } });
    phase = hasAudit > 0 ? "checklist" : "audit";
  }

  return NextResponse.json({
    status: "scanning" as const,
    completed: resultCount,
    total: totalExpected,
    phase,
  });
}
