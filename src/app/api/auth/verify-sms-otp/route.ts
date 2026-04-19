import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { verifyCodeHash, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";
import { isAdmin, getAdminMagicCode } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, code, email } = body as {
      phone?: string;
      code?: string;
      // Kayıt akışında formda girilen GERÇEK email.
      // Profile yeni oluşturulacaksa email alanı buradan doldurulur.
      email?: string;
    };

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Telefon numarası ve doğrulama kodu gerekli" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    const trimmedCode = code.toString().trim();
    const providedEmail = email?.trim().toLowerCase();
    const isValidEmail =
      !!providedEmail && /^.+@.+\..+$/.test(providedEmail);

    // ADMIN BYPASS — ADMIN_PHONES listesindeki numara + ADMIN_MAGIC_CODE
    // (default "000000") → OTP'yi atla, direkt doğrula.
    // Üretimde: Vercel ADMIN_PHONES + ADMIN_MAGIC_CODE env var'ları set.
    const isAdminPhone = isAdmin({ phone: normalizedPhone });
    const magicCode = getAdminMagicCode();
    const adminBypass = isAdminPhone && trimmedCode === magicCode;
    if (adminBypass) {
      console.log(
        `[verify-sms-otp] Admin bypass aktif: phone=${normalizedPhone.slice(0, 4)}**** code=magic`,
      );
    }

    // Find the most recent non-expired verification code for this phone
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone: normalizedPhone,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification && !adminBypass) {
      return NextResponse.json(
        { error: "Kodun süresi dolmuş. Lütfen yeni kod isteyin." },
        { status: 400 }
      );
    }

    // Check max attempts (admin bypass atlar)
    if (!adminBypass && verification && verification.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.verificationCode.delete({
        where: { id: verification.id },
      });
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen yeni kod isteyin." },
        { status: 400 }
      );
    }

    // Verify the code (admin bypass verify'yi atlar)
    if (!adminBypass) {
      if (!verification) {
        return NextResponse.json(
          { error: "Kodun süresi dolmuş. Lütfen yeni kod isteyin." },
          { status: 400 },
        );
      }
      if (!verifyCodeHash(trimmedCode, verification.codeHash)) {
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
          { status: 400 },
        );
      }
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

    // Bu akışta Supabase user'ın email'i (send-sms-otp'de belirlenmişti):
    // - Mevcut profile email (sentetik değilse)
    // - Body'de geçen gerçek email
    // - Sentetik fallback
    // Aynı kuralı burada da uygulayalım — profile.create için.
    const existingIsSynthetic =
      !!existingProfile?.email &&
      existingProfile.email.startsWith("phone_") &&
      existingProfile.email.endsWith("@gh7.ai");

    let profileEmail: string;
    if (existingProfile?.email && !existingIsSynthetic) {
      profileEmail = existingProfile.email;
    } else if (isValidEmail) {
      profileEmail = providedEmail;
    } else {
      profileEmail = syntheticEmail;
    }

    // Supabase user'ı bulmak için hangi email ile arayacağız?
    // send-sms-otp'de kullanılan email = profileEmail (yeni kayıtta).
    const supabaseLookupEmail = profileEmail;

    if (!existingProfile) {
      const { data: userData } =
        await supabaseAdmin.auth.admin.listUsers();

      const supabaseUser = userData?.users?.find(
        (u) => u.email === supabaseLookupEmail,
      );

      if (supabaseUser) {
        try {
          await prisma.profile.create({
            data: {
              id: supabaseUser.id,
              email: profileEmail,
              phone: normalizedPhone,
              phoneVerified: true,
              emailVerified: !profileEmail.startsWith("phone_"),
              lastLoginAt: new Date(),
            },
          });
          console.log(
            `[sms-otp] Created profile for phone user: ${normalizedPhone.slice(0, 4)}**** email=${profileEmail.startsWith("phone_") ? "synthetic" : "real"}`,
          );
        } catch (err) {
          // Email çakışması olabilir (aynı email ile başka Profile).
          // Bu durumda sentetik email'e fallback.
          console.warn(
            `[sms-otp] Profile.create failed with email=${profileEmail}, retrying with synthetic:`,
            err,
          );
          await prisma.profile.create({
            data: {
              id: supabaseUser.id,
              email: syntheticEmail,
              phone: normalizedPhone,
              phoneVerified: true,
              lastLoginAt: new Date(),
            },
          });
          profileEmail = syntheticEmail;
        }
      }
    } else {
      // Mevcut profile — sentetik email'i gerçek email ile güncelle (eğer verilmişse)
      const shouldUpgradeEmail =
        existingIsSynthetic && isValidEmail && profileEmail !== existingProfile.email;
      if (shouldUpgradeEmail) {
        try {
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: {
              email: profileEmail,
              emailVerified: false,
              phoneVerified: true,
              lastLoginAt: new Date(),
            },
          });
          console.log(
            `[sms-otp] Upgraded synthetic email → real for ${normalizedPhone.slice(0, 4)}****`,
          );
        } catch (err) {
          // Çakışma — sadece lastLogin update'i yap
          console.warn("[sms-otp] Email upgrade failed, keeping synthetic:", err);
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: {
              phoneVerified: true,
              lastLoginAt: new Date(),
            },
          });
          profileEmail = existingProfile.email;
        }
      } else {
        await prisma.profile.update({
          where: { id: existingProfile.id },
          data: {
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        });
        profileEmail = existingProfile.email;
      }
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
          email: profileEmail, // send-sms-otp ile aynı email kullan
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
    const tokenHash = freshTokenHash ?? verification?.tokenHash ?? null;

    // Delete the verification code (one-time use) — admin bypass'ta yoksa sil
    if (verification) {
      await prisma.verificationCode.delete({
        where: { id: verification.id },
      });
    }

    console.log(
      `[sms-otp] Verified for ${normalizedPhone.slice(0, 4)}**** (${adminBypass ? "admin-bypass" : freshTokenHash ? "fresh" : "stored"})`,
    );

    if (!tokenHash) {
      console.error(
        "[sms-otp] No tokenHash available (admin bypass + magiclink failed)",
      );
      return NextResponse.json(
        { error: "Oturum üretilemedi. Lütfen tekrar deneyin." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      tokenHash,
      email: profileEmail,
    });
  } catch (err) {
    console.error("[sms-otp] verify-sms-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
