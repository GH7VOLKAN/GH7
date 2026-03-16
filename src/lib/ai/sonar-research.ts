/**
 * Perplexity Sonar — Sektorel Arama Davranisi Arastirmasi
 *
 * Pro prompt uretimi icin 5 paralel Sonar sorgusu:
 * 1. Musteri yolculugu (customer journey)
 * 2. Lokasyon bazli sorular
 * 3. Karsilastirma sorulari
 * 4. Sorun/ihtiyac sorulari
 * 5. Guven/referans sorulari
 *
 * ~55 ham soru uretir, Sonnet tarafindan konsolide edilir.
 */

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

async function querySonar(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("Perplexity API key not configured");

  const res = await fetch(PERPLEXITY_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Types ─────────────────────────────────────────────

export interface DigitalFootprint {
  raw: string;
  hasLinkedIn: boolean;
  hasWebsite: boolean;
  hasGoogleBusiness: boolean;
  hasSectorDirectories: boolean;
  hasNewsArticles: boolean;
}

export interface SectorBehavior {
  raw: string;
  commonQuestions: string[];
  searchCriteria: string[];
  popularSpecialties: string[];
}

export interface SonarResearchResult {
  /** Tum Sonar sorgularinin birlestirilmis ham ciktisi */
  raw: string;
  /** Her sorgunun ayri ham ciktisi */
  queryResults: {
    customerJourney: string;
    locationBased: string;
    comparison: string;
    problemNeed: string;
    trustReference: string;
  };
  /** Tum sorgulardan cikan sorular (~55 adet) */
  allQuestions: string[];
  /** Eski uyumluluk icin */
  commonQuestions: string[];
  searchCriteria: string[];
  popularSpecialties: string[];
}

// ─── 5 Sonar Queries (Spec E.2) ───────────────────────

/**
 * Pro prompt uretimi icin 5 paralel Sonar sorgusu calistir.
 * ~55 ham soru dondurur (Sonnet tarafindan konsolide edilecek).
 */
export async function researchSectorQuestions(
  sectorOrProfession: string,
  city: string,
): Promise<SonarResearchResult> {
  const queries = [
    // 1. Musteri yolculugu — 15 soru
    `Birisi ${sectorOrProfession} hizmeti almak istiyor. Araştırma aşamasından satın alma kararına kadar yapay zekaya hangi soruları sorar? 15 farklı soru ver.`,

    // 2. Lokasyon bazli — 10 soru
    `${city}'de ${sectorOrProfession} arayan biri ne sorar? 10 soru ver.`,

    // 3. Karsilastirma — 10 soru
    `${sectorOrProfession} hizmetinde insanlar neleri karşılaştırır? Fiyat, kalite, süre kriterleri. 10 karşılaştırma sorusu ver.`,

    // 4. Sorun/ihtiyac — 10 soru
    `İnsanlar ${sectorOrProfession} ile ilgili hangi sorunları yaşıyor? Bu sorunlarla ilgili yapay zekaya ne sorarlar? 10 soru ver.`,

    // 5. Guven/referans — 10 soru
    `Birisi ${sectorOrProfession}'de güvenilir firma/uzman arıyor. Güven ve referans ile ilgili ne sorar? 10 soru ver.`,
  ];

  console.log(`[sonar-research] Running 5 Sonar queries for "${sectorOrProfession}" in "${city}"...`);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));

  const fulfilled = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    console.error(`[sonar-research] Query ${i + 1} failed:`, r.reason);
    return "";
  });

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[sonar-research] Got ${successCount}/5 Sonar results`);

  const queryResults = {
    customerJourney: fulfilled[0],
    locationBased: fulfilled[1],
    comparison: fulfilled[2],
    problemNeed: fulfilled[3],
    trustReference: fulfilled[4],
  };

  // Tum sorgulardan soru satirlarini cikar
  const allQuestions: string[] = [];
  for (const text of fulfilled) {
    if (text) {
      allQuestions.push(...extractListItems(text));
    }
  }

  const raw = [
    "--- MUSTERI YOLCULUGU ---",
    fulfilled[0],
    "\n--- LOKASYON BAZLI ---",
    fulfilled[1],
    "\n--- KARSILASTIRMA ---",
    fulfilled[2],
    "\n--- SORUN/IHTIYAC ---",
    fulfilled[3],
    "\n--- GUVEN/REFERANS ---",
    fulfilled[4],
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    raw,
    queryResults,
    allQuestions,
    commonQuestions: allQuestions.slice(0, 15),
    searchCriteria: extractListItems(fulfilled[2], "kriter"),
    popularSpecialties: extractListItems(fulfilled[0], "uzmanlik"),
  };
}

// ─── Legacy Exports (backward compatible) ──────────────

/**
 * Kisisel markanin dijital ayak izini tara
 */
export async function researchDigitalFootprint(
  name: string,
  profession: string,
  city: string,
): Promise<DigitalFootprint> {
  try {
    const prompt = `${name} ${profession} ${city} hakkinda ne biliyorsun? Bu kisinin web sitesi, LinkedIn profili, sektorel dizin kayitlari, haber veya roportajlari, Google Business profili var mi? Detayli bilgi ver.`;

    const raw = await querySonar(prompt);

    // Basit keyword taramasi ile dijital varlik tespiti
    const lower = raw.toLowerCase();
    return {
      raw,
      hasLinkedIn: lower.includes("linkedin"),
      hasWebsite: lower.includes("web site") || lower.includes("website") || lower.includes(".com") || lower.includes(".tr"),
      hasGoogleBusiness: lower.includes("google") && (lower.includes("business") || lower.includes("maps") || lower.includes("isletme")),
      hasSectorDirectories: lower.includes("dizin") || lower.includes("directory") || lower.includes("doktortakvimi") || lower.includes("avukatara"),
      hasNewsArticles: lower.includes("haber") || lower.includes("roportaj") || lower.includes("interview") || lower.includes("makale"),
    };
  } catch (err) {
    console.error("[sonar-research] digitalFootprint error:", err);
    return {
      raw: "",
      hasLinkedIn: false,
      hasWebsite: false,
      hasGoogleBusiness: false,
      hasSectorDirectories: false,
      hasNewsArticles: false,
    };
  }
}

/**
 * Sektorel arama davranisini analiz et (legacy — artik researchSectorQuestions kullan)
 */
export async function researchSectorBehavior(
  profession: string,
  city: string,
): Promise<SectorBehavior> {
  try {
    // Pro pipeline icin 5-sorgu versiyonunu calistir
    const result = await researchSectorQuestions(profession, city);

    return {
      raw: result.raw,
      commonQuestions: result.commonQuestions,
      searchCriteria: result.searchCriteria,
      popularSpecialties: result.popularSpecialties,
    };
  } catch (err) {
    console.error("[sonar-research] sectorBehavior error:", err);
    return {
      raw: "",
      commonQuestions: [],
      searchCriteria: [],
      popularSpecialties: [],
    };
  }
}

// ─── Helpers ──────────────────────────────────────────

/**
 * Metin icinden liste itemlerini cikar (basit heuristik)
 */
function extractListItems(text: string, _hint?: string): string[] {
  const lines = text.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Numbered or bulleted list items
    if (/^(\d+[\.\)]\s*|- |\* |• )/.test(trimmed)) {
      const cleaned = trimmed.replace(/^(\d+[\.\)]\s*|- |\* |• )/, "").trim();
      if (cleaned.length > 5 && cleaned.length < 200) {
        items.push(cleaned);
      }
    }
  }

  return items.slice(0, 15);
}
