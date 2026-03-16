import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";

// Keep serverless function alive for up to 5 minutes for scan execution
export const maxDuration = 300;

// Clean up scans stuck in "running" for more than 10 minutes
async function cleanupStuckScans(brandId: string) {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const stuck = await prisma.scan.updateMany({
    where: {
      brandId,
      status: "running",
      startedAt: { lt: tenMinutesAgo },
    },
    data: { status: "failed", completedAt: new Date() },
  });
  if (stuck.count > 0) {
    console.warn(`[scan-start] Cleaned up ${stuck.count} stuck scans`);
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = (await request.json()) as { brandId: string };

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Cleanup stuck scans first
  await cleanupStuckScans(brandId);

  // Check for already-running scan
  const runningScan = await prisma.scan.findFirst({
    where: { brandId, status: "running" },
  });

  if (runningScan) {
    return NextResponse.json(
      { error: "Scan already running", scanId: runningScan.id },
      { status: 409 },
    );
  }

  const platforms = getAvailablePlatforms();
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "No AI API keys configured" },
      { status: 400 },
    );
  }

  const scan = await prisma.scan.create({
    data: { brandId, status: "pending", type: "manual" },
  });

  // Use after() to keep the serverless function alive after responding
  after(async () => {
    try {
      await executeScan(scan.id, brandId);
    } catch (err) {
      console.error("[scan-start] executeScan error:", err);
    }
  });

  return NextResponse.json({ scanId: scan.id, platforms });
}
