import { EngineResult } from '../schema/types';

export interface SourceStat {
  domain: string;
  count: number;
  engines: string[];
  queries: string[];
  isOwn: boolean;
}

const GEMINI_PROXY = /vertexaisearch\.cloud\.google\.com/i;

/** Gemini grounding returns redirect-proxy URLs; follow them to the real domain. */
async function resolveProxy(url: string): Promise<string> {
  if (!GEMINI_PROXY.test(url)) return url;
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' });
    return res.url || url;
  } catch {
    return url;
  }
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Aggregate cited sources across every result into a ranked domain list.
 * Resolves Gemini proxy links and flags the brand's own domain.
 */
export async function aggregateSources(
  results: EngineResult[],
  brandDomain?: string,
): Promise<SourceStat[]> {
  const own = brandDomain?.replace(/^www\./, '').toLowerCase();
  const map = new Map<string, SourceStat>();

  for (const r of results) {
    for (const s of r.sources ?? []) {
      if (!s.url) continue;
      const resolved = await resolveProxy(s.url);
      const domain = domainOf(resolved);
      if (!domain || GEMINI_PROXY.test(domain)) continue; // skip unresolvable proxies

      const stat =
        map.get(domain) ??
        { domain, count: 0, engines: [], queries: [], isOwn: domain === own };
      stat.count++;
      if (!stat.engines.includes(r.engine)) stat.engines.push(r.engine);
      if (!stat.queries.includes(r.query)) stat.queries.push(r.query);
      map.set(domain, stat);
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count);
}
