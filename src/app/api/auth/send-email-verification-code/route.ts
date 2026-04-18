/**
 * POST /api/auth/send-email-verification-code
 *
 * Authenticated user'ın e-posta adresine 6 haneli doğrulama kodu gönderir.
 * Kod VerificationCode tablosunda hash'li saklanır, Resend ile e-posta gönderilir.
 *
 * Not: Login OTP'den farklı — bu zaten giriş yapmış kullanıcının e-postasını
 * onaylamak için kullanılır. Yeni session oluşturmaz.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import {
  generateOtpCode,
  hashCode,
  OTP_EXPIRY_MINUTES,
  OTP_COOLDOWN_SECONDS,
} from "@/lib/auth/otp";
import { sendEmailVerificationCodeEmail } from "@/lib/email/resend";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Session kontrolü — sadece giriş yapmış kullanıcı e-posta doğrulayabilir
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { email: true, emailVerified: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil bulunamadı" },
        { status: 404 },
      );
    }

    if (profile.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    const normalizedEmail = profile.email.toLowerCase().trim();

    // Synthetic phone_*@gh7.ai kullanıcıları için geçerli e-posta yok
    if (
      normalizedEmail.startsWith("phone_") &&
      normalizedEmail.endsWith("@gh7.ai")
    ) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi tanımlı değil" },
        { status: 400 },
      );
    }

    // Rate limit: son OTP_COOLDOWN_SECONDS içinde kod gönderildi mi
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        tokenHash: { startsWith: "email-verify:" },
        createdAt: {
          gte: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCode) {
      const waitSeconds = Math.ceil(
        (recentCode.createdAt.getTime() +
          OTP_COOLDOWN_SECONDS * 1000 -
          Date.now()) /
          1000,
      );
      return NextResponse.json(
        { error: `Lütfen ${waitSeconds} saniye bekleyin` },
        { status: 429 },
      );
    }

    const code = generateOtpCode();
    const codeHash = hashCode(code);
    // tokenHash prefix'i bu kayıtları login kayıtlarından ayırır
    const tokenHash = `email-verify:${user.id}`;

    // Aynı e-posta için eski doğrulama kodlarını sil
    await prisma.verificationCode.deleteMany({
      where: {
        email: normalizedEmail,
        tokenHash: { startsWith: "email-verify:" },
      },
    });

    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        codeHash,
        tokenHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    await sendEmailVerificationCodeEmail(normalizedEmail, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-email-verification-code] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Send failed" },
      { status: 500 },
    );
  }
}
