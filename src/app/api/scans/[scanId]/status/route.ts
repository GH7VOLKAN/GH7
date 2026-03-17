import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scanId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      brand: { select: { profileId: true } },
      _count: { select: { results: true } },
    },
  });

  if (!scan || scan.brand.profileId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Count total expected results
  const promptCount = await prisma.prompt.count({
    where: { brandId: scan.brandId, isActive: true },
  });

  const totalExpected = promptCount * 4; // 4 platforms
  const resultCount = scan._count.results;

  // Calculate progress percentage
  let progress = 0;
  if (scan.status === "completed") {
    progress = 100;
  } else if (scan.status === "running" && totalExpected > 0) {
    progress = Math.min(Math.round((resultCount / totalExpected) * 85), 85); // Cap at 85% during scan
  } else if (scan.status === "pending") {
    progress = 2;
  }

  // Check if audit exists (phase 2 indicator)
  const hasAudit = await prisma.auditCategory.count({
    where: { brandId: scan.brandId },
  });

  // Check if action tasks exist (phase 3 indicator)
  const hasActions = await prisma.actionTask.count({
    where: { brandId: scan.brandId, source: "ai_action_plan" },
  });

  return NextResponse.json({
    status: scan.status,
    resultCount,
    totalExpected,
    progress,
    hasAudit: hasAudit > 0,
    hasActions: hasActions > 0,
    completedAt: scan.completedAt?.toISOString() ?? null,
  });
}
