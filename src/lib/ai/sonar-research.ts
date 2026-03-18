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

import { captureError } from "@/lib/monitoring";

const PERPLEXITY_API = "https://api.perplexity.ai/chat/completions";

export async function querySonar(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error("[querySonar] PERPLEXITY_API_KEY is not set!");
    throw new Error("Perplexity API key not configured");
  }

  console.log(`[querySonar] Calling Sonar API — prompt length: ${prompt.length} chars`);
  const startTime = Date.now();

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
    const errBody = await res.text().catch(() => "");
    const err = new Error(`Perplexity API error: ${res.status}`);
    captureError(err, { context: "querySonar", status: res.status, body: errBody.slice(0, 200) });
    throw err;
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  console.log(`[querySonar] OK — ${content.length} chars in ${Date.now() - startTime}ms`);
  return content;
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

  // Sorgu A: Recommendation-seeking — şehir + Türkiye odaklı
  const queryA = `${city}'de ${businessArea} hizmeti almak isteyen biri yapay zekaya ne sorar? Sadece FİRMA BULMAYA yönelik sorular: "en iyi firma öner", "güvenilir firma bul", "nereden teklif alayım", "hangi firmayı tercih edeyim". Teknik bilgi veya ansiklopedik soru YAZMA. 10 soru yaz.`;

  // Sorgu B: Location + trust — yerel + firma bulma odaklı
  const queryB = `Türkiye'de ${regionText} bölgesinde ${businessArea} firması arayan kişi yapay zekaya ne sorar? Firma önerisi, marka karşılaştırma, "en iyi hangisi", "hangi firma daha iyi" tarzı 10 soru yaz. Teknik/ansiklopedik soru YAZMA.`;

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
/**
 * V3 Onboarding — Domain bazlı 4 Sonar sorgusu (Spec E.0 birebir)
 * Sorgu 1 (firma analizi): firma adı, faaliyet alanları, ürün/hizmet, bölgeler, sektör, hedef kitle
 * Sorgu 2 (öne çıkan alanlar): Google'da hangi konularda öne çıkıyor, güçlü/zayıf yönler
 * Sorgu 3a (doğrudan rakipler): 10 firma ve web siteleri
 * Sorgu 3b (sektörel rakipler): sektördeki diğer öne çıkan firmalar (domain hariç)
 */
