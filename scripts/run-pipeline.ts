import "dotenv/config";
import { prisma } from "../src/lib/db";
import { updateCompetitorScores } from "../src/lib/ai/competitor-scorer";

const BRAND_ID = "cmmwacz650001jv04udd0tt7t";

async function run() {
  console.log("=== IDAVILLA POST-SCAN FIX ===\n");

  // Get latest scan
  const scan = await prisma.scan.findFirst({
    where: { brandId: BRAND_ID, status: "completed" },
    orderBy: { completedAt: "desc" },
  });
  if (!scan) { console.log("No scan found"); return; }
  console.log("Scan:", scan.id, scan.completedAt);

  // Get all results
  const results = await prisma.promptResult.findMany({
    where: { scanId: scan.id },
    select: { id: true, platform: true, fullResponse: true, mentioned: true, competitors: true },
  });

  const brand = await prisma.brand.findUnique({ where: { id: BRAND_ID }, select: { name: true } });
  const brandLower = (brand?.name ?? "").toLowerCase();

  // 1. Extract competitors from fullResponse bold text and update each result
  console.log("\n1. Extracting competitors from fullResponse...");
  let updated = 0;
  for (const r of results) {
    if (!r.fullResponse) continue;
    if (r.fullResponse.startsWith("[ERROR]")) continue;

    // Extract bold names
    const bolds = (r.fullResponse.match(/\*\*([^*]{2,60})\*\*/g) || [])
      .map((m) => m.replace(/\*\*/g, "").trim());

    // Filter to likely company names
    const compNames = [...new Set(bolds)].filter((name) => {
      const lower = name.toLowerCase();
      if (lower.includes(brandLower) && brandLower.length > 2) return false;
      if (name.length < 3 || name.length > 50) return false;
      if (/^\d/.test(name) || lower.startsWith("http")) return false;
      if (lower.endsWith(":")) return false;
      // Must have at least one uppercase letter
      if (!/[A-ZÇĞİÖŞÜ]/.test(name)) return false;
      if (name.split(/\s+/).length > 5) return false;
      // Filter generic words
      const generic = ["fiyat", "kalite", "hizmet", "firma", "güvenilir", "profesyonel",
        "öne çıkan", "sonuç", "genel", "neden", "avantaj", "dezavantaj",
        "özellik", "karşılaştırma", "alternatif", "dikkat", "önemli",
        "tavsiye", "tercih", "seçim", "fiyatlandırma", "malzeme"];
      if (generic.some((g) => lower === g || lower.startsWith(g + " "))) return false;
      // Filter question words
      if (/^(hangi|nerede|nasıl|yerel|genel) /i.test(name)) return false;
      // Filter platform names
      if (/google|booking|tripadvisor|airbnb|trivago|wikipedia/i.test(lower)) return false;
      return true;
    });

    if (compNames.length > 0) {
      await prisma.promptResult.update({
        where: { id: r.id },
        data: { competitors: compNames },
      });
      updated++;
    }
  }
  console.log(`   ${updated}/${results.length} sonuçta rakip tespit edildi`);

  // 2. Update competitor scores
  console.log("\n2. Updating competitor scores...");
  await updateCompetitorScores(scan.id, BRAND_ID);

  // 3. Report
  const comps = await prisma.competitor.findMany({
    where: { brandId: BRAND_ID },
    select: { name: true, mentionScore: true },
    orderBy: { mentionScore: "desc" },
  });
  console.log("\n=== RAKİP SKORLARI ===");
  comps.forEach((c, i) => console.log(`  ${i + 1}. ${c.name}: ${c.mentionScore}`));

  // Platform stats
  const stats: Record<string, { total: number; mentioned: number }> = {};
  for (const r of results) {
    if (!stats[r.platform]) stats[r.platform] = { total: 0, mentioned: 0 };
    stats[r.platform].total++;
    if (r.mentioned) stats[r.platform].mentioned++;
  }
  console.log("\n=== PLATFORM DURUM ===");
  for (const [p, s] of Object.entries(stats)) console.log(`  ${p}: ${s.mentioned}/${s.total}`);

  console.log("\n=== TAMAMLANDI ===");
  await prisma.$disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
