/**
 * AI provider abstraction — marka-özel 43 madde talimat üretimi.
 *
 * AI_PROVIDER env var:
 *   "qwen" (default) — Alibaba Qwen Max via DashScope (OpenAI-compatible)
 *   "opus"           — Anthropic Claude Opus 4
 *
 * Batching: 3 batch paralel (~14-15 madde/batch).
 * Passed maddeler için prompt'ta kısayol (token tasarrufu).
 * Türkçe enforcement: sistem prompt + retry if CJK detected (Qwen).
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ───────────────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────────────

type ProviderName = "qwen" | "opus";
const PROVIDER: ProviderName =
  (process.env.AI_PROVIDER ?? "qwen").toLowerCase() === "opus"
    ? "opus"
    : "qwen";

// Qwen — QWEN_* env'leri öncelikli (GH7 Audit için ayrı).
// DASHSCOPE_* legacy fallback (diğer sistemler hâlâ kullanıyor).
// Default qwen3.6-max-preview — daha yüksek kalite, hız, Türkçe.
const QWEN_MODEL =
  process.env.QWEN_MODEL ?? process.env.DASHSCOPE_MODEL ?? "qwen3.6-max-preview";
const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL ??
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

// Opus
const OPUS_MODEL = "claude-opus-4-20250514";

// Batch başına upper limit. Qwen Max output cap 8K.
// Opus streaming için 12K (önceki testlerde 4-batch × 12K çalıştı).
const MAX_TOKENS_QWEN = 8000;
const MAX_TOKENS_OPUS = 12000;

// 43 maddeyi 4 batch (~10-12 madde/batch). Her batch 8K output limit altında.
const BATCHES = [
  { label: "AI Crawler + Entity (başlangıç)", indexFrom: 1, indexTo: 11 },
  { label: "Entity (devam) + Structured Data", indexFrom: 12, indexTo: 20 },
  { label: "Content-AI + Query-Match", indexFrom: 21, indexTo: 35 },
  { label: "Authority + AI Platform", indexFrom: 36, indexTo: 43 },
] as const;

// ───────────────────────────────────────────────────────
// Shared types
// ───────────────────────────────────────────────────────

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
    itemIndex: number;
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
  provider: ProviderName;
};

// ───────────────────────────────────────────────────────
// Prompts (shared)
// ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen bir Türk SEO/AEO uzmanısın. Tüm yanıtların akıcı, doğal ve profesyonel Türkçe olmalı. Çeviri hissi vermeyecek doğal Türkçe kullan. Teknik terimler için gerektiğinde İngilizce orijinalini parantez içinde belirt (örn: "yapılandırılmış veri (structured data)").

Görevin: Türkçe bir web sitesinin AI görünürlük denetiminde belirli bir batch'teki maddeler için marka-özel, kapsamlı ve uygulanabilir talimatlar yazmak.

Çıktı formatı strict JSON. Sadece JSON, başka metin, markdown fence, açıklama YASAK:

{
  "items": [
    {
      "code": "madde-kodu",
      "currentState": "Senin sitende mevcut durum — 2-3 cümle, spesifik bulgular",
      "instructions": [
        {
          "step": 1,
          "text": "İlk adım açıklaması (50-100 kelime)",
          "code": "opsiyonel kod bloğu düz metin, tırnaksız"
        }
      ],
      "impactText": "Bu maddeyi yaptığında beklenen etki — 1-2 cümle",
      "expectedGain": "+1-2 puan"
    }
  ]
}

Kurallar (warning/critical maddeler için):
1. Marka-özel talimat — generic yazma, sektör + domain'e göre somut öneri
2. Kod örnekleri eksiksiz, copy-paste edilebilir
3. Her madde 3-5 adım, her adım 50-100 kelime
4. currentState verilen ham veriye dayanan somut bulgu
5. Türkçe doğal, akıcı, profesyonel
6. Boş cümle, tekrar, genelleme, gereksiz İngilizce jargon YASAK

ÖNEMLİ — Passed maddeler için kısayol (token tasarrufu):
- Status "passed" olan maddeler için currentState = "Bu madde siteniz için optimum durumda."
- Instructions boş dizi: []
- impactText = "Geçildi, işlem gerekmez."
- expectedGain = "+0"
- Sadece "warning" ve "critical" maddeler için detaylı talimat üret.

Sana verilen batch'teki MADDELERİN HEPSİ için çıktı üret. Atlama YASAK.`;

function buildUserMessage(
  req: OpusRequest,
  batchItems: OpusRequest["masterItems"],
  batchLabel: string,
): string {
  return [
    `Marka: ${req.brandName}`,
    `Domain: ${req.domain}`,
    `Sektör: ${req.sector || "belirtilmemiş"}`,
    `Lokasyon: ${req.city || "belirtilmemiş"}`,
    "",
    "DataForSEO (özet):",
    JSON.stringify(req.dataForSeoSummary, null, 2).slice(0, 3000),
    "",
    "Perplexity AI mention sonuçları:",
    JSON.stringify(req.perplexityMentions, null, 2).slice(0, 1500),
    "",
    `BU BATCH: ${batchLabel} — ${batchItems.length} madde.`,
    "",
    "MADDELER:",
    ...batchItems.map(
      (m, i) =>
        `\n${String(i + 1).padStart(2, "0")}. ${m.code} — ${m.title}\n   Durum: ${m.currentStatus}\n   Açıklama: ${m.descriptionStatic.slice(0, 120)}\n   Raw: ${JSON.stringify(m.rawMetrics).slice(0, 150)}`,
    ),
    "",
    "Sadece JSON döndür, Türkçe yaz.",
  ].join("\n");
}

function cleanJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// CJK karakter tespiti — Qwen bazen Çince output verirse retry için
const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
function containsCJK(text: string): boolean {
  return CJK_RE.test(text);
}

// ───────────────────────────────────────────────────────
// Pricing
// ───────────────────────────────────────────────────────

// Qwen pricing (USD per 1M tokens).
// qwen3.6-plus: $0.50 in / $3.00 out
// qwen3.6-max-preview: $1.30 in / $7.80 out
const QWEN_PRICING: Record<string, { input: number; output: number }> = {
  "qwen3.6-plus": { input: 0.5, output: 3.0 },
  "qwen3.6-max-preview": { input: 1.3, output: 7.8 },
  "qwen-plus": { input: 0.4, output: 1.2 }, // legacy fallback
  "qwen-max": { input: 2.4, output: 9.6 }, // legacy fallback
};

function calculateCost(usage: OpusUsage, provider: ProviderName): number {
  if (provider === "qwen") {
    const p = QWEN_PRICING[QWEN_MODEL] ?? QWEN_PRICING["qwen3.6-max-preview"];
    return (usage.input_tokens / 1e6) * p.input + (usage.output_tokens / 1e6) * p.output;
  }
  // Opus
  return (
    (usage.input_tokens / 1e6) * 15 +
    (usage.output_tokens / 1e6) * 75 +
    ((usage.cache_creation_input_tokens ?? 0) / 1e6) * 18.75 +
    ((usage.cache_read_input_tokens ?? 0) / 1e6) * 1.5
  );
}

// ───────────────────────────────────────────────────────
// Opus client (preserved — AI_PROVIDER=opus ile aktifleşir)
// ───────────────────────────────────────────────────────

function opusClient(): Anthropic {
  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY env missing");
  return new Anthropic({ apiKey });
}

async function generateBatchOpus(
  req: OpusRequest,
  items: OpusRequest["masterItems"],
  label: string,
): Promise<{ items: OpusInstructionItem[]; usage: OpusUsage }> {
  const userMessage = buildUserMessage(req, items, label);

  const stream = opusClient().messages.stream({
    model: OPUS_MODEL,
    max_tokens: MAX_TOKENS_OPUS,
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
  if (!textBlock) throw new Error(`Opus "${label}" — empty text block`);

  const cleaned = cleanJsonFences(textBlock.text);
  const parsed = JSON.parse(cleaned) as { items?: OpusInstructionItem[] };
  if (!parsed.items) throw new Error(`Opus "${label}" — items[] missing`);

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

// ───────────────────────────────────────────────────────
// Qwen client (default)
// ───────────────────────────────────────────────────────

function qwenClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("QWEN_API_KEY / DASHSCOPE_API_KEY env missing");
  return new OpenAI({
    apiKey,
    baseURL: QWEN_BASE_URL,
  });
}

async function generateBatchQwen(
  req: OpusRequest,
  items: OpusRequest["masterItems"],
  label: string,
  retryCount = 0,
): Promise<{ items: OpusInstructionItem[]; usage: OpusUsage }> {
  const userMessage = buildUserMessage(req, items, label);

  const response = await qwenClient().chat.completions.create({
    model: QWEN_MODEL,
    max_tokens: MAX_TOKENS_QWEN,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });

  const text = response.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error(`Qwen "${label}" — empty response`);

  // Türkçe doğrulama — CJK karakter varsa retry (max 1 kere)
  if (containsCJK(text) && retryCount === 0) {
    console.warn(`[qwen/batch "${label}"] CJK detected, retrying...`);
    return generateBatchQwen(req, items, label, retryCount + 1);
  }

  const cleaned = cleanJsonFences(text);
  let parsed: { items?: OpusInstructionItem[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Qwen "${label}" JSON parse failed: ${err instanceof Error ? err.message : String(err)}. First 300: ${cleaned.slice(0, 300)}`,
    );
  }
  if (!parsed.items) throw new Error(`Qwen "${label}" — items[] missing`);

  return {
    items: parsed.items,
    usage: {
      input_tokens: response.usage?.prompt_tokens ?? 0,
      output_tokens: response.usage?.completion_tokens ?? 0,
    },
  };
}

// ───────────────────────────────────────────────────────
// Dispatcher + batching
// ───────────────────────────────────────────────────────

async function generateBatch(
  req: OpusRequest,
  items: OpusRequest["masterItems"],
  label: string,
): Promise<{ items: OpusInstructionItem[]; usage: OpusUsage }> {
  if (PROVIDER === "opus") return generateBatchOpus(req, items, label);
  return generateBatchQwen(req, items, label);
}

export async function generateAuditInstructions(
  req: OpusRequest,
): Promise<OpusResult> {
  const batched = BATCHES.map((batch) => ({
    batch,
    items: req.masterItems.filter(
      (m) => m.itemIndex >= batch.indexFrom && m.itemIndex <= batch.indexTo,
    ),
  })).filter((b) => b.items.length > 0);

  const results = await Promise.allSettled(
    batched.map(({ batch, items }) => generateBatch(req, items, batch.label)),
  );

  const allItems: OpusInstructionItem[] = [];
  const failedBatches: Array<{ label: string; error: string }> = [];
  let totalUsage: OpusUsage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
  };

  results.forEach((res, idx) => {
    const label = batched[idx].batch.label;
    if (res.status === "fulfilled") {
      allItems.push(...res.value.items);
      totalUsage = {
        input_tokens: totalUsage.input_tokens + res.value.usage.input_tokens,
        output_tokens:
          totalUsage.output_tokens + res.value.usage.output_tokens,
        cache_creation_input_tokens:
          (totalUsage.cache_creation_input_tokens ?? 0) +
          (res.value.usage.cache_creation_input_tokens ?? 0),
        cache_read_input_tokens:
          (totalUsage.cache_read_input_tokens ?? 0) +
          (res.value.usage.cache_read_input_tokens ?? 0),
      };
    } else {
      const msg =
        res.reason instanceof Error ? res.reason.message : String(res.reason);
      failedBatches.push({ label, error: msg });
      console.error(`[${PROVIDER}/batch "${label}"] failed:`, msg);
    }
  });

  return {
    items: allItems,
    usage: totalUsage,
    costUsd: calculateCost(totalUsage, PROVIDER),
    failedBatches,
    provider: PROVIDER,
  };
}

export function currentProvider(): ProviderName {
  return PROVIDER;
}
