/**
 * POST /api/admin/test-tools/reset-all-data
 *
 * TEHLİKELİ — Tüm kayıtlı kullanıcıları ve ilişkili verileri SİLER.
 * Sadece admin kullanıcı çağırabilir.
 *
 * Silinen tablolar (Prisma, cascade dostu sırayla):
 *   PromptResult, Prompt, SuggestedPrompt
 *   Competitor
 *   Scan, ScoreHistory
 *   GeoAudit
 *   ActionTask, ChecklistItem, AuditCategory, SourceDomain
 *   Notification
 *   Payment
 *   VerificationCode, RateLimit
 *   Brand, Profile
 *
 * Supabase auth.users tablosundaki tüm kullanıcılar da silinir.
 * Admin kendisi de silinir (sonra /analiz'den yeniden kayıt olur).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const counts: Record<string, number> = {};

  try {
    // 1) Prisma — ilişkisel tabloları önce sil
    const tables = [
      "promptResult",
      "prompt",
      "suggestedPrompt",
      "competitor",
      "scan",
      "scoreHistory",
      "geoAudit",
      "actionTask",
      "checklistItem",
      "auditCategory",
      "sourceDomain",
      "notification",
      "payment",
      "verificationCode",
      "rateLimit",
      "failedResult",
      "brand",
      "profile",
    ] as const;

    for (const table of tables) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const model = (prisma as any)[table];
        if (model && typeof model.deleteMany === "function") {
          const result = await model.deleteMany();
          counts[table] = result?.count ?? 0;
        } else {
          counts[table] = -1; // tablo bulunamadı
        }
      } catch (err) {
        console.warn(`[reset-all-data] ${table} deleteMany failed:`, err);
        counts[table] = -2; // hata
      }
    }

    // 2) Supabase auth.users — hepsini sil (sayfalı)
    let supabaseDeletedCount = 0;
    let supabaseError: string | null = null;
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      let page = 1;
      const perPage = 1000;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });
        if (error) {
          supabaseError = error.message;
          break;
        }
        const users = data?.users ?? [];
        if (users.length === 0) break;

        for (const u of users) {
          try {
            const { error: delErr } =
              await supabaseAdmin.auth.admin.deleteUser(u.id);
            if (!delErr) supabaseDeletedCount++;
          } catch {
            // tek tek sil, hatalarda devam et
          }
        }

        if (users.length < perPage) break;
        page++;
      }
    } catch (err) {
      supabaseError = err instanceof Error ? err.message : String(err);
    }

    console.log(
      `[reset-all-data] Admin ${admin.email} deleted all data at ${startedAt}. Supabase users: ${supabaseDeletedCount}. Prisma: ${JSON.stringify(counts)}`,
    );

    return NextResponse.json({
      success: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      admin: admin.email,
      prismaCounts: counts,
      supabaseUsersDeleted: supabaseDeletedCount,
      supabaseError,
      message:
        "Tüm veriler silindi. Artık /analiz'den yeniden kayıt olabilirsin. (Dikkat: admin session'ın da silindi, /giris'e yönlendirilmelisin.)",
    });
  } catch (err) {
    console.error("[reset-all-data] Fatal error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Reset failed",
        prismaCounts: counts,
      },
      { status: 500 },
    );
  }
}
