/**
 * POST /api/audit/run-batch — Tek bir Opus batch'i çalıştırır (manuel).
 *
 * Body: { auditId, batchIndex: 0 | 1 | 2 }
 *
 * Kullanıcı /dashboard/audit'te "Batch N'i Çalıştır" butonuna bastığında
 * tetiklenir. Her batch ~2-3 dk sürer — Vercel 300s timeout altında.
 *
 * Davranış:
 * - Audit status "awaiting-opus" değilse reddeder
 * - Başka batch zaten çalışıyorsa reddeder
 * - Qwen çağrısı yapılır, items'a yazılır, opusRaw + costUsd accumulate
 * - Tüm batch'ler done → audit status "completed"
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { runAuditOpusBatch } from "@/lib/audit/pipeline";
import { AUDIT_BATCH_COUNT } from "@/lib/audit/provider";

export const runtime = "nodejs";
export const maxDuration = 300; // Tek batch ~2-3 dk, 300s rahat yeter
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
    const batchIndex = body?.batchIndex as number | undefined;

    if (!auditId || typeof batchIndex !== "number") {
      return NextResponse.json(
        { error: "auditId ve batchIndex gerekli" },
        { status: 400 },
      );
    }
    if (batchIndex < 0 || batchIndex >= AUDIT_BATCH_COUNT) {
      return NextResponse.json(
        {
          error: `batchIndex 0-${AUDIT_BATCH_COUNT - 1} arası olmalı`,
        },
        { status: 400 },
      );
    }

    // Audit sahibi mi?
    const audit = await prisma.audit.findFirst({
      where: { id: auditId, profileId: user.id },
      select: { id: true, status: true },
    });
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Senkron çalıştır — response'ta sonuç döner. UI loading durumu gösterir.
    const result = await runAuditOpusBatch(auditId, batchIndex);

    return NextResponse.json({
      ok: result.ok,
      message: result.message,
      batchIndex,
    });
  } catch (err) {
    console.error("[audit/run-batch] error:", err);
    return NextResponse.json(
      { error: "Batch çalıştırılamadı", details: String(err) },
      { status: 500 },
    );
  }
}
