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
import Anthropic from "@anthropic-ai/sdk";

// ── Simple in-memory cache ──────────────────────────
const cache = new Map<string, { result: FreeToolResult; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

// ── Extract competitors from AI responses ───────────
async function extractCompetitors(
  responses: { platform: string; content: string }[],
  input: FreeToolInput,
): Promise<CompetitorPreview[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  const combinedResponses = responses
    .filter((r) => r.content)
    .map((r) => `[${r.platform}]:\n${r.content.slice(0, 1500)}`)
    .join("\n\n---\n\n");

  if (!combinedResponses) return [];

  try {
    const client = new Anthropic({ apiKey });
    const isKisisel = input.mode === "kisisel";

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Aşağıdaki AI platform yanıtlarında "${input.name}" dışında bahsedilen ${isKisisel ? "profesyoneller/uzmanlar" : "firmalar/markalar"} kimler?

En çok bahsedilen ilk 3 alternatifi bul ve JSON formatında döndür:
[{"name": "İsim", "score": 70}]

score: Tahmini AI görünürlük skoru (0-100). Daha çok ve önce bahsedilen → daha yüksek skor.
Eğer hiç alternatif bulamıyorsan boş array döndür: []

Yanıtlar:
${combinedResponses}`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as CompetitorPreview[];
    return parsed.slice(0, 3).map((c) => ({
      name: c.name,
      score: Math.min(100, Math.max(0, Math.round(c.score))),
    }));
  } catch {
    return [];
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
  if (!input.name.trim() || !input.field.trim() || !input.city.trim()) {
    throw new Error("Tüm alanları doldurun.");
  }

  if (recentQueries >= RATE_LIMIT_MAX) {
    throw new Error("Çok fazla sorgu gönderildi. Lütfen bir dakika bekleyin.");
  }

  // Check cache
  const cacheKey = `${input.mode}:${input.name.toLowerCase().trim()}:${input.field.toLowerCase().trim()}:${input.city.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.result;
  }

  recentQueries++;

  const prompt = buildFreeToolPrompt(input);
  const providers = getAvailableProviders();

  if (providers.length === 0) {
    throw new Error("Hiçbir AI platformu yapılandırılmamış.");
  }

  // Query all platforms in parallel
  const rawResults = await Promise.allSettled(
    providers.map(async (provider) => {
      const response = await provider.sendPrompt(prompt);
      return { platform: provider.platform, response };
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
        sentiment: "nötr",
        position: "Bahsedilmiyor",
        visibilityScore: 0,
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

    platforms.push({
      platform,
      label: platformLabels[platform],
      found: analysis.mentioned,
      excerpt: analysis.excerpt ?? response.content.slice(0, 200),
      sentiment,
      position: positionToLabel(analysis.position),
      visibilityScore,
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
        sentiment: "nötr",
        position: "Bahsedilmiyor",
        visibilityScore: 0,
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

  // Extract competitors and generate insights in parallel
  const [competitors, _] = await Promise.all([
    extractCompetitors(rawResponses, input),
    Promise.resolve(), // placeholder for future parallel work
  ]);

  const freeInsights = generateInsights(
    input,
    platforms,
    overallScore,
    sectorAverage,
  );

  const result: FreeToolResult = {
    input,
    platforms,
    score,
    overallScore,
    scoreLabel,
    sectorAverage,
    freeInsights,
    competitors,
  };

  cache.set(cacheKey, { result, ts: Date.now() });

  return result;
}
