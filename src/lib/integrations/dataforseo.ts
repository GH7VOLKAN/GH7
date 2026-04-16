/**
 * DataForSEO API Integration
 *
 * Provides:
 * - Backlinks overview (total backlinks, referring domains, domain rank)
 * - Keyword search volume (for estimated loss calculation)
 * - Competitor domain discovery
 *
 * Auth: Basic (login:password in env vars)
 * Env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD
 *
 * Cache: 7 days via Redis (Upstash)
 * Cost: ~$0.05 per call, ~$0.15 per full audit
 */

import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";

const BASE_URL = "https://api.dataforseo.com/v3";
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

function getAuthHeader(): string | null {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

async function callDataForSEO<T = unknown>(
  endpoint: string,
  body: unknown
): Promise<T | null> {
  const auth = getAuthHeader();
  if (!auth) {
    console.warn("[dataforseo] DATAFORSEO_LOGIN/PASSWORD not set, skipping");
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Array.isArray(body) ? body : [body]),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.error(`[dataforseo] HTTP ${res.status} for ${endpoint}`);
      return null;
    }

    const data = await res.json();
    return data as T;
  } catch (err) {
    console.error(`[dataforseo] Error calling ${endpoint}:`, err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// 1. Backlinks Overview
// ═══════════════════════════════════════════════════════════

export interface BacklinksOverview {
  totalBacklinks: number;
  referringDomains: number;
  domainRank: number;
  referringMainDomains: number;
  dofollowBacklinks: number;
}

interface DfsBacklinksResponse {
  tasks?: Array<{
    result?: Array<{
      backlinks?: number;
      referring_domains?: number;
      referring_main_domains?: number;
      rank?: number;
      dofollow?: number;
    }>;
  }>;
}

export async function getBacklinksOverview(
  domain: string
): Promise<BacklinksOverview | null> {
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!cleanDomain) return null;

  const cacheKey = makeCacheKey("dfs-backlinks", cleanDomain);
  const cached = await cacheGet<BacklinksOverview>(cacheKey);
  if (cached) return cached;

  const response = await callDataForSEO<DfsBacklinksResponse>(
    "/backlinks/summary/live",
    { target: cleanDomain, internal_list_limit: 1, backlinks_status_type: "live" }
  );

  const result = response?.tasks?.[0]?.result?.[0];
  if (!result) return null;

  const overview: BacklinksOverview = {
    totalBacklinks: result.backlinks ?? 0,
    referringDomains: result.referring_domains ?? 0,
    domainRank: result.rank ?? 0,
    referringMainDomains: result.referring_main_domains ?? 0,
    dofollowBacklinks: result.dofollow ?? 0,
  };

  await cacheSet(cacheKey, overview, CACHE_TTL);
  return overview;
}

// ═══════════════════════════════════════════════════════════
// 2. Keyword Search Volume (for estimated loss)
// ═══════════════════════════════════════════════════════════

export interface KeywordVolume {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number; // 0-1
}

interface DfsKeywordResponse {
  tasks?: Array<{
    result?: Array<{
      keyword?: string;
      search_volume?: number;
      cpc?: number;
      competition?: number;
    }>;
  }>;
}

export async function getKeywordVolumes(
  keywords: string[],
  locationCode = 2792 // Turkey
): Promise<KeywordVolume[]> {
  if (keywords.length === 0) return [];

  const cacheKey = makeCacheKey("dfs-keywords", keywords.sort().join("|"), String(locationCode));
  const cached = await cacheGet<KeywordVolume[]>(cacheKey);
  if (cached) return cached;

  const response = await callDataForSEO<DfsKeywordResponse>(
    "/keywords_data/google/search_volume/live",
    {
      keywords: keywords.slice(0, 100), // API limit
      location_code: locationCode,
      language_code: "tr",
    }
  );

  const results = response?.tasks?.[0]?.result ?? [];
  const volumes: KeywordVolume[] = results.map((r) => ({
    keyword: r.keyword ?? "",
    searchVolume: r.search_volume ?? 0,
    cpc: r.cpc ?? 0,
    competition: r.competition ?? 0,
  }));

  await cacheSet(cacheKey, volumes, CACHE_TTL);
  return volumes;
}

// ═══════════════════════════════════════════════════════════
// 3. Competitor Discovery (real SERP-based competitors)
// ═══════════════════════════════════════════════════════════

export interface CompetitorDomain {
  domain: string;
  commonKeywords: number;
  organicTraffic: number;
  rank: number;
}

interface DfsCompetitorsResponse {
  tasks?: Array<{
    result?: Array<{
      items?: Array<{
        domain?: string;
        intersections?: number;
        metrics?: {
          organic?: { count?: number; etv?: number };
        };
        rank?: number;
      }>;
    }>;
  }>;
}

export async function getCompetitorDomains(
  domain: string,
  locationCode = 2792
): Promise<CompetitorDomain[]> {
  const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!cleanDomain) return [];

  const cacheKey = makeCacheKey("dfs-competitors", cleanDomain, String(locationCode));
  const cached = await cacheGet<CompetitorDomain[]>(cacheKey);
  if (cached) return cached;

  const response = await callDataForSEO<DfsCompetitorsResponse>(
    "/dataforseo_labs/google/competitors_domain/live",
    {
      target: cleanDomain,
      location_code: locationCode,
      language_code: "tr",
      limit: 10,
    }
  );

  const items = response?.tasks?.[0]?.result?.[0]?.items ?? [];
  const competitors: CompetitorDomain[] = items
    .map((i) => ({
      domain: i.domain ?? "",
      commonKeywords: i.intersections ?? 0,
      organicTraffic: i.metrics?.organic?.etv ?? 0,
      rank: i.rank ?? 0,
    }))
    .filter((c) => c.domain && c.domain !== cleanDomain);

  await cacheSet(cacheKey, competitors, CACHE_TTL);
  return competitors;
}

// ═══════════════════════════════════════════════════════════
// Helper: Check if DataForSEO is configured
// ═══════════════════════════════════════════════════════════

export function isDataForSeoAvailable(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}
