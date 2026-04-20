/**
 * POST /api/admin/actions/reset-all-users
 *
 * Admin olmayan tüm kullanıcıların freeAuditUsed=false yapar.
 * Sınırsız analiz test için yararlı.
 *
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser, isAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // Tüm profile'ları çek, admin olmayanları filtrele
  const profiles = await prisma.profile.findMany({
    select: { id: true, email: true, phone: true },
  });

  const nonAdminIds = profiles
    .filter((p) => !isAdmin({ email: p.email, phone: p.phone }))
    .map((p) => p.id);

  const result = await prisma.profile.updateMany({
    where: { id: { in: nonAdminIds } },
    data: { freeAuditUsed: false, freeAuditUsedAt: null },
  });

  return NextResponse.json({ success: true, resetCount: result.count });
}
