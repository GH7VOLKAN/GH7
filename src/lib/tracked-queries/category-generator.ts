/**
 * Kategori sorgu + funnel üretici — Brief N v4 Aşama 5.
 *
 * Qwen ile 10 KATEGORİ HAKİMİYETİ sorgusu üretir. Her sorgu için 3-adım
 * funnel: step1 (geniş kategori + ülke) → step2 (coğrafi daraltma) →
 * step3 (niş özellik).
 *
 * Zorluk dağılımı: 3 kolay (lokasyon+kategori) + 4 orta (bölge+kategori)
 * + 3 zor (ülke+kategori). orderIndex 1-10 kolay→zor.
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

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type CategoryGeneratorInput = {
  name: string;
  sector?: string | null;
  category?: string | null;
  location?: string | null;
  features?: string[];
  gate: "FIRMA" | "KISI" | "ETICARET" | "YURTDISI";
};

export type GeneratedCategoryFunnel = {
  difficulty: "EASY" | "MEDIUM" | "HARD";
  orderIndex: number;
  step1: string;
  step2: string;
  step3: string;
  rationale: string;
};

export type CategoryGenerationResult = {
  queries: GeneratedCategoryFunnel[];
  usage: { input_tokens: number; output_tokens: number };
  costUsd: number;
};

// ─────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen GH7 AI görünürlük platformusun. Markaya özel 10 KATEGORİ HAKİMİYETİ sorgusu üretiyorsun. Her sorgu için 3-adım FUNNEL.

Kategori sorgusu = kullanıcının GENEL kategori için AI'ya sorduğu önerme soruları. Marka adı GEÇMEZ. Funnel yapısıyla 3 adımda daraltma:

FUNNEL YAPISI (her sorgu için):
- Step 1 — Geniş: "{sector} için önerilen {category} Türkiye"
- Step 2 — Coğrafi daraltma: "Ege bölgesinde özellikle neler var?"
- Step 3 — Niş özellik: "Evcil hayvan dostu ve aile için olanlar hangileri?"

DİL:
- "Öner", "önerilen", "öne çıkan", "seçenekler" → doğal
- "En iyi X" DEĞİL (AI cevap vermeyi reddediyor)

ZORLUK DAĞILIMI (tam):
- 3 EASY: lokasyon + kategori (ör. "Edremit bungalov")
- 4 MEDIUM: bölge + kategori (ör. "Ege bölgesi aile dostu bungalov")
- 3 HARD: ülke + kategori (ör. "Türkiye'de bungalov tatili önerileri")

Sıralama: Kolay → Zor (orderIndex 1-10; 1-3 EASY, 4-7 MEDIUM, 8-10 HARD).

ÇIKTI FORMATI — strict JSON, başka metin YOK:
{
  "queries": [
    {
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "orderIndex": 1,
      "step1": "...",
      "step2": "...",
      "step3": "...",
      "rationale": "..."
    },
    ... (tam 10 adet)
  ]
}

rationale: bu sorguyu hangi tip kullanıcı arar, kısa (1 cümle).

YASAK: Marka adı, CJK karakter, "en iyi X", çeviri hissi, 8 kelimeden uzun stepler.`;

function buildUserMessage(input: CategoryGeneratorInput): string {
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
  lines.push(
    "10 KATEGORİ HAKİMİYETİ sorgusu üret. Her sorgu için 3-adım funnel (step1/step2/step3). Zorluk dağılımı: 3 EASY + 4 MEDIUM + 3 HARD. orderIndex 1-10 kolay→zor.",
  );
  return lines.join("\n");
}

function cleanJsonFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function calculateCost(usage: CategoryGenerationResult["usage"]): number {
  const p = QWEN_PRICING[QWEN_MODEL] ?? QWEN_PRICING["qwen3.6-max-preview"];
  return (usage.input_tokens / 1e6) * p.input + (usage.output_tokens / 1e6) * p.output;
}

// ─────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────

export async function generateCategoryQueries(
  input: CategoryGeneratorInput,
): Promise<CategoryGenerationResult> {
  const attempt = async (
    retry = 0,
  ): Promise<{
    queries: GeneratedCategoryFunnel[];
    usage: CategoryGenerationResult["usage"];
  }> => {
    const response = await qwenClient().chat.completions.create({
      model: QWEN_MODEL,
      max_tokens: 3000,
      temperature: 0.5,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(input) },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Qwen category — empty response");

    if (CJK_RE.test(text) && retry === 0) {
      console.warn("[category-generator] CJK detected, retrying…");
      return attempt(retry + 1);
    }

    const cleaned = cleanJsonFences(text);
    let parsed: { queries?: GeneratedCategoryFunnel[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        `Qwen category JSON parse failed: ${err instanceof Error ? err.message : String(err)}. First 300: ${cleaned.slice(0, 300)}`,
      );
    }

    if (!Array.isArray(parsed.queries) || parsed.queries.length === 0) {
      throw new Error("Qwen category — queries[] missing or empty");
    }

    // Normalize + validate
    const queries = parsed.queries
      .slice(0, 10)
      .map((q, i) => ({
        difficulty: (["EASY", "MEDIUM", "HARD"].includes(q.difficulty ?? "")
          ? q.difficulty
          : "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
        orderIndex: Number.isFinite(q.orderIndex) ? Number(q.orderIndex) : i + 1,
        step1: String(q.step1 ?? "").trim(),
        step2: String(q.step2 ?? "").trim(),
        step3: String(q.step3 ?? "").trim(),
        rationale: String(q.rationale ?? "").trim(),
      }))
      .filter((q) => q.step1 && q.step2 && q.step3);

    if (queries.length < 5) {
      throw new Error(
        `Qwen category — yetersiz tam funnel (${queries.length}/10)`,
      );
    }

    return {
      queries,
      usage: {
        input_tokens: response.usage?.prompt_tokens ?? 0,
        output_tokens: response.usage?.completion_tokens ?? 0,
      },
    };
  };

  const { queries, usage } = await attempt();
  return { queries, usage, costUsd: calculateCost(usage) };
}
