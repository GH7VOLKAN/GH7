import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const prompts = await prisma.prompt.findMany({
      where: { brandId: activeBrand.brand.id, isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        results: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("[api/panel/prompts] GET", error);
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
    const { text, category, tags } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 },
      );
    }

    const prompt = await prisma.prompt.create({
      data: {
        brandId: activeBrand.brand.id,
        text: text.trim(),
        category: category ?? "manual",
        tags: tags ?? [],
        source: "manual",
        isActive: true,
      },
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("[api/panel/prompts] POST", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
