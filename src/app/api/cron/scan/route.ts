import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { isPro } from "@/lib/plans";

export const maxDuration = 300; // 5 min max for Vercel Pro

const PROFILE_BATCH_SIZE = 5;
const BATCH_DELAY_MS = 3000;

/**
 * Cron: Scheduled scan — runs Mon/Wed/Fri at 06:00 UTC
 * Processes PRO/BUSINESS/AGENCY profiles in batches of 5
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header automatically)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paidPlans = ["pro", "business", "agency"];

  // Find all brands belonging to paid profiles with auto-scan enabled
  const brands = await prisma.brand.findMany({
    where: {
      autoScan: true,
      scanInterval: { not: "manual" },
      profile: {
        plan: { in: paidPlans },
      },
    },
    include: {
      profile: {
        select: { id: true, plan: true },
      },
      prompts: {
        where: { isActive: true },
        select: { id: true },
      },
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  // Filter: skip brands with no prompts or recent scan (< 20 hours ago)
  const now = Date.now();
  const eligibleBrands = brands.filter((brand) => {
    if (brand.prompts.length === 0) return false;
    const plan = brand.profile?.plan ?? "free";
    if (!isPro(plan)) return false;

    const lastScanTime = brand.scans[0]?.completedAt?.getTime() ?? 0;
    const hoursSince = (now - lastScanTime) / (1000 * 60 * 60);
    return hoursSince > 20; // At least 20 hours since last scan
  });

  console.log(
    `[cron/scan] Found ${eligibleBrands.length} eligible brands out of ${brands.length} total`,
  );

  let triggered = 0;
  let failed = 0;
  const results: Array<{ brandId: string; brandName: string; status: string }> = [];

  // Process in batches of PROFILE_BATCH_SIZE
  for (let i = 0; i < eligibleBrands.length; i += PROFILE_BATCH_SIZE) {
    const batch = eligibleBrands.slice(i, i + PROFILE_BATCH_SIZE);
    const batchNum = Math.floor(i / PROFILE_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(eligibleBrands.length / PROFILE_BATCH_SIZE);

    console.log(
      `[cron/scan] Processing batch ${batchNum}/${totalBatches} (${batch.length} brands)`,
    );

    // Process each brand in the batch sequentially to respect rate limits
    for (const brand of batch) {
      try {
        // Check for already-running scan
        const runningScan = await prisma.scan.findFirst({
          where: { brandId: brand.id, status: "running" },
        });

        if (runningScan) {
          console.warn(`[cron/scan] Skipping brand ${brand.id} — scan already running`);
          results.push({ brandId: brand.id, brandName: brand.name, status: "skipped_running" });
          continue;
        }

        const scan = await prisma.scan.create({
          data: { brandId: brand.id, status: "pending", type: "scheduled" },
        });

        await executeScan(scan.id, brand.id);
        triggered++;
        results.push({ brandId: brand.id, brandName: brand.name, status: "completed" });
      } catch (error) {
        failed++;
        console.error(`[cron/scan] Failed for brand ${brand.id}:`, error);
        results.push({ brandId: brand.id, brandName: brand.name, status: "failed" });
      }
    }

    // Delay between batches to avoid rate limiting
    if (i + PROFILE_BATCH_SIZE < eligibleBrands.length) {
      console.log(`[cron/scan] Waiting ${BATCH_DELAY_MS}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  console.log(
    `[cron/scan] Done: ${triggered} triggered, ${failed} failed out of ${eligibleBrands.length} eligible`,
  );

  return NextResponse.json({
    success: true,
    brandsChecked: brands.length,
    eligibleBrands: eligibleBrands.length,
    scansTriggered: triggered,
    scansFailed: failed,
    results,
  });
}
