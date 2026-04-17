/**
 * Query Enhancer — Retry için sorgu güçlendirme.
 *
 * Bir sorguya 3+ platform "refused/clarification" döndüyse,
 * daha spesifik versiyonu üretilerek tekrar denenir.
 *
 * Stratejiler:
 *   - İl adı yoksa ekle
 *   - Action kelimesi (öner, listele) yoksa ekle
 *   - "somut firma ismi vererek" sufiksi ekle
 */

import { normalizeTurkish } from "@/lib/utils/turkish";

export interface QueryEnhanceContext {
  name: string; // marka/kişi adı
  city?: string; // il (varsa)
  sector?: string; // sektör (varsa)
  userType?: "firma" | "kisi" | "eticaret" | "yurtdisi";
}

const ACTION_WORDS = [
  "öner",
  "listele",
  "sırala",
  "karşılaştır",
  "tavsiye",
  "hangileri",
  "en iyi",
  "en popüler",
];

/**
 * Sorguyu daha spesifik hale getirir — AI'ı somut isim vermeye zorlar.
 *
 *   enhanceQueryForRetry("en iyi firma", { name: "ISITMAX", city: "İstanbul" })
 *     → "en iyi firma — İstanbul'de, 5 tane öner, somut firma ismi vererek listele"
 */
export function enhanceQueryForRetry(
  original: string,
  context: QueryEnhanceContext
): string {
  const additions: string[] = [];
  const normalized = normalizeTurkish(original);

  // İl adı yoksa ekle (firma/kisi için)
  if (
    context.city &&
    (context.userType === "firma" || context.userType === "kisi") &&
    !normalized.includes(normalizeTurkish(context.city))
  ) {
    additions.push(`${context.city}'de`);
  }

  // Action kelimesi yoksa "5 tane öner" ekle
  const hasAction = ACTION_WORDS.some((w) =>
    normalized.includes(normalizeTurkish(w))
  );
  if (!hasAction) {
    additions.push("5 tane öner");
  }

  // Son güçlendirme: "somut firma ismi ver" zorlaması
  const lastForcer =
    context.userType === "kisi"
      ? "somut kişi ismi vererek listele"
      : "somut firma ismi vererek listele";

  if (additions.length === 0) {
    return `${original} — ${lastForcer}`;
  }

  return `${original} — ${additions.join(", ")}, ${lastForcer}`;
}
