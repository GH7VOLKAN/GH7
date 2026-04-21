/**
 * AI cevaplarından kullanıcı markasını (regex, Türkçe-aware) ve rakip adaylarını
 * (Opus, yapılandırılmış) çıkarır.
 */

import Anthropic from "@anthropic-ai/sdk";
import { normalizeTurkish } from "@/lib/utils/turkish";
import type {
  AIProvider,
  CandidateCompetitor,
  FirmProfile,
  UserBrandMention,
} from "@/lib/analiz/types";
import type { FanoutQueryResult } from "./ai-fanout";

export interface ExtractionResult {
  userMentions: UserBrandMention;
  candidates: CandidateCompetitor[];
}

export async function extractMentions(
  queries: FanoutQueryResult[],
  profile: FirmProfile,
  userDomain?: string,
): Promise<ExtractionResult> {
  const userMentions = detectUserMentions(queries, profile, userDomain);
  const candidates = await extractCompetitorsOpus(queries, profile, userDomain);
  return { userMentions, candidates };
}

// ─── User mention (local regex, Türkçe-aware) ─────────────

function detectUserMentions(
  queries: FanoutQueryResult[],
  profile: FirmProfile,
  userDomain?: string,
): UserBrandMention {
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nameNorm = normalizeTurkish(profile.name);
  const domainNorm = userDomain
    ? normalizeTurkish(userDomain).replace(/\.(com\.tr|com|net|org|io|ai|tr)$/, "")
    : "";

  const patterns: RegExp[] = [];
  if (nameNorm.length >= 3) {
    patterns.push(new RegExp(`\\b${escape(nameNorm)}\\b`, "i"));
  }
  // İsim çok kelimeli ise tek tek kelimelerin en uzununu da ekle
  // ("İda Villa Bungalov" → "villa" değil, "bungalov" değil, ama "ida villa" iki kelime match)
  const nameTokens = nameNorm.split(/\s+/).filter((t) => t.length >= 4);
  for (const tok of nameTokens) {
    patterns.push(new RegExp(`\\b${escape(tok)}\\b`, "i"));
  }
  if (domainNorm.length >= 3) {
    patterns.push(new RegExp(`\\b${escape(domainNorm)}\\b`, "i"));
  }
  if (userDomain) {
    patterns.push(new RegExp(escape(normalizeTurkish(userDomain)), "i"));
  }

  const byQuery: Record<string, AIProvider[]> = {};
  let totalMentions = 0;

  for (const q of queries) {
    const provs: AIProvider[] = [];
    for (const a of q.answers) {
      if (!a.text) continue;
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

// ─── Competitor extraction (Opus) ─────────────────────────

async function extractCompetitorsOpus(
  queries: FanoutQueryResult[],
  profile: FirmProfile,
  userDomain?: string,
): Promise<CandidateCompetitor[]> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const answersBlock = queries
    .map((q) => {
      const lines = q.answers
        .filter((a) => a.text && !a.error)
        .map((a) => `  [${a.provider}]: ${a.text.slice(0, 1500)}${a.text.length > 1500 ? "..." : ""}`)
        .join("\n\n");
      return `### ${q.queryId}: "${q.queryText}"\n\n${lines || "(tüm AI cevapları boş)"}`;
    })
    .join("\n\n---\n\n");

  const prompt = `Aşağıda 5 AI'ın 5 kullanıcı sorgusuna verdiği cevaplar var.

GÖREV: Cevaplarda anılan FİRMA/MARKA/UZMAN isimlerini çıkar.

FİLTRELER:
- Türkçe karakter duyarsız karşılaştır (İdavilla = idavilla = IDAVILLA, hepsi aynı)
- "${profile.name}"${userDomain ? ` VE "${userDomain}"` : ""} ASLA listede olmasın (ölçtüğümüz kullanıcı)
- Aynı firmanın farklı yazımlarını tek kayda birleştir
- Jenerik ifadeler HARİÇ ("yerli üretici", "büyük firmalar", "deneyimli uzman")
- Sadece anılan değil, ÖNERİLEN firmaları say ("X'ten kaçının" sayma)

Her firma için JSON:
{
  "name": "standart yazım",
  "url": "domain veya null",
  "mentionCount": N (toplam kaç cevapta),
  "queryIds": ["q1", "q3"],
  "providers": ["chatgpt", "claude"]
}

Frekansa göre AZALAN sıralı, max 20.

SADECE JSON array dön:
[{...}, {...}]

CEVAPLAR:

${answersBlock}`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3072,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";
    const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];

    const nameNormLower = normalizeTurkish(profile.name);

    const result: CandidateCompetitor[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      const name = typeof obj.name === "string" ? obj.name.trim() : "";
      if (!name) continue;
      if (normalizeTurkish(name) === nameNormLower) continue;

      const url = typeof obj.url === "string" && obj.url.trim() ? obj.url.trim() : null;
      const mentionCount =
        typeof obj.mentionCount === "number"
          ? obj.mentionCount
          : parseInt(String(obj.mentionCount ?? 0), 10) || 0;

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

      result.push({ name, url, mentionCount, queryIds, providers });
    }

    result.sort((a, b) => b.mentionCount - a.mentionCount);
    return result.slice(0, 20);
  } catch (err) {
    console.error("[extract] Opus failed:", err);
    return [];
  }
}
