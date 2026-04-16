/**
 * Query Generator (Fast) — Claude Haiku ile ürün/hizmet listesinden
 * gerçekçi arama sorguları üretir.
 *
 * Ücretsiz kullanıcılar için düşük maliyetli hızlı üretim.
 * Pro için prompt-generator.ts'deki Sonar + Opus pipeline kullanılmaya devam eder.
 */

import Anthropic from "@anthropic-ai/sdk";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";

interface GenerateQueriesParams {
  products: string[];
  services: string[];
  cities?: string[];
  brandName?: string;
}

const FALLBACK_QUERIES = [
  "en iyi firma hangisi",
  "güvenilir marka önerisi",
  "hangi firma tercih edilmeli",
  "kaliteli ürün nereden alınır",
  "profesyonel hizmet veren firmalar",
  "sektörünün lideri kim",
  "en iyi marka karşılaştırması",
  "güvenilir tedarikçi arıyorum",
  "referans gösterilebilir firma",
  "uzman ekibe sahip firma",
];

export async function generateQueriesFromProducts({
  products,
  services,
  cities = [],
}: GenerateQueriesParams): Promise<string[]> {
  if (products.length === 0 && services.length === 0) {
    return FALLBACK_QUERIES;
  }

  // Cache key — aynı ürün/hizmet/il kombinasyonu için 7 gün TTL
  const cacheKey = makeCacheKey(
    "queries-fast",
    products.sort().join("|"),
    services.sort().join("|"),
    cities.sort().join("|")
  );

  const cached = await cacheGet<string[]>(cacheKey);
  if (cached && cached.length >= 10) {
    console.log("[generateQueriesFromProducts] Cache hit");
    return cached;
  }

  const apiKey =
    process.env.GH7_ANTHROPIC_API_KEY ||
    (process.env.ANTHROPIC_API_KEY?.length ? process.env.ANTHROPIC_API_KEY : undefined);

  if (!apiKey) {
    console.warn("[generateQueriesFromProducts] No Anthropic key, using fallback");
    return FALLBACK_QUERIES;
  }

  const client = new Anthropic({ apiKey, timeout: 20_000 });

  const productsList = products.length > 0 ? products.map((p) => `- ${p}`).join("\n") : "(yok)";
  const servicesList = services.length > 0 ? services.map((s) => `- ${s}`).join("\n") : "(yok)";
  const citiesText = cities.length > 0 ? `Hizmet verilen iller: ${cities.join(", ")}` : "";

  const prompt = `Bir şirket aşağıdaki ürün/hizmetleri satıyor. Potansiyel müşteriler bu şirketi/ürünleri bulmak için yapay zeka asistanlarına (ChatGPT, Claude, Gemini) NE SORAR?

Ürünler:
${productsList}

Hizmetler:
${servicesList}

${citiesText}

Görevin: Gerçek müşterilerin sorduğu 10 farklı arama sorgusu üret.

Kurallar:
- Her sorgu Türkçe olsun
- Her sorgu farklı bir açıdan yaklaşsın (fiyat, karşılaştırma, tavsiye, kalite, bölge, özellik vb.)
- Kısa ve doğal konuşma dilinde olsun (5-10 kelime)
- Marka adı içermesin, genel sektör sorgusu olsun
- Örnek: "villa banyosu için elektrikli yerden ısıtma hangi marka", "İstanbul'da güvenilir yerden ısıtma firması"

SADECE 10 sorguyu, her biri ayrı satırda, numara veya tire kullanmadan yaz:`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return FALLBACK_QUERIES;
    }

    const queries = textBlock.text
      .split("\n")
      .map((line) => line.trim())
      // Remove numbering/bullets
      .map((line) => line.replace(/^(\d+[.)]\s*|[-*•]\s*)/, "").trim())
      .filter((line) => line.length >= 5 && line.length <= 150)
      .slice(0, 10);

    if (queries.length < 5) {
      console.warn("[generateQueriesFromProducts] Too few queries parsed, using fallback");
      return FALLBACK_QUERIES;
    }

    // Pad to 10 with fallbacks if needed
    while (queries.length < 10) {
      const next = FALLBACK_QUERIES[queries.length];
      if (!queries.includes(next)) queries.push(next);
      else break;
    }

    await cacheSet(cacheKey, queries, 7 * 24 * 60 * 60);
    return queries;
  } catch (err) {
    console.error("[generateQueriesFromProducts] Error:", err);
    return FALLBACK_QUERIES;
  }
}
