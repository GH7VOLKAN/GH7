import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

/**
 * PUT /api/profile
 * Update brand information (name, domain, sector, city, categories, regions)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      brandId,
      name,
      domain,
      sector,
      city,
      businessCategories,
      serviceRegions,
    } = body;

    if (!brandId) {
      return NextResponse.json({ error: "brandId gerekli" }, { status: 400 });
    }

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, profileId: user.id },
    });

    if (!brand) {
      return NextResponse.json({ error: "Marka bulunamad\u0131" }, { status: 404 });
    }

    // Update brand fields
    const updatedBrand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: name?.trim() || brand.name,
        domain: domain?.trim() || brand.domain,
        sector: sector?.trim() || null,
        city: city?.trim() || null,
        businessCategories: Array.isArray(businessCategories) ? businessCategories : brand.businessCategories,
        serviceRegions: Array.isArray(serviceRegions) ? serviceRegions : brand.serviceRegions,
      },
    });

    return NextResponse.json({
      success: true,
      brand: {
        id: updatedBrand.id,
        name: updatedBrand.name,
        domain: updatedBrand.domain,
        sector: updatedBrand.sector,
        city: updatedBrand.city,
        businessCategories: updatedBrand.businessCategories,
        serviceRegions: updatedBrand.serviceRegions,
      },
    });
  } catch (error) {
    console.error("[PUT /api/profile] Error:", error);
    return NextResponse.json(
      { error: "Sunucu hatas\u0131" },
      { status: 500 }
    );
  }
}
