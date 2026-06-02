import { runStage0 } from "./stage0";
import { collectGoogleSerp } from "./collectors/dataforseo";
import { collectOpenAI } from "./collectors/openai";
import { collectAnthropic } from "./collectors/anthropic";
import { collectGemini } from "./collectors/gemini";
import { collectPerplexity } from "./collectors/perplexity";
import { activeEngines } from "./pipeline/runQueries";
import { aggregateSources } from "./pipeline/aggregateSources";
import { classifySources } from "./stage2/classifySources";
import { queryVerdicts } from "./stage2/queryVerdicts";
import { analyzeOverview, analyzeQueryGap } from "./stage2/analyze";
import { config } from "./config";
import { trNorm } from "./util/match";
import type { Engine, EngineResult, QuerySet } from "./schema/types";
import type { ClassifiedSource, Stage2Overview } from "./schema/stage2";
import type { Lang, Report, Section, Source, GapItem } from "@/lib/report/types";

export interface RunInput {
  domain: string;
  brand: string;
  lang: Lang;
  competitorDomains: string[];
  promptCount: number;
  logoUrl?: string;
  maxGaps?: number;
}

const ENGINE_LABEL: Record<string, string> = {
  google_serp: "Google",
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};
const labelFor = (e: string) => ENGINE_LABEL[e] ?? e;

type Collector = (query: string, runId: number, qs: QuerySet) => Promise<EngineResult>;
const REGISTRY: Record<Engine, Collector> = {
  google_serp: collectGoogleSerp,
  openai: collectOpenAI,
  anthropic: collectAnthropic,
  gemini: collectGemini,
  perplexity: collectPerplexity,
};

/** Stage 0 — derive a scoped query set from the site, capped to the tier. */
export async function deriveQueries(
  domain: string,
  promptCount: number,
): Promise<{ business: string; queries: string[] }> {
  const stage0 = await runStage0(domain);
  const queries = stage0.querySet.queries.slice(0, Math.max(1, promptCount));
  return { business: stage0.querySet.business, queries };
}

/** Collect all enabled engines for ONE query (parallel), runsPerQuery times. */
export async function collectForQuery(query: string, qs: QuerySet): Promise<EngineResult[]> {
  const engines = activeEngines();
  const out: EngineResult[] = [];
  for (let run = 1; run <= config.runsPerQuery; run++) {
    const batch = await Promise.all(engines.map((e) => REGISTRY[e](query, run, qs)));
    out.push(...batch);
  }
  return out;
}

/** Stage 1.5 — ranked source map (proxies resolved) + own/comp/neutral. */
export async function classifyAllSources(
  results: EngineResult[],
  domain: string,
  competitorDomains: string[],
): Promise<ClassifiedSource[]> {
  const sources = await aggregateSources(results, domain);
  return classifySources(sources, domain, competitorDomains);
}

/** Build the human-readable per-engine visibility line (for the Stage 2 overview prompt). */
export function buildVisibilityText(results: EngineResult[]): string {
  const by = perEngine(results);
  return Object.entries(by)
    .map(([e, s]) => {
      const pct = s.total ? Math.round((s.appears / s.total) * 100) : 0;
      const avg = s.pos.length ? (s.pos.reduce((a, b) => a + b, 0) / s.pos.length).toFixed(1) : "-";
      return `${labelFor(e)}: ${pct}% (ort. pozisyon ${avg})`;
    })
    .join("\n");
}

export interface AssembleParts {
  results: EngineResult[];
  classified: ClassifiedSource[];
  overview: Stage2Overview | null;
  gaps: GapItem[];
}