export async function researchOnboardingDomain(
  domain: string,
): Promise<{
  companyName: string | null;
  businessCategories: string[];
  competitors: Array<{ name: string; domain: string | null }>;
  strengths: string[];
  weaknesses: string[];
  serviceRegions: string[];
  sector: string | null;
  rawAnalysis: Record<string, string>;
}> {
  // ═══ AŞAMA 1: Firma analizi + güçlü/zayıf yönler (paralel) ═══
  const phase1Queries = [
    // Sorgu 1 (firma analizi) — Spec E.0 birebir
    `${domain} web sitesini analiz et. Firma adı, faaliyet alanları, ürün/hizmet kategorileri, hizmet verdiği bölgeler (hangi şehirler/iller), sektör, hedef kitle?`,
    // Sorgu 2 (güçlü/zayıf yönler) — Spec E.0 birebir
    `${domain} Google'da hangi konularda öne çıkıyor? Güçlü yönleri neler (en az 5 madde)? Zayıf yönleri ve geliştirilebilir alanları neler (en az 5 madde)? Rakiplerine göre avantajları ve dezavantajları neler?`,
  ];

  console.log(`[sonar-research] Phase 1: Running 2 analysis queries for domain: ${domain}...`);
  const phase1Results = await Promise.allSettled(phase1Queries.map((q) => querySonar(q)));
  const phase1 = phase1Results.map((r) => r.status === "fulfilled" ? r.value : "");

  // Aşama 1'den sektör ve faaliyet alanlarını çıkar
  const firmaText = phase1[0];

  // Sektör tespiti: Sonar yanıtının İLK 300 karakterinden (faaliyet tanımı kısmı)
  // Tüm metinden yaparsak hedef kitle kısmındaki kelimeler yanıltıyor
  // (ör. ISITMAX'ın hedef kitlesi "otel" → yanlışlıkla "Turizm" algılanıyor)
  const detectedSector = detectSectorFromText(firmaText.slice(0, 300));

  // ═══ KRİTİK: Rakip aramada genel sektör etiketi DEĞİL, Sonar'ın bulduğu
  // gerçek ürün/hizmet tanımlarını kullan. Örnek:
  //   YANLIŞ: "Isıtma & Soğutma" → Baymak, Demirdöküm (kombi firmaları, rakip değil)
  //   DOĞRU: "elektrikli yerden ısıtma, heat trace, kar buz eritme" → gerçek rakipler
  // ═══
  // Sonar'ın Phase 1 yanıtının ilk 500 karakterini "firma tanımı" olarak kullan
  const firmaSummary = firmaText
    .replace(/\[\d+\]/g, "")   // citation refs temizle
    .replace(/\*\*/g, "")      // bold temizle
    .slice(0, 500)
    .trim();

  console.log(`[sonar-research] Detected sector: "${detectedSector || 'bilinmiyor'}" — searching competitors with actual product description...`);

  // ═══ AŞAMA 2: Rakip bulma — faaliyet alanları (ürün/hizmet) bazlı (paralel) ═══
  // KRİTİK: Genel sektör etiketi (ör. "Isıtma & Soğutma") ile arama YAPMA!
  // Faaliyet alanlarını (businessCategories) kullan — bunlar spesifik ürün/hizmetler.
  const detectedCategories = extractListItems(firmaText).slice(0, 5);
  const categoryText = detectedCategories.length > 0
    ? detectedCategories.join(", ")
    : firmaSummary.slice(0, 200);

  const phase2Queries = [
    // Sorgu 3a (doğrudan rakipler) — faaliyet alanlarına göre, sektör etiketine göre DEĞİL
    `Türkiye'de ${categoryText} üreten veya satan firmalar kimler? ${domain} hariç. 10 firma ve web siteleri listele.\n\nFirma tanımı:\n${firmaSummary}\n\nÖNEMLİ: Her firma için "1. Firma Adı - domain.com" formatında yaz. ${domain} hariç. Büyük holding/genel sektör markaları DEĞİL, aynı niş alanda (aynı ürünleri üreten/satan) firmalar.`,
    // Sorgu 3b (doğrudan rakipler, filtrelemeli) — genel markaları açıkça dışla
    `${domain} firmasının DOĞRUDAN rakipleri — aynı ürünleri üreten/satan Türkiye'deki firmalar. Faaliyet alanları: ${categoryText}. ${domain} hariç.\n\nÖNEMLİ: Genel ısıtma firmaları (Baymak, Demirdöküm gibi kombi/radyatör üreticileri) DAHİL ETMEYİN. Sadece aynı niş ürünlerde (${categoryText}) faaliyet gösteren 10 firma ve web sitelerini "1. Firma Adı - domain.com" formatında listele.`,
  ];

  console.log(`[sonar-research] Phase 2: Running 2 competitor queries...`);
  const phase2Results = await Promise.allSettled(phase2Queries.map((q) => querySonar(q)));
  const phase2 = phase2Results.map((r) => r.status === "fulfilled" ? r.value : "");

  // Combine into fulfilled array (backward compatible)
  const fulfilled = [phase1[0], phase1[1], phase2[0], phase2[1]];

  const successCount = [...phase1Results, ...phase2Results].filter((r) => r.status === "fulfilled").length;
  console.log(`[sonar-research] Onboarding: Got ${successCount}/4 results`);

  // Parse Sorgu 1: faaliyet alanları + firma adı + sektör
  const businessCategories = extractListItems(fulfilled[0]).slice(0, 8);

  // Extract company name from first response
  const companyName = extractCompanyName(fulfilled[0], domain);

  // Parse Sorgu 2: güçlü/zayıf yönler
  const strengths = extractStrengths(fulfilled[1]);
  const weaknesses = extractWeaknesses(fulfilled[1]);

  // Parse Sorgu 3a + 3b: rakipler (birleştir, deduplicate, max 10)
  const competitors3a = extractCompetitorsWithDomains(fulfilled[2]);
  const competitors3b = extractCompetitorsWithDomains(fulfilled[3]);
  const allCompetitors = [...competitors3a];
  for (const c of competitors3b) {
    // Deduplicate by name OR domain
    const isDuplicate = allCompetitors.some((existing) =>
      existing.name.toLowerCase() === c.name.toLowerCase() ||
      (existing.domain && c.domain && existing.domain === c.domain)
    );
    if (!isDuplicate) {
      allCompetitors.push(c);
    }
  }
  // Merge: same domain'e sahip entry'lerde domain olan entry'yi tercih et
  const merged = new Map<string, { name: string; domain: string | null }>();
  for (const c of allCompetitors) {
    const key = c.domain || c.name.toLowerCase();
    const existing = merged.get(key);
    if (!existing || (c.domain && !existing.domain)) {
      merged.set(key, c);
    }
  }
  const competitorEntries = filterTurkishCompetitors([...merged.values()]).slice(0, 10);

  // Parse bölgeler (Sorgu 1'den — coğrafi bölgeler, şehirler, iller)
  const serviceRegions = extractServiceRegions(fulfilled[0]);

  // Sector: already detected from phase 1
  const sector = detectedSector;

  return {
    companyName,
    businessCategories,
    competitors: competitorEntries,
    strengths,
    weaknesses,
    serviceRegions,
    sector,
    rawAnalysis: {
      firmaAnalizi: fulfilled[0],
      oneCikanAlanlar: fulfilled[1],
      dogrudan_rakipler: fulfilled[2],
      sektorel_rakipler: fulfilled[3],
    },
  };
}

