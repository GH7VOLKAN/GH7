/**
 * Website Analyzer — 4 kullanıcı tipi için unified discovery.
 *
 * Başlangıçta sadece firma için domain → products/services tespit ediyordu.
 * Şimdi 4 tip için genişletildi (firma/kisi/eticaret/yurtdisi).
 *
 * Backward compat: analyzeWebsite(domain) fn imzası korunur (firma shortcut).
 * Yeni kod: runDiscovery(input: DiscoveryInput)
 *
 * NOT: Cache kaldırıldı — her analiz Perplexity'yi taze çağırır.
 * 1000+ kullanıcı ölçeğine ulaştığında cache tekrar eklenebilir.
 */

import { querySonar } from "@/lib/ai/sonar-research";
import { buildPromptByType } from "./discovery-prompts";
import {
  DEFAULT_DISCOVERY,
  type DiscoveryInput,
  type DiscoveryResult,
  type CompanyType,
  type DiscoveredQuery,
} from "./discovery-types";

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
  console.log(
    `[discovery] Fresh Perplexity query for ${input.companyType} (no cache)`,
  );

  try {
    const prompt = buildPromptByType(input);
    const response = await querySonar(prompt);
    const parsed = parseDiscoveryResponse(response, input.companyType);
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
          .slice(0, 10)
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
