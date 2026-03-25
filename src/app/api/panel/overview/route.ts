import { NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }
    const data = await getOverviewData(activeBrand.brand.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/panel/overview]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
