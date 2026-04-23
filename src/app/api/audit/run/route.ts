/**
 * POST /api/audit/run — Yeni audit başlatır (Brief G Aşama 1).
 *
 * Body: { brandId: string }
 * Dönüş: { auditId, status }
 *
 * Pipeline (DataForSEO + Perplexity + Opus) Aşama 2-3'te eklenecek.
 * Bu aşamada sadece:
 *   - Brand + Profile ownership kontrolü
 *   - Audit + 43 AuditItem kaydı yaratımı (pending status)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AUDIT_MASTER_ITEMS } from "@/lib/audit/master-items";

export const runtime = "nodejs";
export const maxDuration = 300; // 5dk Vercel timeout (Aşama 2-3 pipeline için)
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

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const brandId = body?.brandId as string | undefined;
    if (!brandId) {
      return NextResponse.json(
        { error: "brandId required" },
        { status: 400 },
      );
    }

    const brand = await prisma.brand.findFirst({
      where: { id: brandId, profileId: profile.id },
      select: { id: true },
    });
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Audit + 43 AuditItem atomik yaratma
    const audit = await prisma.audit.create({
      data: {
        brandId,
        profileId: profile.id,
        status: "pending",
        progress: 0,
        currentStep: "Denetim başlatıldı",
        items: {
          create: AUDIT_MASTER_ITEMS.map((item) => ({
            itemCode: item.code,
            category: item.category,
            itemIndex: item.index,
            title: item.title,
            descriptionStatic: item.descriptionStatic,
            difficulty: item.difficulty,
            estimatedHours: item.estimatedHours,
            status: "warning", // evaluator pipeline'da değişecek
            currentState: "Tarama devam ediyor...",
            instructions: [],
            impactText: "Analiz devam ediyor",
          })),
        },
      },
      select: { id: true, status: true },
    });

    // TODO AŞAMA 2: runAuditPipeline(audit.id) (fire-and-forget).
    // Şimdilik audit "pending" state'te kalıyor — pipeline yazıldıktan
    // sonra buradan tetiklenecek.

    return NextResponse.json({
      auditId: audit.id,
      status: audit.status,
      message: "Audit kaydı oluşturuldu. Pipeline Aşama 2-3'te eklenecek.",
    });
  } catch (err) {
    console.error("[audit/run] error:", err);
    return NextResponse.json(
      { error: "Audit başlatılamadı", details: String(err) },
      { status: 500 },
    );
  }
}
