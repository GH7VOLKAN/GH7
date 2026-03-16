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

  // Sorgu A: Recommendation-seeking (Spec E.2 birebir)
  const queryA = `Birisi ${businessArea} hizmeti almak istiyor ve yapay zekaya soruyor. Özellikle firma önerisi isteyen, teklif almak isteyen, güvenilir firma arayan 10 soru yaz.`;

  // Sorgu B: Location + trust (Spec E.2 birebir)
  const queryB = `Türkiye'de ${businessArea} arayan biri yapay zekaya ne sorar? Firma önerisi, marka karşılaştırma, en iyi firma sorguları. 10 soru yaz.`;

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
  const queries = [
    // Sorgu 1 (firma analizi) — Spec E.0
    `${domain} web sitesini analiz et. Bu firma ne yapıyor? Firma adı, faaliyet alanları, ürün/hizmet kategorileri, hizmet verdiği bölgeler, sektör, hedef kitle kim?`,
    // Sorgu 2 (öne çıkan alanlar) — Spec E.0
    `${domain} Google'da hangi konularda öne çıkıyor? En çok trafik alan sayfaları, güçlü olduğu alanlar, zayıf olduğu alanlar neler?`,
    // Sorgu 3a (doğrudan rakipler) — Spec E.0
    `${domain}'un Türkiye'deki doğrudan rakipleri kimler? Aynı sektörde benzer ürün/hizmet sunan firmalar. 10 firma ve web siteleri listele.`,
    // Sorgu 3b (sektörel rakipler) — Spec E.0
    `${domain} sektöründe Türkiye'de öne çıkan firmalar ve web siteleri hangileri? ${domain} hariç.`,
  ];

  console.log(`[sonar-research] Running 4 onboarding queries for domain: ${domain}...`);

  const results = await Promise.allSettled(queries.map((q) => querySonar(q)));

  const fulfilled = results.map((r) => {
    if (r.status === "fulfilled") return r.value;
    return "";
  });

  const successCount = results.filter((r) => r.status === "fulfilled").length;
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
    if (!allCompetitors.some((existing) => existing.name.toLowerCase() === c.name.toLowerCase())) {
      allCompetitors.push(c);
    }
  }
  const competitorEntries = allCompetitors.slice(0, 10);

  // Parse bölgeler (Sorgu 1'den — faaliyet bölgeleri)
  const regionText = fulfilled[0] + " " + fulfilled[3];
  const serviceRegions = extractListItems(regionText).filter((item) => {
    const lower = item.toLowerCase();
    return lower.includes("türkiye") || lower.includes("istanbul") || lower.includes("ankara") ||
      lower.includes("izmir") || lower.includes("bölge") || lower.includes("il") ||
      lower.includes("geneli") || lower.length < 30;
  }).slice(0, 5);

  // Sector detection
  const combinedText = (fulfilled[0] + " " + fulfilled[3]).toLowerCase();
  let sector: string | null = null;
  const sectorPatterns = [
    { pattern: /ısıtma|soğutma|klima|hvac|kombi|radyatör/i, label: "Isıtma & Soğutma" },
    { pattern: /hukuk|avukat|hukuki|dava/i, label: "Hukuk" },
    { pattern: /sağlık|tıp|hastane|klinik|doktor/i, label: "Sağlık" },
    { pattern: /inşaat|yapı|müteahhit|mimar/i, label: "İnşaat" },
    { pattern: /yazılım|teknoloji|bilişim|dijital/i, label: "Teknoloji" },
    { pattern: /eğitim|okul|kurs|akademi/i, label: "Eğitim" },
    { pattern: /gıda|restoran|yemek|kafe/i, label: "Gıda" },
    { pattern: /tekstil|giyim|moda|konfeksiyon/i, label: "Tekstil" },
    { pattern: /finans|banka|sigorta|yatırım/i, label: "Finans" },
    { pattern: /turizm|otel|seyahat|tatil/i, label: "Turizm" },
    { pattern: /otomotiv|araç|oto|tamir/i, label: "Otomotiv" },
    { pattern: /güzellik|estetik|kuaför|bakım/i, label: "Güzellik & Bakım" },
    { pattern: /danışmanlık|konsültanlık|yönetim/i, label: "Danışmanlık" },
    { pattern: /lojistik|kargo|nakliyat|taşıma/i, label: "Lojistik" },
    { pattern: /emlak|gayrimenkul|konut/i, label: "Emlak" },
    { pattern: /tarım|çiftlik|hayvancılık/i, label: "Tarım" },
    { pattern: /enerji|solar|güneş|elektrik/i, label: "Enerji" },
    { pattern: /e-ticaret|marketplace|online satış/i, label: "E-Ticaret" },
  ];
  for (const sp of sectorPatterns) {
    if (sp.pattern.test(combinedText)) {
      sector = sp.label;
      break;
    }
  }

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
      // Sorgu 3: Rakipler (aynı alanda öne çıkan kişiler)
      `${url} profilindeki kişiyle aynı meslek ve şehirde çalışan, yapay zeka tarafından önerilme ihtimali yüksek 10 kişi kim? İsimlerini listele.`,
    );
  } else {
    // Manuel giriş — ad + meslek + şehir
    const desc = [input.name, input.profession, input.city].filter(Boolean).join(" ");
    queries.push(
      // Sorgu 1: Kişi hakkında genel bilgi
      `${desc} hakkında ne biliyorsun? Bu kişinin uzmanlık alanları, deneyimi, eğitimi nedir? Detaylı bilgi ver.`,
      // Sorgu 2: Dijital varlık
      `${desc} — bu kişinin web sitesi, LinkedIn profili, Google Business profili, sektörel dizinlerde kaydı, haber veya röportajları var mı?`,
      // Sorgu 3: Senin yerine kim (rakipler)
      `${input.profession || "uzman"} ${input.city || "Türkiye"} alanında yapay zekanın önerebileceği en bilinen 10 kişi kim? İsimlerini listele.`,
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
  const domainBase = domain.replace(/\.(com|net|org|com\.tr|tr|io)$/i, "").replace(/\./g, " ");

  // Look for patterns like "ISITMAX", "XYZ Firması", etc.
  const namePatterns = [
    /(?:firma(?:sı)?|şirket(?:i)?|marka(?:sı)?)\s+(?:olan\s+)?[""]?([A-ZÇĞIİÖŞÜ][A-Za-zçğıiöşü\s&.]+?)[""]?(?:\s*[,.]|\s+(?:olarak|bir|şirket|firma))/,
    /([A-ZÇĞIİÖŞÜ][A-ZÇĞIİÖŞÜa-zçğıiöşü\s&.]{2,30}?)(?:\s*\(?\s*(?:${domain.replace(".", "\\.")})\)?)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 50) return name;
    }
  }

  // Fallback: capitalize domain base
  return domainBase.charAt(0).toUpperCase() + domainBase.slice(1);
}

/** Sonar cevabından rakip isim + domain çıkar */
function extractCompetitorsWithDomains(text: string): Array<{ name: string; domain: string | null }> {
  const results: Array<{ name: string; domain: string | null }> = [];
  const lines = text.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    const cleaned = line.replace(/^\s*[-•*\d.)\]]+\s*/, "").trim();
    if (!cleaned || cleaned.length < 2) continue;

    // Try to extract "Name - domain.com" or "Name (domain.com)"
    const domainPattern = /([a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|net|org|com\.tr|tr|io|co)(?:\.[a-z]{2})?)/i;
    const domainMatch = cleaned.match(domainPattern);

    if (domainMatch) {
      const domain = domainMatch[1].toLowerCase();
      // Name is everything before the domain
      const namePart = cleaned.substring(0, cleaned.indexOf(domainMatch[0])).replace(/[-–—:()]+\s*$/, "").trim();
      if (namePart && namePart.length > 1) {
        results.push({ name: namePart, domain });
      }
    } else {
      // No domain found, just use the name
      const namePart = cleaned.replace(/[-–—]+.*$/, "").trim();
      if (namePart && namePart.length > 1 && namePart.length < 80) {
        results.push({ name: namePart, domain: null });
      }
    }
  }

  return results;
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
