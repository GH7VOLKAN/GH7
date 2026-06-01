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
 * Perplexity via the Sonar chat/completions API. Perplexity browses by
 * default and returns citations; we use them as a fallback for sources.
 */
export async function collectPerplexity(
  query: string,
  runId: number,
  qs: QuerySet,
): Promise<EngineResult> {
  const base = {
    engine: 'perplexity' as const,
    query,
    runId,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.perplexity.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.perplexity.model,
        messages: [{ role: 'user', content: buildPrompt(query) }],
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    }
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    const citations: string[] = data?.citations ?? [];

    const parsed = extractJson<ParsedAnswer>(text);
    const ranked = parsed?.ranked ?? [];

    const sources: Source[] =
      parsed?.sources && parsed.sources.length > 0
        ? parsed.sources
        : citations.map((u) => ({ title: u, url: u }));

    return {
      ...base,
      brandAppears: findPosition(ranked, qs.brand) !== null,
      position: findPosition(ranked, qs.brand),
      ranked,
      competitors: competitorsOf(ranked, qs.brand),
      sources,
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
