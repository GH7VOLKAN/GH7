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

const LEGAL_TOKENS = new Set([
  "as", "ltd", "sti", "san", "tic", "ve", "inc", "llc", "co", "gmbh",
  "anonim", "sirketi", "limited", "sirket",
]);

/**
 * Reduce a brand to its distinctive core for matching: strip parentheticals
 * ("ISITMAX (demo)" -> "isitmax"), legal-form tokens ("A.Ş.", "Ltd. Şti.")
 * and single characters. Without this, a brand stored as "ISITMAX (demo)"
 * never matched an AI answer that just says "ISITMAX".
 */
export function brandCore(brand: string): string {
  const norm = trNorm(brand).replace(/\([^)]*\)/g, " ");
  return norm
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !LEGAL_TOKENS.has(t))
    .join(" ")
    .trim();
}

function matchesBrand(name: string, core: string): boolean {
  if (!core || !name) return false;
  return trNorm(name).includes(core);
}

/** Returns the rank at which the brand appears, or null if absent. */
export function findPosition(ranked: RankedItem[], brand: string): number | null {
  const core = brandCore(brand);
  for (const item of ranked) {
    if (item.name && matchesBrand(item.name, core)) return item.rank;
  }
  return null;
}

/** Everyone in the ranking who is NOT the brand. */
export function competitorsOf(ranked: RankedItem[], brand: string): string[] {
  const core = brandCore(brand);
  return ranked.filter((i) => i.name && !matchesBrand(i.name, core)).map((i) => i.name);
}
