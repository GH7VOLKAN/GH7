/**
 * Opus pipeline — marka-özel 43 madde talimat üretimi (Brief G Aşama 3).
 *
 * - Sistem promptu ephemeral cache_control ile cache'lenir (%90 maliyet düşümü)
 * - Tek çağrıda 43 madde için JSON çıktı üretir
 * - Marka domain/sektör/lokasyon + DataForSEO özet + Perplexity mention +
 *   evaluator status'u Opus'a verilir
 *
 * Çıktı: { items: [{ code, currentState, instructions[], impactText, expectedGain }] }
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-20250514";

function client(): Anthropic {
  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY env missing");
  }
  return new Anthropic({ apiKey });
}

// Sistem promptu statik → her audit için aynı → prompt cache ideal.
const SYSTEM_PROMPT = `Sen GH7 AUDIT AI uzmanısın. Görevin: Türkçe bir web sitesinin AI görünürlük denetimini marka-özel, kapsamlı ve uygulanabilir talimatlar halinde yazmak.

Çıktı formatı strict JSON. Sadece JSON, başka metin YASAK:

{
  "items": [
    {
      "code": "ai-crawler-robots",
      "currentState": "Senin sitende mevcut durum — 2-3 cümle, spesifik bulgular",
      "instructions": [
        {
          "step": 1,
          "text": "İlk adım açıklaması (50-100 kelime)",
          "code": "optional kod bloğu tırnaksız düz metin"
        }
      ],
      "impactText": "Bu maddeyi yaptığında beklenen etki — 1-2 cümle",
      "expectedGain": "+1-2 puan"
    }
  ]
}

Kurallar:
1. Her talimat MARKAYA ÖZEL olmalı — generic 'schema ekle' değil, markanın sektörüne uygun schema type belirtmeli, örnek kod markanın adı/domainiyle yazılmalı
2. Kod örnekleri EKSIKSIZ, COPY-PASTE edilebilir olmalı
3. Her madde için 3-5 adım, her adım 50-100 kelime
4. 'currentState' spesifik bulguya dayanmalı — ham veriden çıkarılmış somut tespit
5. Türkçe doğal ve akıcı, samimi ama profesyonel
6. Boş cümle, tekrar, genellemeden kaçın
7. 43 maddenin tümü için çıktı üret. Atlama YASAK.`;

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
  }>;
};

export type OpusInstructionItem = {
  code: string;
  currentState: string;
  instructions: Array<{ step: number; text: string; code?: string }>;
  impactText: string;
  expectedGain: string;
};

export type OpusResult = {
  items: OpusInstructionItem[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  costUsd: number;
};

function cleanJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// Opus pricing (2024 fiyatlandırma — değişirse burayı güncelle)
const PRICE_INPUT_PER_M = 15; // $/1M input tokens
const PRICE_OUTPUT_PER_M = 75;
const PRICE_CACHE_WRITE_PER_M = 18.75; // %25 daha pahalı
const PRICE_CACHE_READ_PER_M = 1.5; // %90 daha ucuz

function calculateCost(usage: OpusResult["usage"]): number {
  const inputCost = (usage.input_tokens / 1_000_000) * PRICE_INPUT_PER_M;
  const outputCost = (usage.output_tokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  const cacheWriteCost =
    ((usage.cache_creation_input_tokens || 0) / 1_000_000) *
    PRICE_CACHE_WRITE_PER_M;
  const cacheReadCost =
    ((usage.cache_read_input_tokens || 0) / 1_000_000) * PRICE_CACHE_READ_PER_M;
  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

export async function generateAuditInstructions(
  req: OpusRequest,
): Promise<OpusResult> {
  const userMessage = [
    `Marka: ${req.brandName}`,
    `Domain: ${req.domain}`,
    `Sektör: ${req.sector || "belirtilmemiş"}`,
    `Lokasyon: ${req.city || "belirtilmemiş"}`,
    "",
    "DataForSEO ham verisi (özet):",
    JSON.stringify(req.dataForSeoSummary, null, 2).slice(0, 15000),
    "",
    "Perplexity AI mention sonuçları:",
    JSON.stringify(req.perplexityMentions, null, 2).slice(0, 5000),
    "",
    "43 madde değerlendirilecek. Her madde için yukarıdaki veriye bakarak marka-özel talimat yaz.",
    "",
    "MADDELER:",
    ...req.masterItems.map(
      (m, i) =>
        `\n${String(i + 1).padStart(2, "0")}. ${m.code} — ${m.title}\n   Durum (evaluator sonucu): ${m.currentStatus}\n   Açıklama: ${m.descriptionStatic.slice(0, 200)}...\n   Raw metric: ${JSON.stringify(m.rawMetrics).slice(0, 300)}`,
    ),
    "",
    "Sadece JSON döndür. Başka metin, açıklama, ön söz YASAK.",
  ].join("\n");

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 16_000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userMessage }],
  });

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
      `Opus JSON parse failed: ${err instanceof Error ? err.message : String(err)}. First 500 chars: ${cleaned.slice(0, 500)}`,
    );
  }

  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error("Opus output missing items[] array");
  }

  const usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_creation_input_tokens:
      (response.usage as { cache_creation_input_tokens?: number })
        .cache_creation_input_tokens ?? 0,
    cache_read_input_tokens:
      (response.usage as { cache_read_input_tokens?: number })
        .cache_read_input_tokens ?? 0,
  };

  return {
    items: parsed.items,
    usage,
    costUsd: calculateCost(usage),
  };
}
