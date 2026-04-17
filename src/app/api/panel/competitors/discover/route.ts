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
          // Upsert — duplicate varsa merge, yoksa insert (delete etmiyoruz artık)
          const { upsertCompetitor } = await import(
            "@/lib/ai/competitor-matching"
          );
          for (const c of result.competitors) {
            await upsertCompetitor({
              brandId: brand.id,
              name: c.name,
              domain: c.domain,
              reason: c.reason,
              products: c.products,
              relevance: c.relevance,
              source: "ai_discovered",
            });
          }

          console.log(
            `[panel/competitors/discover] Upserted ${result.competitors.length} competitors for "${brand.name}"`,
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
