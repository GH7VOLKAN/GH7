/**
 * Analyze pipeline — deep context → query gen → fanout → extraction → (self-heal) → merge.
 */

import { fetchDeepContext } from "./deep-context";
import { generateQueries } from "./context-query-gen";
import { fanoutQueries } from "./ai-fanout";
import { extractMentions } from "./mention-extractor";
import type {
  AIAnswer,
  AnalysisQuery,
  AnalyzeInput,
  AnalyzeResult,
  CandidateCompetitor,
  UserBrandMention,
} from "@/lib/analiz/types";

export async function runAnalyzePipeline(
  input: AnalyzeInput,
): Promise<AnalyzeResult> {
  const t0 = Date.now();

  // ─── Aşama 1: Deep context ──────────────────────────
  console.log("[pipeline] Stage 1/5: deep context");
  const profile = await fetchDeepContext(input);
  console.log(
    `[pipeline] Context quality: ${profile.contextQuality}, products: ${profile.products.length}, distinctives: ${profile.distinctives.length}`,
  );

  if (profile.contextQuality === "empty") {
    throw new Error(
      "Firma hakkında yeterli bilgi bulunamadı. Lütfen doğru bir web adresi girdiğinden emin ol.",
    );
  }

  // ─── Aşama 2: İlk sorgu üretimi ─────────────────────
  console.log("[pipeline] Stage 2/5: query generation (first-pass)");
  const firstQueries = await generateQueries(input, profile, "first-pass");
  if (firstQueries.length === 0) {
    throw new Error("Sorgu üretilemedi. Tekrar deneyin.");
  }
  console.log(`[pipeline] Generated ${firstQueries.length} queries`);

  // ─── Aşama 3: İlk fanout ────────────────────────────
  console.log("[pipeline] Stage 3/5: first fanout (5 AI)");
  const firstFanout = await fanoutQueries(
    firstQueries.map((text, i) => ({ id: `q${i + 1}`, text })),
  );

  // ─── Aşama 4: İlk extraction ────────────────────────
  console.log("[pipeline] Stage 4/5: extraction");
  const firstExtraction = await extractMentions(
    firstFanout,
    profile,
    input.domain,
  );

  console.log(
    `[pipeline] First pass: userMentions=${firstExtraction.userMentions.totalMentions}, candidates=${firstExtraction.candidates.length}`,
  );

  let allQueries = enrichQueries(firstFanout, 1, firstExtraction);
  let userMentions = firstExtraction.userMentions;
  let candidates = firstExtraction.candidates;
  let healingAttempted = false;

  // ─── Aşama 5: Self-heal (conditional) ───────────────
  if (firstExtraction.userMentions.totalMentions === 0) {
    console.log("[pipeline] Stage 5/5: self-heal triggered");
    healingAttempted = true;

    try {
      const healQueries = await generateQueries(input, profile, "heal");
      if (healQueries.length > 0) {
        const healFanout = await fanoutQueries(
          healQueries.map((text, i) => ({ id: `q${i + 6}`, text })),
        );
        const healExtraction = await extractMentions(
          healFanout,
          profile,
          input.domain,
        );

        console.log(
          `[pipeline] Heal pass: userMentions=${healExtraction.userMentions.totalMentions}, candidates=${healExtraction.candidates.length}`,
        );

        // Merge
        const healEnriched = enrichQueries(healFanout, 2, healExtraction);
        allQueries = [...allQueries, ...healEnriched];
        userMentions = mergeMentions(userMentions, healExtraction.userMentions);
        candidates = mergeCandidates(candidates, healExtraction.candidates);
      }
    } catch (err) {
      console.warn("[pipeline] Self-heal failed:", err);
    }
  }

  console.log(`[pipeline] Total: ${Date.now() - t0}ms`);

  return {
    firmProfile: profile,
    queries: allQueries,
    userMentions,
    candidateCompetitors: candidates,
    healingAttempted,
    generatedAt: new Date().toISOString(),
    cached: false,
  };
}

// ─── Helpers ────────────────────────────────────────────

function enrichQueries(
  fanout: Awaited<ReturnType<typeof fanoutQueries>>,
  generation: 1 | 2,
  extraction: Awaited<ReturnType<typeof extractMentions>>,
): AnalysisQuery[] {
  return fanout.map((q) => {
    const userProvsForThisQuery = extraction.userMentions.byQuery[q.queryId] ?? [];

    const answers: AIAnswer[] = q.answers.map((a) => {
      const mentionedYou = userProvsForThisQuery.includes(a.provider);
      const mentionedCompetitors = extraction.candidates
        .filter(
          (c) => c.queryIds.includes(q.queryId) && c.providers.includes(a.provider),
        )
        .map((c) => c.name);
      return { ...a, mentionedYou, mentionedCompetitors };
    });

    return {
      id: q.queryId,
      text: q.queryText,
      generation,
      answers,
    };
  });
}

function mergeMentions(
  a: UserBrandMention,
  b: UserBrandMention,
): UserBrandMention {
  return {
    totalMentions: a.totalMentions + b.totalMentions,
    byQuery: { ...a.byQuery, ...b.byQuery },
  };
}

function mergeCandidates(
  a: CandidateCompetitor[],
  b: CandidateCompetitor[],
): CandidateCompetitor[] {
  const map = new Map<string, CandidateCompetitor>();
  for (const c of [...a, ...b]) {
    const key = c.name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.mentionCount += c.mentionCount;
      existing.queryIds = [...new Set([...existing.queryIds, ...c.queryIds])];
      existing.providers = [...new Set([...existing.providers, ...c.providers])];
      if (!existing.url && c.url) existing.url = c.url;
    } else {
      map.set(key, { ...c });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.mentionCount - a.mentionCount);
}
