/**
 * POST /api/admin/actions/cleanup-stuck-scans
 *
 * 10+ dakikadır "running" olan scan'leri temizler.
 * resultCount > 0 → "completed", yoksa "failed".
 *
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const threshold = new Date(Date.now() - 10 * 60 * 1000);
  const stuck = await prisma.scan.findMany({
    where: { status: "running", startedAt: { lt: threshold } },
    include: { _count: { select: { results: true } } },
  });

  let completed = 0;
  let failed = 0;
  for (const s of stuck) {
    const newStatus = s._count.results > 0 ? "completed" : "failed";
    await prisma.scan.update({
      where: { id: s.id },
      data: { status: newStatus, completedAt: new Date() },
    });
    if (newStatus === "completed") completed++;
    else failed++;
  }

  return NextResponse.json({
    success: true,
    found: stuck.length,
    completed,
    failed,
  });
}
