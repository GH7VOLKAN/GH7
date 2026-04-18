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

    // Code is valid — get the tokenHash for Supabase session
    const tokenHash = verification.tokenHash;

    // Ensure the user profile exists with this phone number
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find or create profile for this phone user
    const existingProfile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!existingProfile) {
      // The Supabase user was created by generateLink in send-sms-otp
      // We need to find the Supabase user and create a profile
      const syntheticEmail = `phone_${normalizedPhone}@gh7.ai`;
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
            phoneVerified: true, // PR B: SMS OTP başarılı = telefon doğrulandı
            lastLoginAt: new Date(),
          },
        });
        console.log(
          `[sms-otp] Created profile for phone user: ${normalizedPhone.slice(0, 4)}****`
        );
      }
    } else {
      // PR B: Mevcut profile için phoneVerified + lastLoginAt güncelle
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          phoneVerified: true,
          lastLoginAt: new Date(),
        },
      });
    }

    // Delete the verification code (one-time use)
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    console.log(`[sms-otp] Verified for ${normalizedPhone.slice(0, 4)}****`);

    // Return tokenHash so client can create Supabase session
    return NextResponse.json({
      success: true,
      tokenHash,
    });
  } catch (err) {
    console.error("[sms-otp] verify-sms-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
