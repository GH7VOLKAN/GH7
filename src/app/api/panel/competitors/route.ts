import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorsData } from "@/lib/dal/competitors";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const data = await getCompetitorsData(activeBrand.brand.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/panel/competitors] GET", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const body = await req.json();
    const { name, domain } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 },
      );
    }

    // Duplicate detection + upsert
    const { upsertCompetitor } = await import("@/lib/ai/competitor-matching");
    const competitor = await upsertCompetitor({
      brandId: activeBrand.brand.id,
      name: name.trim(),
      domain: domain?.trim(),
      source: "manual",
    });

    return NextResponse.json({ competitor }, { status: 201 });
  } catch (error) {
    console.error("[api/panel/competitors] POST", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
