import { RankedItem } from '../schema/types';

/**
 * Normalize Turkish characters so brand matching is robust to i/İ/ı and
 * other diacritics. Fixes the case where "İSITMAX"/"isıtmax" missed "isitmax".
 */
export function trNorm(s: string): string {
  return (s ?? '')
    .replace(/[İIı]/g, 'i')
    .replace(/[Şş]/g, 's')
    .replace(/[Ğğ]/g, 'g')
    .replace(/[Üü]/g, 'u')
    .replace(/[Öö]/g, 'o')
    .replace(/[Çç]/g, 'c')
    .toLowerCase();
}

/** Returns the rank at which the brand appears, or null if absent. */
export function findPosition(ranked: RankedItem[], brand: string): number | null {
  const b = trNorm(brand);
  for (const item of ranked) {
    if (item.name && trNorm(item.name).includes(b)) return item.rank;
  }
  return null;
}

/** Everyone in the ranking who is NOT the brand. */
export function competitorsOf(ranked: RankedItem[], brand: string): string[] {
  const b = trNorm(brand);
  return ranked
    .filter((i) => i.name && !trNorm(i.name).includes(b))
    .map((i) => i.name);
}
