/**
 * POST /api/panel/ajans-paket-satin-al
 *
 * Ajans paketi satın alma talebi oluşturur.
 * Lead tablosuna kayıt atar ve bildirim gönderir.
 *
 * Body: { paketId: string, notes?: string }
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { AJANS_PAKETLERI } from "@/data/ajans-paketleri";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per 10 minutes per IP
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`ajans-paket:${ip}`, 5, 10);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin." },
        { status: 429 },
      );
    }

    // Auth required
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor." }, { status: 401 });
    }

    const body = await req.json();
    const { paketId, notes } = body;

    // Validate paketId
    const paket = AJANS_PAKETLERI.find((p) => p.id === paketId);
    if (!paket) {
      return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
    }

    // Get brand info if available
    let brandId: string | null = null;
    try {
      const brand = await prisma.brand.findFirst({
        where: { profileId: user.id, isDefault: true },
        select: { id: true },
      });
      brandId = brand?.id ?? null;
    } catch {
      // brand not found — continue
    }

    // Save as lead with agency-package source
    const lead = await prisma.lead.create({
      data: {
        phone: user.email ?? "",
        subject: `Ajans Paketi: ${paket.title} (₺${paket.price})`,
        source: "ajans-paketi",
        profileId: user.id,
        brandId,
        status: "new",
        notes: notes || null,
      },
    });

    console.log(
      `[ajans-paket] Yeni sipariş: ${lead.id} — ${paket.title} — ${user.email}`,
    );

    return NextResponse.json({ success: true, orderId: lead.id });
  } catch (error) {
    console.error("[ajans-paket] Kaydetme hatası:", error);
    return NextResponse.json(
      { error: "Talep kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
