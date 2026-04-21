/**
 * Run query generation — 4 kapı için tek Opus çağrısı ile 5 jenerik sorgu üretir.
 *
 * Mevcut prompt-generator.ts farklı bir amaç için yazılmış (weekly tracking,
 * 10-50 sorgu). Burada Shazam flow için kısa, 5 sorgulu, 4 kapıya uyumlu
 * basit bir üretim lazım.
 *
 * Çıktı kuralları:
 * - Marka adı ASLA geçmez
 * - Her sorguda aksiyon kelimesi (öner, listele, hangileri, karşılaştır, en iyi)
 * - Her sorgu spesifik (dar niş, genel kategori değil)
 * - İl bilgisi varsa her sorguda geçer
 * - 5 sorgu 3 ürünün üstüne dağılır (tek ürüne yığılmasın)
 */

import Anthropic from "@anthropic-ai/sdk";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export type QueryGenDoor = "firma" | "kisi" | "eticaret" | "yurtdisi";

export interface QueryGenInput {
  door: QueryGenDoor;
  brandDomain: string;  // filter edilsin, prompt'ta geçmesin
  brandName?: string;   // filter edilsin
  sector?: string;
  products: string[];   // 1-3 ürün
  cities?: string[];    // firma/kişi için il
  targetMarket?: string; // yurtdisi için
  targetLanguage?: string; // yurtdisi için (en/de/ar)
}

export async function generateRunQueries(
  input: QueryGenInput,
): Promise<string[]> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const systemPrompt = buildSystemPrompt(input);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: systemPrompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Markdown fence strip
    const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.warn("[query-gen] No JSON array in Claude response");
      return fallbackQueries(input);
    }

    const parsed: unknown = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(parsed)) return fallbackQueries(input);

    const queries = parsed
      .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
      .map((q) => q.trim())
      .slice(0, 5);

    // Brand/domain filter — Opus kural ihlali yaparsa
    const cleaned_queries = filterBrandLeaks(queries, input);

    if (cleaned_queries.length === 0) {
      console.warn("[query-gen] All queries filtered — using fallback");
      return fallbackQueries(input);
    }

    return cleaned_queries;
  } catch (err) {
    console.error("[query-gen] Claude call failed:", err);
    return fallbackQueries(input);
  }
}

// ═══════════════════════════════════════════════════════════
// Prompt building
// ═══════════════════════════════════════════════════════════

function buildSystemPrompt(input: QueryGenInput): string {
  const common = `
KURALLAR:
- Marka/kişi/domain adı ASLA geçmesin (hiçbir sorguda)
- Her sorguda aksiyon kelimesi: "öner", "listele", "hangileri", "karşılaştır", "en iyi", "tavsiye et"
- Her sorgu spesifik olsun (dar niş, genel kategori değil)
- 5 sorgu ${input.products.length} ürüne dağılsın (tek ürüne yığılma)

SADECE JSON array dön, başka hiçbir şey yazma:
["sorgu 1", "sorgu 2", "sorgu 3", "sorgu 4", "sorgu 5"]
`.trim();

  if (input.door === "firma") {
    const cityLine = input.cities?.length
      ? `İl(ler): ${input.cities.join(", ")} — her sorguda bir il geçsin (tek ilse hep aynı, çoklu ise dağıt)`
      : "İl bilgisi yok, Türkiye geneli sorgular üret";

    return `Sen GH7.ai sorgu stratejistisin. Potansiyel müşterilerin ChatGPT/Claude/Gemini/Perplexity gibi AI'lara firma bulmak için soracağı 5 gerçekçi sorgu üret.

Sektör: ${input.sector || "belirtilmedi"}
Ürünler/Hizmetler: ${input.products.join(", ")}
${cityLine}

ÖRNEK:
"Balıkesir Edremit'te elektrikli yerden ısıtma yaptırabileceğim firmaları öner"
"Bursa'da ısıtma kablosu kurulumu yapan güvenilir firmalar hangileri"
"İzmir'de kar eritme sistemi için en iyi 5 firma"

${common}`;
  }

  if (input.door === "kisi") {
    const cityLine = input.cities?.length
      ? `İl: ${input.cities.join(", ")} — her sorguda geçsin`
      : "İl zorunlu, atla";

    return `Sen GH7.ai sorgu stratejistisin. Potansiyel müşterilerin/hastaların AI'lara uzman/doktor bulmak için soracağı 5 gerçekçi sorgu üret.

Uzmanlık: ${input.sector || "belirtilmedi"}
Hizmet Alanları: ${input.products.join(", ")}
${cityLine}

ÖRNEK:
"Balıkesir'de implant yapan diş hekimlerini listele"
"Edremit'te çocuk kardiyoloğu öner"
"Bandırma'da ortodonti uzmanı hangileri, tavsiye et"

KİŞİ ADI ASLA geçmesin. Sorgular "arayan hasta/müşteri perspektifi" ile.

${common}`;
  }

  if (input.door === "eticaret") {
    return `Sen GH7.ai sorgu stratejistisin. Potansiyel alıcıların AI'lara ürün önerisi için soracağı 5 gerçekçi sorgu üret.

Kategori/Sektör: ${input.sector || "belirtilmedi"}
Ürünler: ${input.products.join(", ")}

ÖRNEK:
"Organik bebek maması için en iyi markaları listele"
"Trendyol'da yerden ısıtma kablosu hangi markaları güvenilir"
"El dokuması halı markaları karşılaştır"

Marketplace vurgusu: bazı sorgularda "trendyol'da", "hepsiburada'da", "amazon'da" ekle.
Marka/mağaza adı ASLA geçmesin.

${common}`;
  }

  // yurtdisi
  const lang = input.targetLanguage || "en";
  const market = input.targetMarket || "hedef pazar";
  const langName = lang === "en" ? "İngilizce" : lang === "de" ? "Almanca" : lang === "ar" ? "Arapça" : lang;

  return `Sen GH7.ai sorgu stratejistisin. ${market} pazarındaki potansiyel alıcıların AI'lara Türk tedarikçi/üretici bulmak için soracağı 5 gerçekçi sorgu üret.

Hedef Pazar: ${market}
Dil: ${langName} (5 sorgunun en az 3'ü ${langName}, kalan 2'si Türkçe olabilir)
Ürünler: ${input.products.join(", ")}

ÖRNEK (${langName}):
"best underfloor heating cable manufacturers from turkey, list them"
"beste fußbodenheizung hersteller aus der türkei auflisten"
"turkish heating cable suppliers for wholesale, compare"

Türk firma adı ASLA geçmesin. Sorgular "yabancı alıcı perspektifi" ile — "from turkey", "turkish", "aus der türkei" gibi Türkiye vurgusu olsun.

${common}`;
}

