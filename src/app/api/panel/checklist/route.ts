import { NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { getChecklistData } from "@/lib/dal/checklist";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const data = await getChecklistData(activeBrand.brand.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/panel/checklist]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
