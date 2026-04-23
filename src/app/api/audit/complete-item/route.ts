/**
 * POST /api/audit/complete-item — Madde "Yaptım" işaretleme (Brief G Aşama 4).
 *
 * Body: { auditId, itemCode }
 * Audit.profileId == user.id kontrolü → AuditItem.completedAt + completedBy set.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const auditId = body?.auditId as string | undefined;
    const itemCode = body?.itemCode as string | undefined;
    if (!auditId || !itemCode) {
      return NextResponse.json(
        { error: "auditId ve itemCode gerekli" },
        { status: 400 },
      );
    }

    // Audit sahibi mi?
    const audit = await prisma.audit.findFirst({
      where: { id: auditId, profileId: user.id },
      select: { id: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    await prisma.auditItem.updateMany({
      where: { auditId, itemCode },
      data: {
        completedAt: new Date(),
        completedBy: user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[audit/complete-item] error:", err);
    return NextResponse.json(
      { error: "Güncelleme başarısız", details: String(err) },
      { status: 500 },
    );
  }
}
