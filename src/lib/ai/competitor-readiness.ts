/**
 * Rakip Readiness Score — otomatik hesaplama.
 *
 * Formül (0-100):
 *   mentionBasis (0-40)      = mentionScore / 100 * 40
 *   platformBasis (0-30)     = (aktif_platform_sayısı / 5) * 30
 *   consistencyBasis (0-30)  = platform skorlarının tutarlılığı (std dev bazlı)
 *
 * Toplam: 0-100
 */

import { prisma } from "@/lib/db";

/**
 * Rakip için readiness skorunu hesaplar.
 *
 * @param mentionScore - 0-100 arası mention oranı
 * @param platforms - Platform bazlı skorlar (ör. {chatgpt: 65, claude: 52})
 * @returns 0-100 arası readiness skoru
 */
export function calculateReadinessScore(
  mentionScore: number,
  platforms: Record<string, number>
): number {
  // 1. Mention basis (0-40)
  const safeMentionScore = Math.max(0, Math.min(100, mentionScore));
  const mentionBasis = Math.round((safeMentionScore / 100) * 40);

  // 2. Platform coverage (0-30)
  const values = Object.values(platforms).filter((v) => v > 0);
  const activePlatforms = values.length;
  // 5 platform varsayılan (chatgpt, claude, gemini, perplexity, google_aio)
  const platformBasis = Math.round((activePlatforms / 5) * 30);

  // 3. Consistency basis (0-30)
  let consistencyBasis = 0;
  if (values.length >= 2) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    // Max beklenen std dev ~50 (0-100 arası dağılım için)
    // Daha düşük std dev = daha tutarlı = daha yüksek skor
    const consistencyRatio = Math.max(0, 1 - stdDev / 50);
    consistencyBasis = Math.round(consistencyRatio * 30);
  } else if (values.length === 1) {
    // Tek platform — orta tutarlılık kabul
    consistencyBasis = 15;
  }

  return Math.min(100, mentionBasis + platformBasis + consistencyBasis);
}

/**
 * Brand'in tüm competitors'ı için readiness'i yeniden hesaplar.
 * Scan sonrası `updateCompetitorScores`'dan sonra çağrılmalı.
 */
export async function updateAllCompetitorReadiness(
  brandId: string
): Promise<{ updated: number; skipped: number }> {
  const competitors = await prisma.competitor.findMany({
    where: { brandId },
    select: {
      id: true,
      mentionScore: true,
      platforms: true,
      readinessScore: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const c of competitors) {
    const platforms = (c.platforms as Record<string, number> | null) ?? {};
    const newScore = calculateReadinessScore(c.mentionScore, platforms);

    if (newScore !== c.readinessScore) {
      await prisma.competitor.update({
        where: { id: c.id },
        data: { readinessScore: newScore },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return { updated, skipped };
}
