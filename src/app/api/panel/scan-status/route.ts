/**
 * /api/panel/scan-status
 *
 * Aktif brand'ın en son scan'inin progress'ini döner. Polling için hafif.
 * ScanNowButton bu endpoint'i 5 saniyede bir yoklar.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getActiveBrand } from "@/lib/dal/brand";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json(
        { error: "Oturum yok" },
        { status: 401 },
      );
    }

    const brand = activeBrand.brand;

    // En son scan (herhangi bir status'te)
    const scan = await prisma.scan.findFirst({
      where: { brandId: brand.id },
      orderBy: { startedAt: "desc" },
      include: {
        _count: { select: { results: true } },
      },
    });

    if (!scan) {
      return NextResponse.json({
        hasScan: false,
        message: "Hiç scan yok",
      });
    }

    // Hedef: platform count × prompt count
    const platformCount = getAvailablePlatforms().length;
    const promptCount = await prisma.prompt.count({
      where: { brandId: brand.id, isActive: true },
    });
    const expectedTotal = platformCount * promptCount;

    const resultCount = scan._count.results;
    const progressPct =
      expectedTotal > 0
        ? Math.min(100, Math.round((resultCount / expectedTotal) * 100))
        : 0;

    const elapsedMs =
      scan.completedAt && scan.startedAt
        ? scan.completedAt.getTime() - scan.startedAt.getTime()
        : Date.now() - scan.startedAt.getTime();

    return NextResponse.json({
      hasScan: true,
      scanId: scan.id,
      status: scan.status,
      type: scan.type,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt,
      resultCount,
      expectedTotal,
      progressPct,
      elapsedMs,
      elapsedSec: Math.round(elapsedMs / 1000),
      promptCount,
      platformCount,
      isActive: scan.status === "running" || scan.status === "pending",
      isDone: scan.status === "completed",
      isFailed: scan.status === "failed",
    });
  } catch (err) {
    console.error("[scan-status] Error:", err);
    return NextResponse.json(
      {
        error: "scan-status failed",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
