import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateSmartPrompts } from "@/lib/ai/prompt-generator";
import { getPlanLimits } from "@/lib/plans";

export const maxDuration = 120;

/**
 * POST /api/prompts/generate
 * Input:  { profileId, categories?, city? }
 * Output: { prompts: [{text, category, salesPotential, businessArea}], count }
 *
 * Spec Görev 2: Faaliyet alanı bazlı, öneri odaklı prompt üretimi.
 * Her faaliyet alanı için 2 Sonar sorgusu → ~100 ham soru → Claude filtre → 50 (Free=10)
 * KURALLAR:
 *  - HİÇBİR promptta firma adı olmasın
 *  - %60 firma önerisi, %20 karşılaştırma, %20 dolaylı
 *  - "Kaç yıl dayanır" tarzı saf bilgi soruları YASAK
 *  - Her faaliyet alanından eşit dağılım
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { profileId, categories, city } = body;

  // Get brand for this profile
  const brand = await prisma.brand.findFirst({
    where: profileId ? { id: profileId } : { profileId: user.id, isDefault: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Verify ownership
  if (brand.profileId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get plan limits
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);
  const promptCount = limits.maxPrompts;

  // Merge categories with brand's existing businessCategories
  const businessCategories =
    categories && categories.length > 0
      ? categories
      : brand.businessCategories.length > 0
        ? brand.businessCategories
        : brand.sector
          ? [brand.sector]
          : [];

  const brandCity = city || brand.city || null;

  try {
    // Delete existing prompts for this brand before regenerating
    await prisma.prompt.deleteMany({ where: { brandId: brand.id } });

    // Generate smart prompts
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
      plan,
    });
  } catch (err) {
    console.error("[prompts/generate] Failed:", err);
    return NextResponse.json(
      { error: "Prompt üretimi sırasında hata oluştu" },
      { status: 500 },
    );
  }
}
