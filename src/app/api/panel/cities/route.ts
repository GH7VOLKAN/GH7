import { NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const brand = activeBrand.brand;
    const regions: string[] = (brand.serviceRegions as string[]) ?? [];

    if (regions.length === 0) {
      return NextResponse.json({ cities: [] });
    }

    // Get all prompt results for the brand
    const results = await prisma.promptResult.findMany({
      where: {
        scan: { brandId: brand.id, status: "completed" },
      },
      select: {
        response: true,
        mentioned: true,
      },
    });

    // For each city, calculate a score based on prompts that mention the city
    const cities = regions.map((city) => {
      const cityLower = city.toLowerCase();
      let totalMentions = 0;
      let mentionedInCity = 0;

      for (const r of results) {
        const text = (r.response ?? "").toLowerCase();
        if (text.includes(cityLower)) {
          totalMentions++;
          if (r.mentioned) {
            mentionedInCity++;
          }
        }
      }

      const score =
        totalMentions > 0
          ? Math.round((mentionedInCity / totalMentions) * 100)
          : 0;

      return {
        city,
        totalMentions,
        mentionedInCity,
        score,
      };
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[api/panel/cities]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
