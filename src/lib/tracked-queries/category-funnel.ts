/**
 * 3-adım kategori funnel — Brief N v4 Aşama 5.
 *
 * Bir TrackedQuery (CATEGORY) için TEK platformda 3 adım drill yapar:
 *   Step 1 — Geniş kategori sorgusu
 *     bulunduysa → dur, foundAtStep=1 döner
 *     bulunmadıysa → Step 2
 *   Step 2 — Coğrafi daraltma (önceki konuşma contextinde)
 *     bulunduysa → dur, foundAtStep=2
 *     bulunmadıysa → Step 3
 *   Step 3 — Niş özellik daraltma
 *     sonuca göre foundAtStep=3 veya null
 *
 * Provider'ların native conversation API'si farklı — bu modül composite
 * prompt yaklaşımı kullanır: önceki turları `Önceki konuşma:\n...` olarak
 * yeni user mesajının başına ekler. Basit ve tüm provider'larda çalışır.
 * Native multi-turn'e migrate etmek future-work.
 */

import type { AIProvider } from "@/lib/ai/providers/base";
import { extractRank, type RankExtraction } from "./category-rank-extractor";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type FunnelStepResult = {
  step: 1 | 2 | 3;
  query: string;
  response: string;
  extraction: RankExtraction;
  error?: string;
};

export type FunnelResult = {
  platform: string;
  foundAtStep: number | null;
  rank: number | null;
  listLength: number | null;
  extractedBrands: string[];
  steps: FunnelStepResult[];
  conversation: ConversationTurn[];
};

// ─────────────────────────────────────────────────────
// Composite prompt builder
// ─────────────────────────────────────────────────────

function composePrompt(
  conversation: ConversationTurn[],
  newQuery: string,
): string {
  if (conversation.length === 0) return newQuery;

  const history = conversation
    .map((t) => {
      const label = t.role === "user" ? "Kullanıcı" : "Asistan";
      return `${label}: ${t.content.slice(0, 1500)}`;
    })
    .join("\n\n");

  return `Önceki konuşma:\n\n${history}\n\nŞimdi kullanıcı soruyor: ${newQuery}`;
}

// ─────────────────────────────────────────────────────
// Tek adım run
// ─────────────────────────────────────────────────────

async function runStep(
  provider: AIProvider,
  conversation: ConversationTurn[],
  query: string,
  brandName: string,
  step: 1 | 2 | 3,
): Promise<FunnelStepResult> {
  try {
    const composite = composePrompt(conversation, query);
    const response = await provider.sendPrompt(composite);
    if (response.error) {
      return {
        step,
        query,
        response: "",
        extraction: {
          brandMentioned: false,
          rank: null,
          listLength: null,
          extractedBrands: [],
          source: "none",
        },
        error: response.error,
      };
    }
    const extraction = await extractRank(response.content, brandName);
    return { step, query, response: response.content, extraction };
  } catch (err) {
    return {
      step,
      query,
      response: "",
      extraction: {
        brandMentioned: false,
        rank: null,
        listLength: null,
        extractedBrands: [],
        source: "none",
      },
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ─────────────────────────────────────────────────────
// Funnel orkestratörü
// ─────────────────────────────────────────────────────

export type FunnelInput = {
  provider: AIProvider;
  step1Query: string;
  step2Query: string;
  step3Query: string;
  brandName: string;
};

export async function runCategoryFunnel(
  input: FunnelInput,
): Promise<FunnelResult> {
  const { provider, step1Query, step2Query, step3Query, brandName } = input;
  const conversation: ConversationTurn[] = [];
  const steps: FunnelStepResult[] = [];

  // ─ Step 1 ─
  const s1 = await runStep(provider, conversation, step1Query, brandName, 1);
  steps.push(s1);
  conversation.push({ role: "user", content: step1Query });
  conversation.push({ role: "assistant", content: s1.response });

  if (s1.extraction.brandMentioned) {
    return {
      platform: provider.platform,
      foundAtStep: 1,
      rank: s1.extraction.rank,
      listLength: s1.extraction.listLength,
      extractedBrands: s1.extraction.extractedBrands,
      steps,
      conversation,
    };
  }

  // ─ Step 2 ─
  const s2 = await runStep(provider, conversation, step2Query, brandName, 2);
  steps.push(s2);
  conversation.push({ role: "user", content: step2Query });
  conversation.push({ role: "assistant", content: s2.response });

  if (s2.extraction.brandMentioned) {
    return {
      platform: provider.platform,
      foundAtStep: 2,
      rank: s2.extraction.rank,
      listLength: s2.extraction.listLength,
      extractedBrands: [
        ...s1.extraction.extractedBrands,
        ...s2.extraction.extractedBrands,
      ],
      steps,
      conversation,
    };
  }

  // ─ Step 3 ─
  const s3 = await runStep(provider, conversation, step3Query, brandName, 3);
  steps.push(s3);
  conversation.push({ role: "user", content: step3Query });
  conversation.push({ role: "assistant", content: s3.response });

  const allBrands = [
    ...s1.extraction.extractedBrands,
    ...s2.extraction.extractedBrands,
    ...s3.extraction.extractedBrands,
  ];

  if (s3.extraction.brandMentioned) {
    return {
      platform: provider.platform,
      foundAtStep: 3,
      rank: s3.extraction.rank,
      listLength: s3.extraction.listLength,
      extractedBrands: allBrands,
      steps,
      conversation,
    };
  }

  // Hiçbir adımda bulunamadı
  return {
    platform: provider.platform,
    foundAtStep: null,
    rank: null,
    listLength: null,
    extractedBrands: allBrands,
    steps,
    conversation,
  };
}
