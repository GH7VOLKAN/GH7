/**
 * Perplexity Sonar — Sektorel Arama Davranisi Arastirmasi (V3)
 *
 * V3 Degisiklik: Per-business-area sorguları
 * Her faaliyet alanı için 2 Sonar sorgusu:
 *   Sorgu A: Recommendation-seeking (oneri amaçlı)
 *   Sorgu B: Location + trust (lokasyon + güven)
 *
 * Pro: 5 alan × 2 sorgu = 10 Sonar sorgusu
 * Free: 0 sorgu (Haiku direkt üretir)
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

export interface BusinessAreaResearchResult {
  /** Faaliyet alanı adı */
  area: string;
  /** 2 sorgunun birleştirilmiş ham çıktısı */
  raw: string;
  /** Sorgu A: Recommendation-seeking sonuçları */
  recommendationData: string;
  /** Sorgu B: Location + trust sonuçları */
  locationTrustData: string;
  /** Çıkarılan sorular */
  allQuestions: string[];
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

// ─── V3: Per-Business-Area Queries (2 per area) ─────────

/**
 * V3 Spec E.2: Her faaliyet alanı için 2 Sonar sorgusu.
 * Sorgu A: Recommendation-seeking → "bu alanda en iyi hizmet veren kim"
 * Sorgu B: Location + trust → "bu bölgede güvenilir firma/uzman"
 */
export async function researchBusinessAreaQuestions(
  businessArea: string,
  city: string,
  serviceRegions?: string[],
): Promise<BusinessAreaResearchResult> {
  const regionText = serviceRegions?.length
    ? serviceRegions.join(", ")
    : city;

  // Sorgu A: Recommendation-seeking
  const queryA = `${businessArea} alanında yapay zekaya "${city}'de en iyi ${businessArea} firmasi/uzmani kim?" veya "${businessArea} tavsiye" gibi oneri soruları sorulduğunda hangi sorular soruluyor? Bu alandaki gerçek müşterilerin yapay zekaya soracağı 10 farklı öneri/tavsiye sorusu ver. Türkçe olsun.`;

  // Sorgu B: Location + trust
  const queryB = `${regionText} bölgesinde ${businessArea} hizmeti arayan birinin güven ve lokasyon bazlı soruları nelerdir? "Yakınımda", "güvenilir", "en iyi", "uygun fiyatlı" gibi sorular. 10 farklı soru ver. Türkçe olsun.`;

  console.log(`[sonar-research] Running 2 queries for business area "${businessArea}" in "${city}"...`);

  const [resultA, resultB] = await Promise.allSettled([
    querySonar(queryA),
    querySonar(queryB),
  ]);

  const recommendationData = resultA.status === "fulfilled" ? resultA.value : "";
  const locationTrustData = resultB.status === "fulfilled" ? resultB.value : "";

  const successCount = [resultA, resultB].filter((r) => r.status === "fulfilled").length;
  console.log(`[sonar-research] Got ${successCount}/2 results for "${businessArea}"`);

  const raw = [
    `--- ${businessArea.toUpperCase()} / ÖNERİ SORULARI ---`,
    recommendationData,
    `\n--- ${businessArea.toUpperCase()} / LOKASYON + GÜVEN ---`,
    locationTrustData,
  ]
    .filter(Boolean)
    .join("\n\n");

  const allQuestions: string[] = [];
  if (recommendationData) allQuestions.push(...extractListItems(recommendationData));
  if (locationTrustData) allQuestions.push(...extractListItems(locationTrustData));

  return {
    area: businessArea,
    raw,
    recommendationData,
    locationTrustData,
    allQuestions,
  };
}

// ─── Legacy: 5 Sonar Queries (backward compatible) ──────

/**
 * Eski 5-sorgu pipeline — geriye uyumluluk için korunuyor.
 * Yeni pipeline researchBusinessAreaQuestions kullanır.
 */
