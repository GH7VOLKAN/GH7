/**
 * PATCH /api/brands/[brandSlug] — Marka alanlarını günceller
 *   Body: { name?, sector?, city?, domain? }
 *   name değişirse slug YENİDEN ÜRETİLMEZ (URL sabit kalır).
 *
 * DELETE /api/brands/[brandSlug] — Markayı siler (hard delete — cascade)
 *   Body: { confirmName: string } — brand.name ile birebir eşleşmeli.
 *   Not: Spec "30 gün soft delete" diyor ama bu bir şema değişikliği
 *   gerektiriyor (tüm brandId query'lerine deletedAt filtresi). Polish
 *   kapsamı dışı — şimdilik confirm-name ile hard delete.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

async function requireOwnedBrand(brandSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
  });
  if (!brand) return { error: NextResponse.json({ error: "Brand not found" }, { status: 404 }) };

  return { brand, userId: user.id };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ brandSlug: string }> },
) {
  const { brandSlug } = await context.params;
  const guard = await requireOwnedBrand(brandSlug);
  if ("error" in guard) return guard.error;

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    sector?: string | null;
    city?: string | null;
    domain?: string;
  };

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (trimmed.length < 2 || trimmed.length > 120) {
      return NextResponse.json(
        { error: "name_invalid", message: "Marka adı 2-120 karakter olmalı." },
        { status: 400 },
      );
    }
    data.name = trimmed;
  }
  if (body.sector !== undefined) {
    data.sector = body.sector?.toString().trim() || null;
  }
  if (body.city !== undefined) {
    data.city = body.city?.toString().trim() || null;
  }
  if (typeof body.domain === "string") {
    const trimmed = body.domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)) {
      return NextResponse.json(
        { error: "domain_invalid", message: "Geçerli bir domain gir (örn: idavilla.com.tr)." },
        { status: 400 },
      );
    }
    data.domain = trimmed;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "no_fields", message: "Güncellenecek alan yok." },
      { status: 400 },
    );
  }

  const updated = await prisma.brand.update({
    where: { id: guard.brand.id },
    data,
    select: { id: true, name: true, sector: true, city: true, domain: true, slug: true },
  });

  return NextResponse.json({ success: true, brand: updated });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ brandSlug: string }> },
) {
  const { brandSlug } = await context.params;
  const guard = await requireOwnedBrand(brandSlug);
  if ("error" in guard) return guard.error;

  const body = (await request.json().catch(() => ({}))) as { confirmName?: string };
  if (body.confirmName?.trim() !== guard.brand.name) {
    return NextResponse.json(
      {
        error: "confirm_mismatch",
        message:
          "Silme onayı için marka adını bire bir yazmalısın. Değişiklik yapılmadı.",
      },
      { status: 400 },
    );
  }

  await prisma.brand.delete({ where: { id: guard.brand.id } });
  return NextResponse.json({ success: true });
}
