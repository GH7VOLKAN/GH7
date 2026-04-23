/**
 * GET /api/audit/status?auditId=X — Audit progress polling (Brief G Aşama 1).
 *
 * Frontend loading ekranı 3 saniyede bir çağırır.
 * Dönüş: id, status, progress, currentStep, completedAt, errorMessage, counts.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const auditId = url.searchParams.get("auditId");
  if (!auditId) {
    return NextResponse.json({ error: "auditId required" }, { status: 400 });
  }

  const audit = await prisma.audit.findFirst({
    where: { id: auditId, profileId: user.id },
    select: {
      id: true,
      status: true,
      progress: true,
      currentStep: true,
      completedAt: true,
      errorMessage: true,
      totalScore: true,
      passedCount: true,
      warningCount: true,
      criticalCount: true,
    },
  });

  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json(audit);
}
