/**
 * DELETE /api/brands/[brandSlug]/competitors/[competitorId] — Rakip sil
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ brandSlug: string; competitorId: string }> },
) {
  const { brandSlug, competitorId } = await context.params;

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

  const competitor = await prisma.competitor.findFirst({
    where: { id: competitorId, brandId: brand.id },
    select: { id: true },
  });
  if (!competitor) {
    return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
  }

  await prisma.competitor.delete({ where: { id: competitor.id } });
  return NextResponse.json({ success: true });
}
