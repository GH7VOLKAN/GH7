/**
 * Brief N v4 smoke-test #4 — tam pipeline (dry-run).
 *
 * 1. Generate: 10 niş + 10 kategori funnel üret
 * 2. Niş pipeline: ilk 1 niş sorgusunu 1 platformda çalıştır (analyzer)
 * 3. Kategori funnel: ilk 1 kategori sorgusunu Perplexity'de çalıştır
 * 4. Source extract + analyze: funnel'dan çıkan kaynakları test fetch
 * 5. Scoring engine'e besle, curved skor hesapla
 *
 * DB'ye YAZMAZ. 3-4 dakika sürer. Tam end-to-end görünürlük sağlar.
 *
 * Kullanım:
 *   npx tsx scripts/brief-n/smoke-full.ts <brandSlug>
 */

import "./_load-env";
import { PrismaClient } from "@prisma/client";
import { generateNicheQueries } from "../../src/lib/tracked-queries/niche-generator";
import { generateCategoryQueries } from "../../src/lib/tracked-queries/category-generator";
import { runCategoryFunnel } from "../../src/lib/tracked-queries/category-funnel";
import { extractSourcesFromResponse } from "../../src/lib/source-analysis/source-extractor";
import { fetchSource } from "../../src/lib/source-analysis/url-fetcher";
import { analyzeFetchedSource } from "../../src/lib/source-analysis/source-analyzer";
import { getAvailableProviders } from "../../src/lib/ai/provider-registry";
import { analyzeResponse } from "../../src/lib/ai/analyzer";
import {
  calculateHealthScore,
  scoreNicheVisibility,
  scoreCategoryDominance,
  scoreSourceDominance,
  calculateCategoryPoints,
} from "../../src/lib/scoring/brand-health-v4";

const prisma = new PrismaClient();

function hr(char = "─") {
  console.log(char.repeat(70));
}

