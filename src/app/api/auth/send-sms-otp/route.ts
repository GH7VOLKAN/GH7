import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import {
  generateOtpCode,
  hashCode,
  OTP_EXPIRY_MINUTES,
  OTP_COOLDOWN_SECONDS,
} from "@/lib/auth/otp";
import {
  sendSms,
  normalizePhoneNumber,
  isValidTurkishPhone,
} from "@/lib/sms/netgsm";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, mode } = body as {
      phone?: string;
      // "login" (default) → sadece kayıtlı kullanıcı için kod gönder
      // "register" → kayıt için kod gönder (/analiz akışı kullanır)
      mode?: "login" | "register";
    };

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Telefon numarası gerekli" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    if (!isValidTurkishPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: "Geçerli bir Türkiye cep telefonu numarası girin" },
        { status: 400 }
      );
    }

    // GİRİŞ SADECE KAYITLI KULLANICI İÇİN
    // mode="login" (default): Profile + Supabase user kontrol, yoksa reddet.
    // mode="register" (/analiz'den): Profile yoksa izin ver (kayıt akışı).
    const effectiveMode = mode ?? "login";
    if (effectiveMode === "login") {
      const existingProfile = await prisma.profile.findFirst({
        where: { phone: normalizedPhone },
        select: { id: true },
      });

      let supabaseUserExists = false;
      if (existingProfile) {
        try {
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
          );
          const { data } = await supabaseAdmin.auth.admin.getUserById(
            existingProfile.id,
          );
          supabaseUserExists = Boolean(data?.user);
        } catch (err) {
          console.warn("[sms-otp] Supabase user check failed:", err);
        }

        if (!supabaseUserExists) {
          // Orphan Profile → temizle
          console.warn(
            `[sms-otp] Orphan Profile found for ${normalizedPhone.slice(0, 4)}**** (Supabase user missing). Cleaning up.`,
          );
          try {
            await prisma.profile.delete({ where: { id: existingProfile.id } });
          } catch (err) {
            console.error("[sms-otp] Orphan cleanup failed:", err);
          }
        }
      }

      if (!existingProfile || !supabaseUserExists) {
        return NextResponse.json(
          {
            error: "NO_ACCOUNT",
            message:
              "Bu telefon ile kayıtlı hesap bulunamadı. Ücretsiz analiz ile başlayın.",
            redirectTo: "/analiz",
          },
          { status: 404 },
        );
      }
    }

    console.log(`[sms-otp] Request for phone: ${normalizedPhone.slice(0, 4)}**** mode=${effectiveMode}`);

    // Rate limit: 5 SMS per hour per phone number
    const rl = await checkRateLimit(`sms:${normalizedPhone}`, 5, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." },
        { status: 429 },
      );
    }

    // Rate limit: Check for recent code sent to this phone
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        phone: normalizedPhone,
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
          1000
      );
      return NextResponse.json(
        { error: `Lütfen ${waitSeconds} saniye bekleyin` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = generateOtpCode();
    const codeHash = hashCode(code);

    // Look up existing user by phone in profiles table
    const existingProfile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
    });

    // Determine the email to use for Supabase auth
    // If user has a profile with an email, use that
    // Otherwise, create a synthetic email based on phone number
    const authEmail = existingProfile?.email || `phone_${normalizedPhone}@gh7.ai`;

    console.log(
      `[sms-otp] User lookup: ${existingProfile ? "found" : "new"}, auth email: ${authEmail}`
    );

    // Generate Supabase magic link (admin) for session creation later
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: authEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[sms-otp] Supabase generateLink error:", linkError);
      return NextResponse.json(
        { error: "Doğrulama kodu oluşturulamadı" },
        { status: 500 }
      );
    }

    const tokenHash = linkData.properties.hashed_token;

    // Delete any existing codes for this phone
    await prisma.verificationCode.deleteMany({
      where: { phone: normalizedPhone },
    });

    // Store new verification code
    await prisma.verificationCode.create({
      data: {
        phone: normalizedPhone,
        codeHash,
        tokenHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    // Send SMS via Netgsm
    const smsResult = await sendSms(
      normalizedPhone,
      `GH7 giris kodunuz: ${code}`
    );

    if (!smsResult.success) {
      console.error("[sms-otp] SMS send failed:", smsResult.error);
      // Clean up the verification code since SMS failed
      await prisma.verificationCode.deleteMany({
        where: { phone: normalizedPhone },
      });
      return NextResponse.json(
        { error: smsResult.error || "SMS gönderilemedi" },
        { status: 500 }
      );
    }

    console.log(`[sms-otp] Code sent to ${normalizedPhone.slice(0, 4)}****`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[sms-otp] send-sms-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
