/**
 * Website Analyzer — 4 kullanıcı tipi için unified discovery.
 *
 * Başlangıçta sadece firma için domain → products/services tespit ediyordu.
 * Şimdi 4 tip için genişletildi (firma/kisi/eticaret/yurtdisi).
 *
 * Backward compat: analyzeWebsite(domain) fn imzası korunur (firma shortcut).
 * Yeni kod: runDiscovery(input: DiscoveryInput)
 *
 * Redis ile 7 gün cache.
 */

import { querySonar } from "@/lib/ai/sonar-research";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";
import { buildPromptByType } from "./discovery-prompts";
import {
  DEFAULT_DISCOVERY,
  type DiscoveryInput,
  type DiscoveryResult,
  type CompanyType,
  type DiscoveredQuery,
} from "./discovery-types";

const CACHE_TTL = 7 * 24 * 60 * 60;

/**
 * Prompt versiyonu — discovery prompt'u her değiştiğinde bump et.
 * Redis cache key'ine suffix olarak eklenir → eski cache'ler otomatik
 * atılır, yeni prompt sonuçları yeni key'lere yazılır.
 *
 * v1 → initial
 * v2 → 2026-04-20: 10 rakip + TR öncelik + ürün-odaklı 4 kapı (PR #114)
 */
const DISCOVERY_PROMPT_VERSION = "v2";

// ═══════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════

/**
 * 4 tip için unified Perplexity discovery.
 *
 * Girdi `DiscoveryInput`:
 *   - firma/yurtdisi: `{ companyType, url, brandName? }`
 *   - kisi: `{ companyType: "kisi", fullName, expertise, socialMedia? }`
 *   - eticaret: `{ companyType: "eticaret", ecommerceMode, url/marketplaceUrl/brandOrProductName }`
 */
export async function runDiscovery(
  input: DiscoveryInput
): Promise<DiscoveryResult> {
  const cacheKey = buildDiscoveryCacheKey(input);
  const cached = await cacheGet<DiscoveryResult>(cacheKey);
  if (cached) {
    console.log(`[discovery] Cache hit for ${input.companyType}`);
    return cached;
  }

  console.log(`[discovery] Cache miss, querying Perplexity for ${input.companyType}`);

  try {
    const prompt = buildPromptByType(input);
    const response = await querySonar(prompt);
    const parsed = parseDiscoveryResponse(response, input.companyType);

    if (hasValidData(parsed)) {
      await cacheSet(cacheKey, parsed, CACHE_TTL);
    }
    return parsed;
  } catch (err) {
    console.error(`[discovery] Error for ${input.companyType}:`, err);
    return { ...DEFAULT_DISCOVERY, companyType: input.companyType };
  }
}

// ═══════════════════════════════════════════════════════════
// Backward-compat: eski firma-only API
// ═══════════════════════════════════════════════════════════

export interface WebsiteAnalysis {
  products: string[];
  services: string[];
  sector: string;
  description: string;
}

