import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const { id } = await params;

    // Verify competitor belongs to user's brand
    const existing = await prisma.competitor.findFirst({
      where: { id, brandId: activeBrand.brand.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 },
      );
    }

    await prisma.competitor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/panel/competitors/[id]] DELETE", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
