import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";
import { generateSmartPrompts } from "@/lib/ai/prompt-generator";
import { getPlanLimits } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const brand = activeBrand.brand;
    const body = await req.json();
    const { categories, city } = body;

    const limits = getPlanLimits(activeBrand.plan);
    const promptCount = limits.maxPrompts;

    const businessCategories =
      categories && categories.length > 0
        ? categories
        : brand.businessCategories.length > 0
          ? brand.businessCategories
          : brand.sector
            ? [brand.sector]
            : [];

    const brandCity = city || brand.city || null;

    // Delete existing prompts before regenerating
    await prisma.prompt.deleteMany({ where: { brandId: brand.id } });

    const smartPrompts = await generateSmartPrompts(
      {
        name: brand.name,
        domain: brand.domain,
        sector: brand.sector,
        city: brandCity,
        type: brand.type as "firma" | "kisisel",
        profession: brand.profession,
        specialties: brand.specialties,
        competitorNames: brand.competitorNames,
        businessCategories,
        serviceRegions: brand.serviceRegions,
      },
      promptCount,
    );

    if (smartPrompts.length > 0) {
      await prisma.prompt.createMany({
        data: smartPrompts.map((p) => ({
          brandId: brand.id,
          text: p.text,
          tags: p.tags,
          source: p.source,
          category: p.category,
          isActive: true,
          businessArea: p.businessArea || null,
          searchIntent: p.searchIntent || null,
          salesPotential: p.salesPotential || null,
        })),
      });
    }

    return NextResponse.json({
      prompts: smartPrompts.map((p) => ({
        text: p.text,
        category: p.category,
        salesPotential: p.salesPotential,
        businessArea: p.businessArea,
        searchIntent: p.searchIntent,
      })),
      count: smartPrompts.length,
      plan: activeBrand.plan,
    });
  } catch (error) {
    console.error("[api/panel/prompts/discover]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
