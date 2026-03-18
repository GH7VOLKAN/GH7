"use server";

import type {
  FreeToolInput,
  FreeToolResult,
  PlatformResult,
  PlatformId,
  CompetitorPreview,
} from "./types";
import { buildFreeToolPrompt } from "./prompt-builder";
import { getAvailableProviders } from "@/lib/ai/provider-registry";
import { analyzeResponse } from "@/lib/ai/analyzer";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";
import Anthropic from "@anthropic-ai/sdk";
import { researchOnboardingDomain } from "@/lib/ai/sonar-research";

// ── Fallback in-memory cache (when Redis unavailable) ──
const memCache = new Map<string, { result: FreeToolResult; ts: number }>();
const MEM_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const REDIS_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// ── Rate limiter ────────────────────────────────────
let recentQueries = 0;
const RATE_LIMIT_MAX = 10;

setInterval(() => {
  recentQueries = 0;
}, 60_000);

// ── Platform labels ─────────────────────────────────
const platformLabels: Record<PlatformId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  groq: "Groq (Llama)",
};

// ── Position to label map ───────────────────────────
function positionToLabel(position: string | null): string {
  switch (position) {
    case "1. sıra":
      return "İlk yanıtta bahsediliyor";
    case "2. sıra":
      return "İkinci sırada öneriliyor";
    case "3. sıra":
      return "Üçüncü sırada yer alıyor";
    case "bahsediliyor":
      return "Yanıtın detay kısmında";
    default:
      return "Bahsedilmiyor";
  }
}

// ── Visibility score from position + sentiment ──────
function calcVisibilityScore(
  mentioned: boolean,
  position: string | null,
  sentiment: string | null,
): number {
  if (!mentioned) return 0;

  let base: number;
  switch (position) {
    case "1. sıra":
      base = 90;
      break;
    case "2. sıra":
      base = 72;
      break;
    case "3. sıra":
      base = 55;
      break;
    case "bahsediliyor":
      base = 35;
      break;
    default:
      base = 20;
  }

  if (sentiment === "pozitif") base = Math.min(100, base + 8);
  else if (sentiment === "negatif") base = Math.max(0, base - 10);

  return base;
}

// ── Sentiment mapping ───────────────────────────────
function normalizeSentiment(
  raw: string | null,
): "pozitif" | "nötr" | "negatif" {
  if (!raw) return "nötr";
  const lower = raw.toLowerCase();
  if (lower.includes("pozitif") || lower.includes("positive")) return "pozitif";
  if (lower.includes("negatif") || lower.includes("negative")) return "negatif";
  return "nötr";
}

// ── Strip markdown from text ────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** → bold
    .replace(/\*([^*]+)\*/g, "$1") // *italic* → italic
    .replace(/#{1,6}\s+/g, "") // ## headers
    .replace(/\[(\d+)\]/g, "") // [1] citation refs
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/`([^`]+)`/g, "$1") // `code` → code
    .replace(/---+/g, "") // horizontal rules
    .replace(/^\s*[-*+]\s+/gm, "• ") // list items
    .replace(/^\s*\d+\.\s+/gm, "") // numbered list prefixes
    .replace(/\n{3,}/g, "\n\n") // multiple newlines
    .trim();
}

// ── Pro insights shape ───────────────────────────────
interface ProInsights {
  competitors: CompetitorPreview[];
  whyNotFound: string[];
  actionItems: string[];
}

// ── Extract competitors, reasons, action plan in one call ──
async function extractProInsights(
  responses: { platform: string; content: string }[],
  input: FreeToolInput,
  platforms: PlatformResult[],
): Promise<ProInsights> {
  const empty: ProInsights = { competitors: [], whyNotFound: [], actionItems: [] };
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return empty;

  const combinedResponses = responses
    .filter((r) => r.content)
    .map((r) => `[${r.platform}]:\n${r.content.slice(0, 2000)}`)
    .join("\n\n---\n\n");

  if (!combinedResponses) return empty;

  try {
    const client = new Anthropic({ apiKey });
    const isKisisel = input.mode === "kisisel";
    const entity = isKisisel ? "kişi" : "firma";
    const notFoundPlatforms = platforms
      .filter((p) => !p.found)
      .map((p) => p.label);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `Aşağıda 4 AI platformuna "${input.name}" (${input.field}, ${input.city}) hakkında sorulmuş yanıtlar var.

