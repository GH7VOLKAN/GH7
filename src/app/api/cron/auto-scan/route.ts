import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";

export const maxDuration = 300; // 5 min max for Vercel Pro

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header automatically)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = await prisma.brand.findMany({
    where: {
      autoScan: true,
      scanInterval: { not: "manual" },
    },
    include: {
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
      prompts: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  const now = Date.now();
  let triggered = 0;

  for (const brand of brands) {
    // Skip brands with no active prompts
    if (brand.prompts.length === 0) continue;

    const lastScan = brand.scans[0];
    const lastScanTime = lastScan?.completedAt?.getTime() ?? 0;
    const hoursSince = (now - lastScanTime) / (1000 * 60 * 60);

    const shouldScan =
      (brand.scanInterval === "daily" && hoursSince > 23) ||
      (brand.scanInterval === "weekly" && hoursSince > 156); // 6.5 days

    if (!shouldScan) continue;

    try {
      const scan = await prisma.scan.create({
        data: { brandId: brand.id, status: "pending" },
      });

      // Execute sequentially to respect rate limits
      await executeScan(scan.id, brand.id);
      triggered++;
    } catch (error) {
      console.error(
        `[auto-scan] Failed for brand ${brand.id}:`,
        error,
      );
    }
  }

  return NextResponse.json({
    success: true,
    brandsChecked: brands.length,
    scansTriggered: triggered,
  });
}
