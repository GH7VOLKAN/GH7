import { runStage0 } from "./stage0";
import { runQueries } from "./pipeline/runQueries";
import { aggregateSources } from "./pipeline/aggregateSources";
import { classifySources } from "./stage2/classifySources";
import { queryVerdicts } from "./stage2/queryVerdicts";
import { analyzeOverview, analyzeQueryGap } from "./stage2/analyze";
import { config } from "./config";
import { trNorm } from "./util/match";
import type { EngineResult, QuerySet } from "./schema/types";
import type { Lang, Report, Section, Source, GapItem } from "@/lib/report/types";

export interface RunInput {
  domain: string;
  brand: string;
  lang: Lang;
  competitorDomains: string[];
  promptCount: number;
  logoUrl?: string;
  /** How many top-severity queries get full gap analysis. */
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

/**
 * Run the full visibility pipeline for one order and assemble the
 * product-agnostic Report. Stage 0 (intake+queries) -> Stage 1 (collect) ->
 * Stage 1.5 (sources) -> Stage 2 (overview + gaps).
 */
export async function runVisibility(
  input: RunInput,
): Promise<{ report: Report; results: EngineResult[] }> {
  // 1. Stage 0 — derive a scoped query set from the site, capped to the tier.
  const stage0 = await runStage0(input.domain);
  const queries = stage0.querySet.queries.slice(0, Math.max(1, input.promptCount));
  const qs: QuerySet = {
    business: stage0.querySet.business,
    brand: input.brand,
    brandDomain: input.domain,
    competitors: input.competitorDomains,
    queries,
  };

  // 2. Stage 1 — collect across enabled engines × runs.
  const results = await runQueries(qs);

  // 3. Stage 1.5 — ranked source map, Gemini proxies resolved.
  const sources = await aggregateSources(results, input.domain);
  const classified = classifySources(sources, input.domain, input.competitorDomains);

  // 4. Stage 2 — overview + per-query gaps.
  const visibilityText = buildVisibilityText(results);
  const overview = await analyzeOverview({
    brand: input.brand,
    visibility: visibilityText,
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
  const gaps: GapItem[] = gapResults
    .filter((g): g is NonNullable<typeof g> => g != null)
    .map((g) => ({
      query: g.query,
      diagnosis: g.diagnosis,
      contentGap: g.contentGap,
      faq: g.faq,
      jsonLd: g.jsonLd,
      actions: g.pageActions,
    }));

  // 5. Assemble the generic Report.
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

  const report: Report = {
    brand: input.brand,
    logoUrl: input.logoUrl,
    product: "AI Görünürlük",
    date: new Date().toISOString(),
    lang: input.lang,
    sections,
  };

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

function buildVisibilityText(results: EngineResult[]): string {
  const by = perEngine(results);
  return Object.entries(by)
    .map(([e, s]) => {
      const pct = s.total ? Math.round((s.appears / s.total) * 100) : 0;
      const avg = s.pos.length ? (s.pos.reduce((a, b) => a + b, 0) / s.pos.length).toFixed(1) : "-";
      return `${labelFor(e)}: ${pct}% (ort. pozisyon ${avg})`;
    })
    .join("\n");
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
  // Keep a display name (first seen original casing) per key.
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
