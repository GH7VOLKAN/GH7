/**
 * POST /api/admin/actions/reset-database
 *
 * TEHLIKELI — admin hariç tüm kullanıcı verilerini siler.
 * Brand, Scan, PromptResult, GeoAudit, Competitor, Prompt cascade siler.
 * Supabase Auth kullanıcılarını da siler (admin hariç).
 *
 * Admin-only. Body: { confirm: "EVET SIFIRLA" }
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

  const { confirm } = (await req.json()) as { confirm?: string };
  if (confirm !== "EVET SIFIRLA") {
    return NextResponse.json(
      { error: "Onay metni yanlış. 'EVET SIFIRLA' yazın." },
      { status: 400 },
    );
  }

  const allProfiles = await prisma.profile.findMany({
    select: { id: true, email: true, phone: true },
  });

  const nonAdminIds = allProfiles
    .filter((p) => !isAdmin({ email: p.email, phone: p.phone }))
    .map((p) => p.id);

  let deletedProfiles = 0;
  let supabaseDeleted = 0;

  // Prisma tarafında: Profile sil → Brand cascade → Scan/Prompt/... cascade
  for (const id of nonAdminIds) {
    try {
      await prisma.profile.delete({ where: { id } });
      deletedProfiles++;
    } catch (err) {
      console.warn(`[admin/reset-db] Profile ${id} delete failed:`, err);
    }
  }

  // Supabase Auth tarafında da sil
  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    for (const id of nonAdminIds) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(id);
        supabaseDeleted++;
      } catch {}
    }
  } catch (err) {
    console.warn("[admin/reset-db] Supabase cleanup:", err);
  }

  return NextResponse.json({
    success: true,
    deletedProfiles,
    supabaseDeleted,
    adminPreserved: allProfiles.length - nonAdminIds.length,
  });
}
