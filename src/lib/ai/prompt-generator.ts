/**
 * GH7.ai — Akilli Prompt Uretim Motoru (V3)
 *
 * KRİTİK KURAL: Promptlarda firma/kişi adı KULLANMA
 * %100 markasız, satış odaklı promptlar.
 * Gerçek müşteri ne sorar → onu sor.
 *
 * V3 Değişiklikler:
 * - Per-business-area Sonar sorguları (2 sorgu/alan)
 * - Dağılım: %60 öneri, %20 karşılaştırma, %20 dolaylı
 * - businessArea + searchIntent etiketleri
 *
 * Free: 5 prompt (Haiku, hızlı)
 * Pro: 50 prompt (Per-area Sonar + Sonnet)
 * Business: 200 prompt (genişleme döngüleriyle)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  researchBusinessAreaQuestions,
  researchDigitalFootprint,
  type DigitalFootprint,
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
  businessCategories?: string[]; // V3: faaliyet alanları
  serviceRegions?: string[];     // V3: hizmet bölgeleri
}

export interface GeneratedPrompt {
  text: string;
  category: string;
  source: "ai_generated" | "sonar";
  tags: string[];
  businessArea?: string;   // V3: hangi faaliyet alanı
  searchIntent?: string;   // V3: recommendation, comparison, indirect
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

  // Pro (50): Per-area Sonar + Sonnet
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

DAGILIM:
- %60 oneri sorusu ("bana X oner", "en iyi X hangisi")
- %20 karsilastirma sorusu ("X mi Y mi", "farklari nedir")
- %20 dolayli soru ("X nasil yapilir", "X fiyatlari")

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "soru metni", "category": "oneri|fiyat|karsilastirma|sorun|lokasyon|bilgi", "searchIntent": "recommendation|comparison|indirect"}]`;

  return callClaude(systemPrompt, brand.name, count, "ai_generated", "haiku");
}

// ─── Firma Pipeline (Per-Area Sonar + Sonnet) ────────────

async function generateFirmaPrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  // V3: Per-business-area Sonar sorguları (2 sorgu/alan)
  const businessAreas = brand.businessCategories?.length
    ? brand.businessCategories
    : brand.sector
      ? [brand.sector]
      : [];

  let sonarContext = "";
  const areaResults: Array<{ area: string; data: string }> = [];

  if (businessAreas.length > 0 && brand.city) {
    try {
      // Her faaliyet alanı için 2 Sonar sorgusu (paralel)
      const areaPromises = businessAreas.slice(0, 5).map(async (area) => {
        const result = await researchBusinessAreaQuestions(area, brand.city!, brand.serviceRegions);
        return { area, data: result.raw };
      });

      const results = await Promise.allSettled(areaPromises);
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.data) {
          areaResults.push(r.value);
        }
      }

      if (areaResults.length > 0) {
        sonarContext = `\n\nPERPLEXITY SONAR ARAŞTIRMASI (${areaResults.length} faaliyet alanı × 2 sorgu):`;
        for (const ar of areaResults) {
          sonarContext += `\n\n--- ${ar.area.toUpperCase()} ---\n${ar.data.slice(0, 2000)}`;
        }
      }
    } catch {
      // Sonar başarısız olursa devam et
    }
  }

  const systemPrompt = `Sen GH7.ai prompt stratejistisin.

PROFIL BILGILERI:
- Sektor: ${brand.sector || "belirtilmedi"}
- Faaliyet Alanlari: ${businessAreas.join(", ") || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Hizmet Bolgeleri: ${brand.serviceRegions?.join(", ") || brand.city || "belirtilmedi"}
- Tip: Firma${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, satis odakli prompt uret
2. Gercek musterinin yapay zekaya soracagi dogal sorular
3. DAGILIM (KESİN ORAN):
   %60 recommendation: Dogrudan oneri ("en iyi X oner", "X tavsiye")
   %20 comparison: Karsilastirma ("X mi Y mi", "farklari nedir")
   %20 indirect: Dolayli bilgi ("X nasil yapilir", "X fiyatlari ne kadar")
4. Her prompt icin faaliyet alani etiketi belirle (businessArea)
5. Kategorize et: oneri, fiyat, karsilastirma, sorun, lokasyon, bilgi, urun, yorum
6. Cesitlendir:
   - Lokasyon bazli: "${brand.city || 'sehir'}'de en iyi {alan} firmasi"
   - Urun/hizmet: "{alan} fiyatlari", "{hizmet} nasil yapilir"
   - Karsilastirma: "{alan}'de A mi B mi" (JENERIK, marka adi yok)
   - Oneri: "bana iyi bir {alan} firmasi oner"
   - Sorun: "{alan} ile ilgili sorunlar"

KRITIK: HICBIR promptta firma/kisi adi olmasin — %100 markasiz.
HIGH potansiyelli (recommendation) promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "kategori", "businessArea": "faaliyet alani", "searchIntent": "recommendation|comparison|indirect"}]`;

  return callClaude(systemPrompt, brand.name, count, areaResults.length > 0 ? "sonar" : "ai_generated", "sonnet");
}

// ─── Kisisel Marka Pipeline ────────────────────────────

async function generateKisiselPrompts(
  brand: BrandInfo,
  count: number,
): Promise<GeneratedPrompt[]> {
  // V3: Per-business-area Sonar + dijital ayak izi
  let footprint: DigitalFootprint | null = null;
  const businessAreas = brand.businessCategories?.length
    ? brand.businessCategories
    : brand.specialties.length > 0
      ? brand.specialties
      : brand.profession
        ? [brand.profession]
        : [];

  let sonarContext = "";
  const areaResults: Array<{ area: string; data: string }> = [];

  if (brand.profession && brand.city) {
    const promises: Promise<unknown>[] = [
      researchDigitalFootprint(brand.name, brand.profession, brand.city).catch(() => null),
    ];

    // Per-area Sonar queries
    for (const area of businessAreas.slice(0, 5)) {
      promises.push(
        researchBusinessAreaQuestions(area, brand.city, brand.serviceRegions).catch(() => null),
      );
    }

    const results = await Promise.allSettled(promises);

    // First result is footprint
    if (results[0].status === "fulfilled") {
      footprint = results[0].value as DigitalFootprint | null;
    }

    // Rest are area results
    for (let i = 1; i < results.length; i++) {
      const settled = results[i];
      if (settled.status === "fulfilled" && settled.value) {
        const areaResult = settled.value as { raw: string };
        if (areaResult?.raw) {
          areaResults.push({ area: businessAreas[i - 1], data: areaResult.raw });
        }
      }
    }

    if (areaResults.length > 0) {
      sonarContext = `\n\nPERPLEXITY SONAR ARAŞTIRMASI (${areaResults.length} alan × 2 sorgu):`;
      for (const ar of areaResults) {
        sonarContext += `\n\n--- ${ar.area.toUpperCase()} ---\n${ar.data.slice(0, 2000)}`;
      }
    }
  }

  const systemPrompt = `Sen GH7.ai prompt stratejistisin.

PROFIL BILGILERI:
- Meslek: ${brand.profession || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Uzmanlik alanlari: ${businessAreas.join(", ") || "belirtilmedi"}
- Tip: Kisisel${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, satis odakli prompt uret
2. Gercek bir hastanin/musterinin yapay zekaya soracagi dogal sorular
3. DAGILIM (KESİN ORAN):
   %60 recommendation: Dogrudan hizmet arama ("${brand.city || 'sehir'}'de iyi ${brand.profession || 'uzman'} oner")
   %20 comparison: Karsilastirma ("${brand.profession || 'meslek'} A mi B mi")
   %20 indirect: Dolayli bilgi ("${brand.profession || 'meslek'} fiyatlari ne kadar")
4. Her prompt icin uzmanlik alani etiketi belirle (businessArea)
5. Kategorize et: lokasyon, uzmanlik, oneri, karsilastirma, genel, itibar, fiyat, yorum
6. Cesitlendir:
   - Lokasyon: "${brand.city}'de iyi bir ${brand.profession} oner"
   - Uzmanlik: "${businessAreas[0] || 'uzmanlik'} icin en iyi ${brand.profession}"
   - Oneri: "bana ${brand.city}'de guvenilir bir ${brand.profession} bul"
   - Karsilastirma: "${brand.city}'de en iyi ${brand.profession} kim"

KRITIK: HICBIR promptta kisi adi olmasin — %100 markasiz.
"${brand.name}" adini KESINLIKLE kullanma.
HIGH potansiyelli (recommendation) promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "kategori", "businessArea": "uzmanlik alani", "searchIntent": "recommendation|comparison|indirect"}]`;

  return callClaude(
    systemPrompt,
    brand.name,
    count,
    footprint?.raw || areaResults.length > 0 ? "sonar" : "ai_generated",
    "sonnet",
  );
}

// ─── Claude API Call ───────────────────────────────────

async function callClaude(
  systemPrompt: string,
  brandName: string,
  expectedCount: number,
  source: "ai_generated" | "sonar",
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
    const parsed: Array<{
      text: string;
      category: string;
      businessArea?: string;
      searchIntent?: string;
    }> = JSON.parse(jsonStr);

    const prompts = parsed.map((p) => ({
      text: p.text,
      category: p.category,
      source,
      tags: [p.category],
      businessArea: p.businessArea,
      searchIntent: p.searchIntent,
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
 * V3 Spec: Faaliyet alanı bazlı genişleme döngüleri.
 * Her alan için alt kategoriler + mevsimsel + müşteri tipleri + sorun bazlı.
 */
