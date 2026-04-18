/**
 * POST /api/auth/verify-email-verification-code
 *
 * Body: { code: string }
 *
 * Authenticated user'ın e-posta adresine gönderilen 6 haneli kodu doğrular.
 * Başarılı olursa Profile.emailVerified=true yapar.
 * Yeni session OLUŞTURMAZ — kullanıcı zaten giriş yapmış durumda.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { verifyCodeHash, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { code } = (await req.json().catch(() => ({}))) as { code?: string };

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { error: "Geçerli 6 haneli kod gerekli" },
        { status: 400 },
      );
    }

    // Session kontrolü
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
      select: { id: true, email: true, emailVerified: true },
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
    const expectedTokenHash = `email-verify:${user.id}`;

    // En son non-expired doğrulama kodunu bul
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        tokenHash: expectedTokenHash,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Kod bulunamadı veya süresi doldu. Yeni kod isteyin." },
        { status: 400 },
      );
    }

    if (verification.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Çok fazla yanlış deneme. Yeni kod isteyin." },
        { status: 429 },
      );
    }

    if (!verifyCodeHash(code, verification.codeHash)) {
      // Deneme sayısını artır
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        {
          error: "Kod yanlış. Tekrar deneyin.",
          attemptsLeft: OTP_MAX_ATTEMPTS - verification.attempts - 1,
        },
        { status: 400 },
      );
    }

    // Başarılı — Profile.emailVerified=true
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    // Kullanılan kodu sil
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-email-verification-code] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verify failed" },
      { status: 500 },
    );
  }
}
