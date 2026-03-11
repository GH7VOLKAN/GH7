import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";

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
    data: { brandId, status: "pending" },
  });

  // Fire-and-forget
  executeScan(scan.id, brandId).catch(console.error);

  return NextResponse.json({ scanId: scan.id, platforms });
}
