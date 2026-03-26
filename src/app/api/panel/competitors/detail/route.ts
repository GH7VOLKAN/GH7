import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { getCompetitorDeepDetail } from "@/lib/dal/competitors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    const name = searchParams.get("name");

    if (!brandId || !name) {
      return NextResponse.json(
        { error: "brandId and name are required" },
        { status: 400 },
      );
    }

    // Verify the brand belongs to the user
    if (brandId !== activeBrand.brand.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const detail = await getCompetitorDeepDetail(brandId, name);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("[api/panel/competitors/detail] GET", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
