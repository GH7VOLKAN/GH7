import { collectGoogleSerp } from '../collectors/dataforseo';
import { collectOpenAI } from '../collectors/openai';
import { collectAnthropic } from '../collectors/anthropic';
import { collectGemini } from '../collectors/gemini';
import { collectPerplexity } from '../collectors/perplexity';
import { config } from '../config';
import { Engine, EngineResult, QuerySet } from '../schema/types';

type Collector = (
  query: string,
  runId: number,
  qs: QuerySet,
) => Promise<EngineResult>;

const registry: Record<Engine, Collector> = {
  google_serp: collectGoogleSerp,
  openai: collectOpenAI,
  anthropic: collectAnthropic,
  gemini: collectGemini,
  perplexity: collectPerplexity,
};

/** The engines actually enabled (cost dial), in registry order. */
export function activeEngines(): Engine[] {
  return (Object.keys(registry) as Engine[]).filter((e) =>
    config.engines.includes(e),
  );
}

/** Stage 1: collect structured results for the whole query set. */
export async function runQueries(qs: QuerySet): Promise<EngineResult[]> {
  const results: EngineResult[] = [];
  const engines = activeEngines();

  for (const query of qs.queries) {
    for (let run = 1; run <= config.runsPerQuery; run++) {
      // Run all engines for this (query, run) in parallel to keep wall-clock
      // time within the serverless function budget.
      const batch = await Promise.all(
        engines.map((engine) => registry[engine](query, run, qs)),
      );
      results.push(...batch);
      for (const r of batch) {
        console.log(
          `[${r.engine.padEnd(12)}] "${query}" run ${run} → ` +
            `appears=${r.brandAppears} pos=${r.position ?? '-'} ` +
            `${r.error ? 'ERR: ' + r.error : ''}`,
        );
      }
    }
  }

  return results;
}
