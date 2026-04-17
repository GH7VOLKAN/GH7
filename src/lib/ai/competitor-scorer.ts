import { prisma } from "@/lib/db";
import { extractCompetitorNames } from "./types";
import { normalizeTurkish } from "@/lib/utils/turkish";
import { upsertCompetitor } from "./competitor-matching";
import { updateAllCompetitorReadiness } from "./competitor-readiness";

export async function updateCompetitorScores(
  scanId: string,
  brandId: string,
): Promise<void> {
  let competitors = await prisma.competitor.findMany({
    where: { brandId },
  });

  const results = await prisma.promptResult.findMany({
    where: { scanId },
    select: { platform: true, excerpt: true, fullResponse: true, competitors: true },
  });

  // Auto-discover new competitors from scan results
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
  const brandNameLower = brand?.name.toLowerCase() ?? "";
  const existingNames = new Set(competitors.map((c) => c.name.toLowerCase()));

  const newCompNames = new Map<string, number>(); // name → mention count
  for (const r of results) {
    const comps = extractCompetitorNames(r.competitors);
    for (const name of comps) {
      const trimmed = name.trim();
      if (!trimmed || trimmed.toLowerCase() === brandNameLower) continue;
      if (existingNames.has(trimmed.toLowerCase())) continue;
      newCompNames.set(trimmed, (newCompNames.get(trimmed) ?? 0) + 1);
    }
  }

  // Add competitors that appear in 2+ results (to avoid noise)
  const toAdd = [...newCompNames.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (toAdd.length > 0) {
    try {
      for (const [name] of toAdd) {
        await upsertCompetitor({
          brandId,
          name,
          source: "scan_discovered",
          reason: "Tarama sonuçlarında otomatik tespit edildi",
        });
      }
      console.log(`[competitor-scorer] Auto-discovered/merged ${toAdd.length} competitors`);
      // Refresh competitor list
      competitors = await prisma.competitor.findMany({ where: { brandId } });
    } catch (err) {
      console.error("[competitor-scorer] Auto-discovery failed:", err);
    }
  }

  if (competitors.length === 0) return;

  for (const comp of competitors) {
    const platformCounts: Record<string, { mentioned: number; total: number }> =
      {
        chatgpt: { mentioned: 0, total: 0 },
        claude: { mentioned: 0, total: 0 },
        gemini: { mentioned: 0, total: 0 },
        perplexity: { mentioned: 0, total: 0 },
      };

    const nameNorm = normalizeTurkish(comp.name);

    for (const r of results) {
      const plat = r.platform;
      if (!platformCounts[plat]) continue;
      platformCounts[plat].total++;

      // Check fullResponse first (3000 chars), fall back to excerpt (200 chars)
      const textToSearch = r.fullResponse ?? r.excerpt ?? "";
      const inText = normalizeTurkish(textToSearch).includes(nameNorm);

      // Also check the competitors array from the analyzer
      const inCompetitors = extractCompetitorNames(r.competitors)
        .some((c: string) => normalizeTurkish(c).includes(nameNorm) || nameNorm.includes(normalizeTurkish(c)));

      if (inText || inCompetitors) {
        platformCounts[plat].mentioned++;
      }
    }

    const platforms: Record<string, number> = {};
    let totalMentioned = 0;
    let totalResults = 0;

    for (const [plat, counts] of Object.entries(platformCounts)) {
      platforms[plat] =
        counts.total > 0
          ? Math.round((counts.mentioned / counts.total) * 100)
          : 0;
      totalMentioned += counts.mentioned;
      totalResults += counts.total;
    }

    const mentionScore =
      totalResults > 0
        ? Math.round((totalMentioned / totalResults) * 100)
        : 0;

    await prisma.competitor.update({
      where: { id: comp.id },
      data: { platforms, mentionScore },
    });
  }

  console.log(
    `[competitor-scorer] Updated ${competitors.length} competitors for scan ${scanId}`,
  );

  // Auto-calculate readiness scores (mention-based formula)
  try {
    const readinessResult = await updateAllCompetitorReadiness(brandId);
    console.log(
      `[competitor-scorer] Readiness: ${readinessResult.updated} updated, ${readinessResult.skipped} unchanged`
    );
  } catch (err) {
    console.error("[competitor-scorer] Readiness update failed:", err);
  }
}