/** Pure assembly of the product-agnostic Report from already-computed parts. */
export function assembleReport(input: RunInput, parts: AssembleParts): Report {
  const { results, classified, overview, gaps } = parts;
  const sections: Section[] = [];

  if (overview) {
    sections.push({
      type: "summary",
      title: "Durum",
      body: [overview.summary, overview.citedVsRecommended, `Ana kaldıraç: ${overview.mainLever}`]
        .filter(Boolean)
        .join("\n\n"),
    });
  }

  sections.push(buildVisibilitySection(results));

  const competitorRows = buildCompetitorRows(results, input.brand);
  if (competitorRows.length) {
    sections.push({ type: "competitors", title: "Seni geçen rakipler", rows: competitorRows });
  }

  const sourceList: Source[] = classified
    .slice(0, 15)
    .map((s) => ({ domain: s.domain, count: s.count, klass: s.klass === "competitor" ? "comp" : s.klass }));
  if (sourceList.length) {
    sections.push({ type: "sourceMap", title: "AI'ların atıf verdiği kaynaklar", sources: sourceList });
  }

  if (gaps.length) {
    sections.push({ type: "gaps", title: "Sorgu-bazlı içerik açıkları", items: gaps });
  }

  return {
    brand: input.brand,
    logoUrl: input.logoUrl,
    product: "AI Görünürlük",
    date: new Date().toISOString(),
    lang: input.lang,
    sections,
  };
}

/**
 * Single-shot run (used locally / non-durable). The durable Inngest function
 * composes the same exported pieces as memoized steps.
 */
export async function runVisibility(
  input: RunInput,
): Promise<{ report: Report; results: EngineResult[] }> {
  const { queries, business } = await deriveQueries(input.domain, input.promptCount);
  const qs: QuerySet = {
    business,
    brand: input.brand,
    brandDomain: input.domain,
    competitors: input.competitorDomains,
    queries,
  };

  const results: EngineResult[] = [];
  for (const query of queries) {
    results.push(...(await collectForQuery(query, qs)));
  }

  const classified = await classifyAllSources(results, input.domain, input.competitorDomains);

  const overview = await analyzeOverview({
    brand: input.brand,
    visibility: buildVisibilityText(results),
    classified,
  });

  const maxGaps = input.maxGaps ?? config.stage2.maxQueries;
  const verdicts = queryVerdicts(results, input.competitorDomains)
    .filter((v) => v.severity > 0)
    .slice(0, maxGaps);
  const gapResults = await Promise.all(
    verdicts.map((v) =>
      analyzeQueryGap({ brand: input.brand, brandDomain: input.domain, verdict: v }),
    ),
  );
  const gaps = gapResults
    .filter((g): g is NonNullable<typeof g> => g != null)
    .map((g) => ({
      query: g.query,
      diagnosis: g.diagnosis,
      contentGap: g.contentGap,
      faq: g.faq,
      jsonLd: g.jsonLd,
      actions: g.pageActions,
    }));

  const report = assembleReport(input, { results, classified, overview, gaps });
  return { report, results };
}

function perEngine(results: EngineResult[]) {
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
  return by;
}

function buildVisibilitySection(results: EngineResult[]): Section {
  const by = perEngine(results);
  const order = ["openai", "anthropic", "gemini", "perplexity", "google_serp"];
  const engines = order
    .filter((e) => by[e])
    .map((e) => {
      const s = by[e];
      const pct = s.total ? Math.round((s.appears / s.total) * 100) : 0;
      const avgPos = s.pos.length ? Math.round((s.pos.reduce((a, b) => a + b, 0) / s.pos.length) * 10) / 10 : null;
      return { name: labelFor(e), pct, avgPos };
    });
  return { type: "visibility", title: "Motor bazında görünürlük", engines };
}

function buildCompetitorRows(results: EngineResult[], brand: string) {
  const b = trNorm(brand);
  const map = new Map<string, { count: number; engines: Set<string> }>();
  for (const r of results) {
    if (r.error) continue;
    for (const name of r.competitors ?? []) {
      const key = trNorm(name);
      if (!key || key.includes(b) || b.includes(key)) continue;
      const entry = map.get(key) ?? { count: 0, engines: new Set<string>() };
      entry.count++;
      entry.engines.add(r.engine);
      map.set(key, entry);
    }
  }
  const display = new Map<string, string>();
  for (const r of results) {
    for (const name of r.competitors ?? []) {
      const key = trNorm(name);
      if (!display.has(key)) display.set(key, name);
    }
  }
  return [...map.entries()]
    .sort((a, b2) => b2[1].count - a[1].count)
    .slice(0, 6)
    .map(([key, v]) => ({
      name: display.get(key) ?? key,
      where: [...v.engines].map(labelFor).join(", "),
    }));
}
