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
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

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
      return NextResponse.json(
        { error: `Lütfen ${waitSeconds} saniye bekleyin` },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = generateOtpCode();
    const codeHash = hashCode(code);

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
      return NextResponse.json(
        { error: "Doğrulama kodu oluşturulamadı" },
        { status: 500 }
      );
    }

    const tokenHash = linkData.properties.hashed_token;

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

    // Send email via Resend
    await sendOtpEmail(normalizedEmail, code);

    console.log(`[otp] Code sent to ${normalizedEmail}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[otp] send-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
