import { NextResponse, after } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";
import { discoverCompetitors } from "@/lib/ai/competitor-discoverer";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const brand = activeBrand.brand;

    // Return immediately, run discovery in background with after()
    after(async () => {
      try {
        console.log(
          `[panel/competitors/discover] Starting competitor discovery for brand "${brand.name}"`,
        );

        const result = await discoverCompetitors({
          name: brand.name,
          domain: brand.domain,
          sector: brand.sector,
          city: brand.city,
          type: brand.type as "firma" | "kisisel",
          specialties: brand.specialties,
          competitorNames: brand.competitorNames,
        });

        if (result.competitors.length > 0) {
          // Remove existing competitors
          await prisma.competitor.deleteMany({
            where: { brandId: brand.id },
          });

          // Insert discovered competitors
          await prisma.competitor.createMany({
            data: result.competitors.map((c) => ({
              brandId: brand.id,
              name: c.name,
              domain: c.domain,
              mentionScore: 0,
              readinessScore: 0,
              platforms: {
                chatgpt: 0,
                claude: 0,
                gemini: 0,
                perplexity: 0,
                google_aio: 0,
              },
              reason: c.reason,
              products: c.products,
              relevance: c.relevance,
              source: "ai_discovered",
              discoveredAt: new Date(),
            })),
          });

          console.log(
            `[panel/competitors/discover] Saved ${result.competitors.length} competitors for "${brand.name}"`,
          );
        } else {
          console.warn(
            `[panel/competitors/discover] No competitors found for "${brand.name}"`,
          );
        }
      } catch (err) {
        console.error(
          "[panel/competitors/discover] Discovery failed:",
          err,
        );
      }
    });

    return NextResponse.json({ status: "discovering" });
  } catch (error) {
    console.error("[api/panel/competitors/discover]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
