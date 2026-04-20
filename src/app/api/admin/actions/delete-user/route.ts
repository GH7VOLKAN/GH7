/**
 * POST /api/admin/actions/delete-user
 *
 * Kullanıcıyı Supabase Auth + Profile + Brand (cascade) sil.
 * Admin kendini silemez.
 *
 * Body: { userId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { getAdminUser, isAdmin } from "@/lib/admin";

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

  if (userId === admin.id) {
    return NextResponse.json(
      { error: "Admin kendi hesabını silemez" },
      { status: 400 },
    );
  }

  // Target profile admin mi? (başka bir admin'i silmeyi engelle — çok destruktif)
  const target = await prisma.profile.findUnique({
    where: { id: userId },
    select: { email: true, phone: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (isAdmin({ email: target.email, phone: target.phone })) {
    return NextResponse.json(
      { error: "Başka bir admin hesabı silinemez" },
      { status: 400 },
    );
  }

  // Prisma: Profile siliniyor → Brand cascade (her brand'in Scan/Prompt/Competitor/PromptResult'ları cascade)
  try {
    await prisma.profile.delete({ where: { id: userId } });
  } catch (err) {
    console.warn("[admin/delete-user] Profile delete:", err);
  }

  // Supabase Auth kullanıcısını da sil
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    await supabaseAdmin.auth.admin.deleteUser(userId);
  } catch (err) {
    console.warn("[admin/delete-user] Supabase delete:", err);
  }

  return NextResponse.json({ success: true });
}