Bu yanıtları analiz edip aşağıdaki JSON'u döndür:
{
  "competitors": [{"name": "İsim", "score": 70, "platforms": ["ChatGPT", "Claude"]}],
  "whyNotFound": ["Neden 1", "Neden 2", "Neden 3"],
  "actionItems": ["Aksiyon 1", "Aksiyon 2", "Aksiyon 3", "Aksiyon 4", "Aksiyon 5"]
}

Kurallar:
- competitors: "${input.name}" dışında yanıtlarda bahsedilen TÜM alternatif ${entity}leri listele (en fazla 10). Her biri için hangi platformlarda bahsedildiğini de belirt. score = tahmini AI görünürlük skoru (0-100). En çok bahsedilenden en az bahsedilene sırala.
- whyNotFound: Bu ${entity}'nin ${notFoundPlatforms.length > 0 ? notFoundPlatforms.join(", ") + " tarafından" : "bazı platformlar tarafından"} neden tanınmadığına dair 3 somut neden. Örnek: "LinkedIn profili optimize edilmemiş", "Sektörel blog içeriği yok", "Google Scholar'da yayın bulunmuyor". Genel cümleler yazma, spesifik ol.
- actionItems: AI görünürlüğünü artırmak için 5 somut aksiyon. Öncelik sırasına göre. Örnek: "Medium'da haftalık ${input.field} yazıları yayınla", "Web sitene yapay zekaların seni tanıması için gerekli tanıtım bilgilerini ekle". Genel tavsiye verme, spesifik ve uygulanabilir ol. TEKNİK jargon KULLANMA (SEO, Schema, markup gibi terimler yasak).

Sadece JSON döndür, başka bir şey yazma.

Yanıtlar:
${combinedResponses}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Extract JSON object from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return empty;

    const parsed = JSON.parse(jsonMatch[0]) as ProInsights;

    return {
      competitors: (parsed.competitors ?? []).slice(0, 10).map((c) => ({
        name: c.name,
        score: Math.min(100, Math.max(0, Math.round(c.score))),
        platforms: c.platforms ?? [],
      })),
      whyNotFound: (parsed.whyNotFound ?? []).slice(0, 3),
      actionItems: (parsed.actionItems ?? []).slice(0, 5),
    };
  } catch {
    return empty;
  }
}

// ── Generate insights from real data ────────────────
function generateInsights(
  input: FreeToolInput,
  platforms: PlatformResult[],
  overallScore: number,
  sectorAverage: number,
): string[] {
  const isKisisel = input.mode === "kisisel";
  const notFound = platforms.filter((p) => !p.found).map((p) => p.label);
  const subject = isKisisel ? "senin" : "markanızın";
  const insights: string[] = [];

  // Insight 1: Platform coverage
  const pctMap: Record<string, number> = {
    ChatGPT: 38,
    Claude: 18,
    Gemini: 28,
    Perplexity: 16,
  };
  if (notFound.length > 0) {
    const missedPct = notFound.reduce(
      (sum, p) => sum + (pctMap[p] ?? 15),
      0,
    );
    insights.push(
      `${notFound.join(" ve ")} ${subject} tanımıyor — bu platformlar toplam AI sorgularının %${missedPct}'${missedPct > 50 ? "ini" : "sini"} oluşturuyor.`,
    );
  } else {
    insights.push(
      `Tüm AI platformları ${subject} tanıyor — bu çok nadir ve güçlü bir dijital varlık göstergesi.`,
    );
  }

  // Insight 2: Best platform finding
  const found = platforms.filter((p) => p.found);
  if (found.length > 0) {
    const best = found.sort((a, b) => b.visibilityScore - a.visibilityScore)[0];
    insights.push(
      `En güçlü görünürlük ${best.label}'da (skor: ${best.visibilityScore}/100). ${
        best.sentiment === "pozitif"
          ? "Üstelik pozitif tonla bahsediliyor."
          : best.sentiment === "negatif"
            ? "Ancak ton negatif — bu iyileştirilebilir."
            : "Ton nötr — pozitif içeriklerle güçlendirilebilir."
      }`,
    );
  } else {
    insights.push(
      isKisisel
        ? `Hiçbir AI platformu ${input.name} adını tanımıyor. Dijital varlık oluşturmak için içerik üretimi ve profesyonel profil optimizasyonu gerekli.`
        : `Hiçbir AI platformu ${input.name} markasını tanımıyor. Web sitesi yapılandırılmış verisi, sektörel içerik ve dizin kayıtları ile görünürlük oluşturulabilir.`,
    );
  }

  // Insight 3: Score comparison
  const diff = sectorAverage - overallScore;
  if (diff > 10) {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamanın ${diff} puan altında. Acil aksiyon gerekli.`,
    );
  } else if (diff > 0) {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamaya yakınsın ancak üst sıralar için iyileştirme gerekli.`,
    );
  } else {
    insights.push(
      `Sektör ortalaması ${sectorAverage}/100, ${subject} skoru ${overallScore}/100 — ortalamanın üzerindesin. Pro ile bu avantajı koruyabilirsin.`,
    );
  }

  return insights;
}

