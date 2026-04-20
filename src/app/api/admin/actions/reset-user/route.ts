/**
 * POST /api/admin/actions/reset-user
 *
 * Kullanıcının freeAuditUsed=false yapar — tekrar analiz yapabilir.
 * Admin-only.
 *
 * Body: { userId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { userId } = (await req.json()) as { userId?: string };
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  await prisma.profile.update({
    where: { id: userId },
    data: {
      freeAuditUsed: false,
      freeAuditUsedAt: null,
    },
  });

  return NextResponse.json({ success: true });
}
