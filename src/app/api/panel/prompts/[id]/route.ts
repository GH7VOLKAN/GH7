import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 },
      );
    }

    // Verify prompt belongs to user's brand
    const existing = await prisma.prompt.findFirst({
      where: { id, brandId: activeBrand.brand.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 },
      );
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { text: text.trim() },
    });

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("[api/panel/prompts/[id]] PUT", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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

    // Verify prompt belongs to user's brand
    const existing = await prisma.prompt.findFirst({
      where: { id, brandId: activeBrand.brand.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 },
      );
    }

    // Soft delete
    await prisma.prompt.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/panel/prompts/[id]] DELETE", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
