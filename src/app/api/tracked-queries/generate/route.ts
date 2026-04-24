/**
 * POST /api/tracked-queries/generate
 *
 * Brief N v4 Aşama 7 — Onboarding sorgu üretimi.
 * Brand bilgisinden Qwen ile 10 NICHE + 10 CATEGORY funnel üretir,
 * DB'ye yazmaz — taslakları kullanıcı onayına döner.
 *
 * Body: { brandSlug: string }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateNicheQueries } from "@/lib/tracked-queries/niche-generator";
import { generateCategoryQueries } from "@/lib/tracked-queries/category-generator";

export const maxDuration = 120;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    brandSlug?: string;
  };
  if (!body.brandSlug) {
    return NextResponse.json({ error: "brandSlug required" }, { status: 400 });
  }

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: body.brandSlug },
    select: {
      id: true,
      name: true,
      sector: true,
      city: true,
      gate: true,
      businessCategories: true,
      specialties: true,
    },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const input = {
    name: brand.name,
    sector: brand.sector,
    category: brand.businessCategories?.[0] ?? null,
    location: brand.city,
    features: [...(brand.specialties ?? []), ...(brand.businessCategories ?? [])],
    gate: brand.gate,
  };

  try {
    const [niche, category] = await Promise.all([
      generateNicheQueries(input),
      generateCategoryQueries(input),
    ]);

    return NextResponse.json({
      success: true,
      niche: niche.queries,
      category: category.queries,
      cost: {
        nicheUsd: niche.costUsd,
        categoryUsd: category.costUsd,
        totalUsd: niche.costUsd + category.costUsd,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[tracked-queries/generate] failed:", message);
    return NextResponse.json(
      { error: "generation_failed", message },
      { status: 500 },
    );
  }
}
