// Ported into GH7: env comes from Next.js (process.env), not dotenv.

/**
 * Central config. All secrets come from .env (never hard-code keys).
 *
 * IMPORTANT: model names below are defaults that may be OUTDATED.
 * Verify the current model name for each provider before relying on output,
 * and override via .env if needed.
 */
export const config = {
  dataforseo: {
    login: process.env.DATAFORSEO_LOGIN ?? '',
    password: process.env.DATAFORSEO_PASSWORD ?? '',
    // DataForSEO rejects some location_name strings; location_code is unambiguous.
    // 2792 = Turkey. Override via .env if you target a city/region.
    locationCode: Number(process.env.DATAFORSEO_LOCATION_CODE ?? 2792),
    languageCode: process.env.DATAFORSEO_LANGUAGE ?? 'tr',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-5.5',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? 'gemini-3.5-flash',
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY ?? '',
    model: process.env.PERPLEXITY_MODEL ?? 'sonar',
  },
  /**
   * Reasoning model (Opus-class) used for Stage 0 (intake + query generation)
   * and Stage 2 (gap analysis). Uses the Anthropic key. VERIFY current model name.
   */
  reasoning: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.REASONING_MODEL ?? 'claude-opus-4-7',
  },
  /** How many times to run each query per engine (averages out non-determinism). */
  runsPerQuery: Number(process.env.RUNS_PER_QUERY ?? 3),

  /** Stage 2: how many top-severity queries to do full gap analysis on (cost). */
  stage2: {
    maxQueries: Number(process.env.STAGE2_MAX_QUERIES ?? 5),
  },

  /**
   * COST DIALS — keep the measurement (commodity) layer cheap so budget goes to
   * analysis/content/reporting (the value layer).
   *
   * engines: which engines to run. Default = all five. Narrow via
   * ENGINES=perplexity,google_serp,openai,gemini,anthropic
   */
  engines: (process.env.ENGINES ?? 'perplexity,google_serp,openai,gemini,anthropic')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  /**
   * Rough USD-per-call estimates for the pre-run cost preview ONLY (not billing).
   * Adjust to your real rates. google_serp is high because of AI Overview enrichment.
   */
  costPerCall: {
    google_serp: Number(process.env.COST_GOOGLE ?? 0.02),
    perplexity: Number(process.env.COST_PERPLEXITY ?? 0.006),
    openai: Number(process.env.COST_OPENAI ?? 0.01),
    anthropic: Number(process.env.COST_ANTHROPIC ?? 0.01),
    gemini: Number(process.env.COST_GEMINI ?? 0.005),
  } as Record<string, number>,
};
