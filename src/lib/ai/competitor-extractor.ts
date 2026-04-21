/**
 * Rakip çıkarıcı — 5 AI'ın verdiği cevaplardan firma/marka isimlerini bulur.
 *
 * Strateji:
 * - Tek Opus çağrısı, tüm cevapları birden okur
 * - Kendi markayı filtreler (hariç tut)
 * - Aynı markanın farklı yazımlarını birleştirir
 * - Frekans + hangi query'lerde + hangi AI'larda geçti bilgisi döndürür
 * - Kişi adı ve "yerli üretici" gibi jenerik ifadeleri filtreler
 *
 * Regex fallback yok — Opus yeterince güvenilir, ikinci katman karmaşa yaratır.
 * Opus fail ederse boş dizi döndürülür, frontend "rakip bulunamadı, manuel ekle" gösterir.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { QueryWithAnswers, AIProvider } from "./multi-ai-fanout";
import { normalizeTurkish } from "@/lib/utils/turkish";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export interface CandidateCompetitor {
  name: string;
  mentionCount: number;
  queryIds: string[];
  providers: AIProvider[];
}

export interface UserBrandMention {
  totalMentions: number;
  byQuery: Record<string, AIProvider[]>; // queryId → hangi provider'larda anıldı
}

export interface ExtractionResult {
  candidates: CandidateCompetitor[];
  userMentions: UserBrandMention;
}

export async function extractCompetitorsFromAnswers(
  queriesWithAnswers: QueryWithAnswers[],
  userBrandName: string,
  userDomain: string,
): Promise<ExtractionResult> {
  // User brand mention detection — regex word boundary (local, hızlı)
  const userMentions = detectUserBrandMentions(
    queriesWithAnswers,
    userBrandName,
    userDomain,
  );

  // Opus extraction — tüm cevaplardan firma isimlerini çıkar
  const candidates = await extractWithOpus(
    queriesWithAnswers,
    userBrandName,
    userDomain,
  );

  return { candidates, userMentions };
}

// ═══════════════════════════════════════════════════════════
// User brand detection — regex
// ═══════════════════════════════════════════════════════════

function detectUserBrandMentions(
  queries: QueryWithAnswers[],
  brandName: string,
  domain: string,
): UserBrandMention {
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Türkçe-aware lowercase (İ → i, ı → i, vb.)
  const brandNorm = normalizeTurkish(brandName);
  const domainNorm = normalizeTurkish(domain)
    .replace(/\.(com\.tr|com|net|org|io|ai|tr)$/, "");

  const patterns: RegExp[] = [];
  if (brandNorm.length >= 3) {
    patterns.push(new RegExp(`\\b${escapeRegex(brandNorm)}\\b`, "i"));
  }
  if (domainNorm.length >= 3) {
    patterns.push(new RegExp(`\\b${escapeRegex(domainNorm)}\\b`, "i"));
  }
  // Tam domain (nokta dahil) — normalize edilmiş halde
  patterns.push(new RegExp(escapeRegex(normalizeTurkish(domain)), "i"));

  const byQuery: Record<string, AIProvider[]> = {};
  let totalMentions = 0;

  for (const q of queries) {
    const provs: AIProvider[] = [];
    for (const a of q.answers) {
      if (!a.text) continue;
      // CEVAP METNİNİ DE TÜRKÇE-NORMALIZE ET
      const textNorm = normalizeTurkish(a.text);
      const isMatch = patterns.some((p) => p.test(textNorm));
      if (isMatch) {
        provs.push(a.provider);
        totalMentions++;
      }
    }
    if (provs.length > 0) byQuery[q.queryId] = provs;
  }

  return { totalMentions, byQuery };
}

// ═══════════════════════════════════════════════════════════
// Opus extraction
// ═══════════════════════════════════════════════════════════

async function extractWithOpus(
  queries: QueryWithAnswers[],
  userBrandName: string,
  userDomain: string,
): Promise<CandidateCompetitor[]> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[extract] No Anthropic key");
    return [];
  }

  // Prompt'u tüm cevaplarla hazırla
  const answersBlock = queries
    .map((q) => {
      const answerLines = q.answers
        .filter((a) => a.text && !a.error)
        .map(
          (a) =>
            `  [${a.provider}]: ${a.text.slice(0, 1500)}${a.text.length > 1500 ? "..." : ""}`,
        )
        .join("\n\n");
      return `### ${q.queryId}: "${q.queryText}"\n\n${answerLines || "(tüm AI cevapları boş)"}`;
    })
    .join("\n\n---\n\n");

  const prompt = `Aşağıda 5 farklı AI platformunun, 5 farklı kullanıcı sorgusuna verdiği cevaplar var.

GÖREV: Bu cevaplarda geçen FİRMA/MARKA isimlerini çıkar.

FİLTRELER:
- Türkçe karakter duyarsız karşılaştır (İdavilla = idavilla = IDAVILLA, hepsi aynı)
- Marka ismi cevap metninde herhangi bir yazımla geçiyorsa rakip sayma
- "${userBrandName}" VE "${userDomain}" ASLA listede olmasın (bunlar ölçtüğümüz kullanıcının kendi markası)
- Aynı firmanın farklı yazımları tek kayda birleşsin (Danfoss = DANFOSS = danfoss.com.tr)
- Jenerik ifadeler HARİÇ: "yerli üretici", "global marka", "büyük firmalar", "deneyimli uzman" vb.
- Kişi adları (Dr. Ahmet Yılmaz) → KAPIYA GÖRE: eğer cevap kişi öneriyor (doktor, avukat, danışman) ise kişi isimleri rakip sayılır. Ürün/hizmet öneriliyor ise kişi isimleri HARİÇ (muhtemelen yazar/uzman atıfı).
- Sadece söz edilen her firmayı değil, GERÇEKTEN ÖNERİLEN firmaları say ("X'ten kaçının" → sayma).

Her firma için:
- name: standart yazım (ör. "Danfoss", baş harfleri büyük, domain değil)
- mentionCount: toplam kaç AI cevabında anıldı
- queryIds: hangi sorgularda anıldı (q1, q2... formatında)
- providers: hangi AI'lar andı (chatgpt, claude, gemini, perplexity, google_aio)

Frekansa göre AZALAN sırada dön, max 20 firma.

SADECE JSON array dön, başka hiçbir metin yazma:
[
  {"name": "Firma", "mentionCount": N, "queryIds": ["q1","q3"], "providers": ["chatgpt","claude"]}
]

CEVAPLAR:

${answersBlock}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3072,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.warn("[extract] No JSON array in Opus response");
      return [];
    }

    const parsed: unknown = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(parsed)) return [];

    const result: CandidateCompetitor[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;

      const name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name) continue;
      if (name.toLowerCase() === userBrandName.toLowerCase()) continue;

      const mentionCount =
        typeof obj.mentionCount === "number"
          ? obj.mentionCount
          : typeof obj.mentionCount === "string"
            ? parseInt(obj.mentionCount, 10) || 0
            : 0;

      const queryIds = Array.isArray(obj.queryIds)
        ? (obj.queryIds as unknown[]).filter((x): x is string => typeof x === "string")
        : [];

      const providers = Array.isArray(obj.providers)
        ? (obj.providers as unknown[]).filter(
            (x): x is AIProvider =>
              typeof x === "string" &&
              ["chatgpt", "claude", "gemini", "perplexity", "google_aio"].includes(x),
          )
        : [];

      result.push({ name, mentionCount, queryIds, providers });
    }

    // mentionCount azalan sıra (Opus yapmış olabilir ama garanti et)
    result.sort((a, b) => b.mentionCount - a.mentionCount);

    return result.slice(0, 20);
  } catch (err) {
    console.error("[extract] Opus call failed:", err);
    return [];
  }
}
