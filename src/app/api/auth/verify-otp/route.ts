import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyCodeHash, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "E-posta ve doğrulama kodu gerekli" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent non-expired verification code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Kodun süresi dolmuş. Lütfen yeni kod isteyin." },
        { status: 400 }
      );
    }

    // Check max attempts
    if (verification.attempts >= OTP_MAX_ATTEMPTS) {
      // Delete the used-up code
      await prisma.verificationCode.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen yeni kod isteyin." },
        { status: 400 }
      );
    }

    // Verify the code
    if (!verifyCodeHash(code.toString().trim(), verification.codeHash)) {
      // Increment attempt counter
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = OTP_MAX_ATTEMPTS - verification.attempts - 1;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Yanlış kod. ${remaining} deneme hakkınız kaldı.`
              : "Yanlış kod. Lütfen yeni kod isteyin.",
        },
        { status: 400 }
      );
    }

    // Code is valid — get the tokenHash for Supabase session
    const tokenHash = verification.tokenHash;

    // Delete the verification code (one-time use)
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    console.log(`[otp] Verified for ${normalizedEmail}`);

    // Return tokenHash so client can create Supabase session
    return NextResponse.json({
      success: true,
      tokenHash,
    });
  } catch (err) {
    console.error("[otp] verify-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
