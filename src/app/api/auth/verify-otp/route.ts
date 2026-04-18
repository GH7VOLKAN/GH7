import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    // Code is valid — fresh magic link aşağıda üretiliyor
    // (stored tokenHash consume edilmiş olabilir)

    // Delete the verification code (one-time use)
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    console.log(`[otp] Code verified for ${normalizedEmail}, creating session server-side...`);

    // Generate a FRESH magic link token for immediate use
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
      console.error("[otp] Session link generation failed:", linkError);
      return NextResponse.json(
        { error: "Oturum oluşturulamadı. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Return the fresh token hash — client will use this immediately
    const freshTokenHash = linkData.properties.hashed_token;

    console.log(`[otp] Fresh session token generated for ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      tokenHash: freshTokenHash,
    });
  } catch (err) {
    console.error("[otp] verify-otp error:", err);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
