/**
 * Rakip eşleştirme ve upsert logic — duplicate detection merkezi.
 *
 * Tüm rakip eklemeleri (manuel, AI-discovered, scan-discovered, free-audit)
 * bu modülden geçer. Duplicate detected ise mevcut kayıt güncellenir.
 */

import { prisma } from "@/lib/db";
import {
  normalizeForMatching,
  extractRootDomain,
  brandMatchFuzzy,
} from "@/lib/utils/turkish";
import type { Competitor, Prisma } from "@prisma/client";

export type CompetitorSource =
  | "manual"
  | "ai_discovered"
  | "scan_discovered"
  | "free_audit"
  | "discovery";

export interface CompetitorUpsertInput {
  brandId: string;
  name: string;
  domain?: string;
  source?: CompetitorSource;
  reason?: string;
  products?: string[];
  relevance?: "direct" | "indirect";
  mentionScore?: number;
  readinessScore?: number;
  platforms?: Record<string, number>;
}

/**
 * Platforms JSON'ını merge eder — her platform için max değer alınır.
 */
function mergePlatforms(
  a: Record<string, number>,
  b: Record<string, number>
): Record<string, number> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const result: Record<string, number> = {};
  for (const k of keys) {
    result[k] = Math.max(a[k] ?? 0, b[k] ?? 0);
  }
  return result;
}

/**
 * Verilen brand için fuzzy match ile mevcut duplicate rakibi bulur.
 * Öncelik sırası:
 *   1. Domain match (normalizedDomain eşitliği)
 *   2. normalizedName exact match
 *   3. brandMatchFuzzy (Levenshtein / first word)
 */
export async function findDuplicateCompetitor(
  brandId: string,
  name: string,
  domain?: string
): Promise<Competitor | null> {
  const normalizedName = normalizeForMatching(name);
  const normalizedDomain = domain ? extractRootDomain(domain) : null;

  if (!normalizedName && !normalizedDomain) return null;

  const existing = await prisma.competitor.findMany({
    where: { brandId },
  });

  return (
    existing.find((c) => {
      // Domain match (en güçlü sinyal)
      if (
        normalizedDomain &&
        c.normalizedDomain &&
        c.normalizedDomain === normalizedDomain
      ) {
        return true;
      }
      // Normalized name exact match
      if (c.normalizedName && c.normalizedName === normalizedName) return true;
      // Fuzzy name match
      return brandMatchFuzzy(c.name, name);
    }) ?? null
  );
}

/**
 * Yeni rakip eklenmesi — duplicate varsa merge, yoksa insert.
 * Returns: Competitor (yeni veya merged)
 *
 * Kullanım:
 *   await upsertCompetitor({
 *     brandId: "...",
 *     name: "Warmhaus",
 *     domain: "warmhaus.com",
 *     source: "manual",
 *   });
 */
export async function upsertCompetitor(
  input: CompetitorUpsertInput
): Promise<Competitor> {
  const trimmedName = input.name?.trim() ?? "";
  if (!trimmedName) {
    throw new Error("Competitor name is required");
  }

  const normalizedName = normalizeForMatching(trimmedName);
  const normalizedDomain = input.domain ? extractRootDomain(input.domain) : null;

  if (!normalizedName) {
    throw new Error("Competitor name normalized to empty");
  }

  const match = await findDuplicateCompetitor(
    input.brandId,
    trimmedName,
    input.domain
  );

  if (match) {
    // UPDATE — merge data (prefer richer data from either side)
    const existingPlatforms =
      (match.platforms as Record<string, number> | null) ?? {};
    const mergedPlatforms = mergePlatforms(
      existingPlatforms,
      input.platforms ?? {}
    );

    // Source priority: manual > ai_discovered > scan_discovered > free_audit > discovery
    // Don't downgrade source
    const shouldUpdateSource =
      match.source !== "manual" &&
      input.source &&
      input.source !== match.source;

    return prisma.competitor.update({
      where: { id: match.id },
      data: {
        // Prefer longer/more informative name
        name:
          match.name.length >= trimmedName.length ? match.name : trimmedName,
        normalizedName: match.normalizedName || normalizedName,
        domain: match.domain || input.domain || "",
        normalizedDomain: match.normalizedDomain || normalizedDomain,
        mentionScore: Math.max(match.mentionScore, input.mentionScore ?? 0),
        readinessScore: Math.max(
          match.readinessScore,
          input.readinessScore ?? 0
        ),
        platforms: mergedPlatforms as Prisma.InputJsonValue,
        reason: input.reason || match.reason,
        products:
          input.products && input.products.length > 0
            ? input.products
            : match.products,
        relevance: input.relevance ?? match.relevance,
        source: shouldUpdateSource
          ? (input.source as CompetitorSource)
          : match.source,
      },
    });
  }

  // INSERT — no duplicate found
  return prisma.competitor.create({
    data: {
      brandId: input.brandId,
      name: trimmedName,
      normalizedName,
      domain: input.domain ?? "",
      normalizedDomain,
      mentionScore: input.mentionScore ?? 0,
      readinessScore: input.readinessScore ?? 0,
      platforms: (input.platforms ?? {
        chatgpt: 0,
        claude: 0,
        gemini: 0,
        perplexity: 0,
        google_aio: 0,
      }) as Prisma.InputJsonValue,
      source: input.source ?? "manual",
      reason: input.reason ?? null,
      products: input.products ?? [],
      relevance: input.relevance ?? "direct",
      discoveredAt:
        input.source && input.source !== "manual" ? new Date() : null,
    },
  });
}

/**
 * Birden fazla rakibi toplu upsert eder.
 * Her biri için ayrı upsertCompetitor çağrısı (paralel değil — sıralı,
 * aynı brand'ta aynı anda duplicate yaratmamak için).
 */
export async function upsertCompetitorsBulk(
  inputs: CompetitorUpsertInput[]
): Promise<Competitor[]> {
  const results: Competitor[] = [];
  for (const input of inputs) {
    try {
      const c = await upsertCompetitor(input);
      results.push(c);
    } catch (err) {
      console.error(
        `[competitor-matching] Upsert failed for ${input.name}:`,
        err
      );
    }
  }
  return results;
}
