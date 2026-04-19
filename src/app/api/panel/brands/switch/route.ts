/**
 * POST /api/panel/brands/switch
 *
 * Aktif brand'i değiştir. Cookie'ye `gh7_active_brand_id` yazar.
 * getActiveBrand() (dal/brand.ts) bu cookie'yi önce okur.
 *
 * Body: { brandId: string }
 *
 * Güvenlik: Brand mutlaka authenticated user'ın profile'ına ait olmalı.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const ACTIVE_BRAND_COOKIE = "gh7_active_brand_id";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { brandId } = body as { brandId?: string };

    if (!brandId || typeof brandId !== "string") {
      return NextResponse.json({ error: "brandId required" }, { status: 400 });
    }

    // Profile bul
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });
    if (!profile && user.email) {
      profile = await prisma.profile.findUnique({
        where: { email: user.email.toLowerCase() },
      });
    }
    if (!profile) {
      return NextResponse.json({ error: "No profile" }, { status: 404 });
    }

    // Brand ownership doğrula
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, profileId: profile.id },
      select: { id: true, name: true, domain: true },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found or not owned" },
        { status: 404 },
      );
    }

    // Cookie yaz (1 yıl, httpOnly için değil — client erişebilir)
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_BRAND_COOKIE, brand.id, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      success: true,
      brand: {
        id: brand.id,
        name: brand.name,
        domain: brand.domain,
      },
    });
  } catch (err) {
    console.error("[api/panel/brands/switch]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
