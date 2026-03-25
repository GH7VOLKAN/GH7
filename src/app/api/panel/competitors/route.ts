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

    const competitor = await prisma.competitor.create({
      data: {
        brandId: activeBrand.brand.id,
        name: name.trim(),
        domain: domain?.trim() ?? "",
        mentionScore: 0,
        readinessScore: 0,
        platforms: {
          chatgpt: 0,
          claude: 0,
          gemini: 0,
          perplexity: 0,
          google_aio: 0,
        },
        source: "manual",
      },
    });

    return NextResponse.json({ competitor }, { status: 201 });
  } catch (error) {
    console.error("[api/panel/competitors] POST", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
