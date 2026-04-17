/**
 * Türkçe karakter işleme — merkezi utility.
 *
 * JavaScript'in yerleşik toLowerCase/toUpperCase fonksiyonları Türkçe İ/ı için
 * yanlış sonuç üretir. Bu dosya, projedeki tüm Türkçe metin işlemlerinin
 * tek kaynağıdır.
 *
 * Kullanım örnekleri:
 *   normalizeTurkish("İstanbul") === normalizeTurkish("ISTANBUL") === "istanbul"
 *   normalizeTurkish("ISITMAX") === normalizeTurkish("Isıtmax") === "isitmax"
 *   brandMatch("ISITMAX", "Isıtmax") === true
 */

const TURKISH_ASCII_MAP: Record<string, string> = {
  "İ": "i",
  "I": "i",
  "ı": "i",
  "i": "i",
  "Ş": "s",
  "ş": "s",
  "Ğ": "g",
  "ğ": "g",
  "Ü": "u",
  "ü": "u",
  "Ö": "o",
  "ö": "o",
  "Ç": "c",
  "ç": "c",
};

// Türkçe karakterler için case-preserving map (sadece ASCII çevirme)
const TURKISH_ONLY_MAP: Record<string, string> = {
  "İ": "I",
  "ı": "i",
  "Ş": "S",
  "ş": "s",
  "Ğ": "G",
  "ğ": "g",
  "Ü": "U",
  "ü": "u",
  "Ö": "O",
  "ö": "o",
  "Ç": "C",
  "ç": "c",
};

/**
 * Türkçe'yi ASCII'ye çevirip lowercase döndürür.
 * Karşılaştırma + cache key + eşleştirme için kullanılır.
 *
 * Önemli: İ, I, ı, i HEPSİ "i"ye dönüşür. Bu bilinçli bir tasarım —
 * Türkçe'deki dört farklı "i" harfini tek anahtara indirger.
 */
export function normalizeTurkish(text: string): string {
  if (!text) return "";
  let out = "";
  for (const ch of text) {
    out += TURKISH_ASCII_MAP[ch] ?? ch;
  }
  return out.toLowerCase();
}

/**
 * Sadece Türkçe karakterleri ASCII'ye çevirir, case'i korur.
 * Slug ve URL için kullanılır.
 *   turkishToAscii("Şirket İsmi") → "Sirket Ismi"
 */
export function turkishToAscii(text: string): string {
  if (!text) return "";
  let out = "";
  for (const ch of text) {
    out += TURKISH_ONLY_MAP[ch] ?? ch;
  }
  return out;
}

/**
 * Türkçe-güvenli lowercase (ASCII çevirmez, locale kullanır).
 *   turkishLowerCase("İSTANBUL") → "istanbul" (doğru)
 *   "İSTANBUL".toLowerCase() → "i̇stanbul" (yanlış - fazladan combining dot)
 */
export function turkishLowerCase(text: string): string {
  return text.toLocaleLowerCase("tr-TR");
}

/**
 * Türkçe-güvenli uppercase.
 *   turkishUpperCase("istanbul") → "İSTANBUL" (doğru)
 *   "istanbul".toUpperCase() → "ISTANBUL" (yanlış - i büyük İ olmalı)
 */
export function turkishUpperCase(text: string): string {
  return text.toLocaleUpperCase("tr-TR");
}

/**
 * Türkçe-aware capitalize (her kelimenin ilk harfi büyük, kalan küçük).
 *   turkishCapitalize("AHMET YILMAZ") → "Ahmet Yılmaz"
 *   turkishCapitalize("ahmet yılmaz") → "Ahmet Yılmaz"
 */
export function turkishCapitalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word;
      return (
        word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1)
      );
    })
    .join(" ");
}

/**
 * Sorgu normalize: Türkçe karakterleri normalize eder + trim + çoklu boşluk.
 * Karşılaştırma ve cache key için.
 */
export function normalizeQuery(text: string): string {
  return normalizeTurkish(text).trim().replace(/\s+/g, " ");
}

/**
 * İki markanın aynı olup olmadığını kontrol eder (case + Türkçe insensitive).
 *   brandMatch("ISITMAX", "Isıtmax") → true
 *   brandMatch("İdavilla", "idavilla") → true
 *   brandMatch("Warmup", "warmup") → true
 *   brandMatch("ISITMAX", "Warmup") → false
 */