export async function analyzeWebsite(domain: string): Promise<WebsiteAnalysis> {
  const result = await runDiscovery({
    companyType: "firma",
    url: domain,
  });
  return {
    products: result.products,
    services: result.services,
    sector: result.sector,
    description: result.description,
  };
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

function buildDiscoveryCacheKey(input: DiscoveryInput): string {
  const parts: string[] = [];
  if (input.url) parts.push(cleanDomain(input.url));
  if (input.brandName) parts.push(input.brandName);
  if (input.fullName) parts.push(input.fullName);
  if (input.expertise) parts.push(input.expertise);
  if (input.marketplaceUrl) parts.push(input.marketplaceUrl);
  if (input.brandOrProductName) parts.push(input.brandOrProductName);
  if (input.location) parts.push(input.location);
  if (input.targetMarkets) parts.push(input.targetMarkets);
  if (parts.length === 0) parts.push("empty");
  // Prompt versiyonu → eski cache'ler otomatik invalidate (PR #114 sonrası)
  return makeCacheKey(
    `discovery-${input.companyType}-${DISCOVERY_PROMPT_VERSION}`,
    ...parts,
  );
}

function cleanDomain(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();
}

function parseDiscoveryResponse(
  response: string,
  expectedType: CompanyType
): DiscoveryResult {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn(`[discovery] No JSON in response`);
    return { ...DEFAULT_DISCOVERY, companyType: expectedType };
  }

  let parsed: Partial<DiscoveryResult> & {
    [key: string]: unknown;
  };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("[discovery] JSON parse error:", err);
    return { ...DEFAULT_DISCOVERY, companyType: expectedType };
  }

  // Tüm alanları güvenli şekilde extract et
  const result: DiscoveryResult = {
    companyType: expectedType,
    sector: typeof parsed.sector === "string" ? parsed.sector : "",
    description:
      typeof parsed.description === "string" ? parsed.description : "",
    location:
      parsed.location && typeof parsed.location === "object"
        ? (parsed.location as DiscoveryResult["location"])
        : {},
    competitors: Array.isArray(parsed.competitors)
      ? (parsed.competitors as DiscoveryResult["competitors"])
          .filter(
            (c): c is DiscoveryResult["competitors"][number] =>
              !!c && typeof c === "object" && "name" in c
          )
          .slice(0, 5)
      : [],
    targetQueries: normalizeTargetQueries(parsed.targetQueries),
    products: Array.isArray(parsed.products)
      ? (parsed.products as string[]).filter(
          (p) => typeof p === "string" && p.length > 0
        ).slice(0, 10)
      : [],
    services: Array.isArray(parsed.services)
      ? (parsed.services as string[]).filter(
          (s) => typeof s === "string" && s.length > 0
        ).slice(0, 8)
      : [],
    platforms: Array.isArray(parsed.platforms)
      ? (parsed.platforms as DiscoveryResult["platforms"])
      : undefined,
  };

  // Tip bazlı ek alanlar
  if (expectedType === "kisi" && Array.isArray(parsed.expertise)) {
    result.expertise = (parsed.expertise as string[])
      .filter((e) => typeof e === "string")
      .slice(0, 6);
  }

  if (expectedType === "eticaret") {
    if (typeof parsed.priceSegment === "string") {
      const seg = parsed.priceSegment as string;
      if (["ekonomik", "orta", "premium", "luks"].includes(seg)) {
        result.priceSegment = seg as DiscoveryResult["priceSegment"];
      }
    }
    if (typeof parsed.category === "string") {
      result.category = parsed.category;
    }
  }

  if (expectedType === "yurtdisi") {
    if (Array.isArray(parsed.targetCountries)) {
      result.targetCountries = (parsed.targetCountries as string[]).filter(
        (c) => typeof c === "string"
      );
    }
    if (Array.isArray(parsed.siteLanguages)) {
      result.siteLanguages = (parsed.siteLanguages as string[]).filter(
        (l) => typeof l === "string"
      );
    }
  }

  return result;
}

function normalizeTargetQueries(raw: unknown): DiscoveredQuery[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): DiscoveredQuery | null => {
      if (typeof item === "string") {
        return { query: item };
      }
      if (item && typeof item === "object" && "query" in item) {
        const obj = item as { query: unknown; language?: unknown };
        if (typeof obj.query === "string") {
          return {
            query: obj.query,
            language:
              typeof obj.language === "string" ? obj.language : undefined,
          };
        }
      }
      return null;
    })
    .filter((q): q is DiscoveredQuery => q !== null)
    .slice(0, 15);
}

function hasValidData(result: DiscoveryResult): boolean {
  return (
    result.products.length > 0 ||
    result.services.length > 0 ||
    result.competitors.length > 0 ||
    result.targetQueries.length > 0 ||
    !!result.sector ||
    !!result.description
  );
}
