/**
 * Niş sorgu üretici — Brief N v4 Aşama 4.
 *
 * Qwen ile 10 NICHE BİLİNİRLİK sorgusu üretir. Kullanıcı onboarding'de
 * onaylar (Aşama 7). Sorgular DEĞİŞMEZ — metrik tutarlılığı için.
 *
 * Kurallar (brief):
 *   - Spesifik, kullanıcı-özel sorular (kim arar, nasıl arar)
 *   - Lokasyon + kategori + özellik kombinasyonu
 *   - 6-12 kelime, Türkçe doğal konuşma
 *   - Marka adı içermeyen sorgular
 *   - "En iyi X" genel sorular YASAK (bunlar kategori sorguya gider)
 */

import OpenAI from "openai";

const QWEN_MODEL =
  process.env.QWEN_MODEL ?? process.env.DASHSCOPE_MODEL ?? "qwen3.6-max-preview";
const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL ??
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

const QWEN_PRICING: Record<string, { input: number; output: number }> = {
  "qwen3.6-plus": { input: 0.5, output: 3.0 },
  "qwen3.6-max-preview": { input: 1.3, output: 7.8 },
  "qwen-plus": { input: 0.4, output: 1.2 },
  "qwen-max": { input: 2.4, output: 9.6 },
};

function qwenClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("QWEN_API_KEY / DASHSCOPE_API_KEY env missing");
  return new OpenAI({ apiKey, baseURL: QWEN_BASE_URL });
}

const CJK_RE = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/;
const containsCJK = (s: string) => CJK_RE.test(s);

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type NicheGeneratorInput = {
  name: string;
  sector?: string | null;
  category?: string | null;
  location?: string | null;
  features?: string[];
  gate: "FIRMA" | "KISI" | "ETICARET" | "YURTDISI";
};

export type GeneratedNicheQuery = {
  query: string;
  rationale: string;
};

export type NicheGenerationResult = {
  queries: GeneratedNicheQuery[];
  usage: { input_tokens: number; output_tokens: number };
  costUsd: number;
};

// ─────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen GH7 AI görünürlük platformusun. Markaya özel NICHE BİLİNİRLİK sorguları üretiyorsun.

Niş sorgu = gerçek kullanıcının Google/ChatGPT/Claude'da yazdığı SPESİFİK bir soru. Kullanıcı belirli bir şey arıyor: lokasyon + kategori + özellik kombinasyonu.

KURALLAR:
1. Spesifik, kullanıcı-özel sorular ("Edremit Körfezi'nde evcil hayvanla kalabileceğim bungalov")
2. Lokasyon + kategori + özellik kombinasyonu
3. 6-12 kelime
4. Türkçe doğal konuşma — çeviri hissi verme
5. Her sorgu farklı bir "kim arar, nasıl arar" senaryosu

KESİN YASAKLAR:
- Marka adını içeren sorgu YASAK
- "En iyi X" genel sorular YASAK (bunlar kategori sorgu alanı)
- Çok geniş sorgular ("Türkiye'de tatil") YASAK
- Çeviri hissi veren cümleler YASAK
- Türkçe dışı karakter YASAK

ÇIKTI FORMATI — strict JSON, başka metin YOK:
{
  "queries": [
    { "query": "...", "rationale": "..." },
    ... (tam 10 adet)
  ]
}

rationale: bu sorguyu hangi tip kullanıcı arar, kısa (1 cümle).`;

function buildUserMessage(input: NicheGeneratorInput): string {
  const lines: string[] = [];
  lines.push(`MARKA: ${input.name}`);
  if (input.sector) lines.push(`Sektör: ${input.sector}`);
  if (input.category) lines.push(`Kategori: ${input.category}`);
  if (input.location) lines.push(`Coğrafya: ${input.location}`);
  if (input.features && input.features.length > 0) {
    lines.push(`Özellikler: ${input.features.join(", ")}`);
  }
  lines.push(`Kapı: ${input.gate}`);
  lines.push("");
  lines.push("Bu markaya özel 10 NİŞ BİLİNİRLİK sorgusu üret.");
  return lines.join("\n");
}

function calculateCost(usage: NicheGenerationResult["usage"]): number {
  const p = QWEN_PRICING[QWEN_MODEL] ?? QWEN_PRICING["qwen3.6-max-preview"];
  return (usage.input_tokens / 1e6) * p.input + (usage.output_tokens / 1e6) * p.output;
}

function cleanJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

// ─────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────

export async function generateNicheQueries(
  input: NicheGeneratorInput,
): Promise<NicheGenerationResult> {
  const attempt = async (
    retry = 0,
  ): Promise<{ queries: GeneratedNicheQuery[]; usage: NicheGenerationResult["usage"] }> => {
    const response = await qwenClient().chat.completions.create({
      model: QWEN_MODEL,
      max_tokens: 2000,
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(input) },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Qwen niche — empty response");

    if (containsCJK(text) && retry === 0) {
      console.warn("[niche-generator] CJK detected, retrying…");
      return attempt(retry + 1);
    }

    const cleaned = cleanJsonFences(text);
    let parsed: { queries?: GeneratedNicheQuery[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        `Qwen niche JSON parse failed: ${err instanceof Error ? err.message : String(err)}. First 300: ${cleaned.slice(0, 300)}`,
      );
    }

    if (!Array.isArray(parsed.queries) || parsed.queries.length === 0) {
      throw new Error("Qwen niche — queries[] missing or empty");
    }

    // İlk 10'u al; fazla dönerse kırp
    const queries = parsed.queries.slice(0, 10).map((q) => ({
      query: String(q.query ?? "").trim(),
      rationale: String(q.rationale ?? "").trim(),
    }));

    const filtered = queries.filter((q) => q.query.length >= 5);
    if (filtered.length < 5) {
      throw new Error(
        `Qwen niche — yetersiz geçerli sorgu (${filtered.length}/10)`,
      );
    }

    return {
      queries: filtered,
      usage: {
        input_tokens: response.usage?.prompt_tokens ?? 0,
        output_tokens: response.usage?.completion_tokens ?? 0,
      },
    };
  };

  const { queries, usage } = await attempt();
  return { queries, usage, costUsd: calculateCost(usage) };
}
