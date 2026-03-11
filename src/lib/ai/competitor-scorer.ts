import { prisma } from "@/lib/db";

export async function updateCompetitorScores(
  scanId: string,
  brandId: string,
): Promise<void> {
  const competitors = await prisma.competitor.findMany({
    where: { brandId },
  });
  if (competitors.length === 0) return;

  const results = await prisma.promptResult.findMany({
    where: { scanId },
    select: { platform: true, excerpt: true },
  });

  for (const comp of competitors) {
    const platformCounts: Record<string, { mentioned: number; total: number }> =
      {
        chatgpt: { mentioned: 0, total: 0 },
        claude: { mentioned: 0, total: 0 },
        gemini: { mentioned: 0, total: 0 },
        perplexity: { mentioned: 0, total: 0 },
      };

    const nameLower = comp.name.toLowerCase();

    for (const r of results) {
      const plat = r.platform;
      if (!platformCounts[plat]) continue;
      platformCounts[plat].total++;
      if (r.excerpt?.toLowerCase().includes(nameLower)) {
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
}
