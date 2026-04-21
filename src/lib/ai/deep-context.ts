/**
 * Perplexity deep context fetch — firma hakkında zengin analiz.
 *
 * Tek sorguda yetinmez, 2-3 sorgu birden atar:
 *   1. "Firma analizi" — ne yapıyor, nerede, ne öne çıkarıyor
 *   2. "Niş/ayırt edici özellik" — bu firmayı benzerlerden ayıran ne
 *   3. (Yurtdışı için) "Hedef pazar özelinde firma"
 *
 * Çıktı: rich FirmProfile. Yetersizse contextQuality "thin" veya "empty".
 */

import { querySonar } from "./sonar-research";
import type { AnalyzeInput, FirmProfile } from "@/lib/analiz/types";

export async function fetchDeepContext(
  input: AnalyzeInput,
): Promise<FirmProfile> {
  const queries = buildContextQueries(input);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));
  const texts = results.map((r) => (r.status === "fulfilled" ? r.value : ""));
  const rawContext = texts.filter(Boolean).join("\n\n---\n\n");

  if (!rawContext || rawContext.length < 200) {
    return emptyProfile(input, rawContext);
  }

  const profile = await extractProfileFromContext(rawContext, input);
  return profile;
}

function buildContextQueries(input: AnalyzeInput): string[] {
  if (input.door === "firma") {
    return [
      `${input.domain} web sitesini analiz et. Firma adı, faaliyet alanları, ürün/hizmet kategorileri, hizmet bölgeleri, sektör, hedef kitle — detaylı anlat.`,
      `${input.domain} benzer firmalardan ne ile ayrılıyor? Ayırt edici özellikleri, nişleri, öne çıkardığı konular neler? En az 5 madde.`,
    ];
  }
  if (input.door === "kisi") {
    const q = `${input.fullName} ${input.city ? input.city + "'de" : ""} kim? Uzmanlık alanı, çalıştığı klinik/ofis, eğitimi, öne çıktığı konular neler? Detaylı anlat.`;
    return [q];
  }
  if (input.door === "eticaret") {
    return [
      `${input.domain} web sitesini analiz et. Hangi ürün kategorilerini satıyor, hangi fiyat segmentinde, hangi marketplace'lerde aktif, marka pozisyonu ne? Detaylı anlat.`,
      `${input.domain} benzer e-ticaret markalarından ne ile ayrılıyor? Ürün yelpazesi, hedef kitle, fiyat, marka değeri açısından öne çıkan yönleri neler?`,
    ];
  }
  // yurtdisi
  return [
    `${input.domain} web sitesini analiz et. Hangi ürünleri üretiyor, hangi pazarlara ihraç ediyor, ne ile öne çıkıyor? Detaylı anlat.`,
    `${input.domain} ${input.targetMarket ?? "hedef pazar"} pazarına nasıl konumlanıyor? Rekabet ortamında ayırt edici özellikleri neler?`,
  ];
}

async function extractProfileFromContext(
  rawContext: string,
  input: AnalyzeInput,
): Promise<FirmProfile> {
  // Opus ile yapılandırılmış extraction
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key missing");

  const client = new Anthropic({ apiKey });
  const prompt = `Aşağıda Perplexity'nin bir firma/kişi hakkında verdiği analiz var. Bundan yapılandırılmış bir profil çıkar.

GİRİŞ:
${rawContext.slice(0, 8000)}

GÖREV: Aşağıdaki JSON şemasına göre yanıt ver. SADECE JSON dön, başka hiçbir metin yazma.

{
  "name": "Firma/kişi adı (standart yazım)",
  "sector": "Sektör (ör: 'Turizm ve Konaklama', 'Diş Hekimliği', 'Endüstriyel Isıtma')",
  "city": "Şehir veya null",
  "district": "İlçe veya null",
  "country": "Ülke (Türkiye değilse doldur)",
  "products": ["3-5 ana ürün/hizmet. Özel isim ve parantez KULLANMA. 'Kafe & restoran hizmeti (Limoncello)' değil 'Restoran hizmeti'. Kısa net isimler."],
  "distinctives": ["3-5 ayırt edici özellik. Bu firmayı benzerlerden ayıran nişler. 'Pet-friendly konaklama', 'Edremit Güre lokasyon', 'Mandalina bahçesi', '12 ay açık' gibi."]
}

KRİTİK:
- products listesinde özel isim (markaya ait restoran adı, ürün modeli) YASAK
- distinctives asla jenerik olmasın ("kaliteli hizmet" YASAK, "deniz kenarı konum" OK)`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  const text = block?.type === "text" ? block.text : "";
  const cleaned = text.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    return emptyProfile(input, rawContext);
  }

  try {
    const parsed = JSON.parse(match[0]) as {
      name?: string;
      sector?: string;
      city?: string | null;
      district?: string | null;
      country?: string | null;
      products?: string[];
      distinctives?: string[];
    };

    const products = (parsed.products ?? [])
      .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      .map((p) => stripParensAndSpecialNames(p))
      .slice(0, 5);

    const distinctives = (parsed.distinctives ?? [])
      .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
      .slice(0, 5);

    const hasEnoughData = products.length >= 2 && parsed.name;

    return {
      name: parsed.name ?? deriveNameFromInput(input),
      sector: parsed.sector ?? "",
      location: {
        city: parsed.city ?? undefined,
        district: parsed.district ?? undefined,
        country: parsed.country ?? undefined,
      },
      products,
      distinctives,
      rawContext,
      contextQuality: hasEnoughData ? "rich" : "thin",
    };
  } catch {
    return emptyProfile(input, rawContext);
  }
}

function stripParensAndSpecialNames(product: string): string {
  // "Kafe & restoran hizmeti (Limoncello Cafe)" → "Kafe & restoran hizmeti"
  return product
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveNameFromInput(input: AnalyzeInput): string {
  if (input.fullName) return input.fullName;
  if (input.domain) {
    return input.domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(".")[0]
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }
  return "Bilinmiyor";
}

function emptyProfile(input: AnalyzeInput, rawContext: string): FirmProfile {
  return {
    name: deriveNameFromInput(input),
    sector: "",
    location: {},
    products: [],
    distinctives: [],
    rawContext,
    contextQuality: rawContext.length < 50 ? "empty" : "thin",
  };
}
