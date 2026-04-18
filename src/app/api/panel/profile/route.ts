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
    const { emailWeeklyReport } = body;

    const data: Record<string, unknown> = {};
    if (typeof emailWeeklyReport === "boolean") {
      data.emailWeeklyReport = emailWeeklyReport;
    }

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
      emailWeeklyReport: updated.emailWeeklyReport,
    });
  } catch (error) {
    console.error("[api/panel/profile]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
