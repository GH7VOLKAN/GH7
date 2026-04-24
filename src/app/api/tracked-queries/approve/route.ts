/**
 * POST /api/tracked-queries/approve
 *
 * Brief N v4 Aşama 7 — Onay sonrası TrackedQuery kayıtlarını yazar.
 * Niş sorgular unlockedAt=now, kategori sorgular unlockedAt=null (eşik
 * sistemi skor yükselince açar).
 *
 * Body: {
 *   brandSlug: string,
 *   niche: { query: string; rationale?: string }[],
 *   category: { difficulty: "EASY"|"MEDIUM"|"HARD"; orderIndex: number;
 *               step1: string; step2: string; step3: string;
 *               rationale?: string }[]
 * }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { persistNicheQueries } from "@/lib/tracked-queries/niche-persister";
import { persistCategoryQueries } from "@/lib/tracked-queries/category-persister";
import type { GeneratedCategoryFunnel } from "@/lib/tracked-queries/category-generator";
import type { GeneratedNicheQuery } from "@/lib/tracked-queries/niche-generator";

export const maxDuration = 60;

function validateNiche(input: unknown): GeneratedNicheQuery[] | null {
  if (!Array.isArray(input)) return null;
  const out: GeneratedNicheQuery[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const query = typeof rec.query === "string" ? rec.query.trim() : "";
    if (query.length < 5) continue;
    out.push({
      query,
      rationale: typeof rec.rationale === "string" ? rec.rationale : "",
    });
  }
  return out.length > 0 ? out.slice(0, 10) : null;
}

function validateCategory(input: unknown): GeneratedCategoryFunnel[] | null {
  if (!Array.isArray(input)) return null;
  const out: GeneratedCategoryFunnel[] = [];
  for (let i = 0; i < input.length; i++) {
    const item = input[i];
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const step1 = typeof rec.step1 === "string" ? rec.step1.trim() : "";
    const step2 = typeof rec.step2 === "string" ? rec.step2.trim() : "";
    const step3 = typeof rec.step3 === "string" ? rec.step3.trim() : "";
    if (!step1 || !step2 || !step3) continue;

    const diff = (["EASY", "MEDIUM", "HARD"].includes(String(rec.difficulty))
      ? rec.difficulty
      : "MEDIUM") as "EASY" | "MEDIUM" | "HARD";

    out.push({
      difficulty: diff,
      orderIndex: Number.isFinite(rec.orderIndex)
        ? Number(rec.orderIndex)
        : i + 1,
      step1,
      step2,
      step3,
      rationale: typeof rec.rationale === "string" ? rec.rationale : "",
    });
  }
  return out.length > 0 ? out.slice(0, 10) : null;
}

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
    niche?: unknown;
    category?: unknown;
  };

  if (!body.brandSlug) {
    return NextResponse.json({ error: "brandSlug required" }, { status: 400 });
  }

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: body.brandSlug },
    select: { id: true, slug: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const nicheQueries = validateNiche(body.niche);
  if (!nicheQueries) {
    return NextResponse.json(
      { error: "niche_invalid", message: "En az 1 geçerli niş sorgu gerekli" },
      { status: 400 },
    );
  }

  const categoryQueries = validateCategory(body.category);
  if (!categoryQueries) {
    return NextResponse.json(
      {
        error: "category_invalid",
        message: "En az 1 geçerli kategori funnel (step1/2/3 dolu) gerekli",
      },
      { status: 400 },
    );
  }

  try {
    const [nicheResult, categoryResult] = await Promise.all([
      persistNicheQueries(brand.id, nicheQueries),
      persistCategoryQueries(brand.id, categoryQueries),
    ]);

    return NextResponse.json({
      success: true,
      niche: {
        created: nicheResult.created,
        archived: nicheResult.archived,
      },
      category: {
        created: categoryResult.created,
        archived: categoryResult.archived,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[tracked-queries/approve] failed:", message);
    return NextResponse.json(
      { error: "persist_failed", message },
      { status: 500 },
    );
  }
}
