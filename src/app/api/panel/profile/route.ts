import { NextRequest, NextResponse } from "next/server";
import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/panel/profile
 * Session'daki kullanıcının Profile + Brand bilgisini döner.
 * /analiz sayfası authenticated user için:
 *   - Brand varsa → /panel/genel'e redirect (loop'u kırmak için)
 *   - Brand yoksa → form prefill (email+phone)
 */
export async function GET() {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const p = activeBrand.profile;
    return NextResponse.json({
      profile: {
        id: p.id,
        email: p.email,
        phone: p.phone,
        fullName: p.fullName,
        plan: p.plan,
        emailWeeklyReport: p.emailWeeklyReport,
        emailVerified: (p as Record<string, unknown>).emailVerified ?? false,
        phoneVerified: (p as Record<string, unknown>).phoneVerified ?? false,
      },
      brand: activeBrand.brand
        ? {
            id: activeBrand.brand.id,
            name: activeBrand.brand.name,
            domain: activeBrand.brand.domain ?? "",
          }
        : null,
    });
  } catch (error) {
    console.error("[api/panel/profile GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const activeBrand = await getActiveBrand();
    if (!activeBrand?.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      email,
      emailWeeklyReport,
      emailScoreChange,
      emailScanComplete,
    } = body;

    const data: Record<string, unknown> = {};
    if (typeof fullName === "string") data.fullName = fullName.trim() || null;
    if (typeof email === "string" && email.trim()) {
      const trimmed = email.trim().toLowerCase();
      // Syntetik phone_*@gh7.ai e-postasını yeni bir mailer ile değiştir
      if (!/^.+@.+\..+$/.test(trimmed)) {
        return NextResponse.json(
          { error: "Geçersiz e-posta formatı" },
          { status: 400 },
        );
      }
      // Çakışma kontrolü — başka profile bu email'i kullanıyorsa reddet
      const existing = await prisma.profile.findUnique({
        where: { email: trimmed },
      });
      if (existing && existing.id !== activeBrand.profile.id) {
        return NextResponse.json(
          { error: "Bu e-posta başka bir hesap tarafından kullanılıyor" },
          { status: 409 },
        );
      }
      data.email = trimmed;
      data.emailVerified = false; // yeni email, doğrulama gerekir
    }
    if (typeof emailWeeklyReport === "boolean")
      data.emailWeeklyReport = emailWeeklyReport;
    if (typeof emailScoreChange === "boolean")
      data.emailScoreChange = emailScoreChange;
    if (typeof emailScanComplete === "boolean")
      data.emailScanComplete = emailScanComplete;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.profile.update({
      where: { id: activeBrand.profile.id },
      data,
    });

    return NextResponse.json({
      fullName: updated.fullName,
      email: updated.email,
      emailVerified: updated.emailVerified,
      emailWeeklyReport: updated.emailWeeklyReport,
      emailScoreChange: updated.emailScoreChange,
      emailScanComplete: updated.emailScanComplete,
    });
  } catch (error) {
    console.error("[api/panel/profile]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
