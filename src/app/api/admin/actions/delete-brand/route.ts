/**
 * POST /api/admin/actions/delete-brand
 *
 * Bir brand'i ve tüm ilgili kayıtlarını siler.
 * Cascade: Brand → Scan → PromptResult, Prompt, Competitor
 * GeoAudit ise userId'ye bağlı — brand'e değil. Manuel temizlenir.
 *
 * Admin-only. Body: { brandId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { brandId } = (await req.json()) as { brandId?: string };
  if (!brandId) {
    return NextResponse.json({ error: "brandId required" }, { status: 400 });
  }

  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { id: true, name: true, domain: true, profileId: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // GeoAudit url/brandName ile eşleşenleri de temizle
  try {
    await prisma.geoAudit.deleteMany({
      where: {
        userId: brand.profileId,
        OR: [
          { url: { contains: brand.domain ?? "", mode: "insensitive" } },
          { brandName: { equals: brand.name, mode: "insensitive" } },
        ],
      },
    });
  } catch (err) {
    console.warn("[admin/delete-brand] GeoAudit cleanup:", err);
  }

  // Brand silinince cascade ile Scan, Prompt, Competitor, PromptResult siler.
  await prisma.brand.delete({ where: { id: brandId } });

  return NextResponse.json({
    success: true,
    deletedBrand: { id: brand.id, name: brand.name },
  });
}
