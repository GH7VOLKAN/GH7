import { EngineResult } from '../schema/types';
import { SourceStat, aggregateSources } from '../pipeline/aggregateSources';
import { classifySources } from './classifySources';
import { queryVerdicts } from './queryVerdicts';
import { analyzeOverview, analyzeQueryGap } from './analyze';
import { buildReport } from './buildReport';
import { QueryGap } from '../schema/stage2';
import { config } from '../config';

export interface Stage2Input {
  results: EngineResult[];
  sources?: SourceStat[]; // from Stage 1.5; recomputed if absent
  brand: string;
  brandDomain: string;
  competitorDomains: string[];
  lang?: string;
}

function visibilitySummary(results: EngineResult[]): string {
  const by: Record<string, { total: number; appears: number; pos: number[] }> = {};
  for (const r of results) {
    if (r.error) continue;
    by[r.engine] ??= { total: 0, appears: 0, pos: [] };
    by[r.engine].total++;
    if (r.brandAppears) {
      by[r.engine].appears++;
      if (r.position != null) by[r.engine].pos.push(r.position);
    }
  }
  return Object.entries(by)
    .map(([e, s]) => {
      const pct = s.total ? Math.round((s.appears / s.total) * 100) : 0;
      const avg = s.pos.length
        ? (s.pos.reduce((a, b) => a + b, 0) / s.pos.length).toFixed(1)
        : '-';
      return `${e}: ${s.appears}/${s.total} (${pct}%), ort. pozisyon ${avg}`;
    })
    .join('\n');
}

export async function runStage2(input: Stage2Input): Promise<string> {
  const sources = input.sources ?? (await aggregateSources(input.results, input.brandDomain));
  const classified = classifySources(sources, input.brandDomain, input.competitorDomains);

  const overview = await analyzeOverview({
    brand: input.brand,
    visibility: visibilitySummary(input.results),
    classified,
    lang: input.lang ?? 'tr',
  });

  const verdicts = queryVerdicts(input.results, input.competitorDomains)
    .filter((v) => v.severity > 0)
    .slice(0, config.stage2.maxQueries);

  const gaps: QueryGap[] = [];
  for (const v of verdicts) {
    console.log(`  gap analizi: "${v.query}" (severity ${v.severity})`);
    const g = await analyzeQueryGap({
      brand: input.brand,
      brandDomain: input.brandDomain,
      verdict: v,
      lang: input.lang ?? 'tr',
    });
    if (g) gaps.push(g);
  }

  return buildReport({ brand: input.brand, overview, classified, gaps });
}