/**
 * V3 Onboarding — Kişisel marka Sonar analizi (Spec E.0)
 * LinkedIn URL veya manuel giriş → Sonar ile uzmanlıklar + rakipler bulunur
 */
export async function researchOnboardingPersonal(input: {
  linkedinUrl?: string;
  name?: string;
  profession?: string;
  city?: string;
}): Promise<{
  name: string | null;
  profession: string | null;
  city: string | null;
  specialties: string[];
  competitors: Array<{ name: string }>;
  strengths: string[];
  weaknesses: string[];
  rawAnalysis: Record<string, string>;
}> {
  const queries: string[] = [];

  if (input.linkedinUrl) {
    // LinkedIn URL varsa — profil taranır
    const url = input.linkedinUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    queries.push(
      // Sorgu 1: LinkedIn profil analizi
      `${url} LinkedIn profilini analiz et. Bu kişinin adı, mesleği, uzmanlık alanları, şehri, eğitimi ve deneyimi nedir? Detaylı bilgi ver.`,
      // Sorgu 2: Dijital varlık
      `${url} sahibi hakkında internette ne bilgi var? Web sitesi, Google Business profili, sektörel dizinlerde kaydı, haberler veya röportajlar var mı?`,
      // Sorgu 3: Rakipler (aynı alanda öne çıkan Türk kişiler)
      `${url} profilindeki kişiyle aynı meslek ve şehirde çalışan TÜRKİYE'deki profesyoneller kim? ÖNEMLİ: SADECE TÜRK uzmanlar/profesyoneller. Yabancı isim KESINLIKLE YAZMA. Türkiye'de yaşayan ve çalışan 10 Türk profesyonelin isimlerini listele.`,
    );
  } else {
    // Manuel giriş — ad + meslek + şehir
    const desc = [input.name, input.profession, input.city].filter(Boolean).join(" ");
    queries.push(
      // Sorgu 1: Kişi hakkında genel bilgi
      `${desc} hakkında ne biliyorsun? Bu kişinin uzmanlık alanları, deneyimi, eğitimi nedir? Detaylı bilgi ver.`,
      // Sorgu 2: Dijital varlık
      `${desc} — bu kişinin web sitesi, LinkedIn profili, Google Business profili, sektörel dizinlerde kaydı, haber veya röportajları var mı?`,
      // Sorgu 3: Senin yerine kim (Türk rakipler)
      `${input.city || "Türkiye"}'de ${input.profession || "uzman"} alanında yapay zekanın önerebileceği en bilinen TÜRK profesyoneller kim? ÖNEMLİ: SADECE Türkiye'de yaşayan ve çalışan Türk uzmanlar. Yabancı isim KESINLIKLE YAZMA. 10 Türk uzmanın isimlerini listele.`,
    );
  }

  console.log(`[sonar-research] Running ${queries.length} personal onboarding queries...`);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));
  const fulfilled = results.map((r) => r.status === "fulfilled" ? r.value : "");

  const successCount = results.filter((r) => r.status === "fulfilled").length;
  console.log(`[sonar-research] Personal onboarding: Got ${successCount}/${queries.length} results`);

  // Parse results
  const specialties = extractListItems(fulfilled[0]).filter((item) => {
    const lower = item.toLowerCase();
    return !lower.includes("eğitim") && !lower.includes("üniversite") && item.length < 50;
  }).slice(0, 5);

  const strengths = extractStrengths(fulfilled[1]);
  const weaknesses = extractWeaknesses(fulfilled[1]);
  const competitorNames = extractListItems(fulfilled[2]).slice(0, 10);
  const competitors = competitorNames.map((name) => ({ name }));

  // Extract name/profession/city from Sonar if LinkedIn was used
  let parsedName: string | null = input.name || null;
  let parsedProfession: string | null = input.profession || null;
  let parsedCity: string | null = input.city || null;

  if (input.linkedinUrl && fulfilled[0]) {
    // Try to extract from first response
    const text = fulfilled[0];
    if (!parsedName) {
      const nameMatch = text.match(/(?:adı|ismi|Ad Soyad)[:\s]+([A-ZÇĞIİÖŞÜa-zçğıiöşü\s.]+?)(?:\s*[,.\n])/);
      if (nameMatch?.[1]) parsedName = nameMatch[1].trim();
    }
    if (!parsedProfession) {
      const profMatch = text.match(/(?:mesleği|uzmanlığı|meslek)[:\s]+([^\n,.]+)/i);
      if (profMatch?.[1]) parsedProfession = profMatch[1].trim();
    }
    if (!parsedCity) {
      const cityMatch = text.match(/(?:şehir|konum|lokasyon|yaşadığı)[:\s]+([^\n,.]+)/i);
      if (cityMatch?.[1]) parsedCity = cityMatch[1].trim();
    }
  }

  return {
    name: parsedName,
    profession: parsedProfession,
    city: parsedCity,
    specialties,
    competitors,
    strengths,
    weaknesses,
    rawAnalysis: {
      profilAnalizi: fulfilled[0],
      dijitalVarlik: fulfilled[1],
      rakipler: fulfilled[2],
    },
  };
}

