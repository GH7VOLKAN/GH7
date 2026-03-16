import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { discoverCompetitors } from "@/lib/ai/competitor-discoverer";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = (await request.json()) as { brandId: string };

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Return immediately, run discovery in background with after()
  after(async () => {
    try {
      console.log(`[discover-api] Starting competitor discovery for brand "${brand.name}"`);

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
        await prisma.competitor.deleteMany({ where: { brandId } });

        // Insert discovered competitors
        await prisma.competitor.createMany({
          data: result.competitors.map((c) => ({
            brandId,
            name: c.name,
            domain: c.domain,
            mentionScore: 0,
            readinessScore: 0,
            platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
            reason: c.reason,
            products: c.products,
            relevance: c.relevance,
            source: "ai_discovered",
            discoveredAt: new Date(),
          })),
        });

        console.log(
          `[discover-api] Saved ${result.competitors.length} competitors for "${brand.name}"`,
        );
      } else {
        console.warn(`[discover-api] No competitors found for "${brand.name}"`);
      }
    } catch (err) {
      console.error("[discover-api] Discovery failed:", err);
    }
  });

  return NextResponse.json({ status: "discovering" });
}
