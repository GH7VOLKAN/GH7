/**
 * STAGE 2 PROMPTS — the value layer.
 * (1) Overview: interpret visibility + classified sources honestly.
 * (2) Per-query gap: given the competitor pages AI cites for a losing query,
 *     produce a concrete content gap + ready-to-use assets (no vague advice).
 *
 * Copyright: generated content must be ORIGINAL. Analyze competitor pages to
 * understand what makes them citable; NEVER copy their text.
 */

/** Map a language code to a full language name for the prompt instruction. */
function langName(lang: string): string {
  const m: Record<string, string> = { tr: "Turkish", en: "English" };
  return m[lang] ?? "Turkish";
}

export const OVERVIEW_SYSTEM = `You are an AEO/GEO strategist. You give honest, specific, actionable reads — never generic platitudes. You distinguish being CITED as a source from being RECOMMENDED as a vendor, classify sources correctly, and name the realistic main lever even when it is not flattering. Output ONLY a JSON object.`;

export function buildOverviewPrompt(input: {
  brand: string;
  visibility: string; // per-engine appear% + avg position
  classifiedSources: string; // own/competitor/neutral with counts
  lang: string;
}): string {
  return [
    `Brand: ${input.brand}`,
    '',
    'Visibility (per engine):',
    input.visibility,
    '',
    'Cited sources, classified (own / competitor / neutral):',
    input.classifiedSources,
    '',
    'Produce JSON:',
    '{',
    '  "summary": "where the brand wins/loses across engines, in plain language",',
    '  "citedVsRecommended": "interpret: is the brand cited as a source vs recommended as a vendor? what does the gap mean?",',
    '  "sourceReading": {',
    '    "own": "what the brand\'s own-domain citations mean + action (defend/expand)",',
    '    "competitor": "competitor-domain citations are NOT a place to get into — they are an out-content signal on the brand\'s OWN domain; say so",',
    '    "neutral": "the genuinely neutral sources = the real get-listed targets; if they are scarce, say so honestly"',
    '  },',
    '  "mainLever": "the realistic highest-leverage lever. If neutral sources are scarce (common in specialized B2B niches), the main lever is own-content authority + entity strength, NOT third-party placement. Be honest.",',
    '  "neutralSourcePlan": ["only genuinely winnable neutral placements: marketplaces, manufacturer dealer/partner pages, directories, comparison/editorial. Do NOT list competitor domains here."]',
    '}',
    '',
    `LANGUAGE: write EVERY natural-language value (summary, citedVsRecommended, sourceReading.*, mainLever, neutralSourcePlan items) entirely in ${langName(input.lang)}. Do NOT mix languages. Keep brand/domain names and numbers as-is.`,
    'Output ONLY the JSON object.',
  ].join('\n');
}

export const GAP_SYSTEM = `You make a business become the answer AI gives for ONE specific query. You are given the competitor page(s) AI currently cites for that query. You produce a concrete, page-specific content gap and ready-to-use assets — never vague "write better content" advice. All generated content must be ORIGINAL; analyze the competitor page to see what makes it citable, but NEVER copy its wording. Output ONLY a JSON object.`;

export function buildGapPrompt(input: {
  brand: string;
  brandDomain: string;
  query: string;
  competitorPages: { url: string; text: string }[];
  lang: string;
}): string {
  const pages = input.competitorPages
    .map((p, i) => `--- COMPETITOR PAGE ${i + 1} (${p.url}) ---\n${p.text}`)
    .join('\n\n');

  return [
    `Brand: ${input.brand} (${input.brandDomain})`,
    `Query AI users ask: "${input.query}"`,
    '',
    'These are the competitor pages AI currently cites/recommends for this query:',
    pages || '(no competitor page text available — infer from the query)',
    '',
    'Produce JSON:',
    '{',
    '  "diagnosis": "specifically WHY these pages get cited for this query (topics covered, data assets, structure, authority signals they have)",',
    '  "contentGap": ["the concrete elements the brand must add to win: e.g. a temperature/wattage spec table, a sizing calculator, 2-3 sector case studies, an ATEX certification section, FAQ answering these sub-questions — be specific to THIS query"],',
    '  "faq": [{ "q": "real sub-question a buyer asks", "a": "concise original answer the brand can publish" }],',
    '  "jsonLd": "a valid JSON-LD <script type=\\"application/ld+json\\"> FAQPage (or Product/Service) snippet for this content",',
    '  "pageActions": ["concrete, ordered actions to publish on the brand\'s own domain to out-rank the competitor pages for this query"]',
    '}',
    '',
    `LANGUAGE: write EVERY natural-language value (diagnosis, contentGap items, faq q/a, pageActions) entirely in ${langName(input.lang)}. Do NOT mix languages. The "jsonLd" value stays as code (schema.org), and URLs/brand names stay as-is.`,
    'RULES: be specific to this query and these competitor pages. "How much better" = match or exceed them on the extractable signals AI uses (completeness, specificity, structure, authority). ORIGINAL content only — never copy competitor text. Output ONLY the JSON object.',
  ].join('\n');
}
