/**
 * Perplexity Sonar — Kisisel Marka Arastirmasi
 * Dijital iz tarama ve sektorel arama davranisi analizi
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
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

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
 * Sektorel arama davranisini analiz et
 */
export async function researchSectorBehavior(
  profession: string,
  city: string,
): Promise<SectorBehavior> {
  try {
    const prompt = `Birisi "${city}'de iyi bir ${profession} ariyorum" dese, insanlar genellikle nasil sorular sorar? Hangi kriterlere bakiyor? En cok aranan alt uzmanliklar neler? Turkce cevap ver.`;

    const raw = await querySonar(prompt);

    return {
      raw,
      commonQuestions: extractListItems(raw, "soru"),
      searchCriteria: extractListItems(raw, "kriter"),
      popularSpecialties: extractListItems(raw, "uzmanlik"),
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

/**
 * Metin icinden liste itemlerini cikar (basit heuristik)
 */
function extractListItems(text: string, _hint: string): string[] {
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

  return items.slice(0, 10);
}
