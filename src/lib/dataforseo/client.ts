/**
 * DataForSEO REST API Client
 * Keyword research ve SERP analizi icin
 */

const DATAFORSEO_BASE = "https://api.dataforseo.com";

function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DataForSEO credentials not configured");
  }
  return Buffer.from(`${login}:${password}`).toString("base64");
}

export function isDataForSEOAvailable(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

async function apiRequest<T>(endpoint: string, body: unknown[]): Promise<T> {
  const res = await fetch(`${DATAFORSEO_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getAuth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`DataForSEO API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${data.status_message}`);
  }

  return data;
}

export interface KeywordResult {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

interface DataForSEOResponse {
  status_code: number;
  status_message: string;
  tasks: Array<{
    result: Array<{
      items?: Array<{
        keyword_data?: {
          keyword: string;
          keyword_info?: {
            search_volume: number;
            competition: number;
            cpc: number;
          };
        };
        se_type?: string;
        keyword?: string;
        keyword_info?: {
          search_volume: number;
          competition: number;
          cpc: number;
        };
      }>;
    }>;
  }>;
}

/**
 * Sektore dayali anahtar kelime arastirmasi
 * DataForSEO Labs — Related Keywords API
 */
export async function getRelatedKeywords(
  sector: string,
  city?: string | null,
): Promise<KeywordResult[]> {
  const keyword = city ? `${sector} ${city}` : sector;

  try {
    const data = await apiRequest<DataForSEOResponse>(
      "/v3/dataforseo_labs/google/related_keywords/live",
      [
        {
          keyword,
          language_code: "tr",
          location_code: 2792, // Turkiye
          limit: 50,
          include_seed_keyword: true,
        },
      ],
    );

    const items = data.tasks?.[0]?.result?.[0]?.items ?? [];

    return items
      .filter((item) => item.keyword_data?.keyword_info?.search_volume)
      .map((item) => ({
        keyword: item.keyword_data!.keyword,
        searchVolume: item.keyword_data!.keyword_info!.search_volume,
        competition: item.keyword_data!.keyword_info!.competition ?? 0,
        cpc: item.keyword_data!.keyword_info!.cpc ?? 0,
      }))
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 30); // Top 30
  } catch (err) {
    console.error("[dataforseo] getRelatedKeywords error:", err);
    return [];
  }
}

/**
 * Marka adi + sektor keyword onerileri
 * DataForSEO Labs — Keyword Suggestions API
 */
export async function getKeywordSuggestions(
  brandName: string,
  sector: string,
): Promise<KeywordResult[]> {
  try {
    const data = await apiRequest<DataForSEOResponse>(
      "/v3/dataforseo_labs/google/keyword_suggestions/live",
      [
        {
          keyword: `${brandName} ${sector}`,
          language_code: "tr",
          location_code: 2792,
          limit: 20,
        },
      ],
    );

    const items = data.tasks?.[0]?.result?.[0]?.items ?? [];

    return items
      .filter((item) => item.keyword_info?.search_volume)
      .map((item) => ({
        keyword: item.keyword ?? "",
        searchVolume: item.keyword_info!.search_volume,
        competition: item.keyword_info!.competition ?? 0,
        cpc: item.keyword_info!.cpc ?? 0,
      }))
      .sort((a, b) => b.searchVolume - a.searchVolume);
  } catch (err) {
    console.error("[dataforseo] getKeywordSuggestions error:", err);
    return [];
  }
}
