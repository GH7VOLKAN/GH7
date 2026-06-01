/**
 * The single prompt used for every chat engine. The model must search the web
 * (grounding is mandatory) and rank businesses as it would for a real consumer,
 * then return ONLY the structured JSON — no prose narrative. The "answer in
 * prose first" framing is deliberately avoided: verbose models (e.g. Claude)
 * exhaust their token budget on prose and never emit the JSON.
 */
export function buildPrompt(query: string): string {
  return [
    'You are auditing AI search visibility. Search the web for this query the way you would to recommend businesses to a real consumer.',
    `User query: "${query}"`,
    '',
    'Do NOT write a prose answer. Respond with ONLY a JSON object (no markdown fences, no text before or after) in EXACTLY this shape:',
    '{',
    '  "ranked": [{ "name": "Business Name", "rank": 1 }],',
    '  "sources": [{ "title": "Source title", "url": "https://..." }],',
    '  "reasoning": "Why you ranked them in this order.",',
    '  "notable": "Anything notable a competitor should know."',
    '}',
    '',
    'Rank every business you would recommend, best first (rank 1 = top recommendation).',
    'Use the real web sources you consulted. If you would recommend no specific businesses, return an empty "ranked" array.',
  ].join('\n');
}
