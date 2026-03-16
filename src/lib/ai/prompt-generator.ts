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

  // Pro (50): Sonar + Sonnet temel akış
  if (count <= 50) {
    if (brand.type === "firma") {
      return generateFirmaPrompts(brand, count);
    }
    return generateKisiselPrompts(brand, count);
  }

  // Business (200) / Agency (500): Genişleme döngüleriyle
  return generateExpandedPrompts(brand, count);
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

// ─── Business/Agency Expanded Pipeline (200-500 prompt) ──

/**
 * Spec E.3/E.4: 5 genişleme döngüsüyle çok sayıda prompt üretimi.
 * Döngü 1: Genel sektör → 50 prompt
 * Döngü 2: Alt uzmanlıklar → +50 prompt
 * Döngü 3: Mevsimsel/dönemsel → +30 prompt
 * Döngü 4: Farklı müşteri tipleri → +30 prompt
 * Döngü 5: Sorun bazlı → +40 prompt
 * Sonnet hepsini birleştirir, tekrarları çıkarır, hedefe tamamlar.
 */
async function generateExpandedPrompts(
  brand: BrandInfo,
  targetCount: number,
): Promise<GeneratedPrompt[]> {
  const sectorOrProfession = brand.type === "firma" ? brand.sector : brand.profession;
  const city = brand.city || "";

  // Döngü 1: Temel (50 prompt — mevcut Pro pipeline)
  const baseFn = brand.type === "firma" ? generateFirmaPrompts : generateKisiselPrompts;
  const basePrompts = await baseFn(brand, 50);

  // Döngü 2-5: Ek sorgu alanları — Sonar + Sonnet
  const expansionQueries = [
    // Döngü 2: Alt uzmanlıklar
    `${sectorOrProfession} sektöründe alt uzmanlık alanları nelerdir? Her alt alan için yapay zekaya sorulabilecek 15 soru üret. ${city ? `${city} odaklı olsun.` : ""}`,
    // Döngü 3: Mevsimsel/dönemsel
    `${sectorOrProfession} sektöründe mevsimsel veya dönemsel talepler nelerdir? Kışın, yazın, bayramlarda ne soruluyor? 10 soru üret.`,
    // Döngü 4: Farklı müşteri tipleri
    `${sectorOrProfession} hizmeti alan farklı müşteri tipleri kimler? (ev sahibi, müteahhit, genç, yaşlı vb.) Her tip için 10 farklı soru üret.`,
    // Döngü 5: Sorun/şikayet bazlı
    `${sectorOrProfession} ile ilgili en çok hangi şikayetler ve sorunlar yaşanıyor? Bu sorunlarla ilgili yapay zekaya sorulabilecek 15 soru üret.`,
  ];

  // Sonar ile paralel araştırma
  const expansionResults = await Promise.allSettled(
    expansionQueries.map(async (query) => {
      try {
        const res = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [{ role: "user", content: query }],
            max_tokens: 2048,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) return "";
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "";
      } catch {
        return "";
      }
    }),
  );

  const expansionTexts = expansionResults
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter(Boolean);

  const remaining = targetCount - basePrompts.length;
  if (remaining <= 0) return basePrompts.slice(0, targetCount);

  // Sonnet ile tüm genişleme verilerini birleştir ve tekrarları çıkar
  const consolidationPrompt = `Sen GH7.ai prompt stratejistisin.

MEVCUT PROMPTLAR (${basePrompts.length} adet — bunların tekrarını ÜRETME):
${basePrompts.map((p) => `- ${p.text}`).join("\n")}

GENIŞLEME ARAŞTIRMASI VERİLERİ:
${expansionTexts.map((t, i) => `\n--- Döngü ${i + 2} ---\n${t.slice(0, 2000)}`).join("")}

PROFİL: ${sectorOrProfession}, ${city}

GÖREV:
1. Araştırma verilerinden ${remaining} adet YENİ markasız prompt üret
2. Mevcut promptlarla TEKRAR ETME — tamamen farklı açılardan sor
3. Kategorize et: oneri, fiyat, karsilastirma, sorun, lokasyon, bilgi, urun, yorum
4. Cesitlendir: alt uzmanlıklar, mevsimsel, müşteri tipleri, sorun bazlı
5. HIGH potansiyelli promptlar önce

KRİTİK: HİÇBİR promptta firma/kişi adı olmasın — %100 markasız.

JSON: [{"text": "...", "category": "..."}]`;

  const additionalPrompts = await callClaude(
    consolidationPrompt,
    brand.name,
    remaining,
    "sonar",
    "sonnet",
  );

  // Birleştir ve hedef sayıya kırp
  const allPrompts = [...basePrompts, ...additionalPrompts];
  return allPrompts.slice(0, targetCount);
}
