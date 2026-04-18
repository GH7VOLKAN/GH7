/**
 * /api/auth/verify-email?token=...
 *
 * E-posta doğrulama linki callback'i. Token doğruysa emailVerified=true.
 * Kullanıcıyı /panel/genel'e redirect eder.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.gh7.ai";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=missing_token`);
  }

  try {
    const profile = await prisma.profile.findFirst({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerificationExpiry: true,
        emailVerified: true,
      },
    });

    if (!profile) {
      return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=invalid`);
    }

    if (profile.emailVerified) {
      return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=already`);
    }

    if (
      profile.emailVerificationExpiry &&
      profile.emailVerificationExpiry.getTime() < Date.now()
    ) {
      return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=expired`);
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=success`);
  } catch (err) {
    console.error("[verify-email] Error:", err);
    return NextResponse.redirect(`${appUrl}/panel/genel?emailVerify=error`);
  }
}
