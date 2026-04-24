/**
 * Brief N v4 smoke-test #1 — Qwen generate (niş + kategori) dry-run.
 *
 * Bir brandSlug için 10 niş + 10 kategori funnel üretir ve terminale basar.
 * DB'ye YAZMAZ. Qwen kalitesini UI'a tıklamadan görürsün.
 *
 * Kullanım:
 *   npx tsx scripts/brief-n/smoke-generate.ts <brandSlug>
 *
 * Gerekli env: QWEN_API_KEY (veya DASHSCOPE_API_KEY), DATABASE_URL
 */

import "./_load-env";
import { PrismaClient } from "@prisma/client";
import { generateNicheQueries } from "../../src/lib/tracked-queries/niche-generator";
import { generateCategoryQueries } from "../../src/lib/tracked-queries/category-generator";

const prisma = new PrismaClient();

function hr() {
  console.log("─".repeat(70));
}

async function main() {
  const brandSlug = process.argv[2];
  if (!brandSlug) {
    console.error("Kullanım: npx tsx scripts/brief-n/smoke-generate.ts <brandSlug>");
    process.exit(1);
  }

  const brand = await prisma.brand.findFirst({
    where: { slug: brandSlug },
    select: {
      name: true,
      sector: true,
      city: true,
      gate: true,
      businessCategories: true,
      specialties: true,
    },
  });
  if (!brand) {
    console.error(`Brand bulunamadı: ${brandSlug}`);
    process.exit(1);
  }

  const input = {
    name: brand.name,
    sector: brand.sector,
    category: brand.businessCategories?.[0] ?? null,
    location: brand.city,
    features: [...(brand.specialties ?? []), ...(brand.businessCategories ?? [])],
    gate: brand.gate,
  };

  hr();
  console.log(`MARKA: ${brand.name} (${brandSlug})`);
  console.log(`Kapı: ${brand.gate} · Sektör: ${brand.sector ?? "—"} · Şehir: ${brand.city ?? "—"}`);
  console.log(`Özellikler: ${input.features.join(", ") || "—"}`);
  hr();

  console.log("\n▸ Qwen niş + kategori paralel üretim başlıyor (30-60s)…\n");
  const t0 = Date.now();

  const [niche, category] = await Promise.all([
    generateNicheQueries(input),
    generateCategoryQueries(input),
  ]);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  hr();
  console.log(`✓ Tamamlandı: ${elapsed}s · Maliyet: $${(niche.costUsd + category.costUsd).toFixed(4)}`);
  hr();

  // ─── NIŞ ───
  console.log("\n🎯 NİŞ BİLİNİRLİK SORGULARI\n");
  niche.queries.forEach((q, i) => {
    console.log(`${String(i + 1).padStart(2, "0")}. ${q.query}`);
    if (q.rationale) console.log(`    ${q.rationale}`);
  });

  // ─── KATEGORİ ───
  console.log("\n\n🏆 KATEGORİ HAKİMİYETİ FUNNELLERİ\n");
  category.queries.forEach((q, i) => {
    console.log(`${String(i + 1).padStart(2, "0")}. [${q.difficulty}] orderIndex=${q.orderIndex}`);
    console.log(`    Step 1: ${q.step1}`);
    console.log(`    Step 2: ${q.step2}`);
    console.log(`    Step 3: ${q.step3}`);
    if (q.rationale) console.log(`    ← ${q.rationale}`);
    console.log();
  });

  hr();
  console.log("KALİTE KONTROLÜ:");
  console.log(`  • Niş sayısı: ${niche.queries.length}/10 ${niche.queries.length === 10 ? "✓" : "⚠"}`);
  console.log(`  • Kategori sayısı: ${category.queries.length}/10 ${category.queries.length === 10 ? "✓" : "⚠"}`);
  const diffDist = category.queries.reduce(
    (acc, q) => ({ ...acc, [q.difficulty]: (acc[q.difficulty] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
  console.log(
    `  • Zorluk dağılımı: EASY=${diffDist.EASY ?? 0}, MEDIUM=${diffDist.MEDIUM ?? 0}, HARD=${diffDist.HARD ?? 0}`,
  );
  console.log(`  • Token: ${niche.usage.input_tokens + category.usage.input_tokens} in / ${niche.usage.output_tokens + category.usage.output_tokens} out`);

  const nicheContainsBrand = niche.queries.filter((q) =>
    q.query.toLowerCase().includes(brand.name.toLowerCase()),
  );
  if (nicheContainsBrand.length > 0) {
    console.log(`  ⚠ ${nicheContainsBrand.length} niş sorgu marka adını içeriyor (brief yasak)!`);
    nicheContainsBrand.forEach((q) => console.log(`      → "${q.query}"`));
  }

  const catContainsBrand = category.queries.filter((q) =>
    [q.step1, q.step2, q.step3].some((s) =>
      s.toLowerCase().includes(brand.name.toLowerCase()),
    ),
  );
  if (catContainsBrand.length > 0) {
    console.log(`  ⚠ ${catContainsBrand.length} kategori funnel'ı marka adını içeriyor (brief yasak)!`);
  }
  hr();
}

main()
  .catch((err) => {
    console.error("\n✗ HATA:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
