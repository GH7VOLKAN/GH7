import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/panel/brand
 * Marka adı, domain, sektör ve userType güncellemesi.
 */
export async function PATCH(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.brand) {
      return NextResponse.json({ error: "No brand" }, { status: 401 });
    }

    const body = await req.json();
    const { name, domain, sector, userType } = body;

    const data: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof domain === "string") data.domain = domain.trim() || null;
    if (typeof sector === "string") data.sector = sector.trim() || null;
    if (typeof userType === "string" && userType.trim()) {
      const allowed = ["firma", "kisi", "eticaret", "yurtdisi"];
      if (allowed.includes(userType)) {
        data.userType = userType;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.brand.update({
      where: { id: activeBrand.brand.id },
      data,
    });

    return NextResponse.json({
      name: updated.name,
      domain: updated.domain,
      sector: updated.sector,
      userType: (updated as { userType?: string }).userType ?? "firma",
    });
  } catch (error) {
    console.error("[api/panel/brand] PATCH", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