export async function researchSectorQuestions(
  sectorOrProfession: string,
  city: string,
): Promise<SonarResearchResult> {
  const queries = [
    `Birisi ${sectorOrProfession} hizmeti almak istiyor. Araştırma aşamasından satın alma kararına kadar yapay zekaya hangi soruları sorar? 15 farklı soru ver.`,
    `${city}'de ${sectorOrProfession} arayan biri ne sorar? 10 soru ver.`,
    `${sectorOrProfession} hizmetinde insanlar neleri karşılaştırır? Fiyat, kalite, süre kriterleri. 10 karşılaştırma sorusu ver.`,
    `İnsanlar ${sectorOrProfession} ile ilgili hangi sorunları yaşıyor? Bu sorunlarla ilgili yapay zekaya ne sorarlar? 10 soru ver.`,
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

// ─── Onboarding: Domain-based 4 Sonar queries ──────────

/**
 * V3 Spec D.1: Onboarding sırasında domain bazlı 4 Sonar sorgusu
 * 1. Firma ne yapar, faaliyet alanları
 * 2. Rakip tespiti
 * 3. Güçlü/zayıf yönler
 * 4. Hizmet bölgesi + hedef kitle
 */
export async function researchOnboardingDomain(
  brandName: string,
  domain: string,
): Promise<{
  businessCategories: string[];
  competitors: string[];
  strengths: string[];
  weaknesses: string[];
  serviceRegions: string[];
  sector: string | null;
  rawAnalysis: Record<string, string>;
}> {
  const queries = [
    // Sorgu 1: Ne yapar?
    `${domain} web sitesine ve ${brandName} hakkındaki bilgilere göre bu firma/kurum ne iş yapar? Ana faaliyet alanlarını listele. Kısa ve net.`,
    // Sorgu 2: Rakipler
    `${brandName} (${domain}) firmasının Türkiye'deki en bilinen 5 rakibi kimlerdir? Sadece isimleri listele.`,
    // Sorgu 3: Güçlü/zayıf yönler
    `${brandName} (${domain}) hakkında online bilgilere göre güçlü ve zayıf yönleri nelerdir? Güçlü: 3 madde, Zayıf: 3 madde.`,
    // Sorgu 4: Hizmet bölgesi
    `${brandName} (${domain}) hangi şehirlerde/bölgelerde hizmet veriyor? Hedef kitlesi kimler? Kısa cevap.`,
  ];

  console.log(`[sonar-research] Running 4 onboarding queries for "${brandName}" (${domain})...`);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));

  const fulfilled = results.map((r) => {
    if (r.status === "fulfilled") return r.value;
    return "";
  });

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[sonar-research] Onboarding: Got ${successCount}/4 results`);

  // Parse results
  const businessCategories = extractListItems(fulfilled[0]).slice(0, 5);
  const competitors = extractListItems(fulfilled[1]).slice(0, 5);
  const allItems3 = fulfilled[2];
  const strengths = extractStrengths(allItems3);
  const weaknesses = extractWeaknesses(allItems3);
  const serviceRegions = extractListItems(fulfilled[3]).slice(0, 5);

  // Sector detection from first query
  const sectorKeywords = fulfilled[0].toLowerCase();
  let sector: string | null = null;
  const sectorPatterns = [
    { pattern: /ısıtma|soğutma|klima|hvac/i, label: "Isıtma & Soğutma" },
    { pattern: /hukuk|avukat|hukuki/i, label: "Hukuk" },
    { pattern: /sağlık|tıp|hastane|klinik/i, label: "Sağlık" },
    { pattern: /inşaat|yapı|müteahhit/i, label: "İnşaat" },
    { pattern: /yazılım|teknoloji|bilişim|it/i, label: "Teknoloji" },
    { pattern: /eğitim|okul|kurs/i, label: "Eğitim" },
    { pattern: /gıda|restoran|yemek/i, label: "Gıda" },
    { pattern: /tekstil|giyim|moda/i, label: "Tekstil" },
    { pattern: /finans|banka|sigorta/i, label: "Finans" },
    { pattern: /turizm|otel|seyahat/i, label: "Turizm" },
  ];
  for (const sp of sectorPatterns) {
    if (sp.pattern.test(sectorKeywords)) {
      sector = sp.label;
      break;
    }
  }

  return {
    businessCategories,
    competitors,
    strengths,
    weaknesses,
    serviceRegions,
    sector,
    rawAnalysis: {
      whatDoes: fulfilled[0],
      competitors: fulfilled[1],
      strengthsWeaknesses: fulfilled[2],
      regions: fulfilled[3],
    },
  };
}

// ─── Digital Footprint (Kişisel marka) ──────────────────

export async function researchDigitalFootprint(
  name: string,
  profession: string,
  city: string,
): Promise<DigitalFootprint> {
  try {
    const prompt = `${name} ${profession} ${city} hakkinda ne biliyorsun? Bu kisinin web sitesi, LinkedIn profili, sektorel dizin kayitlari, haber veya roportajlari, Google Business profili var mi? Detayli bilgi ver.`;

    const raw = await querySonar(prompt);

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
 * Sektorel arama davranisini analiz et (legacy)
 */
export async function researchSectorBehavior(
  profession: string,
  city: string,
): Promise<SectorBehavior> {
  try {
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

function extractListItems(text: string, _hint?: string): string[] {
  const lines = text.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(\d+[\.\)]\s*|- |\* |• )/.test(trimmed)) {
      const cleaned = trimmed.replace(/^(\d+[\.\)]\s*|- |\* |• )/, "").trim();
      if (cleaned.length > 3 && cleaned.length < 200) {
        items.push(cleaned);
      }
    }
  }

  return items.slice(0, 15);
}

function extractStrengths(text: string): string[] {
  const lower = text.toLowerCase();
  const idx = lower.indexOf("güçlü");
  if (idx === -1) return extractListItems(text).slice(0, 3);

  const afterStrengths = text.slice(idx);
  const weakIdx = afterStrengths.toLowerCase().indexOf("zayıf");
  const strengthSection = weakIdx > 0 ? afterStrengths.slice(0, weakIdx) : afterStrengths;
  return extractListItems(strengthSection).slice(0, 3);
}

function extractWeaknesses(text: string): string[] {
  const lower = text.toLowerCase();
  const idx = lower.indexOf("zayıf");
  if (idx === -1) return [];

  const afterWeaknesses = text.slice(idx);
  return extractListItems(afterWeaknesses).slice(0, 3);
}
