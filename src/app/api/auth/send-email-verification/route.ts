/**
 * /api/auth/send-email-verification
 *
 * Giriş yapmış kullanıcıya (veya body'de verilmiş e-postaya) doğrulama linki gönderir.
 * Token 24 saat geçerlidir.
 *
 * POST body: { email?: string }  — verilmezse session'daki kullanıcının e-postası kullanılır
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { sendEmailVerificationEmail } from "@/lib/email/resend";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const TOKEN_TTL_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let targetEmail: string | null = (body as { email?: string }).email ?? null;

    // Session'dan kullanıcıyı bul (varsa)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        if (!targetEmail) targetEmail = user.email ?? null;
      }
    } catch (err) {
      console.warn("[send-email-verification] Session read failed:", err);
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 },
      );
    }

    const normalizedEmail = targetEmail.toLowerCase().trim();

    // Synthetic phone e-postası ise reddet
    if (normalizedEmail.startsWith("phone_") && normalizedEmail.endsWith("@gh7.ai")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 },
      );
    }

    // Profile bul
    const profile = userId
      ? await prisma.profile.findUnique({ where: { id: userId } })
      : await prisma.profile.findFirst({ where: { email: normalizedEmail } });

    if (!profile) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 },
      );
    }

    if (profile.emailVerified) {
      return NextResponse.json(
        { success: true, alreadyVerified: true },
      );
    }

    // Token üret (32 byte hex)
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.gh7.ai";
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    await sendEmailVerificationEmail(normalizedEmail, verifyUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-email-verification] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 },
    );
  }
}
