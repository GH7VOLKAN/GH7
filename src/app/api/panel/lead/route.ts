/**
 * POST /api/panel/lead
 *
 * "Sizi Arayalım" form verilerini Supabase leads tablosuna kaydeder.
 * Auth opsiyonel — anonim kullanıcılar da lead bırakabilir.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, timeSlot, subject, source } = body;

    if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
      return NextResponse.json(
        { error: "Geçerli bir telefon numarası girin" },
        { status: 400 },
      );
    }

    // Auth opsiyonel — giriş yapmış kullanıcı varsa profileId ekle
    let profileId: string | null = null;
    let brandId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        profileId = user.id;

        const brand = await prisma.brand.findFirst({
          where: { profileId: user.id, isDefault: true },
          select: { id: true },
        });
        brandId = brand?.id ?? null;
      }
    } catch {
      // Auth başarısız — anonim lead olarak devam
    }

    // Lead'i Supabase'e kaydet
    const lead = await prisma.lead.create({
      data: {
        phone: phone.trim(),
        timeSlot: timeSlot || null,
        subject: subject || null,
        source: source || "sizi-arayalim",
        profileId,
        brandId,
        status: "new",
      },
    });

    console.log(`[lead] Yeni lead kaydedildi: ${lead.id} — ${phone} — ${subject || "belirtilmedi"}`);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("[lead] Kaydetme hatası:", error);
    return NextResponse.json(
      { error: "Lead kaydedilemedi" },
      { status: 500 },
    );
  }
}

// GET — admin için lead listesi
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("[lead] Liste hatası:", error);
    return NextResponse.json({ error: "Listelenemedi" }, { status: 500 });
  }
}
