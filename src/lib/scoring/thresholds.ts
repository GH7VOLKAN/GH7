/**
 * Kategori sorgu eşik sistemi — Brief N v4.
 *
 * Sağlık skoru belli eşiklere ulaşınca kilitli kategori sorguları açar.
 * Eşiklere ulaşmak kullanıcıyı GEO yolculuğunda ilerlemeye motive eder.
 */

export const CATEGORY_UNLOCK_THRESHOLDS: ReadonlyArray<{
  score: number;
  categoryQueriesUnlocked: number;
}> = [
  { score: 50, categoryQueriesUnlocked: 5 },
  { score: 60, categoryQueriesUnlocked: 6 },
  { score: 70, categoryQueriesUnlocked: 7 },
  { score: 80, categoryQueriesUnlocked: 8 },
  { score: 90, categoryQueriesUnlocked: 9 },
  { score: 100, categoryQueriesUnlocked: 10 },
];

/**
 * Verilen curved sağlık skoru için kaç kategori sorgunun kilidi açılmış
 * olmalı. Skor 50 altıysa 0 kategori sorgu (hepsi kilitli).
 */
export function getUnlockedCategoryQueryCount(curvedScore: number): number {
  let unlocked = 0;
  for (const t of CATEGORY_UNLOCK_THRESHOLDS) {
    if (curvedScore >= t.score) unlocked = t.categoryQueriesUnlocked;
    else break;
  }
  return unlocked;
}

/**
 * Sonraki eşik bilgisi — UI'da "bir sonraki eşik +X puan uzakta" coaching için.
 */
export function getNextThreshold(curvedScore: number): {
  score: number;
  categoryQueriesUnlocked: number;
  pointsAway: number;
} | null {
  for (const t of CATEGORY_UNLOCK_THRESHOLDS) {
    if (curvedScore < t.score) {
      return {
        score: t.score,
        categoryQueriesUnlocked: t.categoryQueriesUnlocked,
        pointsAway: t.score - curvedScore,
      };
    }
  }
  return null; // Tüm eşikler aşıldı
}
