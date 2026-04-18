/**
 * Admin test tool: Kullanıcı listesi
 *
 * GET /api/admin/test-tools/users
 * Son 100 kullanıcıyı freeAuditUsed + lastLoginAt bilgileriyle döndürür.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser, logAdminAction } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logAdminAction(admin.email ?? admin.id, "list_users");

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      phone: true,
      freeAuditUsed: true,
      freeAuditUsedAt: true,
      lastLoginAt: true,
      createdAt: true,
      plan: true,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      freeAuditUsedAt: u.freeAuditUsedAt?.toISOString() ?? null,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