export function brandMatch(a: string, b: string): boolean {
  return normalizeTurkish(a) === normalizeTurkish(b);
}

/**
 * Domain normalize: protocol, www, path kaldır, lowercase.
 * Türkçe karakter domain'de çok nadir (IDN), lowercase yeterli.
 *   normalizeDomain("https://www.isitmax.com/about") → "isitmax.com"
 */
export function normalizeDomain(url: string): string {
  if (!url) return "";
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/**
 * Slug oluştur: Türkçe karakterleri ASCII'ye çevir, lowercase, tire-ayrılmış.
 *   generateSlug("İstanbul Yerden Isıtma") → "istanbul-yerden-isitma"
 */
export function generateSlug(text: string): string {
  return turkishToAscii(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * İki metin arasında substring eşleşmesi kontrolü (Türkçe-safe).
 *   textContains("ISITMAX önerir", "isıtmax") → true
 *   textContains("Warmup önerir", "isıtmax") → false
 */
export function textContains(haystack: string, needle: string): boolean {
  return normalizeTurkish(haystack).includes(normalizeTurkish(needle));
}

/**
 * Rakip adı için cache/unique key normalize.
 * Türkçe karakterleri ASCII'ye çevirir, lowercase yapar,
 * alfanumerik olmayan her şeyi siler.
 *   "Warmhaus Türkiye" → "warmhausturkiye"
 *   "WARMHAUS" → "warmhaus"
 *   "warmhaus.com" → "warmhauscom"
 *   "A.B.C. Şirketi" → "abcsirketi"
 */
export function normalizeForMatching(text: string): string {
  if (!text) return "";
  return normalizeTurkish(text).replace(/[^a-z0-9]/g, "");
}

/**
 * Domain'in kök adını çıkarır (www + subdomain + TLD yok).
 *   "https://www.warmhaus.com.tr/about" → "warmhaus"
 *   "warmhaus.com" → "warmhaus"
 *   "sub.isitmax.com" → "sub" (⚠️ sub + ana domain ayrımı için özel case gerekir)
 * Boş input → ""
 */
export function extractRootDomain(url: string): string {
  if (!url) return "";
  const normalized = normalizeDomain(url);
  if (!normalized) return "";
  const parts = normalized.split(".");
  // İlk parça genelde ana marka adı. Sub-domain edge case'lerini
  // bu basit heuristic yakalayamaz, ama duplicate detection için yeterli.
  return (parts[0] ?? "").toLowerCase();
}

/**
 * Levenshtein distance — iki metin arasındaki minimum düzenleme mesafesi.
 *   levenshteinDistance("Warmhaus", "Warmhaüs") → 1
 *   levenshteinDistance("ABC", "XYZ") → 3
 *   levenshteinDistance("", "abc") → 3
 */
export function levenshteinDistance(a: string, b: string): number {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Fuzzy marka eşleştirme — duplicate detection için.
 * Şu kontroller sırasıyla yapılır:
 *   1. normalizeForMatching exact eşit → match
 *   2. İlk kelime eşit ve >= 4 karakter → match (ör: "Warmhaus X" vs "Warmhaus Y")
 *   3. Levenshtein distance <= threshold ve min 5 karakter → match
 *
 * @param threshold - Levenshtein eşiği, default 2
 *
 *   brandMatchFuzzy("Warmhaus", "WARMHAUS") → true
 *   brandMatchFuzzy("Warmhaus Türkiye", "Warmhaus İstanbul") → true
 *   brandMatchFuzzy("Warmhaus", "Warmhaüs") → true
 *   brandMatchFuzzy("Apple", "XYZ") → false
 */
export function brandMatchFuzzy(
  a: string,
  b: string,
  threshold = 2
): boolean {
  const na = normalizeForMatching(a);
  const nb = normalizeForMatching(b);
  if (!na || !nb) return false;
  if (na === nb) return true;

  // İlk kelime match (ilk kelime >= 4 karakter olmalı ki "a b" vs "a c" match etmesin)
  const firstA = normalizeTurkish(a).split(/\s+/)[0] ?? "";
  const firstB = normalizeTurkish(b).split(/\s+/)[0] ?? "";
  if (firstA && firstA === firstB && firstA.length >= 4) return true;

  // Levenshtein distance kontrolü (min 5 karakterli stringler için)
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen >= 5) {
    const dist = levenshteinDistance(na, nb);
    if (dist <= threshold) return true;
  }

  return false;
}
