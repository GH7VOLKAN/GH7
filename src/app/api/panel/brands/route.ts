/**
 * GET /api/panel/brands
 *
 * Authenticated kullanıcının tüm brand'lerini listeler.
 * Sidebar brand dropdown'ında kullanılır.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Profile ara (id veya email ile)
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });
    if (!profile && user.email) {
      profile = await prisma.profile.findUnique({
        where: { email: user.email.toLowerCase() },
      });
    }

    if (!profile) {
      return NextResponse.json({ brands: [] });
    }

    const brands = await prisma.brand.findMany({
      where: { profileId: profile.id },
      select: {
        id: true,
        name: true,
        domain: true,
        isDefault: true,
        userType: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        domain: b.domain,
        isDefault: b.isDefault,
        userType: b.userType,
      })),
    });
  } catch (err) {
    console.error("[api/panel/brands] GET", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
