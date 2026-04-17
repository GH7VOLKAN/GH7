/**
 * Response Quality Classification
 *
 * AI cevabının kalitesini sınıflandırır — bir sorguya AI somut isim verdi mi,
 * genel bilgi mi döndü, yoksa "daha spesifik sor" mu dedi?
 *
 * Retry logic için kullanılır: 3+ platform "refused/clarification" dönerse
 * scan-engine daha spesifik sorguyla tekrar dener.
 */

export type ResponseQuality =
  | "direct_list" // AI somut isim verdi (1+ firma/kişi/marka)
  | "general_info" // Genel bilgi verdi, isim vermedi
  | "refused" // Cevap vermedi / reddetti
  | "clarification_asked" // "Daha spesifik sor" dedi
  | "error"; // API hatası

export interface ResponseQualityInput {
  content: string;
  mentioned: boolean;
  competitorCount: number;
  hasError: boolean;
}

/**
 * Cevabın kalitesini heuristik olarak sınıflandırır.
 *   - hasError → "error"
 *   - Çok kısa içerik → "refused"
 *   - "daha spesifik" / "hangi bölge" tarzı patterns → "clarification_asked"
 *   - "bilmiyorum" / "cannot recommend" tarzı → "refused"
 *   - Marka veya 2+ rakip geçiyor → "direct_list"
 *   - Diğer → "general_info"
 */
export function classifyResponseQuality(
  input: ResponseQualityInput
): ResponseQuality {
  const { content, mentioned, competitorCount, hasError } = input;

  if (hasError) return "error";
  if (!content || content.length < 50) return "refused";

  const normalized = content.toLowerCase();

  // Clarification patterns — AI daha spesifik bilgi istiyor
  const clarificationPatterns = [
    "daha spesifik",
    "biraz daha detay",
    "hangi konuda",
    "ne tür",
    "hangi şehir",
    "hangi bölge",
    "hangi alanda",
    "specify",
    "more specific",
    "could you clarify",
    "can you clarify",
    "please provide more",
  ];
  if (clarificationPatterns.some((p) => normalized.includes(p))) {
    return "clarification_asked";
  }

  // Refused patterns — AI cevap veremediğini söylüyor
  const refusedPatterns = [
    "cevap veremem",
    "bilmiyorum",
    "bilgim yok",
    "emin değilim",
    "kesin bir şey söyleyemem",
    "i don't have information",
    "i cannot provide",
    "cannot recommend",
    "i'm not sure",
    "unfortunately i don't",
  ];
  if (
    refusedPatterns.some((p) => normalized.includes(p)) &&
    !mentioned &&
    competitorCount === 0
  ) {
    return "refused";
  }

  // Direct list — marka geçiyor veya 2+ rakip geçiyor (somut isim var)
  if (mentioned || competitorCount >= 2) {
    return "direct_list";
  }

  // Diğer — içerik var ama somut isim yok
  return "general_info";
}

/**
 * Quality "weak" sayılır mı? (retry için)
 */
export function isWeakQuality(quality: ResponseQuality | null | undefined): boolean {
  return quality === "refused" || quality === "clarification_asked";
}
