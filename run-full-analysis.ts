/**
 * Full Vision Pipeline for idavilla.com.tr
 *
 * 1. Deactivate old prompts
 * 2. Generate new smart prompts (Sonar + Claude)
 * 3. Run full scan (5 platforms × N questions)
 * 4. Report results
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { generateSmartPrompts } from "./src/lib/ai/prompt-generator";
import { executeScan } from "./src/lib/ai/scan-engine";

const prisma = new PrismaClient();
const BRAND_ID = "cmmwacz650001jv04udd0tt7t";

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  GH7 Full Vision Pipeline — idavilla.com.tr");
  console.log("═══════════════════════════════════════════\n");

  // ── Step 0: Load brand data ──
  const brand = await prisma.brand.findUnique({ where: { id: BRAND_ID } });
  if (!brand) throw new Error("Brand not found");
  console.log("Brand:", brand.name, "|", brand.domain);
  console.log("Sector:", brand.sector);
  console.log("Categories:", brand.businessCategories.join(", ").slice(0, 100) + "...");
  console.log("Competitors:", brand.competitorNames.join(", "));

  // ── Step 1: Deactivate old prompts ──
  const deactivated = await prisma.prompt.updateMany({
    where: { brandId: BRAND_ID, isActive: true },
    data: { isActive: false },
  });
  console.log(`\n[Step 1] Deactivated ${deactivated.count} old prompts`);

  // ── Step 2: Generate new smart prompts via Sonar + Claude ──
  console.log("\n[Step 2] Generating smart prompts...");
  console.log("  Using Sonar per-business-area research + Claude Sonnet generation");

  const newPrompts = await generateSmartPrompts({
    name: brand.name,
    domain: brand.domain,
    sector: brand.sector ?? "Turizm",
    type: (brand.type as "firma" | "kisisel") ?? "firma",
    city: brand.city ?? "Balıkesir",
    profession: null,
    specialties: [],
    competitorNames: brand.competitorNames ?? [],
    businessCategories: brand.businessCategories ?? [],
    serviceRegions: brand.serviceRegions ?? [],
  }, 10);

  console.log(`  Generated ${newPrompts.length} prompts:`);
  for (const p of newPrompts) {
    console.log(`    [${p.category}] ${p.text}`);
  }

  // Store prompts in DB
  for (const p of newPrompts) {
    await prisma.prompt.create({
      data: {
        brandId: BRAND_ID,
        text: p.text,
        category: p.category ?? "oneri",
        tags: p.tags ?? [],
        source: "sonar",
        isActive: true,
        businessArea: p.businessArea ?? null,
        searchIntent: p.searchIntent ?? null,
        salesPotential: p.salesPotential ?? null,
      },
    });
  }
  console.log(`  Stored ${newPrompts.length} prompts in database`);

  // ── Step 3: Clean stuck scans ──
  await prisma.scan.updateMany({
    where: { brandId: BRAND_ID, status: "running", startedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } },
    data: { status: "failed" },
  });

  // ── Step 4: Run full scan ──
  console.log("\n[Step 3] Starting full scan...");
  const scan = await prisma.scan.create({
    data: { brandId: BRAND_ID, status: "running", type: "manual", startedAt: new Date() },
  });
  console.log(`  Scan ID: ${scan.id}`);

  await executeScan(scan.id, BRAND_ID);
  console.log("  Scan completed!");

  // ── Step 5: Report results ──
  console.log("\n═══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("═══════════════════════════════════════════\n");

  const results = await prisma.promptResult.findMany({
    where: { scanId: scan.id },
    select: { platform: true, mentioned: true, competitors: true, fullResponse: true },
  });

  // Platform stats
  const stats: Record<string, { total: number; mentioned: number; errors: number }> = {};
  for (const r of results) {
    if (!stats[r.platform]) stats[r.platform] = { total: 0, mentioned: 0, errors: 0 };
    stats[r.platform].total++;
    if (r.mentioned) stats[r.platform].mentioned++;
    if (r.fullResponse?.startsWith("[ERROR]")) stats[r.platform].errors++;
  }

  console.log("Platform Results:");
  for (const [plat, s] of Object.entries(stats)) {
    console.log(`  ${plat}: ${s.mentioned}/${s.total} mentioned, ${s.errors} errors`);
  }

  // Competitors
  const compResults = results.filter(r => Array.isArray(r.competitors) && r.competitors.length > 0);
  console.log(`\nCompetitor data in results: ${compResults.length}/${results.length} have competitors`);

  const competitors = await prisma.competitor.findMany({
    where: { brandId: BRAND_ID },
    select: { name: true, mentionScore: true },
    orderBy: { mentionScore: "desc" },
    take: 10,
  });
  console.log("\nTop Competitors (from DB):");
  competitors.forEach((c, i) => console.log(`  ${i + 1}. ${c.name} — score: ${c.mentionScore}`));

  // Score
  const score = await prisma.scoreHistory.findFirst({
    where: { brandId: BRAND_ID },
    orderBy: { date: "desc" },
  });
  console.log(`\nFinal Score: ${score?.mentionScore ?? "N/A"}/100`);

  console.log("\n✅ Full pipeline completed. Refresh dashboard to see results.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
