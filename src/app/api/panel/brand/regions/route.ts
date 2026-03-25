import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const body = await req.json();
    const { regions } = body;

    if (!Array.isArray(regions)) {
      return NextResponse.json(
        { error: "regions must be an array" },
        { status: 400 },
      );
    }

    const updated = await prisma.brand.update({
      where: { id: activeBrand.brand.id },
      data: { serviceRegions: regions },
    });

    return NextResponse.json({
      serviceRegions: updated.serviceRegions,
    });
  } catch (error) {
    console.error("[api/panel/brand/regions]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