async function generateExpandedPrompts(
  brand: BrandInfo,
  targetCount: number,
): Promise<GeneratedPrompt[]> {
  const sectorOrProfession = brand.type === "firma" ? brand.sector : brand.profession;
  const city = brand.city || "";
  const businessAreas = brand.businessCategories?.length
    ? brand.businessCategories
    : sectorOrProfession
      ? [sectorOrProfession]
      : [];

  // Döngü 1: Temel (50 prompt — mevcut Pro pipeline)
  const baseFn = brand.type === "firma" ? generateFirmaPrompts : generateKisiselPrompts;
  const basePrompts = await baseFn(brand, 50);

  // Döngü 2-5: Her faaliyet alanı için genişleme
  const expansionQueries: string[] = [];

  for (const area of businessAreas.slice(0, 5)) {
    // Alt uzmanlıklar
    expansionQueries.push(
      `${area} alanında alt uzmanlık ve hizmet kategorileri nelerdir? Her alt alan için yapay zekaya sorulabilecek 10 soru üret. ${city ? `${city} odaklı olsun.` : ""}`,
    );
    // Mevsimsel + müşteri tipleri + sorun bazlı
    expansionQueries.push(
      `${area} hizmetinde: 1) Mevsimsel talepler nelerdir? 2) Farklı müşteri tipleri kimler? 3) En çok hangi şikayetler yaşanıyor? Her biri için 5 yapay zeka sorusu üret. ${city ? `${city} odaklı.` : ""}`,
    );
  }

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
${expansionTexts.map((t, i) => `\n--- Genişleme ${i + 1} ---\n${t.slice(0, 2000)}`).join("")}

PROFİL: ${sectorOrProfession}, ${city}
FALİYET ALANLARI: ${businessAreas.join(", ")}

GÖREV:
1. Araştırma verilerinden ${remaining} adet YENİ markasız prompt üret
2. Mevcut promptlarla TEKRAR ETME — tamamen farklı açılardan sor
3. DAGILIM: %60 recommendation, %20 comparison, %20 indirect
4. Her prompt için businessArea ve searchIntent etiketi belirle
5. Cesitlendir: alt uzmanlıklar, mevsimsel, müşteri tipleri, sorun bazlı
6. HIGH potansiyelli promptlar önce

KRİTİK: HİÇBİR promptta firma/kişi adı olmasın — %100 markasız.

JSON: [{"text": "...", "category": "...", "businessArea": "...", "searchIntent": "recommendation|comparison|indirect"}]`;

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
