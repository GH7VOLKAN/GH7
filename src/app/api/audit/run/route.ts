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

import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { AUDIT_MASTER_ITEMS } from "@/lib/audit/master-items";
import { runAuditPipeline } from "@/lib/audit/pipeline";

export const runtime = "nodejs";
// Vercel Pro/Enterprise fluid compute'da max 800s (~13 dk). Hobby'de
// 60s, Pro classic'te 300s. Qwen pipeline ortalama 6-8 dk sürebiliyor;
// fluid compute gerekli. Plan yetersizse fallback queue (gelecek sprint).
export const maxDuration = 800;
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

    // AŞAMA 2 — Pipeline tetikleme (Next.js `after` primitive).
    // Response hemen dönüyor; pipeline function return sonrası
    // arkaplanda maxDuration 300s içinde koşar. Frontend /audit/status
    // endpoint'ini polling eder.
    after(async () => {
      try {
        await runAuditPipeline(audit.id);
      } catch (err) {
        console.error("[audit/run] pipeline failed:", err);
      }
    });

    return NextResponse.json({
      auditId: audit.id,
      status: audit.status,
      message: "Audit başlatıldı — pipeline arkaplanda çalışıyor.",
    });
  } catch (err) {
    console.error("[audit/run] error:", err);
    return NextResponse.json(
      { error: "Audit başlatılamadı", details: String(err) },
      { status: 500 },
    );
  }
}