async function main() {
  const brandSlug = process.argv[2];
  if (!brandSlug) {
    console.error("Kullanım: npx tsx scripts/brief-n/smoke-full.ts <brandSlug>");
    process.exit(1);
  }

  const brand = await prisma.brand.findFirst({
    where: { slug: brandSlug },
    include: { competitors: { select: { name: true } } },
  });
  if (!brand) {
    console.error(`Brand bulunamadı: ${brandSlug}`);
    process.exit(1);
  }

  hr("═");
  console.log(`TAM PIPELINE SMOKE TEST — ${brand.name}`);
  hr("═");

  // ─── 1. GENERATE ────────────────────────────────────
  console.log("\n[1/5] Qwen generate (niş + kategori paralel)…");
  const genT0 = Date.now();
  const [nicheGen, catGen] = await Promise.all([
    generateNicheQueries({
      name: brand.name,
      sector: brand.sector,
      location: brand.city,
      features: brand.specialties ?? [],
      gate: brand.gate,
    }),
    generateCategoryQueries({
      name: brand.name,
      sector: brand.sector,
      location: brand.city,
      features: brand.specialties ?? [],
      gate: brand.gate,
    }),
  ]);
  console.log(
    `  ✓ ${((Date.now() - genT0) / 1000).toFixed(1)}s · ${nicheGen.queries.length} niş + ${catGen.queries.length} kategori · $${(nicheGen.costUsd + catGen.costUsd).toFixed(4)}`,
  );

  if (nicheGen.queries.length === 0 || catGen.queries.length === 0) {
    console.error("✗ Yetersiz üretim, durduruluyor");
    return;
  }

  const sampleNiche = nicheGen.queries[0];
  const sampleCat = catGen.queries[0];
  console.log(`  Örnek niş: "${sampleNiche.query}"`);
  console.log(`  Örnek kategori step1: "${sampleCat.step1}"`);

  // ─── 2. NİŞ PIPELINE ────────────────────────────────
  console.log("\n[2/5] Niş sorgusu 1 platformda test (Perplexity tercihli)…");
  const providers = getAvailableProviders();
  const perplexity = providers.find((p) => p.platform === "perplexity") ?? providers[0];
  if (!perplexity) {
    console.error("✗ Hiç provider yok");
    return;
  }

  const nicheT0 = Date.now();
  const nicheResp = await perplexity.sendPrompt(sampleNiche.query);
  const nicheAnalysis = await analyzeResponse(nicheResp.content, brand.name, sampleNiche.query);
  console.log(
    `  ✓ ${((Date.now() - nicheT0) / 1000).toFixed(1)}s · platform=${perplexity.platform}`,
  );
  console.log(`  mentioned: ${nicheAnalysis.mentioned}`);
  console.log(`  mentionType: ${nicheAnalysis.mentionType}`);
  console.log(`  position: ${nicheAnalysis.position ?? "—"}`);

  // ─── 3. KATEGORİ FUNNEL ──────────────────────────────
  console.log("\n[3/5] Kategori sorgusu 3-adım funnel (Perplexity)…");
  const funT0 = Date.now();
  const funnel = await runCategoryFunnel({
    provider: perplexity,
    step1Query: sampleCat.step1,
    step2Query: sampleCat.step2,
    step3Query: sampleCat.step3,
    brandName: brand.name,
  });
  const funElapsed = ((Date.now() - funT0) / 1000).toFixed(1);
  console.log(
    `  ✓ ${funElapsed}s · foundAtStep=${funnel.foundAtStep ?? "null"} rank=${funnel.rank ?? "—"} listLength=${funnel.listLength ?? "—"} adım=${funnel.steps.length}`,
  );
  console.log(`  extractedBrands (${funnel.extractedBrands.length}):`);
  funnel.extractedBrands.slice(0, 8).forEach((b) => console.log(`    · ${b}`));
  const catPoints = calculateCategoryPoints(funnel.foundAtStep, funnel.rank);
  console.log(`  puan (5 max): ${catPoints}`);

  // ─── 4. SOURCE ANALYSIS ──────────────────────────────
  console.log("\n[4/5] Funnel'dan URL çıkar + fetch + analiz…");
  const allSources = funnel.steps.flatMap((s) =>
    extractSourcesFromResponse({
      platform: perplexity.platform,
      content: s.response,
      citations: s.step === 1 ? (nicheResp.citations ?? []) : undefined,
    }),
  );
  const uniqUrls = [...new Set(allSources.map((s) => s.url))].slice(0, 5); // max 5 fetch
  console.log(
    `  ${allSources.length} extracted → ${uniqUrls.length} unique (max 5 test fetch)`,
  );

  const sourceOutcomes: Array<{
    url: string;
    status: string;
    mentionsBrand: boolean;
    comps: string[];
  }> = [];
  for (const url of uniqUrls) {
    const t0 = Date.now();
    const fr = await fetchSource(url, { timeoutMs: 8000 });
    const outcome = analyzeFetchedSource(fr, brand.name, [], brand.competitors);
    sourceOutcomes.push({
      url,
      status: outcome.status,
      mentionsBrand: outcome.mentionsBrand,
      comps: outcome.mentionedCompetitors,
    });
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const marker =
      outcome.status === "unreachable"
        ? "✗ BLOK"
        : outcome.mentionsBrand
          ? "✓ VAR"
          : outcome.mentionedCompetitors.length > 0
            ? "⚠ RAKİP"
            : "— NÖTR";
    console.log(
      `    ${marker} ${domain} (${Date.now() - t0}ms)${outcome.mentionedCompetitors.length > 0 ? ` · rakip: ${outcome.mentionedCompetitors.slice(0, 3).join(", ")}` : ""}`,
    );
  }

  // ─── 5. SCORING ──────────────────────────────────────
  console.log("\n[5/5] Scoring engine — 3 katman skor (örnek veriyle)…");

  // Niş: 1 sorgu × 1 platform = 1 check
  const nicheVis = scoreNicheVisibility(nicheAnalysis.mentioned ? 1 : 0, 1);

  // Kategori: 1 sorgu × 1 platform = 5 max
  const catDom = scoreCategoryDominance(catPoints, 5);

  // Kaynak
  const srcSummaries = sourceOutcomes.map((s) => ({
    status: s.status as "analyzed" | "unreachable",
    mentionsBrand: s.mentionsBrand,
    mentionedCompetitors: s.comps,
  }));
  const srcDom = scoreSourceDominance(srcSummaries);

  const score = calculateHealthScore({
    siteInternalAudit: 0, // Bu smoke test audit çalıştırmıyor
    authoritySignalsAudit: 0,
    externalSourceAudit: 0,
    nicheVisibility: nicheVis,
    categoryDominance: catDom,
    sourceDominance: srcDom,
    trend: 0,
    competitor: 0,
  });

  console.log(`  Niş (0-10): ${nicheVis}`);
  console.log(`  Kategori (0-15): ${catDom}`);
  console.log(`  Kaynak (0-10): ${srcDom}`);
  console.log(`  Ham toplam: ${score.raw}/35 (audit boyutları dahil değil)`);
  console.log(`  Curved: ${score.curved}/100`);

  hr("═");
  console.log("GENEL DEĞERLENDIRME:");
  console.log(
    `  ✓ Qwen üretim: ${nicheGen.queries.length === 10 && catGen.queries.length === 10 ? "OK" : "YETERSIZ"}`,
  );
  console.log(
    `  ✓ Niş pipeline: ${!nicheResp.error ? "OK" : "HATA"} ${nicheResp.error ? `(${nicheResp.error.slice(0, 60)})` : ""}`,
  );
  console.log(
    `  ✓ Kategori funnel: ${funnel.steps.filter((s) => !s.error).length}/${funnel.steps.length} step başarılı`,
  );
  console.log(
    `  ✓ Kaynak fetch: ${sourceOutcomes.filter((s) => s.status !== "unreachable").length}/${sourceOutcomes.length} erişilebilir`,
  );
  console.log(`  ✓ Scoring: çalışıyor`);
  hr("═");
}

main()
  .catch((err) => {
    console.error("\n✗ PIPELINE HATA:", err instanceof Error ? err.stack : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
