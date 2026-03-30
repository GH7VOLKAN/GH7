/**
 * GH7.ai Query-Based Analysis Pages — Utility Functions
 *
 * Turkish-aware helpers for slug generation, query normalization,
 * firm name normalization, classification, and content generation.
 */

import type { PlatformKey } from "@/lib/types";

// ─── Types ──────────────────────────────────────────

export interface ScanResultForQueryPage {
  platform: string;
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  fullResponse: string | null;
  citations: unknown; // Json — string[]
  competitors: unknown; // Json — CompetitorDetail[] | string[]
  citationSources: unknown; // Json — CitationSource[]
  mentionContext: string | null;
}

export interface FirmRankingEntry {
  firmName: string;
  firmNormalized: string;
  firmWebsite: string | null;
  platforms: PlatformKey[];
  platformCount: number;
  positions: Record<string, string | null>;
  sentiments: Record<string, string | null>;
  mentionContexts: Record<string, string | null>;
  sourceUrls: string[];
  sourceCount: number;
  rankPosition: number;
}

export interface SourceAnalysisEntry {
  domain: string;
  url: string;
  platforms: PlatformKey[];
  count: number;
}

export interface CleanPlatformResponse {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  response: string;
  firmsMentioned: string[];
  sourceCount: number;
}

// ─── Turkish Character Map ──────────────────────────

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

function turkishToAscii(str: string): string {
  return str.replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TURKISH_CHAR_MAP[ch] || ch);
}

// ─── Slug Generation ────────────────────────────────

