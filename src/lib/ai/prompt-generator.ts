/**
 * GH7.ai — Akilli Prompt Uretim Motoru
 *
 * KRİTİK KURAL: Promptlarda firma/kişi adı KULLANMA
 * %100 markasız, satış odaklı promptlar.
 * Gerçek müşteri ne sorar → onu sor.
 *
 * Free: 5 prompt (Haiku, hizli)
 * Pro: 50 prompt (Sonar arastirma + Sonnet)
 * Business: 200 prompt (5 dongulu genisleme)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  researchDigitalFootprint,
  researchSectorBehavior,
  researchSectorQuestions,
  type DigitalFootprint,
  type SectorBehavior,
  type SonarResearchResult,
} from "./sonar-research";

// ─── Types ─────────────────────────────────────────────

interface BrandInfo {
  name: string;
  domain: string;
  sector: string | null;
  city: string | null;
  type: "firma" | "kisisel";
  profession: string | null;
  specialties: string[];
  competitorNames: string[];
}

export interface GeneratedPrompt {
  text: string;
  category: string;
  source: "ai_generated" | "dataforseo" | "sonar";
  tags: string[];
}

// ─── Main Generator ────────────────────────────────────

/**
 * Akilli prompt uretimi — firma ve kisisel marka icin farkli pipeline
 * TUMU MARKASIZ — firma/kisi adi KULLANILMAZ
 */
export async function generateSmartPrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  // Free: 5 prompt (Haiku, hızlı ve ucuz)
  if (count <= 5) {
    return generateFreePrompts(brand, count);
  }

  // Pro+: Sonar araştırma + Sonnet
  if (brand.type === "firma") {
    return generateFirmaPrompts(brand, count);
  }
  return generateKisiselPrompts(brand, count);
}

// ─── Free Pipeline (Haiku, 5 prompt) ────────────────────

async function generateFreePrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  const sectorOrProfession = brand.type === "firma"
    ? (brand.sector || "genel sektor")
    : (brand.profession || "genel meslek");

  const systemPrompt = `${count} adet markasiz, satis odakli prompt uret.
Tip: ${brand.type === "firma" ? "BUSINESS" : "PERSONAL"}
Sektor/Meslek: ${sectorOrProfession}
Sehir: ${brand.city || "belirtilmedi"}

Gercek musterinin yapay zekaya soracagi dogal sorular.
Firma/kisi adi KESINLIKLE icermesin — %100 markasiz olmali.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "soru metni", "category": "oneri|fiyat|karsilastirma|sorun|lokasyon|bilgi"}]`;

  return callClaude(systemPrompt, brand.name, count, "ai_generated", "haiku");
}

// ─── Firma Pipeline (Sonar + Sonnet) ────────────────────

async function generateFirmaPrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  // 1. Perplexity Sonar ile 5 paralel sektor arastirmasi (spec E.2)
  let sonarResult: SonarResearchResult | null = null;
  if (brand.sector && brand.city) {
    try {
      sonarResult = await researchSectorQuestions(brand.sector, brand.city);
    } catch {
      // Sonar basarisiz olursa devam et
    }
  }

  const sonarContext = sonarResult?.raw
    ? `\n\nPERPLEXITY SONAR ARASTIRMASI (5 sorgu, ~${sonarResult.allQuestions.length} ham soru):
${sonarResult.raw.slice(0, 4000)}`
    : "";

  const systemPrompt = `Sen GH7.ai prompt stratejistisin.

PROFIL BILGILERI:
- Sektor: ${brand.sector || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Tip: Firma${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, satis odakli prompt uret
2. Gercek musterinin yapay zekaya soracagi dogal sorular
3. Satis potansiyeline gore onceliklendir:
   HIGH: Dogrudan satin alma niyeti ("en iyi X firmasi oner")
   MEDIUM: Arastirma asamasi ("X fiyatlari ne kadar")
   LOW: Genel bilgi ("X nedir nasil yapilir")
4. Kategorize et: oneri, fiyat, karsilastirma, sorun, lokasyon, bilgi, urun, yorum
5. Cesitlendir:
   - Lokasyon bazli: "${brand.city || 'sehir'}'de en iyi {sektor} firmasi"
   - Urun/hizmet: "{urun} fiyatlari", "{hizmet} nasil yapilir"
   - Karsilastirma: "{sektor}'de A mi B mi" (JENERIK, marka adi yok)
   - Oneri: "bana iyi bir {sektor} firmasi oner"
   - Sorun: "{sektor} ile ilgili sorunlar"

KRITIK: HICBIR promptta firma/kisi adi olmasin — %100 markasiz.
HIGH potansiyelli promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "kategori"}]`;

  return callClaude(systemPrompt, brand.name, count, sonarResult?.raw ? "sonar" : "ai_generated", "sonnet");
}

