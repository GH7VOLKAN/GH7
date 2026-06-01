import { config } from '../config';
import { buildPrompt } from './prompt';
import { extractJson } from '../util/json';
import { findPosition, competitorsOf } from '../util/match';
import { EngineResult, QuerySet, RankedItem, Source } from '../schema/types';

interface ParsedAnswer {
  ranked: RankedItem[];
  sources: Source[];
  reasoning: string;
  notable: string;
}

/**
 * Gemini via generateContent with Google Search grounding.
 * Verify the current model name and grounding tool shape.
 */
export async function collectGemini(
  query: string,
  runId: number,
  qs: QuerySet,
): Promise<EngineResult> {
  const base = {
    engine: 'gemini' as const,
    query,
    runId,
    timestamp: new Date().toISOString(),
  };

  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(query) }] }],
        tools: [{ google_search: {} }],
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    }
    const text: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text ?? '')
        .join('\n') ?? '';

    const parsed = extractJson<ParsedAnswer>(text);
    const ranked = parsed?.ranked ?? [];

    return {
      ...base,
      brandAppears: findPosition(ranked, qs.brand) !== null,
      position: findPosition(ranked, qs.brand),
      ranked,
      competitors: competitorsOf(ranked, qs.brand),
      sources: parsed?.sources ?? [],
      reasoning: parsed?.reasoning ?? '',
      notable: parsed?.notable ?? '',
      raw: data,
    };
  } catch (e: any) {
    return {
      ...base,
      brandAppears: false,
      position: null,
      ranked: [],
      competitors: [],
      sources: [],
      reasoning: '',
      notable: '',
      raw: null,
      error: String(e?.message ?? e),
    };
  }
}
