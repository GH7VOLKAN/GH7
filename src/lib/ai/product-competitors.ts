/**
 * Ürün bazlı rakip bulma motoru.
 *
 * Perplexity Sonar'a ürün-scoped tek sorgu atar, JSON array parse eder,
 * doğrular, normalize eder. 4 kapı için farklı output şekilleri.
 *
 * Cache: caller (endpoint) sorumluluğunda — burada çağırmıyoruz.
 */

import { querySonar } from "./sonar-research";
import {
  buildProductCompetitorPrompt,
  type ProductCompetitorPromptInput,
  type ProductCompetitorDoor,
} from "./product-competitor-prompts";

// ═══════════════════════════════════════════════════════════
// Output types (kapıya göre değişen alanlar optional)
// ═══════════════════════════════════════════════════════════

export type CompetitorCategory = "producer" | "installer";

export interface ProductCompetitor {
  name: string;
  url: string | null;
  reason: string;

  // Firma
  category?: CompetitorCategory;

  // Kişi
  platform?: string;

  // E-ticaret
  platforms?: string[];

  // Yurtdışı
  market?: string;
}

export interface ProductCompetitorsResult {
  productName: string;
  competitors: ProductCompetitor[];
  raw: string; // debugging için ham Sonar cevabı
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════

export interface FindCompetitorsInput {
  door: ProductCompetitorDoor;
  domain: string;
  productName: string;

  // Optional hints (detect'ten gelir)
  sector?: string;
  cities?: string[];
  city?: string;
  fullName?: string;
  expertise?: string;
  priceSegment?: "ekonomik" | "orta" | "premium" | "luks";
  targetMarket?: string;
}

export async function findCompetitorsForProduct(
  input: FindCompetitorsInput,
): Promise<ProductCompetitorsResult> {
  const prompt = buildProductCompetitorPrompt({
    door: input.door,
    domain: input.domain,
    productName: input.productName,
    sector: input.sector,
    cities: input.cities,
    fullName: input.fullName,
    expertise: input.expertise,
    city: input.city,
    priceSegment: input.priceSegment,
    targetMarket: input.targetMarket,
  } satisfies ProductCompetitorPromptInput);

  let raw = "";
  try {
    raw = await querySonar(prompt);
  } catch (err) {
    console.error(
      `[product-competitors] Sonar failed for product "${input.productName}":`,
      err,
    );
    return { productName: input.productName, competitors: [], raw: "" };
  }

  const competitors = parseCompetitors(raw, input);
  return { productName: input.productName, competitors, raw };
}

// ═══════════════════════════════════════════════════════════
// Parser
// ═══════════════════════════════════════════════════════════

function parseCompetitors(
  raw: string,
  input: FindCompetitorsInput,
): ProductCompetitor[] {
  // Sonar bazen markdown code fence içinde döndürüyor — strip et
  const cleaned = raw
    .replace(/```json?\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  // JSON array'i bul — ilk [ ile son ] arası
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.warn(
      `[product-competitors] No JSON array in Sonar response for "${input.productName}"`,
    );
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(arrayMatch[0]);
  } catch (err) {
    console.error(
      `[product-competitors] JSON parse error for "${input.productName}":`,
      err,
    );
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const ownDomainLower = input.domain.toLowerCase();
  const ownFullNameLower = input.fullName?.toLowerCase().trim();

  const competitors: ProductCompetitor[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;

    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    if (!name) continue;

    // Kendini rakip sanma
    if (ownFullNameLower && name.toLowerCase() === ownFullNameLower) continue;

    const rawUrl = typeof obj.url === "string" ? obj.url.trim() : "";
    const url = normalizeUrl(rawUrl);

    // Kendi domain'i ise skip
    if (url && url.toLowerCase().includes(ownDomainLower)) continue;

    const reason = typeof obj.reason === "string" ? obj.reason.trim() : "";

    const competitor: ProductCompetitor = { name, url, reason };

    // Kapıya göre ek alanlar
    if (input.door === "firma") {
      const cat = typeof obj.category === "string" ? obj.category : "";
      if (cat === "producer" || cat === "installer") {
        competitor.category = cat;
      }
    } else if (input.door === "kisi") {
      if (typeof obj.platform === "string") competitor.platform = obj.platform;
    } else if (input.door === "eticaret") {
      if (Array.isArray(obj.platforms)) {
        competitor.platforms = obj.platforms.filter(
          (p): p is string => typeof p === "string",
        );
      }
    } else if (input.door === "yurtdisi") {
      if (typeof obj.market === "string") competitor.market = obj.market;
    }

    competitors.push(competitor);
  }

  // Dedupe by url (varsa), sonra by name (lowercase)
  const seen = new Set<string>();
  const unique: ProductCompetitor[] = [];
  for (const c of competitors) {
    const key = c.url?.toLowerCase() || c.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(c);
  }

  return unique.slice(0, 12);
}

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let u = raw.trim().toLowerCase();
  u = u.replace(/^https?:\/\//, "").replace(/^www\./, "");
  u = u.split("/")[0].split("?")[0].split("#")[0];
  // En az bir nokta olmalı (domain.tld)
  if (!u.includes(".")) return null;
  if (!/^[a-z0-9.-]+$/.test(u)) return null;
  return u;
}
