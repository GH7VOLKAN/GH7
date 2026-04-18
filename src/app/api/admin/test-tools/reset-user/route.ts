/**
 * Admin test tool: Kullanıcı sıfırla
 *
 * POST body: { input: "email@example.com" | "05321234567" }
 * input telefon veya e-posta olabilir.
 * Eşleşen Profile için freeAuditUsed=false yapar.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser, logAdminAction } from "@/lib/admin";
import { normalizePhoneNumber } from "@/lib/sms/netgsm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { input } = (await req.json().catch(() => ({}))) as { input?: string };
  if (!input) {
    return NextResponse.json({ error: "input gerekli" }, { status: 400 });
  }

  const trimmed = input.trim();
  const isEmail = trimmed.includes("@");

  let profile;
  if (isEmail) {
    profile = await prisma.profile.findUnique({
      where: { email: trimmed.toLowerCase() },
    });
  } else {
    const normalizedPhone = normalizePhoneNumber(trimmed);
    profile = await prisma.profile.findFirst({
      where: { phone: normalizedPhone },
    });
  }

  if (!profile) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      freeAuditUsed: false,
      freeAuditUsedAt: null,
    },
  });

  logAdminAction(admin.email ?? admin.id, "reset_user", {
    target: trimmed,
    profileId: profile.id,
  });

  return NextResponse.json({
    success: true,
    email: profile.email,
    phone: profile.phone,
    freeAuditUsed: false,
  });
}
