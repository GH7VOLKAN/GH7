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
 * ChatGPT via OpenAI Responses API with the web_search tool.
 * Note: gpt-4o-search-preview is a Chat Completions model and does NOT work
 * with the Responses API tools array — use a standard model (gpt-5.x / gpt-4.1)
 * here. Verify the current tool type and search-capable model in your account.
 */
export async function collectOpenAI(
  query: string,
  runId: number,
  qs: QuerySet,
): Promise<EngineResult> {
  const base = {
    engine: 'openai' as const,
    query,
    runId,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.openai.model,
        tools: [{ type: 'web_search' }],
        input: buildPrompt(query),
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    }
    const text: string =
      data?.output_text ??
      (Array.isArray(data?.output)
        ? data.output
            .flatMap((o: any) => (o.content ?? []).map((c: any) => c.text ?? ''))
            .join('\n')
        : '');

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