/** Sonar cevabından firma adı çıkar */
function extractCompanyName(text: string, domain: string): string | null {
  // Try to find a proper name from the text
  // Strip "www." prefix and domain extensions to get clean base name
  const domainBase = domain
    .replace(/^www\./i, "")
    .replace(/\.(com|net|org|com\.tr|tr|io)$/i, "")
    .replace(/\./g, " ");

  // Look for patterns like "ISITMAX", "XYZ Firması", etc.
  const namePatterns = [
    /(?:firma(?:sı)?|şirket(?:i)?|marka(?:sı)?)\s+(?:olan\s+)?[""]?([A-ZÇĞIİÖŞÜ][A-Za-zçğıiöşü\s&.]+?)[""]?(?:\s*[,.]|\s+(?:olarak|bir|şirket|firma))/,
    new RegExp(`([A-ZÇĞIİÖŞÜ][A-ZÇĞIİÖŞÜa-zçğıiöşü\\s&.]{2,30}?)(?:\\s*\\(?\\s*(?:${domain.replace(/^www\./i, "").replace(/\./g, "\\.")}))\\)?`, "i"),
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 50) return name;
    }
  }

  // Fallback: UPPERCASE the domain base (e.g. "isitmax" → "ISITMAX")
  return domainBase.toUpperCase();
}

/** Sonar cevabından rakip isim + domain çıkar
 * Desteklenen formatlar:
 * - "1. Firma Adı - domain.com"
 * - "- Firma Adı (domain.com)"
 * - "| Firma Adı | domain.com |"  (markdown tablo)
 * - "**Firma Adı** — domain.com"
 */