// ─── Kisisel Marka Pipeline ────────────────────────────

async function generateKisiselPrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  // 1. Perplexity Sonar ile 5 paralel arastirma (spec E.2) + dijital ayak izi
  let footprint: DigitalFootprint | null = null;
  let sonarResult: SonarResearchResult | null = null;

  if (brand.profession && brand.city) {
    [footprint, sonarResult] = await Promise.all([
      researchDigitalFootprint(brand.name, brand.profession, brand.city).catch(() => null),
      researchSectorQuestions(brand.profession, brand.city).catch(() => null),
    ]);
  }

  const sonarContext =
    footprint?.raw || sonarResult?.raw
      ? `\n\nPERPLEXITY SONAR VERISI (5 sorgu, ~${sonarResult?.allQuestions.length ?? 0} ham soru):
${sonarResult?.raw ? sonarResult.raw.slice(0, 4000) : "veri yok"}`
      : "";

  const systemPrompt = `Sen GH7.ai prompt stratejistisin.

PROFIL BILGILERI:
- Meslek: ${brand.profession || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Uzmanlik alanlari: ${brand.specialties.length > 0 ? brand.specialties.join(", ") : "belirtilmedi"}
- Tip: Kisisel${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, satis odakli prompt uret
2. Gercek bir hastanin/musterinin yapay zekaya soracagi dogal sorular
3. Satis potansiyeline gore onceliklendir:
   HIGH: Dogrudan hizmet arama ("${brand.city || 'sehir'}'de iyi ${brand.profession || 'uzman'} oner")
   MEDIUM: Arastirma ("${brand.profession || 'meslek'} fiyatlari ne kadar")
   LOW: Genel bilgi
4. Kategorize et: lokasyon, uzmanlik, oneri, karsilastirma, genel, itibar, fiyat, yorum
5. Cesitlendir:
   - Lokasyon: "${brand.city}'de iyi bir ${brand.profession} oner"
   - Uzmanlik: "${brand.specialties[0] || 'uzmanlik'} icin en iyi ${brand.profession}"
   - Oneri: "bana ${brand.city}'de guvenilir bir ${brand.profession} bul"
   - Karsilastirma: "${brand.city}'de en iyi ${brand.profession} kim"

KRITIK: HICBIR promptta kisi adi olmasin — %100 markasiz.
"${brand.name}" adini KESINLIKLE kullanma.
HIGH potansiyelli promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "kategori"}]`;

  return callClaude(
    systemPrompt,
    brand.name,
    count,
    footprint?.raw || sonarResult?.raw ? "sonar" : "ai_generated",
    "sonnet",
  );
}

// ─── Claude API Call ───────────────────────────────────

async function callClaude(
  systemPrompt: string,
  brandName: string,
  expectedCount: number,
  source: "ai_generated" | "dataforseo" | "sonar",
  tier: "haiku" | "sonnet" = "sonnet",
): Promise<GeneratedPrompt[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey });
  const model = tier === "haiku"
    ? "claude-haiku-4-5-20251001"
    : "claude-sonnet-4-20250514";

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: systemPrompt,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // JSON parse — Claude bazen markdown code block icinde dondurur
    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed: Array<{ text: string; category: string }> = JSON.parse(jsonStr);

    const prompts = parsed.map((p) => ({
      text: p.text,
      category: p.category,
      source,
      tags: [p.category],
    }));

    // Validation: HICBIR promptta marka/kisi adi olmamali
    const brandLower = brandName.toLowerCase();
    const containsBrand = prompts.filter((p) => p.text.toLowerCase().includes(brandLower));
    if (containsBrand.length > 0) {
      console.warn(
        `[prompt-generator] Warning: ${containsBrand.length}/${prompts.length} prompts contain "${brandName}" — filtering them out.`,
      );
      // Markali promptlari filtrele, kalan markasiz promptlari dondur
      const cleaned = prompts.filter((p) => !p.text.toLowerCase().includes(brandLower));
      return cleaned;
    }

    return prompts;
  } catch (err) {
    console.error("[prompt-generator] Claude call failed:", err);
    return [];
  }
}