export function generateQuerySlug(query: string): string {
  return turkishToAscii(query)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

// ─── Query Normalization ────────────────────────────

export function normalizeQuery(query: string): string {
  return turkishToAscii(query)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

// ─── Firm Name Normalization ────────────────────────

const COMPANY_SUFFIXES = [
  "a.ş.",
  "a.s.",
  "ltd.",
  "ltd",
  "şti.",
  "sti.",
  "şti",
  "sti",
  "inc.",
  "inc",
  "corp.",
  "corp",
  "llc",
  "gmbh",
  "co.",
  "anonim şirketi",
  "anonim sirketi",
  "limited şirketi",
  "limited sirketi",
  "holding",
];

export function normalizeFirmName(name: string): string {
  let normalized = name.trim().toLowerCase();
  for (const suffix of COMPANY_SUFFIXES) {
    const idx = normalized.lastIndexOf(suffix);
    if (idx > 0) {
      normalized = normalized.slice(0, idx).trim();
    }
  }
  return turkishToAscii(normalized)
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Query Classification ───────────────────────────

const CLASSIFICATION_PATTERNS: Record<string, RegExp[]> = {
  siralama: [
    /en iyi/i,
    /sıralama/i,
    /top \d+/i,
    /ilk \d+/i,
    /başlıca/i,
    /öncü/i,
    /lider/i,
    /birinci/i,
  ],
  karsilastirma: [
    /karşılaştır/i,
    /karsilastir/i,
    /vs\.?/i,
    /mı yoksa/i,
    /mi yoksa/i,
    /fark/i,
    /hangisi/i,
    /arasındaki/i,
    /arasinda/i,
  ],
  fiyat: [
    /fiyat/i,
    /ücret/i,
    /ucret/i,
    /maliyet/i,
    /ne kadar/i,
    /paket/i,
    /tarife/i,
  ],
  tavsiye: [
    /tavsiye/i,
    /öner/i,
    /oner/i,
    /tercih/i,
    /seçmeli/i,
    /secmeli/i,
    /nereye/i,
    /nereden/i,
  ],
  bilgi: [
    /nedir/i,
    /nasıl/i,
    /nasil/i,
    /ne zaman/i,
    /neden/i,
    /kim/i,
    /hakkında/i,
    /hakkinda/i,
  ],
};

export function classifyQuery(
  query: string,
): "siralama" | "karsilastirma" | "bilgi" | "fiyat" | "tavsiye" {
  for (const [type, patterns] of Object.entries(CLASSIFICATION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        return type as "siralama" | "karsilastirma" | "bilgi" | "fiyat" | "tavsiye";
      }
    }
  }
  return "bilgi";
}

// ─── Location Extraction ────────────────────────────

const TURKISH_CITIES = [
  "istanbul",
  "ankara",
  "izmir",
  "bursa",
  "antalya",
  "adana",
  "konya",
  "gaziantep",
  "mersin",
  "diyarbakır",
  "kayseri",
  "eskişehir",
  "trabzon",
  "samsun",
  "denizli",
  "malatya",
  "erzurum",
  "van",
  "batman",
  "elazığ",
  "manisa",
  "sakarya",
  "muğla",
  "aydın",
  "balıkesir",
  "tekirdağ",
  "kahramanmaraş",
  "mardin",
  "hatay",
  "afyonkarahisar",
  "kocaeli",
  "edirne",
  "çanakkale",
  "bodrum",
  "kadıköy",
  "beşiktaş",
  "şişli",
  "bakırköy",
  "beyoğlu",
  "üsküdar",
  "ataşehir",
  "maltepe",
  "levent",
  "maslak",
  "beykoz",
  "sarıyer",
  "zeytinburnu",
];

export function extractLocation(query: string): string | null {
  const lower = query.toLowerCase();
  for (const city of TURKISH_CITIES) {
    if (lower.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  // Check ASCII versions too
  const asciiLower = turkishToAscii(lower);
  for (const city of TURKISH_CITIES) {
    const asciiCity = turkishToAscii(city);
    if (asciiLower.includes(asciiCity) && asciiCity !== city) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  return null;
}

// ─── Sector Extraction ──────────────────────────────

const SECTOR_KEYWORDS: Record<string, string[]> = {
  teknoloji: ["yazılım", "teknoloji", "bilişim", "it", "saas", "uygulama", "app"],
  saglik: ["sağlık", "hastane", "klinik", "doktor", "diş", "tıp", "eczane"],
  egitim: ["eğitim", "okul", "üniversite", "kurs", "öğretim", "dershane"],
  hukuk: ["hukuk", "avukat", "avukatlık", "dava", "hukuki"],
  insaat: ["inşaat", "yapı", "müteahhit", "konut", "emlak"],
  finans: ["finans", "banka", "sigorta", "yatırım", "muhasebe", "mali"],
  gida: ["gıda", "restoran", "yemek", "cafe", "kafe", "lokanta"],
  turizm: ["turizm", "otel", "tatil", "seyahat", "tur"],
  eticaret: ["e-ticaret", "eticaret", "online satış", "mağaza"],
  pazarlama: ["pazarlama", "reklam", "ajans", "dijital", "seo"],
  otomat: ["oto", "araç", "araba", "otomobil", "servis", "tamir"],
  moda: ["moda", "giyim", "tekstil", "kıyafet"],
  gayrimenkul: ["gayrimenkul", "emlak", "kiralık", "satılık"],
  danismanlik: ["danışmanlık", "danismanlik", "consulting", "müşavir"],
};

export function extractSector(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return sector;
    }
  }
  return null;
}

// ─── Content Generation ─────────────────────────────

export function generatePageTitle(query: string): string {
  // Capitalize first letter
  const title = query.charAt(0).toUpperCase() + query.slice(1);
  return `${title} | AI Gorunurluk Analizi — GH7.ai`;
}

export function generateMetaDescription(
  query: string,
  platformCount: number,
  firmCount: number,
): string {
  return `"${query}" sorgusu ${platformCount} yapay zeka platformunda analiz edildi. ${firmCount} firma tespit edildi. Detayli AI gorunurluk raporu ve kaynak analizi.`;
}

export function generateSummary(
  query: string,
  ranking: FirmRankingEntry[],
  platformCount: number,
): string {
  if (ranking.length === 0) {
    return `"${query}" sorgusu ${platformCount} platformda analiz edildi ancak hicbir firma tespit edilemedi.`;
  }

  const topFirms = ranking.slice(0, 3).map((f) => f.firmName);
  const topList = topFirms.join(", ");
  const totalFirms = ranking.length;

  return `"${query}" sorgusu ${platformCount} yapay zeka platformunda analiz edildi. Toplam ${totalFirms} firma tespit edildi. En sik bahsedilen firmalar: ${topList}. ${ranking[0].firmName} ${ranking[0].platformCount}/${platformCount} platformda gorunur.`;
}

// ─── Data Aggregation ───────────────────────────────

function extractCompetitorNamesFromJson(competitors: unknown): string[] {
  if (!Array.isArray(competitors)) return [];
  return competitors
    .map((c: unknown) =>
      typeof c === "string" ? c : (c as { name?: string })?.name ?? "",
    )
    .filter(Boolean);
}

function extractCitationUrls(citations: unknown): string[] {
  if (!Array.isArray(citations)) return [];
  return citations.filter((c): c is string => typeof c === "string");
}

export function buildFirmRanking(
  scanResults: ScanResultForQueryPage[],
): FirmRankingEntry[] {
  const firmMap = new Map<
    string,
    {
      firmName: string;
      firmNormalized: string;
      platforms: Set<PlatformKey>;
      positions: Record<string, string | null>;
      sentiments: Record<string, string | null>;
      mentionContexts: Record<string, string | null>;
      sourceUrls: Set<string>;
    }
  >();

  for (const result of scanResults) {
    if (!result.mentioned) continue;

    const competitorNames = extractCompetitorNamesFromJson(result.competitors);
    const citations = extractCitationUrls(result.citations);
    const platform = result.platform as PlatformKey;

    // Add competitors as firms
    for (const name of competitorNames) {
      const normalized = normalizeFirmName(name);
      if (!normalized) continue;

      const existing = firmMap.get(normalized);
      if (existing) {
        existing.platforms.add(platform);
        existing.positions[platform] = result.position;
        existing.sentiments[platform] = result.sentiment;
        existing.mentionContexts[platform] = result.mentionContext;
        for (const url of citations) existing.sourceUrls.add(url);
      } else {
        firmMap.set(normalized, {
          firmName: name,
          firmNormalized: normalized,
          platforms: new Set([platform]),
          positions: { [platform]: result.position },
          sentiments: { [platform]: result.sentiment },
          mentionContexts: { [platform]: result.mentionContext },
          sourceUrls: new Set(citations),
        });
      }
    }
  }

  // Sort by platform count (desc), then alphabetically
  const entries = Array.from(firmMap.values())
    .sort((a, b) => {
      const diff = b.platforms.size - a.platforms.size;
      if (diff !== 0) return diff;
      return a.firmName.localeCompare(b.firmName, "tr");
    })
    .map((entry, idx) => ({
      firmName: entry.firmName,
      firmNormalized: entry.firmNormalized,
      firmWebsite: null,
      platforms: Array.from(entry.platforms),
      platformCount: entry.platforms.size,
      positions: entry.positions,
      sentiments: entry.sentiments,
      mentionContexts: entry.mentionContexts,
      sourceUrls: Array.from(entry.sourceUrls),
      sourceCount: entry.sourceUrls.size,
      rankPosition: idx + 1,
    }));

  return entries;
}

export function buildSourceAnalysis(
  scanResults: ScanResultForQueryPage[],
): SourceAnalysisEntry[] {
  const sourceMap = new Map<
    string,
    { domain: string; url: string; platforms: Set<PlatformKey>; count: number }
  >();

  for (const result of scanResults) {
    const citations = extractCitationUrls(result.citations);
    const platform = result.platform as PlatformKey;

    for (const url of citations) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, "");
        const existing = sourceMap.get(domain);
        if (existing) {
          existing.platforms.add(platform);
          existing.count++;
        } else {
          sourceMap.set(domain, {
            domain,
            url,
            platforms: new Set([platform]),
            count: 1,
          });
        }
      } catch {
        // Invalid URL — skip
      }
    }
  }

  return Array.from(sourceMap.values())
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({
      ...entry,
      platforms: Array.from(entry.platforms),
    }));
}

export function cleanPlatformResponses(
  scanResults: ScanResultForQueryPage[],
): CleanPlatformResponse[] {
  // Group by platform, pick best result per platform
  const platformMap = new Map<string, ScanResultForQueryPage>();

  for (const result of scanResults) {
    const existing = platformMap.get(result.platform);
    if (!existing || (result.mentioned && !existing.mentioned)) {
      platformMap.set(result.platform, result);
    }
  }

  return Array.from(platformMap.entries()).map(([platform, result]) => ({
    platform: platform as PlatformKey,
    mentioned: result.mentioned,
    position: result.position,
    sentiment: result.sentiment,
    response: (result.fullResponse || "").slice(0, 2000),
    firmsMentioned: extractCompetitorNamesFromJson(result.competitors),
    sourceCount: extractCitationUrls(result.citations).length,
  }));
}
