/**
 * POST /api/brands/[brandSlug]/competitors — Rakip ekle
 *   Body: { name: string, domain?: string, isPrimary?: boolean }
 *   Kural: brand başına max 3 isPrimary=true; kullanıcı ekleme max 10 rakip.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİI]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

function normalizeDomain(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim();
}

const MAX_COMPETITORS = 10;
const MAX_PRIMARY = 3;

export async function POST(
  request: Request,
  context: { params: Promise<{ brandSlug: string }> },
) {
  const { brandSlug } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brand = await prisma.brand.findFirst({
    where: { profileId: user.id, slug: brandSlug },
    select: { id: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    domain?: string;
    isPrimary?: boolean;
  };

  const name = body.name?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "name_required", message: "Rakip adı en az 2 karakter olmalı." },
      { status: 400 },
    );
  }

  const existing = await prisma.competitor.findMany({
    where: { brandId: brand.id },
    select: { id: true, isPrimary: true },
  });

  if (existing.length >= MAX_COMPETITORS) {
    return NextResponse.json(
      {
        error: "max_competitors",
        message: `En fazla ${MAX_COMPETITORS} rakip eklenebilir. Önce birini sil.`,
      },
      { status: 400 },
    );
  }

  const nn = normalizeName(name);
  const primaryCount = existing.filter((c) => c.isPrimary).length;
  const wantsPrimary = body.isPrimary ?? primaryCount < MAX_PRIMARY;
  if (wantsPrimary && primaryCount >= MAX_PRIMARY) {
    return NextResponse.json(
      {
        error: "max_primary",
        message: `Birincil rakip limiti ${MAX_PRIMARY}. Önce birini birincil olmaktan çıkar.`,
      },
      { status: 400 },
    );
  }

  const domain = body.domain?.trim()
    ? normalizeDomain(body.domain)
    : `${nn}.placeholder`;
  const nd = normalizeDomain(domain);

  try {
    const created = await prisma.competitor.create({
      data: {
        brandId: brand.id,
        name,
        normalizedName: nn,
        domain,
        normalizedDomain: nd,
        isPrimary: wantsPrimary,
        source: "manual",
      },
      select: {
        id: true,
        name: true,
        domain: true,
        isPrimary: true,
      },
    });
    return NextResponse.json({ success: true, competitor: created });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Unique") || message.includes("unique")) {
      return NextResponse.json(
        {
          error: "duplicate",
          message: "Bu rakip zaten eklenmiş.",
        },
        { status: 409 },
      );
    }
    console.error("[competitors/create] failed:", message);
    return NextResponse.json(
      { error: "create_failed", message },
      { status: 500 },
    );
  }
}
