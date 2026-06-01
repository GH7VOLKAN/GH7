import { reason } from '../stage0/reason';
import { extractJson } from '../util/json';
import {
  OVERVIEW_SYSTEM,
  buildOverviewPrompt,
  GAP_SYSTEM,
  buildGapPrompt,
} from './prompts';
import { fetchCompetitorPages } from './fetchPages';
import { ClassifiedSource, QueryGap, QueryVerdict, Stage2Overview } from '../schema/stage2';

export async function analyzeOverview(input: {
  brand: string;
  visibility: string;
  classified: ClassifiedSource[];
}): Promise<Stage2Overview | null> {
  const classifiedSources = input.classified
    .map((s) => `${String(s.count).padStart(3)} ${s.domain} [${s.klass}]`)
    .join('\n');

  const text = await reason(
    OVERVIEW_SYSTEM,
    buildOverviewPrompt({
      brand: input.brand,
      visibility: input.visibility,
      classifiedSources,
    }),
  );
  return extractJson<Stage2Overview>(text);
}

export async function analyzeQueryGap(input: {
  brand: string;
  brandDomain: string;
  verdict: QueryVerdict;
}): Promise<QueryGap | null> {
  const competitorPages = await fetchCompetitorPages(input.verdict.citedCompetitorUrls);
  const text = await reason(
    GAP_SYSTEM,
    buildGapPrompt({
      brand: input.brand,
      brandDomain: input.brandDomain,
      query: input.verdict.query,
      competitorPages,
    }),
    5000,
  );
  const gap = extractJson<QueryGap>(text);
  if (gap) gap.query = input.verdict.query;
  return gap;
}