export function extractCompetitorsWithDomains(text: string): Array<{ name: string; domain: string | null }> {
  const results: Array<{ name: string; domain: string | null }> = [];
  const lines = text.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    // Step 1: Pipe/tablo formatını temizle: "| Firma | domain |" → "Firma  domain"
    let cleaned = line
      .replace(/^\s*\|/, "")     // Baştaki pipe
      .replace(/\|\s*$/, "")     // Sondaki pipe
      .replace(/\|/g, " ")       // Ortadaki pipe'lar → boşluk
      .replace(/^\s*[-•*\d.)\]]+\s*/, "")  // Liste işaretleri
      .replace(/\*\*/g, "")      // Bold markdown
      .trim();

    if (!cleaned || cleaned.length < 3) continue;

    // Remove citation refs like [1][2], URL prefixes, and markdown artifacts
    cleaned = cleaned
      .replace(/\[\d+\]/g, "")
      .replace(/https?:\/\//g, "")   // Remove http:// https://
      .replace(/^www\.\s*/i, "")     // Remove leading www.
      .trim();

    if (!cleaned || cleaned.length < 3) continue;

    // Skip header/description/explanation lines (Turkish + English)
    if (/^(firma adı|firma\s*$|şirket adı|şirket\s*$|ad[ıi]\s*$|web\s*$|domain\s*$|sıra\s*$|#|---)/i.test(cleaned)) continue;
    if (/^(aşağıda|yukarıda|bunlar|şunlar|sıralama|alfabetik|arama sonuç)/i.test(cleaned)) continue;
    if (/^(tanımlanan|listelenen|belirlenen|tespit edilen|bulunan|mevcut|maalesef|ne yazık)/i.test(cleaned)) continue;
    if (/^(to help|i would|search result|however|note|information|competitive|consult|review|details|comparable)/i.test(cleaned)) continue;
    if (/^(bu |bu firmalar|gereklidir|gerekli|yeterli|sorgunuz|recommendation)/i.test(cleaned)) continue;
    // Skip lines that are clearly explanatory sentences or descriptions
    if (/^[A-Za-zÇĞIİÖŞÜçğıiöşü\s]{20,}:/.test(cleaned)) continue;

    // Step 2: Domain pattern
    const domainPattern = /([a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com\.tr|com|net|org|tr|io|co)(?:\.[a-z]{2})?)/i;

    // Skip lines that look like category/description, not firm names (too many words, no domain)
    if (cleaned.split(/\s+/).length > 6 && !domainPattern.test(cleaned)) continue;
    // Skip lines containing keywords that indicate descriptions, not company names
    if (/\b(listesi|sağlayıcıları|üreticileri|firmaları|sistemleri sağ|kabloları,)\b/i.test(cleaned) && !domainPattern.test(cleaned)) continue;
    const domainMatch = cleaned.match(domainPattern);

    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase();
      // Name = domain'den önceki kısım
      let namePart = cleaned.substring(0, cleaned.indexOf(domainMatch[0]))
        .replace(/[-–—:()[\]]+\s*$/, "")
        .trim();

      // Eğer isim boşsa domain'den türet
      if (!namePart || namePart.length < 2) {
        namePart = domain.replace(/\.(com\.tr|com|net|org|tr|io|co).*$/, "");
        namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      // Skip "www." as a name — use domain-derived name instead
      if (namePart === "www." || namePart === "www" || namePart.length < 2) {
        namePart = domain
          .replace(/^www\./, "")
          .replace(/\.(com\.tr|com|net|org|tr|io|co).*$/, "");
        namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      }

      if (namePart && namePart.length >= 2 && namePart.length < 80) {
        results.push({ name: namePart, domain });
      }
    } else {
      // Domain yok — sadece isim
      let namePart = cleaned
        .replace(/[-–—]+.*$/, "")
        .replace(/:.*$/, "")              // "Firma: açıklama" → "Firma"
        .replace(/,.*$/, "")              // "Firma, açıklama" → "Firma"
        .replace(/\s*\(.*?\)\s*/g, " ")   // Parantez içi açıklamaları kaldır
        .replace(/\[\d+\]/g, "")          // Citation refs [1][2]
        .trim();
      // Max 4 kelime — firma adı genelde kısa olur
      if (namePart.split(/\s+/).length > 4) {
        namePart = namePart.split(/\s+/).slice(0, 3).join(" ");
      }
      if (namePart && namePart.length >= 3 && namePart.length < 60) {
        // Açıklama cümlelerini atla
        if (!/^(bu|bu firmalar|bunlar|yukarıda|aşağıda|not|kaynak|türkiye|elektrikli|yerden|ısıtma|sektör)/i.test(namePart)) {
          results.push({ name: namePart, domain: null });
        }
      }
    }
  }

  return results;
}

/** Filter out obviously non-Turkish competitors */
function filterTurkishCompetitors(
  competitors: Array<{ name: string; domain: string | null }>
): Array<{ name: string; domain: string | null }> {
  // Known global/international brands to exclude (not Turkish companies)
  const globalBrands = new Set([
    // Tech giants
    'amazon', 'google', 'microsoft', 'apple', 'meta', 'facebook', 'netflix',
    'uber', 'airbnb', 'booking', 'alibaba', 'samsung', 'sony', 'lg',
    'hp', 'dell', 'ibm', 'oracle', 'sap', 'salesforce', 'adobe',
    // HVAC / Heating / Industrial
    'siemens', 'bosch', 'philips', 'daikin', 'mitsubishi', 'carrier',
    'trane', 'lennox', 'honeywell', 'schneider', 'abb', 'emerson',
    'johnson controls', 'toshiba', 'panasonic', 'whirlpool', 'electrolux',
    'danfoss', 'devi', 'raychem', 'nvent', 'nvent', 'rehau', 'uponor',
    'heimeier', 'oventrop', 'thermon', 'chromalox', 'watlow', 'heatizon',
    'warmup', 'schluter', 'frostguard', 'pentair', 'ferroli', 'vaillant',
    'viessmann', 'buderus', 'junkers', 'baxi', 'grundfos', 'wilo',
    // Retail / Consumer
    'walmart', 'ikea', 'zara', 'h&m', 'unilever', 'procter', 'nestle',
    'coca-cola', 'pepsi', 'mcdonalds', 'starbucks', 'nike', 'adidas',
    // Auto
    'bmw', 'mercedes', 'toyota', 'honda', 'ford', 'volkswagen',
    // Digital / SaaS
    'hubspot', 'mailchimp', 'shopify', 'wix', 'squarespace', 'wordpress',
    'linkedin', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest',
  ]);

  return competitors.filter((c) => {
    const nameLower = c.name.toLowerCase().trim();
    const domainLower = (c.domain || '').toLowerCase();

    // Exclude if name matches known global brand
    for (const brand of globalBrands) {
      if (nameLower.includes(brand)) return false;
    }

    // Exclude obvious non-Turkish domains
    if (domainLower && !domainLower.includes('.tr') && !domainLower.includes('.com')) {
      // .co.uk, .de, .fr, etc. are definitely not Turkish
      if (/\.(uk|de|fr|es|it|nl|jp|cn|kr|in|au|ca|ru|br|mx|se|no|dk|fi|ch|at|be|pl|cz)$/i.test(domainLower)) {
        return false;
      }
    }

    // Exclude if name is too short (likely abbreviation of global brand)
    if (nameLower.length <= 2) return false;

    // Exclude English sentences/descriptions that got parsed as names
    if (/^(to help|i would|i recommend|search result|clarification|this |the |here |these |note |please |however |for more|unfortunately)/i.test(nameLower)) return false;
    if (/^(işte |aradığınız|sağlanan|bu bilgi|bu konuda|bu tür|gereklidir|gerekli|yeterli değil|sektörel dizin|daha fazla)/i.test(nameLower)) return false;

    // Exclude if it looks like a sentence (too many words) rather than a company name
    const wordCount = nameLower.split(/\s+/).length;
    if (wordCount > 6) return false;

    return true;
  });
}

/** Detect sector from raw text */
function detectSectorFromText(text: string): string | null {
  const lower = typeof text === "string" ? text.toLowerCase() : "";
  // Sıralama önemli: Daha spesifik pattern'lar önce gelir
  const sectorPatterns = [
    { pattern: /turizm|otel|seyahat|tatil|konaklama|bungalov|pansiyon|butik otel|apart|hostel/i, label: "Turizm" },
    { pattern: /ısıtma|soğutma|klima|hvac|kombi|radyatör|yerden ısıtma/i, label: "Isıtma & Soğutma" },
    { pattern: /hukuk|avukat|hukuki|dava/i, label: "Hukuk" },
    { pattern: /sağlık|tıp|hastane|klinik|doktor/i, label: "Sağlık" },
    { pattern: /yazılım|teknoloji|bilişim|dijital/i, label: "Teknoloji" },
    { pattern: /eğitim|okul|kurs|akademi/i, label: "Eğitim" },
    { pattern: /gıda|restoran|yemek|kafe/i, label: "Gıda" },
    { pattern: /tekstil|giyim|moda|konfeksiyon/i, label: "Tekstil" },
    { pattern: /finans|banka|sigorta|yatırım/i, label: "Finans" },
    { pattern: /otomotiv|araç|oto|tamir/i, label: "Otomotiv" },
    { pattern: /güzellik|estetik|kuaför|bakım/i, label: "Güzellik & Bakım" },
    { pattern: /danışmanlık|konsültanlık|yönetim/i, label: "Danışmanlık" },
    { pattern: /lojistik|kargo|nakliyat|taşıma/i, label: "Lojistik" },
    { pattern: /emlak|gayrimenkul|konut/i, label: "Emlak" },
    { pattern: /tarım|çiftlik|hayvancılık/i, label: "Tarım" },
    { pattern: /enerji|solar|güneş|elektrik/i, label: "Enerji" },
    { pattern: /e-ticaret|marketplace|online satış/i, label: "E-Ticaret" },
    { pattern: /inşaat|müteahhit|mimar/i, label: "İnşaat" },  // En son: "yapı" kelimesi çok genel
  ];
  for (const sp of sectorPatterns) {
    if (sp.pattern.test(lower)) return sp.label;
  }
  return null;
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

// ─── Region Extraction ────────────────────────────────

/** Sonar cevabından coğrafi bölge/şehir/il bilgilerini çıkar.
 *  Business category değil, gerçek coğrafi lokasyonlar döndürür.
 */
export function extractServiceRegions(text: string): string[] {
  if (!text) return [];

  // Bilinen Türk şehirleri ve bölgeleri
  const knownRegions: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /türkiye\s*geneli/i, label: "Türkiye geneli" },
    { pattern: /tüm\s*türkiye/i, label: "Türkiye geneli" },
    { pattern: /yurt\s*geneli/i, label: "Türkiye geneli" },
    { pattern: /[iİ]stanbul/i, label: "İstanbul" },
    { pattern: /ankara/i, label: "Ankara" },
    { pattern: /[iİ]zmir/i, label: "İzmir" },
    { pattern: /antalya/i, label: "Antalya" },
    { pattern: /bursa/i, label: "Bursa" },
    { pattern: /adana/i, label: "Adana" },
    { pattern: /konya/i, label: "Konya" },
    { pattern: /gaziantep/i, label: "Gaziantep" },
    { pattern: /kayseri/i, label: "Kayseri" },
    { pattern: /mersin/i, label: "Mersin" },
    { pattern: /eskişehir/i, label: "Eskişehir" },
    { pattern: /samsun/i, label: "Samsun" },
    { pattern: /trabzon/i, label: "Trabzon" },
    { pattern: /denizli/i, label: "Denizli" },
    { pattern: /diyarbakır/i, label: "Diyarbakır" },
    { pattern: /erzurum/i, label: "Erzurum" },
    { pattern: /muğla/i, label: "Muğla" },
    { pattern: /bodrum/i, label: "Bodrum" },
    { pattern: /marmara\s*bölge/i, label: "Marmara Bölgesi" },
    { pattern: /ege\s*bölge/i, label: "Ege Bölgesi" },
    { pattern: /akdeniz\s*bölge/i, label: "Akdeniz Bölgesi" },
    { pattern: /karadeniz\s*bölge/i, label: "Karadeniz Bölgesi" },
    { pattern: /iç\s*anadolu/i, label: "İç Anadolu Bölgesi" },
    { pattern: /doğu\s*anadolu/i, label: "Doğu Anadolu Bölgesi" },
    { pattern: /güneydoğu\s*anadolu/i, label: "Güneydoğu Anadolu Bölgesi" },
    { pattern: /avrupa\s*yakası/i, label: "Avrupa Yakası" },
    { pattern: /anadolu\s*yakası/i, label: "Anadolu Yakası" },
    { pattern: /uluslararası/i, label: "Uluslararası" },
    { pattern: /yurt\s*dışı/i, label: "Yurt dışı" },
  ];

  const found = new Set<string>();
  for (const region of knownRegions) {
    if (region.pattern.test(text)) {
      found.add(region.label);
    }
  }

  // Also look for "bölge" section in the text and extract listed regions
  const bolgeIdx = text.toLowerCase().indexOf("bölge");
  const hizmetBolgeIdx = text.toLowerCase().indexOf("hizmet ver");
  const startIdx = Math.max(bolgeIdx, hizmetBolgeIdx);
  if (startIdx > -1) {
    // Grab a window around the "bölge" or "hizmet ver" keyword
    const window = text.slice(Math.max(0, startIdx - 50), startIdx + 300);
    const listItems = extractListItems(window);
    for (const item of listItems) {
      // Only include if it looks geographic (short, contains a known city/region word)
      if (item.length < 40) {
        const lower = item.toLowerCase();
        const isGeographic = knownRegions.some((r) => r.pattern.test(lower)) ||
          /il\b|şehir|bölge|geneli|yakası/i.test(lower);
        if (isGeographic) {
          found.add(item);
        }
      }
    }
  }

  // If nothing found, default to "Türkiye geneli"
  if (found.size === 0) {
    // Check if "Türkiye" is mentioned at all
    if (/türkiye/i.test(text)) {
      found.add("Türkiye geneli");
    }
  }

  return Array.from(found).slice(0, 8);
}

