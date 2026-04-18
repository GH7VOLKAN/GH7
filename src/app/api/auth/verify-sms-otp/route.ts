import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { verifyCodeHash, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Telefon numarası ve doğrulama kodu gerekli" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    // Find the most recent non-expired verification code for this phone
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: normalizedPhone,
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

    // Code is valid
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const syntheticEmail = `phone_${normalizedPhone}@gh7.ai`;

    // Find or create profile for this phone user
    const existingProfile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!existingProfile) {
      const { data: userData } =
        await supabaseAdmin.auth.admin.listUsers();

      const supabaseUser = userData?.users?.find(
        (u) => u.email === syntheticEmail
      );

      if (supabaseUser) {
        await prisma.profile.create({
          data: {
            id: supabaseUser.id,
            email: syntheticEmail,
            phone: normalizedPhone,
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        });
        console.log(
          `[sms-otp] Created profile for phone user: ${normalizedPhone.slice(0, 4)}****`
        );
      }
    } else {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          phoneVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    // KRITIK: Client supabase.auth.verifyOtp için TAZE tokenHash oluştur.
    // Eski tokenHash (send-sms-otp'de oluşan) consume edilmiş veya expire
    // olmuş olabilir → "Email link is invalid or has expired" hatası.
    // Her verify çağrısında yeni bir magic link üretilir.
    let freshTokenHash: string | null = null;
    try {
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: syntheticEmail,
        });
      if (linkError || !linkData?.properties?.hashed_token) {
        console.error(
          "[sms-otp] Fresh magic link generation failed:",
          linkError,
        );
      } else {
        freshTokenHash = linkData.properties.hashed_token;
      }
    } catch (err) {
      console.error("[sms-otp] Fresh magic link exception:", err);
    }

    // Fallback: taze üretilemezse stored tokenHash'i kullan (eski davranış)
    const tokenHash = freshTokenHash ?? verification.tokenHash;

    // Delete the verification code (one-time use)
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    console.log(
      `[sms-otp] Verified for ${normalizedPhone.slice(0, 4)}**** (tokenHash=${freshTokenHash ? "fresh" : "stored"})`,
    );

    return NextResponse.json({
      success: true,
      tokenHash,
      email: syntheticEmail,
    });
  } catch (err) {
    console.error("[sms-otp] verify-sms-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
