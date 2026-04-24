/**
 * Kategori funnel response parser — Brief N v4 Aşama 5.
 *
 * AI cevabından şunları çıkarır:
 *  - brandMentioned: marka adı (veya normalize varyantı) geçiyor mu
 *  - rank: markanın liste içindeki sırası (varsa)
 *  - listLength: liste toplam uzunluğu
 *  - extractedBrands: cevapta geçen tüm marka/firma adları (rakip tespiti)
 *
 * İlk aşama: hızlı regex — numaralı/bullet liste + normalize match.
 * İkinci aşama (opsiyonel fallback): Qwen meta-prompt.
 *
 * Maliyet avantajı için regex önce dener; kesin sonuç varsa LLM çağırmaz.
 */

import OpenAI from "openai";
import { normalizeTurkish } from "@/lib/ai/analyzer";

const QWEN_MODEL =
  process.env.QWEN_MODEL ?? process.env.DASHSCOPE_MODEL ?? "qwen3.6-max-preview";
const QWEN_BASE_URL =
  process.env.QWEN_BASE_URL ??
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

function qwenClient(): OpenAI {
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("QWEN_API_KEY / DASHSCOPE_API_KEY env missing");
  return new OpenAI({ apiKey, baseURL: QWEN_BASE_URL });
}

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type RankExtraction = {
  brandMentioned: boolean;
  rank: number | null;
  listLength: number | null;
  extractedBrands: string[];
  source: "regex" | "qwen" | "none";
};

// ─────────────────────────────────────────────────────
// Regex-based fast parser
// ─────────────────────────────────────────────────────

/**
 * Numaralı/bullet liste öğelerini çıkarır.
 * Desteklenen formatlar:
 *   - "1. Marka adı — açıklama"
 *   - "1) Marka adı"
 *   - "- Marka adı: açıklama"
 *   - "• Marka adı"
 *   - "**Marka adı**"
 */
function extractListItems(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const items: string[] = [];

  // Numaralı veya bullet satır
  const listRe = /^\s*(?:(\d+)[.)]|[-*•])\s+(.+)$/;

  for (const line of lines) {
    const m = line.match(listRe);
    if (!m) continue;
    let item = m[2].trim();
    // "**" bold kaldır, tırnak temizle
    item = item.replace(/\*\*/g, "").replace(/^["'"'*]+|["'"'*]+$/g, "");
    // ":" veya " — " sonrası açıklamayı at, sadece ad bırak
    const cutIdx = item.search(/\s[:\-—–]\s|:\s/);
    if (cutIdx > 0) item = item.slice(0, cutIdx).trim();
    if (item.length >= 2 && item.length <= 100) {
      items.push(item);
    }
  }
  return items;
}

function findRankByBrand(
  items: string[],
  brandName: string,
): number | null {
  const nb = normalizeTurkish(brandName);
  for (let i = 0; i < items.length; i++) {
    const ni = normalizeTurkish(items[i]);
    if (ni.includes(nb)) return i + 1;
  }
  return null;
}

export function extractRankFromTextFast(
  text: string,
  brandName: string,
): RankExtraction {
  const items = extractListItems(text);

  if (items.length > 0) {
    const rank = findRankByBrand(items, brandName);
    const brandMentioned =
      rank !== null ||
      normalizeTurkish(text).includes(normalizeTurkish(brandName));

    return {
      brandMentioned,
      rank,
      listLength: items.length,
      extractedBrands: items,
      source: "regex",
    };
  }

  // Liste yok — sadece brand mention check
  const mentioned = normalizeTurkish(text).includes(
    normalizeTurkish(brandName),
  );
  return {
    brandMentioned: mentioned,
    rank: null,
    listLength: null,
    extractedBrands: [],
    source: mentioned ? "regex" : "none",
  };
}

// ─────────────────────────────────────────────────────
// Qwen fallback — karmaşık cevaplar için
// ─────────────────────────────────────────────────────

const QWEN_PARSE_PROMPT = `Sen bir AI cevap analizörüsün. Verilen AI cevabında, aranan marka geçiyor mu ve hangi sırada olduğunu bul.

KURALLAR:
- Cevap bir "öneri/liste" formatındaysa sırayı bul
- Cevap serbest metin ise marka geçip geçmediğini söyle
- Normalize et: Türkçe karakterler (ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i)

ÇIKTI — strict JSON, başka metin yok:
{
  "brandMentioned": true/false,
  "rank": null | 1..N,
  "listLength": null | N,
  "extractedBrands": ["Marka1", "Marka2", ...]
}`;

export async function extractRankWithQwen(
  text: string,
  brandName: string,
): Promise<RankExtraction> {
  try {
    const response = await qwenClient().chat.completions.create({
      model: QWEN_MODEL,
      max_tokens: 600,
      temperature: 0.1,
      messages: [
        { role: "system", content: QWEN_PARSE_PROMPT },
        {
          role: "user",
          content: `ARANAN MARKA: ${brandName}\n\nAI CEVABI:\n${text.slice(0, 3000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const raw = response.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as {
      brandMentioned?: boolean;
      rank?: number | null;
      listLength?: number | null;
      extractedBrands?: string[];
    };
    return {
      brandMentioned: Boolean(parsed.brandMentioned),
      rank:
        typeof parsed.rank === "number" && parsed.rank > 0 ? parsed.rank : null,
      listLength:
        typeof parsed.listLength === "number" && parsed.listLength > 0
          ? parsed.listLength
          : null,
      extractedBrands: Array.isArray(parsed.extractedBrands)
        ? parsed.extractedBrands.filter((s) => typeof s === "string")
        : [],
      source: "qwen",
    };
  } catch (err) {
    console.error("[rank-extractor] Qwen fallback failed:", err);
    return {
      brandMentioned: false,
      rank: null,
      listLength: null,
      extractedBrands: [],
      source: "none",
    };
  }
}

/**
 * İki aşamalı ekstraksiyon: önce regex (ücretsiz), listede bulunamadıysa
 * veya ambigu ise Qwen. Regex brand'ı listede bulduysa direkt döner.
 */
export async function extractRank(
  text: string,
  brandName: string,
  options?: { forceQwen?: boolean },
): Promise<RankExtraction> {
  if (options?.forceQwen) {
    return extractRankWithQwen(text, brandName);
  }

  const fast = extractRankFromTextFast(text, brandName);

  // Regex liste buldu + brand listede → kesin sonuç
  if (fast.source === "regex" && fast.listLength && fast.rank !== null) {
    return fast;
  }

  // Regex liste buldu ama brand yok ve text mention da yok → kesin yok
  if (fast.source === "regex" && fast.listLength && !fast.brandMentioned) {
    return fast;
  }

  // Belirsiz (liste yok ama mention olabilir, veya liste var ama brand yok
  // ama text'te mention var) → Qwen'e düş
  return extractRankWithQwen(text, brandName);
}
