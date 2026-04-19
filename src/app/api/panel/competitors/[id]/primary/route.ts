/**
 * POST /api/panel/competitors/[id]/primary
 *
 * Bir rakibi ana rakip (isPrimary=true) olarak işaretler veya kaldırır.
 * Kısıt: Brand başına max 3 ana rakip olabilir.
 *
 * Body: { primary: true | false }
 * Dönen: { id, isPrimary, primaryCount }
 */

import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_PRIMARY = 3;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const primary = !!body.primary;

    // Competitor'ın bu brand'e ait olduğunu doğrula
    const competitor = await prisma.competitor.findFirst({
      where: { id, brandId: activeBrand.brand.id },
    });
    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 },
      );
    }

    if (primary) {
      // Primary yapılıyorsa limit kontrol (kendi dışındaki primary sayısı)
      const currentPrimaryCount = await prisma.competitor.count({
        where: {
          brandId: activeBrand.brand.id,
          isPrimary: true,
          id: { not: id },
        },
      });
      if (currentPrimaryCount >= MAX_PRIMARY) {
        return NextResponse.json(
          {
            error: `Maksimum ${MAX_PRIMARY} ana rakip seçebilirsiniz. Önce birini kaldırın.`,
          },
          { status: 400 },
        );
      }
    }

    await prisma.competitor.update({
      where: { id },
      data: { isPrimary: primary },
    });

    const primaryCount = await prisma.competitor.count({
      where: { brandId: activeBrand.brand.id, isPrimary: true },
    });

    return NextResponse.json({
      id,
      isPrimary: primary,
      primaryCount,
      maxPrimary: MAX_PRIMARY,
    });
  } catch (err) {
    console.error("[api/panel/competitors/[id]/primary]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
