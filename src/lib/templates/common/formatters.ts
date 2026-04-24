/**
 * Türkçe formatter'lar — sayı, tarih, para, bağlaç (Brief H Aşama 1).
 *
 * Kural: tüm çıktılar Türkçe lokale uygun, UI'da olduğu gibi render edilebilir.
 */

/**
 * Sayı değişimini "+3" / "-2" / "0" olarak formatlar.
 */
export function formatChange(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return "0";
}

/**
 * Tarih formatlayıcı — "23 Nisan 2026" gibi uzun Türkçe.
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Kısa tarih — "23.04.2026".
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * TL para formatı — "2.450 TL" (minor unit yok).
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * USD formatı — "$0.45" (2 desimal).
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

/**
 * Sayı formatı — "1.234" (binlik ayırıcı).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(value);
}

/**
 * Çoğul — count'a göre singular / plural cümle seç.
 *   formatPlural(1, "madde", "madde") → "madde"
 *   formatPlural(5, "madde", "madde")  → "madde"
 * Not: Türkçe'de çoğul eki cümle yapısından dolayı genelde aynı, ama
 * "1 rakip" / "3 rakipte" gibi çekim farkları için kullanılabilir.
 */
export function formatPlural(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

/**
 * Türkçe bağlaç uyumu — kelimenin son sesli harfine göre "de/da", "e/a" vs.
 *
 *   formatWithConnector("Balıkesir", "de") → "Balıkesir'de"
 *   formatWithConnector("Edremit", "de")   → "Edremit'te"  (sessiz sonra)
 *   formatWithConnector("ISITMAX", "den")  → "ISITMAX'ten" (sessiz sonra)
 *
 * Not: bu basit bir heuristic, Türkçe morfolojisinin tamamını kapsamaz.
 * %90 doğruluk hedefler.
 */
type Connector = "de" | "da" | "den" | "dan" | "e" | "a" | "i" | "ı";

const BACK_VOWELS = new Set(["a", "ı", "o", "u"]);
// Sessiz/sert ünsüz (ştemiyzh) — "p,ç,t,k,f,h,s,ş" sonu için de→te, den→ten
const HARD_CONSONANTS = new Set(["p", "ç", "t", "k", "f", "h", "s", "ş"]);

function lastVowelIsBack(word: string): boolean {
  const match = word.toLowerCase().match(/[aeıioöuü]/g);
  const last = match?.[match.length - 1];
  return last ? BACK_VOWELS.has(last) : false;
}

function endsInHardConsonant(word: string): boolean {
  const last = word.trim().slice(-1).toLowerCase();
  return HARD_CONSONANTS.has(last);
}

export function formatWithConnector(
  word: string,
  connector: Connector,
): string {
  const isBack = lastVowelIsBack(word);
  const hardEnd = endsInHardConsonant(word);

  let suffix: string;
  switch (connector) {
    case "de":
    case "da":
      suffix = hardEnd ? (isBack ? "ta" : "te") : isBack ? "da" : "de";
      break;
    case "den":
    case "dan":
      suffix = hardEnd
        ? isBack
          ? "tan"
          : "ten"
        : isBack
          ? "dan"
          : "den";
      break;
    case "e":
    case "a":
      suffix = isBack ? "a" : "e";
      break;
    case "i":
    case "ı":
      suffix = isBack ? "ı" : "i";
      break;
    default:
      suffix = connector;
  }

  return `${word}'${suffix}`;
}

/**
 * AI platform ismini normalize et — "chatgpt" → "ChatGPT" vs.
 */
const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
  googleaio: "Google AIO",
};

export function formatPlatform(key: string): string {
  const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
  return PLATFORM_NAMES[normalized] ?? key;
}