// ═══════════════════════════════════════════════════════════
// Safety net: brand leak filter
// ═══════════════════════════════════════════════════════════

function filterBrandLeaks(queries: string[], input: QueryGenInput): string[] {
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const brandLower = input.brandName?.toLowerCase() ?? "";
  const domainBase = input.brandDomain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.(com\.tr|com|net|org|io|ai|tr)$/, "");

  const brandRegex =
    brandLower.length >= 3
      ? new RegExp(`\\b${escapeRegex(brandLower)}\\b`, "i")
      : null;
  const domainRegex =
    domainBase.length >= 3
      ? new RegExp(`\\b${escapeRegex(domainBase)}\\b`, "i")
      : null;

  return queries.filter((q) => {
    if (brandRegex?.test(q)) return false;
    if (domainRegex?.test(q)) return false;
    if (q.toLowerCase().includes(input.brandDomain.toLowerCase())) return false;
    return true;
  });
}

// ═══════════════════════════════════════════════════════════
// Fallback — Opus fail ederse hardcoded template
// ═══════════════════════════════════════════════════════════

function fallbackQueries(input: QueryGenInput): string[] {
  const city = input.cities?.[0] || "Türkiye";
  const p = input.products.slice(0, 3);
  if (p.length === 0) p.push("hizmet");

  if (input.door === "firma") {
    return [
      `${city}'de ${p[0]} yaptırabileceğim firmaları öner`,
      `${city}'de ${p[0]} sektöründe en iyi firmalar hangileri, listele`,
      `${p[1] || p[0]} için güvenilir firma tavsiye et ${city} bölgesinde`,
      `${city}'de ${p[2] || p[0]} kurulumu yapan firmalar hangileri`,
      `${p[0]} için ${city}'de hangi firmayı tercih etmeliyim, karşılaştır`,
    ];
  }
  if (input.door === "kisi") {
    return [
      `${city}'de ${p[0]} alanında iyi uzman öner`,
      `${city}'de ${p[0]} için en iyi hekimi/uzmanı listele`,
      `${p[1] || p[0]} yapan uzmanları ${city}'de tavsiye et`,
      `${city}'de ${p[0]} alanında en deneyimli kim, isim ver`,
      `${p[0]} için ${city}'de hangi uzmanı tercih etmeliyim`,
    ];
  }
  if (input.door === "eticaret") {
    return [
      `${p[0]} için en iyi markaları listele`,
      `${p[0]} alırken hangi marka daha iyi, karşılaştır`,
      `Trendyol'da ${p[0]} en iyi markalar hangileri`,
      `${p[1] || p[0]} güvenilir markaları öner`,
      `Türkiye'de ${p[0]} satan markalar hangileri`,
    ];
  }
  // yurtdisi
  const market = input.targetMarket || "europe";
  return [
    `best ${p[0]} manufacturers from turkey, list them`,
    `which turkish companies export ${p[0]} to ${market}`,
    `turkish ${p[0]} suppliers for wholesale, compare`,
    `most reliable ${p[0]} brands from turkey`,
    `top ${p[0]} exporters from turkey to ${market}`,
  ];
}
