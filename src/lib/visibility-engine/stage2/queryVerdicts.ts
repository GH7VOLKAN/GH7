import { EngineResult } from '../schema/types';
import { QueryVerdict } from '../schema/stage2';
import { trNorm } from '../util/match';

function bare(url: string): string {
  try {
    return trNorm(new URL(url).hostname).replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Build a per-query verdict from all engine results, and collect the competitor
 * URLs AI cited for each query — those are the out-content targets.
 */
export function queryVerdicts(
  results: EngineResult[],
  competitorDomains: string[],
): QueryVerdict[] {
  const comps = competitorDomains.map((d) => bare('https://' + d)).filter(Boolean);
  const byQuery = new Map<string, EngineResult[]>();
  for (const r of results) {
    if (!byQuery.has(r.query)) byQuery.set(r.query, []);
    byQuery.get(r.query)!.push(r);
  }

  const verdicts: QueryVerdict[] = [];
  for (const [query, rs] of byQuery) {
    const appeared = new Set<string>();
    const lost = new Set<string>();
    const positions: number[] = [];
    const compUrls = new Set<string>();

    for (const r of rs) {
      if (r.error) continue;
      if (r.brandAppears) {
        appeared.add(r.engine);
        if (r.position != null) positions.push(r.position);
      } else {
        lost.add(r.engine);
      }
      for (const s of r.sources ?? []) {
        const d = bare(s.url);
        if (d && comps.some((c) => d === c || d.includes(c) || c.includes(d)))
          compUrls.add(s.url);
      }
    }

    const avgPosition = positions.length
      ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
      : null;

    verdicts.push({
      query,
      enginesAppeared: [...appeared],
      enginesLost: [...lost],
      avgPosition,
      citedCompetitorUrls: [...compUrls],
      severity: lost.size * 2 + compUrls.size + (avgPosition && avgPosition > 3 ? 1 : 0),
    });
  }

  return verdicts.sort((a, b) => b.severity - a.severity);
}