// ─── Helpers ──────────────────────────────────────────

function extractListItems(text: string, _hint?: string): string[] {
  const lines = text.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(\d+[\.\)]\s*|- |\* |• )/.test(trimmed)) {
      const cleaned = trimmed
        .replace(/^(\d+[\.\)]\s*|- |\* |• )/, "")
        .replace(/\*\*/g, "")          // Remove markdown bold
        .replace(/\[.*?\]/g, "")       // Remove citation refs [1][2]
        .trim();
      if (cleaned.length > 3 && cleaned.length < 200) {
        items.push(cleaned);
      }
    }
  }

  return items.slice(0, 15);
}

function extractStrengths(text: string): string[] {
  const lower = text.toLowerCase();

  // Try multiple keywords for the "strengths" section
  const strengthKeywords = ["güçlü yön", "güçlü alan", "avantaj", "öne çıkan", "güçlü"];
  let idx = -1;
  for (const kw of strengthKeywords) {
    const found = lower.indexOf(kw);
    if (found !== -1) { idx = found; break; }
  }
  if (idx === -1) return extractListItems(text).slice(0, 5);

  const afterStrengths = text.slice(idx);
  // End section at weaknesses/disadvantages heading
  const weakKeywords = ["zayıf", "dezavantaj", "geliştirilebilir", "eksik"];
  let weakIdx = -1;
  for (const kw of weakKeywords) {
    const found = afterStrengths.toLowerCase().indexOf(kw);
    if (found > 50) { // Must be at least 50 chars after strengths header
      weakIdx = weakIdx === -1 ? found : Math.min(weakIdx, found);
    }
  }
  const strengthSection = weakIdx > 0 ? afterStrengths.slice(0, weakIdx) : afterStrengths;
  return extractListItems(strengthSection).slice(0, 5);
}

function extractWeaknesses(text: string): string[] {
  const lower = text.toLowerCase();

  // Try multiple keywords for the "weaknesses" section
  const weakKeywords = ["zayıf yön", "zayıf alan", "dezavantaj", "geliştirilebilir", "zayıf"];
  let idx = -1;
  for (const kw of weakKeywords) {
    const found = lower.indexOf(kw);
    if (found !== -1) { idx = found; break; }
  }
  if (idx === -1) return [];

  const afterWeaknesses = text.slice(idx);
  // End section at next heading (a new keyword that's not about weaknesses)
  const endKeywords = ["sonuç olarak", "özetle", "sonuç:", "kaynaklar", "güçlü yön"];
  let endIdx = afterWeaknesses.length;
  for (const kw of endKeywords) {
    const found = afterWeaknesses.toLowerCase().indexOf(kw, 50);
    if (found > 0) {
      endIdx = Math.min(endIdx, found);
    }
  }
  const weakSection = afterWeaknesses.slice(0, endIdx);
  return extractListItems(weakSection).slice(0, 5);
}
