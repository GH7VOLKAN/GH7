/**
 * POST /api/analiz/newsletter-optin
 *
 * GH7 Advisor Haftalık e-bülten opt-in/opt-out endpoint'i.
 * KVKK uyumlu consent tarihi kaydı — Profile.newsletterOptIn +
 * Profile.newsletterOptInAt güncellenir.
 *
 * Not (MVP): şu an auth'suz — ileride Supabase session check eklenecek.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profileId, optIn } = body as {
      profileId?: string;
      optIn?: boolean;
    };

    if (!profileId || typeof optIn !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "profileId ve optIn gerekli." },
        { status: 400 },
      );
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        newsletterOptIn: optIn,
        newsletterOptInAt: optIn ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter-optin] error:", err);
    return NextResponse.json(
      { ok: false, error: "Sistem hatası." },
      { status: 500 },
    );
  }
}
