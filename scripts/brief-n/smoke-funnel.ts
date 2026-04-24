/**
 * Brief N v4 smoke-test #2 — 3-adım kategori funnel end-to-end.
 *
 * Bir brand için ad-hoc kategori sorgu verip 1 platformda funnel çalıştırır.
 * Sonuç: response parsing + rank extraction + source extraction terminale.
 * DB'ye YAZMAZ.
 *
 * Kullanım:
 *   npx tsx scripts/brief-n/smoke-funnel.ts <brandSlug> <platform>
 *   platform: perplexity | chatgpt | claude | gemini | google_aio
 *
 * Sorguları inline sabit tutuyor — senin brand'in için manuel değiştir
 * veya arg olarak geç (3 arg: step1, step2, step3).
 */

import { PrismaClient } from "@prisma/client";
import { runCategoryFunnel } from "../../src/lib/tracked-queries/category-funnel";
import { extractSourcesFromResponse } from "../../src/lib/source-analysis/source-extractor";
import { getAvailableProviders } from "../../src/lib/ai/provider-registry";

const prisma = new PrismaClient();

function hr() {
  console.log("─".repeat(70));
}

async function main() {
  const brandSlug = process.argv[2];
  const platformArg = process.argv[3] ?? "perplexity";
  const step1Arg = process.argv[4];
  const step2Arg = process.argv[5];
  const step3Arg = process.argv[6];

  if (!brandSlug) {
    console.error(
      "Kullanım: npx tsx scripts/brief-n/smoke-funnel.ts <brandSlug> <platform> [step1] [step2] [step3]",
    );
    process.exit(1);
  }

  const brand = await prisma.brand.findFirst({
    where: { slug: brandSlug },
    select: { name: true, sector: true, city: true },
  });
  if (!brand) {
    console.error(`Brand bulunamadı: ${brandSlug}`);
    process.exit(1);
  }

  // Default funnel (İdavilla için örnek; diğer markalar için arg geç)
  const defaultSector = brand.sector ?? "konaklama";
  const defaultLocation = brand.city ?? "Türkiye";
  const step1 =
    step1Arg ??
    `${defaultSector} için önerilen seçenekler ${defaultLocation}`;
  const step2 = step2Arg ?? `Bölgede özellikle hangi tesisler öne çıkıyor?`;
  const step3 =
    step3Arg ?? `Aile dostu, özel özellikleri olanlar hangileri?`;

  const providers = getAvailableProviders();
  const provider = providers.find((p) => p.platform === platformArg);
  if (!provider) {
    console.error(
      `Platform bulunamadı: ${platformArg}. Mevcut: ${providers.map((p) => p.platform).join(", ")}`,
    );
    process.exit(1);
  }

  hr();
  console.log(`MARKA: ${brand.name} (${brandSlug})`);
  console.log(`PLATFORM: ${platformArg}`);
  hr();
  console.log("Step 1:", step1);
  console.log("Step 2:", step2);
  console.log("Step 3:", step3);
  hr();

  console.log("\n▸ Funnel çalışıyor…\n");
  const t0 = Date.now();

  const result = await runCategoryFunnel({
    provider,
    step1Query: step1,
    step2Query: step2,
    step3Query: step3,
    brandName: brand.name,
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  hr();
  console.log(`✓ Tamamlandı: ${elapsed}s`);
  console.log(`  foundAtStep: ${result.foundAtStep ?? "bulunamadı"}`);
  console.log(`  rank: ${result.rank ?? "—"}`);
  console.log(`  listLength: ${result.listLength ?? "—"}`);
  console.log(`  çalıştırılan adım: ${result.steps.length}`);
  hr();

  // Her step detayı
  for (const step of result.steps) {
    console.log(`\n▸ STEP ${step.step}: ${step.query}\n`);
    if (step.error) {
      console.log(`  ✗ Hata: ${step.error}`);
      continue;
    }
    console.log("── Response (ilk 800 char) ──");
    console.log(step.response.slice(0, 800));
    if (step.response.length > 800) console.log(`... [+${step.response.length - 800} char]`);
    console.log("\n── Extraction ──");
    console.log(`  mentioned: ${step.extraction.brandMentioned}`);
    console.log(`  rank: ${step.extraction.rank ?? "—"}`);
    console.log(`  listLength: ${step.extraction.listLength ?? "—"}`);
    console.log(`  source: ${step.extraction.source}`);
    console.log(
      `  extractedBrands (${step.extraction.extractedBrands.length}): ${step.extraction.extractedBrands.slice(0, 6).join(", ")}`,
    );

    // URL extraction
    const aiResponse = {
      platform: platformArg as "perplexity" | "chatgpt" | "claude" | "gemini" | "google_aio",
      content: step.response,
    };
    const sources = extractSourcesFromResponse(aiResponse);
    if (sources.length > 0) {
      console.log(`  sources (${sources.length}):`);
      sources.slice(0, 8).forEach((s) => console.log(`    · ${s.domain}`));
    }
    hr();
  }

  console.log("\nKALİTE KONTROLÜ:");
  console.log(`  • Step 1'de bulundu → erken dur: ${result.foundAtStep === 1 && result.steps.length === 1 ? "✓" : result.foundAtStep === null ? "— (bulunamadı)" : "✗ beklenen 1 step"}`);
  console.log(`  • Rank çıkarılabildi: ${result.rank !== null ? "✓" : "— (liste yok veya marka dışı)"}`);
  console.log(`  • Rakip markalar tespit: ${result.extractedBrands.length > 0 ? `✓ (${result.extractedBrands.length})` : "— (hiç bulunamadı?)"}`);
  const totalSources = result.steps
    .map((s) =>
      extractSourcesFromResponse({
        platform: platformArg as "perplexity" | "chatgpt" | "claude" | "gemini" | "google_aio",
        content: s.response,
      }).length,
    )
    .reduce((a, b) => a + b, 0);
  console.log(`  • Kaynak URL'leri çıkarıldı: ${totalSources > 0 ? `✓ (${totalSources})` : platformArg === "perplexity" ? "⚠ Perplexity'de citations bekleniyordu" : "— (best effort)"}`);
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
