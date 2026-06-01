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
 * Claude via Anthropic Messages API with the web_search tool.
 * Verify the current web_search tool version string and model name.
 */
export async function collectAnthropic(
  query: string,
  runId: number,
  qs: QuerySet,
): Promise<EngineResult> {
  const base = {
    engine: 'anthropic' as const,
    query,
    runId,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: config.anthropic.model,
        max_tokens: 4096,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: buildPrompt(query) }],
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    }
    const text: string = Array.isArray(data?.content)
      ? data.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('\n')
      : '';

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
