import { fetchSite } from './fetchSite';
import { reason } from './reason';
import {
  INTAKE_SYSTEM,
  buildIntakePrompt,
  QUERYGEN_SYSTEM,
  buildQueryGenPrompt,
} from './prompts';
import { extractJson } from '../util/json';
import { Intake, QueryPlan } from '../schema/intake';
import { QuerySet } from '../schema/types';

export interface Stage0Result {
  intake: Intake;
  plan: QueryPlan;
  querySet: QuerySet;
  pagesFetched: string[];
}

/** Slugify a domain/brand into a safe filename stem. */
function slug(s: string): string {
  return s.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function runStage0(urlInput: string): Promise<Stage0Result> {
  // 1. Read the site
  const site = await fetchSite(urlInput);

  // 2. Extract structured intake
  const intakeText = await reason(INTAKE_SYSTEM, buildIntakePrompt(site.text, site.url));
  const intake = extractJson<Intake>(intakeText);
  if (!intake) throw new Error('Intake extraction returned no valid JSON.');
  if (!intake.brandDomain) intake.brandDomain = site.host;

  // 3. Generate the query plan from the intake
  const planText = await reason(
    QUERYGEN_SYSTEM,
    buildQueryGenPrompt(JSON.stringify(intake, null, 2)),
  );
  const plan = extractJson<QueryPlan>(planText);
  if (!plan?.queries) throw new Error('Query generation returned no valid JSON.');

  // 4. Flatten into a Stage 1 QuerySet (dedup the query texts)
  const queries = [...new Set(plan.queries.map((q) => q.query).filter(Boolean))];
  const querySet: QuerySet = {
    business: slug(intake.brand || site.host),
    brand: intake.brand,
    brandDomain: intake.brandDomain,
    competitors: [], // emerge from the run; do not pre-fill with guesses
    queries,
  };

  return { intake, plan, querySet, pagesFetched: site.pagesFetched };
}
