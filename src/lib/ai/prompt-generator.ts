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
 * Free: 10 prompt (Per-area Sonar + Sonnet, aynı Pro pipeline)
 * Pro: 50 prompt/marka (Per-area Sonar + Sonnet), 1 marka
 * Business: 50 prompt/marka × 3 marka (Per-area Sonar + Sonnet)
 * Agency: 50 prompt/marka × 25 marka (Per-area Sonar + Sonnet)
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  querySonar,
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
  businessArea?: string;      // V3: hangi faaliyet alanı
  searchIntent?: string;      // V3: recommendation, comparison, indirect
  salesPotential?: string;    // HIGH, MEDIUM, LOW
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
  // Tüm planlar aynı Sonar + Sonnet pipeline kullanır
  // Free: 10 prompt, Pro: 50 prompt — tek fark sayı
  if (brand.type === "firma") {
    return generateFirmaPrompts(brand, count);
  }
  return generateKisiselPrompts(brand, count);
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

  const systemPrompt = `Sen GH7.ai prompt stratejistisin. AMACIN: Gercek musterilerin yapay zekaya FİRMA BULMAK icin soracagi sorular uretmek.

PROFIL BILGILERI:
- Sektor: ${brand.sector || "belirtilmedi"}
- Faaliyet Alanlari: ${businessAreas.join(", ") || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Hizmet Bolgeleri: ${brand.serviceRegions?.join(", ") || brand.city || "belirtilmedi"}
- Tip: Firma${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, FİRMA BULMA odakli prompt uret
2. Her soru "yapay zekadan firma/hizmet saglayici onerisi almak" icin sorulmali
3. DAGILIM (KESİN ORAN):
   %60 recommendation: Dogrudan firma onerisi ("bana ${brand.city || 'sehir'}'de iyi bir {alan} firmasi oner", "en iyi {alan} firmasi hangisi", "guvenilir {alan} firmasi bul")
   %20 comparison: Firma karsilastirma ("hangi {alan} firmasi daha iyi", "{alan}'de en iyi 3 firma")
   %20 indirect: Dolayli firma bulma ("bu isi nereden yaptirabilirim", "teklif nereden alabilirim")
4. Her prompt icin faaliyet alani etiketi belirle (businessArea)
5. Her faaliyet alanindan ESIT DAGILIM sagla
6. salesPotential belirle: HIGH (dogrudan firma onerisi), MEDIUM (karsilastirma), LOW (dolayli)

ORNEK İYİ SORULAR:
- "${brand.city || 'Istanbul'}'de en iyi ${businessAreas[0] || 'sektor'} firmasi hangisi?"
- "Bana guvenilir bir ${businessAreas[0] || 'sektor'} firmasi onerir misin?"
- "${businessAreas[0] || 'sektor'} icin teklif nereden alabilirim?"
- "Hangi ${businessAreas[0] || 'sektor'} firmasini tercih etmeliyim?"
- "${brand.city || 'sehir'}'de ${businessAreas[0] || 'sektor'} yapan firmalar hangileri?"

KESINLIKLE YASAK — bu tip sorular URETME:
- "X nedir", "nasil calisir", "ne ise yarar" → ANSİKLOPEDİK, YASAK
- "Kac yil dayanir", "omru ne kadar" → TEKNİK BİLGİ, YASAK
- "Maliyeti ne kadar", "fiyati nedir" → SAF FİYAT, YASAK
- "Avantajlari nelerdir", "farklari nedir" → BİLGİ SORUSU, YASAK
- Cevabi bir FİRMA ADI olmayan tum sorular YASAK
- Firma/marka adi iceren sorular YASAK

KRITIK: HICBIR promptta firma adi, kisi adi, domain adi (ornegin isitmax.com, abc.com.tr gibi) olmasin — %100 markasiz.
"hakkinda bilgin var mi" veya "X firmasi nasil" gibi direkt firma soran sorular YASAK.
Her soru genel bir musteri sorusu olmali: "en iyi firma oner", "guvenilir firma bul" tarzinda.
HIGH potansiyelli (recommendation) promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "oneri|karsilastirma|lokasyon|sorun", "businessArea": "faaliyet alani", "searchIntent": "recommendation|comparison|indirect", "salesPotential": "HIGH|MEDIUM|LOW"}]`;

  return callClaude(systemPrompt, brand.name, count, areaResults.length > 0 ? "sonar" : "ai_generated", "sonnet", brand.domain);
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

  const systemPrompt = `Sen GH7.ai prompt stratejistisin. AMACIN: Gercek musterilerin yapay zekaya UZMAN/HİZMET SAGLAYICI BULMAK icin soracagi sorular uretmek.

PROFIL BILGILERI:
- Meslek: ${brand.profession || "belirtilmedi"}
- Sehir: ${brand.city || "belirtilmedi"}
- Uzmanlik alanlari: ${businessAreas.join(", ") || "belirtilmedi"}
- Tip: Kisisel${sonarContext}

GOREVIN:
1. Tam olarak ${count} adet markasiz, UZMAN BULMA odakli prompt uret
2. Her soru "yapay zekadan kisi/uzman onerisi almak" icin sorulmali
3. DAGILIM (KESİN ORAN):
   %60 recommendation: Dogrudan uzman arama ("${brand.city || 'sehir'}'de iyi bir ${brand.profession || 'uzman'} oner", "en iyi ${brand.profession || 'uzman'} kim")
   %20 comparison: Uzman karsilastirma ("${brand.city || 'sehir'}'de en iyi ${brand.profession || 'uzman'} kim", "hangi ${brand.profession || 'uzman'} daha iyi")
   %20 indirect: Dolayli uzman bulma ("bu konuda kime danismaliyim", "nereden randevu alabilirim")
4. Her prompt icin uzmanlik alani etiketi belirle (businessArea)

ORNEK İYİ SORULAR:
- "${brand.city || 'Istanbul'}'de en iyi ${brand.profession || 'uzman'} kim?"
- "Bana iyi bir ${businessAreas[0] || brand.profession || 'uzman'} onerir misin?"
- "${brand.city || 'sehir'}'de ${businessAreas[0] || brand.profession || 'uzman'} ariyorum, kimi onerirsin?"
- "Guvenilir bir ${brand.profession || 'uzman'} nasil bulurum?"

KESINLIKLE YASAK — bu tip sorular URETME:
- "X nedir", "nasil calisir" → ANSİKLOPEDİK, YASAK
- "Kac yil surer", "ne kadar dayanir" → TEKNİK BİLGİ, YASAK
- "Fiyati nedir", "ne kadar" → SAF FİYAT, YASAK
- Cevabi bir KİŞİ ADI olmayan tum sorular YASAK

KRITIK: HICBIR promptta kisi adi, firma adi, domain adi olmasin — %100 markasiz.
HIGH potansiyelli (recommendation) promptlar listenin basinda olsun.

JSON formatinda dondur — baska hicbir sey yazma:
[{"text": "prompt metni", "category": "oneri|karsilastirma|lokasyon|uzmanlik", "businessArea": "uzmanlik alani", "searchIntent": "recommendation|comparison|indirect", "salesPotential": "HIGH|MEDIUM|LOW"}]`;

  return callClaude(
    systemPrompt,
    brand.name,
    count,
    footprint?.raw || areaResults.length > 0 ? "sonar" : "ai_generated",
    "sonnet",
    brand.domain,
  );
}

