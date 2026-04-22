/**
 * /api/analiz/can-start
 *
 * Ücretsiz analiz başlatılabilir mi kontrol eder.
 *
 * POST body: { phone?: string, email?: string }
 *
 * Kontroller:
 * 1. phone veya email verildiyse → Profile bul
 * 2. Profile.freeAuditUsed = true ise → canStart=false, redirect=/panel/genel
 * 3. Aksi halde canStart=true
 *
 * Response:
 *   { canStart: true }
 *   { canStart: false, reason: "already_used", redirectTo: "/panel/genel" }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";
import { isAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, email } = body as { phone?: string; email?: string };

    if (!phone && !email) {
      return NextResponse.json(
        { error: "phone veya email gerekli" },
        { status: 400 },
      );
    }

    // Telefonu normalize et
    const normalizedPhone = phone ? normalizePhoneNumber(phone) : undefined;
    const normalizedEmail = email?.toLowerCase().trim();

    // ADMIN BYPASS — sınırsız analiz
    if (isAdmin({ phone: normalizedPhone ?? null, email: normalizedEmail ?? null })) {
      return NextResponse.json({ canStart: true, adminBypass: true });
    }

    const orConditions: Array<Record<string, unknown>> = [];
    if (normalizedPhone) orConditions.push({ phone: normalizedPhone });
    if (normalizedEmail) orConditions.push({ email: normalizedEmail });

    const existing = await prisma.profile.findFirst({
      where: { OR: orConditions },
      select: {
        id: true,
        freeAuditUsed: true,
        freeAuditUsedAt: true,
        phone: true,
        email: true,
        plan: true,
      },
    });

    // ─── Pro user bypass — dashboard'a yönlendir ─────
    if (existing?.plan && existing.plan !== "free") {
      return NextResponse.json({
        canStart: false,
        reason: "pro_user",
        redirectTo: "/dashboard/genel",
        message:
          "Pro üyesiniz. Dashboard'dan yeni analiz başlatabilirsiniz.",
      });
    }

    if (existing?.freeAuditUsed) {
      return NextResponse.json({
        canStart: false,
        reason: "already_used",
        redirectTo: "/panel/genel",
        message:
          "Bu telefon veya e-posta ile daha önce ücretsiz analiz yaptırdınız. Dashboard'unuza giriş yapın.",
      });
    }

    return NextResponse.json({
      canStart: true,
      profileId: existing?.id ?? null,
    });
  } catch (err) {
    console.error("[api/can-start] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check failed" },
      { status: 500 },
    );
  }
}
