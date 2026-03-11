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

  return NextResponse.json({
    status: scan.status,
    resultCount: scan._count.results,
    totalExpected: promptCount * 4, // 4 platforms
    completedAt: scan.completedAt?.toISOString() ?? null,
  });
}
