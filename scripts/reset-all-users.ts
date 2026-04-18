/**
 * MANUEL ÇALIŞTIRILACAK RESET SCRIPT.
 *
 * Supabase auth.users + Prisma'daki tüm test verilerini siler.
 * ADMIN_EMAILS env'deki hesapları KORUR.
 *
 * Kullanım:
 *   # .env.local veya .env.production'da şunlar olmalı:
 *   #   DATABASE_URL, DIRECT_URL
 *   #   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   #   ADMIN_EMAILS=info@gh7.ai,volkan@isitmax.com,...
 *
 *   npx tsx scripts/reset-all-users.ts
 *
 * Otomatik çalışmaz — sadece terminalden manuel tetiklenir.
 */

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Fallback — env yoksa hardcoded liste
const FALLBACK_ADMIN_EMAILS = [
  "info@gh7.ai",
  "kaizen.isitmax@gmail.com",
  "volkan@isitmax.com",
  "info@isitmax.com",
];

const protectedEmails = new Set(
  (ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : FALLBACK_ADMIN_EMAILS).map((e) =>
    e.toLowerCase(),
  ),
);

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  RESET ALL USERS — test verisi temizliği");
  console.log("═══════════════════════════════════════════════════");
  console.log(
    `Korunan admin e-postaları (${protectedEmails.size}):`,
    [...protectedEmails].join(", "),
  );
  console.log("");

  // ──────────────────────────────────────────────
  // 1) Supabase: admin dışındaki tüm user'ları sil
  // ──────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli",
    );
  }
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const protectedUserIds = new Set<string>();
  let supabaseDeleted = 0;
  let supabaseKept = 0;

  let page = 1;
  const perPage = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw new Error(`Supabase listUsers hatası: ${error.message}`);
    const users = data?.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      const email = u.email?.toLowerCase() ?? "";
      if (protectedEmails.has(email)) {
        protectedUserIds.add(u.id);
        supabaseKept++;
        continue;
      }
      try {
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(
          u.id,
        );
        if (delErr) {
          console.warn(`  ✗ Silinemedi ${u.email}: ${delErr.message}`);
        } else {
          supabaseDeleted++;
        }
      } catch (err) {
        console.warn(`  ✗ Exception ${u.email}:`, err);
      }
    }

    if (users.length < perPage) break;
    page++;
  }

  console.log(`Supabase auth.users:`);
  console.log(`  ✓ Silinen: ${supabaseDeleted}`);
  console.log(`  ⛔ Korunan (admin): ${supabaseKept}`);
  console.log("");

  // ──────────────────────────────────────────────
  // 2) Prisma: admin Profile'ları dışında her şey
  // ──────────────────────────────────────────────
  // Sırayla sil (cascade dostu): ilişkili → Profile
  console.log("Prisma tabloları siliniyor...");

  // Admin profile ID'leri
  const adminProfiles = await prisma.profile.findMany({
    where: { email: { in: [...protectedEmails] } },
    select: { id: true, email: true },
  });
  const protectedProfileIds = new Set(adminProfiles.map((p) => p.id));
  console.log(
    `  Korunan Profile id'leri: ${[...protectedProfileIds].join(", ")} (email: ${adminProfiles.map((p) => p.email).join(", ")})`,
  );

  // Admin Brand'leri bul (korunacak)
  const adminBrands = await prisma.brand.findMany({
    where: { profileId: { in: [...protectedProfileIds] } },
    select: { id: true, name: true },
  });
  const protectedBrandIds = new Set(adminBrands.map((b) => b.id));

  const deletionOrder = [
    {
      name: "promptResult",
      fn: () =>
        prisma.promptResult.deleteMany({
          where: { prompt: { brandId: { notIn: [...protectedBrandIds] } } },
        }),
    },
    {
      name: "prompt",
      fn: () =>
        prisma.prompt.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "suggestedPrompt",
      fn: () =>
        prisma.suggestedPrompt.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "competitor",
      fn: () =>
        prisma.competitor.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "scan",
      fn: () =>
        prisma.scan.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "scoreHistory",
      fn: () =>
        prisma.scoreHistory.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "actionTask",
      fn: () =>
        prisma.actionTask.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "checklistItem",
      fn: () =>
        prisma.checklistItem.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "auditCategory",
      fn: () =>
        prisma.auditCategory.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "sourceDomain",
      fn: () =>
        prisma.sourceDomain.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "notification",
      fn: () =>
        prisma.notification.deleteMany({
          where: { brandId: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "geoAudit",
      fn: () =>
        prisma.geoAudit.deleteMany({
          where: {
            OR: [
              { userId: null },
              { userId: { notIn: [...protectedProfileIds] } },
            ],
          },
        }),
    },
    {
      name: "payment",
      fn: () =>
        prisma.payment.deleteMany({
          where: { profileId: { notIn: [...protectedProfileIds] } },
        }),
    },
    {
      name: "verificationCode",
      fn: () => prisma.verificationCode.deleteMany(),
    },
    {
      name: "rateLimit",
      fn: () => prisma.rateLimit.deleteMany(),
    },
    {
      name: "brand",
      fn: () =>
        prisma.brand.deleteMany({
          where: { id: { notIn: [...protectedBrandIds] } },
        }),
    },
    {
      name: "profile",
      fn: () =>
        prisma.profile.deleteMany({
          where: { id: { notIn: [...protectedProfileIds] } },
        }),
    },
  ];

  const prismaCounts: Record<string, number> = {};
  for (const { name, fn } of deletionOrder) {
    try {
      const r = await fn();
      prismaCounts[name] = r.count;
      console.log(`  ✓ ${name}: ${r.count} silindi`);
    } catch (err) {
      console.warn(`  ✗ ${name} başarısız:`, err instanceof Error ? err.message : err);
      prismaCounts[name] = -1;
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("  SONUÇ:");
  console.log(`  Supabase silinen: ${supabaseDeleted}`);
  console.log(`  Supabase korunan: ${supabaseKept}`);
  console.log(`  Prisma silinen toplam: ${Object.values(prismaCounts).filter((n) => n > 0).reduce((a, b) => a + b, 0)}`);
  console.log("═══════════════════════════════════════════════════");
  console.log("Admin hesapları korundu. Artık admin olarak /analiz'e gidip");
  console.log("test analizini yapabilirsin.");
}

main()
  .catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
