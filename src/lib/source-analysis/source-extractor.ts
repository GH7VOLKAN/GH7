/**
 * Kaynak URL çıkarıcı — Brief N v4 Aşama 6.
 *
 * AI cevaplarından referans URL'lerini çıkarır. Platform bazlı öncelik:
 *   1. Perplexity — response.citations (API native)
 *   2. Google AIO — content içinde URL regex (SerpAPI ayrıca sources alanı)
 *   3. ChatGPT / Claude / Gemini — içerik içinde URL regex (best effort)
 *
 * Düşük kalite URL filtrelemesi: http/https, domain geçerli, yaygın
 * invalid pattern'ler (ör. `example.com`) dışlanır.
 */

import type { AIResponse } from "@/lib/ai/types";

export type ExtractedSource = {
  url: string;
  domain: string;
  platform: string;
};

const URL_REGEX = /https?:\/\/[^\s()<>"'\]\[\\]+[^\s()<>"'\]\[\\.,;:!?]/gi;

// Dışlanan domain'ler (örnek/placeholder)
const EXCLUDED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "localhost",
]);

// İç domain'ler — AI platformunun kendi kaynak linki (yararlı değil)
const PLATFORM_INTERNAL_DOMAINS = new Set([
  "chatgpt.com",
  "openai.com",
  "claude.ai",
  "anthropic.com",
  "perplexity.ai",
  "gemini.google.com",
  "serpapi.com",
]);

export function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isValidSourceUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const d = u.hostname.replace(/^www\./, "").toLowerCase();
    if (EXCLUDED_DOMAINS.has(d)) return false;
    if (PLATFORM_INTERNAL_DOMAINS.has(d)) return false;
    if (!d.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

function dedupByUrl(sources: ExtractedSource[]): ExtractedSource[] {
  const seen = new Set<string>();
  const out: ExtractedSource[] = [];
  for (const s of sources) {
    if (seen.has(s.url)) continue;
    seen.add(s.url);
    out.push(s);
  }
  return out;
}

// ─────────────────────────────────────────────────────
// Extractors per platform
// ─────────────────────────────────────────────────────

function extractFromPerplexity(r: AIResponse): ExtractedSource[] {
  const sources: ExtractedSource[] = [];
  if (Array.isArray(r.citations)) {
    for (const u of r.citations) {
      if (typeof u === "string" && isValidSourceUrl(u)) {
        sources.push({ url: u, domain: extractDomain(u), platform: r.platform });
      }
    }
  }
  // Perplexity metninde de ek URL olabilir — fallback regex
  const textUrls = extractFromText(r.content, r.platform);
  return dedupByUrl([...sources, ...textUrls]);
}

function extractFromText(content: string, platform: string): ExtractedSource[] {
  if (!content) return [];
  const matches = content.match(URL_REGEX) ?? [];
  const out: ExtractedSource[] = [];
  for (const m of matches) {
    if (!isValidSourceUrl(m)) continue;
    out.push({ url: m, domain: extractDomain(m), platform });
  }
  return dedupByUrl(out);
}

/**
 * Ana genel API — herhangi bir AIResponse'tan kaynakları çıkarır.
 */
export function extractSourcesFromResponse(r: AIResponse): ExtractedSource[] {
  if (r.platform === "perplexity") return extractFromPerplexity(r);
  // Diğer platformlar: sadece metin URL regex (best effort)
  return extractFromText(r.content, r.platform);
}

/**
 * Funnel'ın her step'indeki response'tan kaynakları toplar, dedupe eder.
 * TrackingResult.sources JSON alanı için.
 */
export function extractSourcesFromFunnel(steps: Array<{
  response: string;
  step: number;
  platform?: string;
}>, platform: string): ExtractedSource[] {
  const all: ExtractedSource[] = [];
  for (const s of steps) {
    const srcs = extractFromText(s.response, platform);
    all.push(...srcs);
  }
  return dedupByUrl(all);
}