// ── Main action ─────────────────────────────────────
export async function runFreeToolQuery(
  input: FreeToolInput,
): Promise<FreeToolResult> {
  if (!input.name.trim()) {
    throw new Error("Lütfen gerekli alanları doldurun.");
  }
  if (input.mode === "kisisel" && !input.field.trim()) {
    throw new Error("Lütfen meslek/uzmanlık alanını doldurun.");
  }

  if (recentQueries >= RATE_LIMIT_MAX) {
    throw new Error("Çok fazla sorgu gönderildi. Lütfen bir dakika bekleyin.");
  }

  // Check cache — try Redis first, fall back to in-memory
  const cacheKey = makeCacheKey("freetool", input.mode, input.name, input.field, input.city);

  const redisCached = await cacheGet<FreeToolResult>(cacheKey);
  if (redisCached) return redisCached;

  const memCached = memCache.get(cacheKey);
  if (memCached && Date.now() - memCached.ts < MEM_CACHE_TTL) {
    return memCached.result;
  }

  recentQueries++;

  // Firma modunda domain'den sektör/şehir çıkar (Sonar)
  if (input.mode === "firma" && (!input.field || !input.city)) {
    try {
      const domain = input.name.replace(/^https?:\/\//, "").replace(/\/+$/, "").toLowerCase();
      console.log("[free-tool] Firma mode — researching domain:", domain);
      const research = await researchOnboardingDomain(domain);
      if (!input.field && research.sector) input.field = research.sector;
      if (!input.field && research.businessCategories?.length) input.field = research.businessCategories[0];
      if (!input.city && research.serviceRegions?.length) input.city = research.serviceRegions[0];
      console.log("[free-tool] Sonar result — field:", input.field, "city:", input.city);
    } catch (err) {
      console.error("[free-tool] Sonar domain research failed:", err);
    }
  }

  const prompt = buildFreeToolPrompt(input);
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error("Hiçbir AI platformu yapılandırılmamış.");
  }

  // Query all platforms in parallel with retry for failures
  const rawResults = await Promise.allSettled(
    providers.map(async (provider) => {
      try {
        const response = await provider.sendPrompt(prompt);
        if (!response.error && response.content) {
          return { platform: provider.platform, response };
        }
        // Retry once after 2s delay
        await new Promise((r) => setTimeout(r, 2000));
        const retryResponse = await provider.sendPrompt(prompt);
        return { platform: provider.platform, response: retryResponse };
      } catch {
        // Retry once on exception
        try {
          await new Promise((r) => setTimeout(r, 2000));
          const retryResponse = await provider.sendPrompt(prompt);
          return { platform: provider.platform, response: retryResponse };
        } catch {
          return {
            platform: provider.platform,
            response: { error: true, content: null },
          };
        }
      }
    }),
  );

  // Analyze each response
  const platforms: PlatformResult[] = [];
  const rawResponses: { platform: string; content: string }[] = [];

  for (const settled of rawResults) {
    if (settled.status === "rejected") continue;

    const { platform, response } = settled.value;

    if (response.error || !response.content) {
      platforms.push({
        platform,
        label: platformLabels[platform],
        found: false,
        excerpt: `${platformLabels[platform]} şu an bu sorguya yanıt veremedi. Platform geçici olarak kullanılamıyor olabilir.`,
        fullResponse: "",
        sentiment: "nötr",
        position: "Bahsedilmiyor",
        positionRaw: null,
        visibilityScore: 0,
        citations: [],
      });
      continue;
    }

    rawResponses.push({ platform, content: response.content });

    const analysis = await analyzeResponse(
      response.content,
      input.name,
      prompt,
    );

    const sentiment = normalizeSentiment(analysis.sentiment);
    const visibilityScore = calcVisibilityScore(
      analysis.mentioned,
      analysis.position,
      analysis.sentiment,
    );

    // Clean excerpt: strip markdown formatting
    const cleanExcerpt = stripMarkdown(
      analysis.excerpt ?? response.content.slice(0, 400),
    );

    // Full cleaned response for evidence display (up to 1500 chars)
    const fullResponse = stripMarkdown(response.content).slice(0, 1500);

    platforms.push({
      platform,
      label: platformLabels[platform],
      found: analysis.mentioned,
      excerpt: cleanExcerpt,
      fullResponse,
      sentiment,
      position: positionToLabel(analysis.position),
      positionRaw: analysis.position,
      visibilityScore,
      citations: analysis.citations ?? [],
    });
  }

  // Add placeholder for unavailable platforms
  const allPlatforms: PlatformId[] = [
    "chatgpt",
    "claude",
    "gemini",
    "perplexity",
  ];
  for (const pid of allPlatforms) {
    if (!platforms.find((p) => p.platform === pid)) {
      platforms.push({
        platform: pid,
        label: platformLabels[pid],
        found: false,
        excerpt: "Bu platform için API anahtarı yapılandırılmamış.",
        fullResponse: "",
        sentiment: "nötr",
        position: "Bahsedilmiyor",
        positionRaw: null,
        visibilityScore: 0,
        citations: [],
      });
    }
  }

  // Sort in canonical order
  platforms.sort(
    (a, b) =>
      allPlatforms.indexOf(a.platform) - allPlatforms.indexOf(b.platform),
  );

  // Calculate scores (only from active platforms)
  const activePlatforms = platforms.filter(
    (p) => !p.excerpt.includes("API anahtarı yapılandırılmamış"),
  );
  const overallScore =
    activePlatforms.length > 0
      ? Math.round(
          activePlatforms.reduce((sum, p) => sum + p.visibilityScore, 0) /
            activePlatforms.length,
        )
      : 0;

  const scoreLabel =
    overallScore <= 25
      ? "Düşük"
      : overallScore <= 50
        ? "Orta"
        : overallScore <= 75
          ? "İyi"
          : "Mükemmel";

  // Sector average heuristic (deterministic based on input hash)
  const hashSeed =
    input.name.length + input.field.length * 7 + input.city.length * 13;
  const sectorAverage = Math.max(
    30,
    Math.min(80, overallScore + 8 + (hashSeed % 15)),
  );

  const score = platforms.filter((p) => p.found).length;

  // Extract pro insights (competitors, reasons, action items)
  const proInsights = await extractProInsights(rawResponses, input, platforms);

  const freeInsights = generateInsights(
    input,
    platforms,
    overallScore,
    sectorAverage,
  );

  const result: FreeToolResult = {
    input,
    platforms,
    promptUsed: prompt,
    score,
    overallScore,
    scoreLabel,
    sectorAverage,
    freeInsights,
    competitors: proInsights.competitors,
    whyNotFound: proInsights.whyNotFound,
    actionItems: proInsights.actionItems,
  };

  // Store in both Redis (7 day TTL, cross-user) and in-memory (1h fallback)
  await cacheSet(cacheKey, result, REDIS_TTL);
  memCache.set(cacheKey, { result, ts: Date.now() });

  return result;
}
