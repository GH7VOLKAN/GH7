/**
 * Opus pipeline — marka-özel 43 madde talimat üretimi (Brief G Aşama 3 + Batching).
 *
 * Strateji:
 * - 43 madde 4 batch'e bölünür (~10-15 madde/batch).
 * - 4 batch **paralel** (Promise.all) → toplam süre ~60-90s (Vercel 5dk altı).
 * - Her batch küçük: max_tokens 4000, streaming gerekmez.
 * - Sistem promptu ephemeral cache — ikinci batch'ten itibaren cache hit
 *   (parallel olduğu için değil, ama subsequent audit'ler için).
 * - Passed maddeler için prompt'ta kısayol → token tasarrufu.
 * - Bir batch fail olursa sadece o batch'in maddeleri default kalır,
 *   diğer 3 batch'in output'u yine yazılır.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-20250514";
// Batch başına ~10-15 madde. Detaylı kod bloğu içeren maddelerde
// item başı 800-1200 token gelebiliyor → 12000 güvenli sınır.
// 8000 yetmedi (bazı batch'ler ortasından kesildi).
const MAX_TOKENS_PER_BATCH = 12000;

// 43 madde 4 batch'e: kategoriye göre mantıklı bölüm.
// indexFrom/To itemIndex (1-based) inclusive.
const BATCHES = [
  { label: "AI Crawler + Entity (başlangıç)", indexFrom: 1, indexTo: 11 },
  { label: "Entity (devam) + Structured Data", indexFrom: 12, indexTo: 20 },
  { label: "Content-AI + Query-Match", indexFrom: 21, indexTo: 35 },
  { label: "Authority + AI Platform", indexFrom: 36, indexTo: 43 },
] as const;

function client(): Anthropic {
  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY env missing");
  }
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Sen GH7 AUDIT AI uzmanısın. Görevin: Türkçe bir web sitesinin AI görünürlük denetiminde belirli bir batch'teki maddeler için marka-özel, kapsamlı ve uygulanabilir talimatlar yazmak.

Çıktı formatı strict JSON. Sadece JSON, başka metin YASAK:

{
  "items": [
    {
      "code": "madde-kodu",
      "currentState": "Senin sitende mevcut durum — 2-3 cümle, spesifik bulgular",
      "instructions": [
        {
          "step": 1,
          "text": "İlk adım açıklaması (50-100 kelime)",
          "code": "opsiyonel kod bloğu düz metin"
        }
      ],
      "impactText": "Bu maddeyi yaptığında beklenen etki — 1-2 cümle",
      "expectedGain": "+1-2 puan"
    }
  ]
}

Kurallar (warning/critical maddeler için):
1. Marka-özel talimat (sektör + domain bazlı, generic değil)
2. Kod örnekleri eksiksiz, copy-paste edilebilir
3. Her madde 3-5 adım, her adım 50-100 kelime
4. currentState spesifik bulguya dayanmalı
5. Türkçe doğal, samimi ama profesyonel
6. Boş cümle, tekrar, genelleme YASAK

ÖNEMLİ — Passed maddeler için kısayol (token tasarrufu):
- Status "passed" olan maddeler için currentState = "Bu madde siteniz için optimum durumda."
- Instructions boş dizi: []
- impactText = "Geçildi, işlem gerekmez."
- expectedGain = "+0"
- Sadece "warning" ve "critical" maddeler için detaylı talimat üret.

Sana verilen batch'teki MADDELERİN HEPSİ için çıktı üret (atlama YASAK).`;

type OpusRequest = {
  brandName: string;
  domain: string;
  sector: string | null;
  city: string | null;

  dataForSeoSummary: unknown;
  perplexityMentions: unknown;

  masterItems: Array<{
    code: string;
    title: string;
    descriptionStatic: string;
    currentStatus: string;
    rawMetrics: unknown;
    itemIndex: number; // batch filtresi için
  }>;
};

export type OpusInstructionItem = {
  code: string;
  currentState: string;
  instructions: Array<{ step: number; text: string; code?: string }>;
  impactText: string;
  expectedGain: string;
};

export type OpusUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
};

export type OpusResult = {
  items: OpusInstructionItem[];
  usage: OpusUsage;
  costUsd: number;
  failedBatches: Array<{ label: string; error: string }>;
};

function cleanJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// Opus pricing
const PRICE_INPUT_PER_M = 15;
const PRICE_OUTPUT_PER_M = 75;
const PRICE_CACHE_WRITE_PER_M = 18.75;
const PRICE_CACHE_READ_PER_M = 1.5;

function calculateCost(usage: OpusUsage): number {
  const inputCost = (usage.input_tokens / 1_000_000) * PRICE_INPUT_PER_M;
  const outputCost = (usage.output_tokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  const cacheWriteCost =
    ((usage.cache_creation_input_tokens || 0) / 1_000_000) *
    PRICE_CACHE_WRITE_PER_M;
  const cacheReadCost =
    ((usage.cache_read_input_tokens || 0) / 1_000_000) * PRICE_CACHE_READ_PER_M;
  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

type BatchOutput = {
  items: OpusInstructionItem[];
  usage: OpusUsage;
};

async function generateBatch(
  req: OpusRequest,
  batchItems: OpusRequest["masterItems"],
  batchLabel: string,
): Promise<BatchOutput> {
  const userMessage = [
    `Marka: ${req.brandName}`,
    `Domain: ${req.domain}`,
    `Sektör: ${req.sector || "belirtilmemiş"}`,
    `Lokasyon: ${req.city || "belirtilmemiş"}`,
    "",
    "DataForSEO (özet):",
    JSON.stringify(req.dataForSeoSummary, null, 2).slice(0, 8000),
    "",
    "Perplexity AI mention sonuçları:",
    JSON.stringify(req.perplexityMentions, null, 2).slice(0, 3000),
    "",
    `BU BATCH: ${batchLabel} — ${batchItems.length} madde.`,
    "",
    "MADDELER:",
    ...batchItems.map(
      (m, i) =>
        `\n${String(i + 1).padStart(2, "0")}. ${m.code} — ${m.title}\n   Durum: ${m.currentStatus}\n   Açıklama: ${m.descriptionStatic.slice(0, 200)}...\n   Raw: ${JSON.stringify(m.rawMetrics).slice(0, 250)}`,
    ),
    "",
    "Sadece JSON döndür. Başka metin YASAK.",
  ].join("\n");

  // SDK max_tokens > ~8000 için streaming zorunlu kılıyor. Detaylı kod
  // içeren maddelerde 12000 gerekebiliyor → streaming + finalMessage.
  const stream = client().messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS_PER_BATCH,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });
  const response = await stream.finalMessage();

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    throw new Error("Opus response missing text block");
  }

  const cleaned = cleanJsonFences(textBlock.text);

  let parsed: { items?: OpusInstructionItem[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Opus JSON parse failed (batch "${batchLabel}"): ${err instanceof Error ? err.message : String(err)}. First 300 chars: ${cleaned.slice(0, 300)}`,
    );
  }

  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error(`Opus batch "${batchLabel}" output missing items[]`);
  }

  const usageRaw = response.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };

  return {
    items: parsed.items,
    usage: {
      input_tokens: usageRaw.input_tokens,
      output_tokens: usageRaw.output_tokens,
      cache_creation_input_tokens: usageRaw.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: usageRaw.cache_read_input_tokens ?? 0,
    },
  };
}

export async function generateAuditInstructions(
  req: OpusRequest,
): Promise<OpusResult> {
  // 43 maddeyi BATCHES'e göre ayır
  const batchedRequests = BATCHES.map((batch) => {
    const items = req.masterItems.filter(
      (m) => m.itemIndex >= batch.indexFrom && m.itemIndex <= batch.indexTo,
    );
    return { batch, items };
  }).filter((b) => b.items.length > 0);

  // Paralel Opus çağrıları
  const results = await Promise.allSettled(
    batchedRequests.map(({ batch, items }) =>
      generateBatch(req, items, batch.label),
    ),
  );

  // Merge
  const allItems: OpusInstructionItem[] = [];
  const failedBatches: Array<{ label: string; error: string }> = [];
  let totalUsage: OpusUsage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };

  results.forEach((res, idx) => {
    const batchLabel = batchedRequests[idx].batch.label;
    if (res.status === "fulfilled") {
      allItems.push(...res.value.items);
      totalUsage = {
        input_tokens: totalUsage.input_tokens + res.value.usage.input_tokens,
        output_tokens:
          totalUsage.output_tokens + res.value.usage.output_tokens,
        cache_creation_input_tokens:
          (totalUsage.cache_creation_input_tokens || 0) +
          (res.value.usage.cache_creation_input_tokens || 0),
        cache_read_input_tokens:
          (totalUsage.cache_read_input_tokens || 0) +
          (res.value.usage.cache_read_input_tokens || 0),
      };
    } else {
      const msg =
        res.reason instanceof Error
          ? res.reason.message
          : String(res.reason);
      failedBatches.push({ label: batchLabel, error: msg });
      console.error(`[opus/batch "${batchLabel}"] failed:`, msg);
    }
  });

  return {
    items: allItems,
    usage: totalUsage,
    costUsd: calculateCost(totalUsage),
    failedBatches,
  };
}
