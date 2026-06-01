import { config } from '../config';
import { EngineResult, QuerySet, RankedItem, Source } from '../schema/types';

/**
 * Google via DataForSEO SERP API (live/advanced).
 * Extracts organic results (ranked list) + the AI Overview block and its
 * source references. Uses the brand DOMAIN for matching, not the brand name.
 *
 * Note: this uses the synchronous "live" endpoint for simplicity ($2/1k).
 * For batch/scheduled runs switch to the cheaper async Standard queue
 * (/v3/serp/google/organic/task_post + task_get, ~$0.60/1k).
 */
export async function collectGoogleSerp(
  query: string,
  runId: number,
  qs: QuerySet,
): Promise<EngineResult> {
  const base = {
    engine: 'google_serp' as const,
    query,
    runId,
    timestamp: new Date().toISOString(),
  };

  try {
    const auth = Buffer.from(
      `${config.dataforseo.login}:${config.dataforseo.password}`,
    ).toString('base64');

    const res = await fetch(
      'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keyword: query,
            location_code: config.dataforseo.locationCode,
            language_code: config.dataforseo.languageCode,
            device: 'desktop',
          },
        ]),
      },
    );

    const data: any = await res.json();
    const task = data?.tasks?.[0];
    // DataForSEO returns HTTP 200 even on per-task failures; surface those.
    if (task && task.status_code !== 20000) {
      throw new Error(`DataForSEO task ${task.status_code}: ${task.status_message}`);
    }
    const items: any[] = task?.result?.[0]?.items ?? [];

    const organic = items.filter((i) => i.type === 'organic');
    const ranked: RankedItem[] = organic.map((i) => ({
      name: i.domain ?? i.title ?? '',
      rank: i.rank_group ?? i.rank_absolute ?? 0,
    }));

    const aio = items.find((i) => i.type === 'ai_overview');
    const aioRefs: Source[] = (aio?.references ?? aio?.items ?? [])
      .map((r: any) => ({ title: r.title ?? r.domain ?? '', url: r.url ?? '' }))
      .filter((s: Source) => s.url);

    const brandKey = (qs.brandDomain ?? qs.brand).toLowerCase();
    const matched = ranked.find((r) => r.name.toLowerCase().includes(brandKey));

    return {
      ...base,
      brandAppears: !!matched,
      position: matched?.rank ?? null,
      ranked,
      competitors: ranked
        .filter((r) => !r.name.toLowerCase().includes(brandKey))
        .map((r) => r.name),
      sources: aioRefs,
      reasoning: '',
      notable: aio?.text ?? aio?.markdown ?? '',
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
