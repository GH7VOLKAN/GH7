import { NextResponse, after } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";

export const maxDuration = 300;

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = (await request.json()) as { brandId: string };

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Check for already-running scan
  const runningScan = await prisma.scan.findFirst({
    where: { brandId, status: "running" },
  });

  if (runningScan) {
    return NextResponse.json(
      { error: "Scan already running", scanId: runningScan.id },
      { status: 409 }
    );
  }

  const platforms = getAvailablePlatforms();
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "No AI API keys configured" },
      { status: 400 }
    );
  }

  const scan = await prisma.scan.create({
    data: { brandId, status: "pending", type: "manual" },
  });

  after(async () => {
    try {
      await executeScan(scan.id, brandId);
    } catch (err) {
      console.error("[admin-scan-trigger] executeScan error:", err);
    }
  });

  return NextResponse.json({ scanId: scan.id, platforms });
}
