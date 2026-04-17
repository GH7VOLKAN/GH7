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
