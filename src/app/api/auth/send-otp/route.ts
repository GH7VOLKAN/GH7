import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import {
  generateOtpCode,
  hashCode,
  OTP_EXPIRY_MINUTES,
  OTP_COOLDOWN_SECONDS,
} from "@/lib/auth/otp";
import { sendOtpEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, mode } = body as {
      email?: string;
      // "login" (default) → sadece kayıtlı kullanıcı için kod gönder
      // "register" → kayıt akışı (/analiz'den)
      mode?: "login" | "register";
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[otp] Send OTP request for: ${normalizedEmail}`);

    // GİRİŞ SADECE KAYITLI KULLANICI İÇİN (mode="login" default)
    const effectiveMode = mode ?? "login";
    if (effectiveMode === "login") {
      const existingProfile = await prisma.profile.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (!existingProfile) {
        return NextResponse.json(
          {
            error: "NO_ACCOUNT",
            message:
              "Bu e-posta ile kayıtlı hesap bulunamadı. Ücretsiz analiz ile başlayın.",
            redirectTo: "/analiz",
          },
          { status: 404 },
        );
      }
    }

    // Check RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[otp] RESEND_API_KEY is not set! Email cannot be sent. " +
          "Set RESEND_API_KEY in .env.local or environment variables."
      );
      return NextResponse.json(
        { error: "E-posta servisi yapılandırılmamış. Yöneticiyle iletişime geçin." },
        { status: 500 }
      );
    }

    // Rate limit: Check for recent code sent to this email
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
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
      console.log(`[otp] Rate limited for ${normalizedEmail}, wait ${waitSeconds}s`);
      return NextResponse.json(
        { error: `Lütfen ${waitSeconds} saniye bekleyin` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = generateOtpCode();
    const codeHash = hashCode(code);

    console.log(`[otp] Generated code for ${normalizedEmail}, creating Supabase link...`);

    // Check Supabase env vars
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "[otp] Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
      return NextResponse.json(
        { error: "Kimlik doğrulama servisi yapılandırılmamış" },
        { status: 500 }
      );
    }

    // Generate Supabase magic link (admin) for session creation later
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[otp] Supabase generateLink error:", linkError);
      console.error("[otp] linkData:", JSON.stringify(linkData, null, 2));
      return NextResponse.json(
        { error: "Doğrulama kodu oluşturulamadı" },
        { status: 500 }
      );
    }

    const tokenHash = linkData.properties.hashed_token;
    console.log(`[otp] Supabase link generated for ${normalizedEmail}`);

    // Delete any existing codes for this email
    await prisma.verificationCode.deleteMany({
      where: { email: normalizedEmail },
    });

    // Store new verification code
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        codeHash,
        tokenHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    console.log(`[otp] Verification code stored, sending email via Resend...`);

    // Send email via Resend
    try {
      const emailResult = await sendOtpEmail(normalizedEmail, code);
      console.log(`[otp] Resend response:`, JSON.stringify(emailResult, null, 2));
    } catch (emailError) {
      console.error("[otp] Resend API error:", emailError);
      // Clean up the verification code since email failed
      await prisma.verificationCode.deleteMany({
        where: { email: normalizedEmail },
      });
      return NextResponse.json(
        {
          error:
            "E-posta gönderilemedi. Lütfen e-posta adresinizi kontrol edin.",
        },
        { status: 500 }
      );
    }

    console.log(`[otp] Code sent successfully to ${normalizedEmail}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[otp] send-otp unexpected error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