// ─── Claude API Call ───────────────────────────────────

async function callClaude(
  systemPrompt: string,
  brandName: string,
  expectedCount: number,
  source: "ai_generated" | "sonar",
  tier: "haiku" | "sonnet" = "sonnet",
  brandDomain?: string,
  userPlan?: string,
): Promise<GeneratedPrompt[]> {
  // Free kullanıcılar için Qwen (maliyet: $0.003 vs $0.01)
  const { callQwen: callQwenFn, isQwenAvailable: isQwenAvailableFn } = await import("./qwen-client");
  if (userPlan === "free" && isQwenAvailableFn()) {
    try {
      const result = await callQwenFn({ systemPrompt, userMessage: `Marka: ${brandName}`, maxTokens: 4096 });
      if (result) {
        const parsed = JSON.parse(result);
        const prompts = Array.isArray(parsed) ? parsed : parsed.prompts ?? [];
        return prompts.slice(0, expectedCount).map((p: Record<string, string>) => ({
          text: p.text || p.prompt || "",
          category: p.category || "tavsiye",
          salesPotential: p.salesPotential || "MEDIUM",
          businessArea: p.businessArea || "",
          source,
        }));
      }
    } catch {
      console.warn("[prompt-gen] Qwen failed, falling back to Claude");
    }
  }

  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
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
      salesPotential?: string;
    }> = JSON.parse(jsonStr);

    const prompts = parsed.map((p) => ({
      text: p.text,
      category: p.category,
      source,
      tags: [p.category],
      businessArea: p.businessArea,
      searchIntent: p.searchIntent,
      salesPotential: p.salesPotential || (p.searchIntent === "recommendation" ? "HIGH" : p.searchIntent === "comparison" ? "MEDIUM" : "LOW"),
    }));

    // Validation: Filter out non-firma-bulma prompts (encyclopedic, technical, definition)
    const filteredPrompts = prompts.filter((p) => {
      const lower = p.text.toLowerCase();
      // Reject encyclopedic/technical patterns
      const badPatterns = [
        /nedir\s*\?/,           // "X nedir?"
        /ne demek/,              // "X ne demek?"
        /nasıl çalışır/,         // "nasıl çalışır?"
        /ne işe yarar/,          // "ne işe yarar?"
        /avantajları nelerdir/,  // encyclopedic
        /dezavantajları/,        // encyclopedic
        /farkı nedir/,           // "X ile Y farkı nedir?"
        /kaç yıl dayanır/,       // technical lifespan
        /ömrü ne kadar/,         // technical lifespan
        /kaç saat sürer/,        // technical
        /maliyeti ne kadar/,     // pure price (not firma recommendation)
        /fiyatı nedir/,          // pure price
        /tarihçesi/,             // history
        /ne zaman icat/,         // history
        /çeşitleri nelerdir/,    // types/encyclopedic
        /türleri nelerdir/,      // types/encyclopedic
      ];

      for (const pattern of badPatterns) {
        if (pattern.test(lower)) return false;
      }

      return true;
    });

    // Validation: HICBIR promptta marka/kisi adi veya domain olmamali
    const brandLower = brandName.toLowerCase();
    const domainLower = brandDomain?.toLowerCase().replace(/\.(com|net|org|io|ai|tr|com\.tr)$/, "") || "";

    const cleanedPrompts = filteredPrompts.filter((p) => {
      const lower = p.text.toLowerCase();
      if (lower.includes(brandLower)) return false;
      if (domainLower && domainLower.length > 3 && lower.includes(domainLower)) return false;
      // Also filter ".com", "domain.com" patterns
      if (brandDomain && lower.includes(brandDomain.toLowerCase())) return false;
      return true;
    });

    if (cleanedPrompts.length < filteredPrompts.length) {
      console.warn(
        `[prompt-generator] Warning: ${filteredPrompts.length - cleanedPrompts.length}/${filteredPrompts.length} prompts contained brand/domain — filtered out.`,
      );
    }

    return cleanedPrompts;
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
        return await querySonar(query);
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
    brand.domain,
  );

  // Birleştir ve hedef sayıya kırp
  const allPrompts = [...basePrompts, ...additionalPrompts];
  return allPrompts.slice(0, targetCount);
}
