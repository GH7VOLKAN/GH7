/**
 * GH7.ai — AI Rakip Keşif Motoru
 *
 * Pipeline:
 * 1. Perplexity Sonar: Markanın gerçek nişini ve rakiplerini web'den araştır
 * 2. Claude Opus: Sonar bulgularını analiz et, AYNI ürün kategorisindeki
 *    gerçek rakipleri belirle, yapılandırılmış JSON döndür
 *
 * Kritik: "elektrikli yerden ısıtma" vs "sulu yerden ısıtma" gibi
 * alt kategori farklılıklarını doğru ayırt etmeli.
 */

import Anthropic from "@anthropic-ai/sdk";
import { querySonar, isOwnBrand, isValidCompetitorName } from "./sonar-research";

// ─── Types ───────────────────────────────────────────

interface BrandContext {
  name: string;
  domain: string;
  sector: string | null;
  city: string | null;
  type: "firma" | "kisisel";
  specialties: string[];
  competitorNames: string[];
}

export interface DiscoveredCompetitor {
  name: string;
  domain: string;
  reason: string;
  products: string[];
  relevance: "direct" | "indirect";
}

export interface DiscoveryResult {
  competitors: DiscoveredCompetitor[];
  nicheDescription: string;
}

async function researchCompetitors(brand: BrandContext): Promise<string> {
  const specialtiesStr = brand.specialties.length > 0
    ? brand.specialties.join(", ")
    : "";

  const brandDesc = [brand.name, brand.sector, specialtiesStr, brand.city]
    .filter(Boolean)
    .join(" ");

  // 2 parallel Sonar queries for breadth
  const queries = [
    // Query 1: Direct competitor search — who competes with THIS brand?
    `"${brand.name}" ${brand.domain} firmasının Türkiye'deki doğrudan rakipleri kimler? ` +
    `Bu firma ${specialtiesStr || brand.sector || ""} alanında faaliyet gösteriyor. ` +
    `Aynı ürün/hizmet kategorisinde olan firmalar, web siteleri ve ana ürünleri neler? ` +
    `Önemli: Sadece AYNI alt kategorideki firmalar (örneğin elektrikli ısıtma ile sulu ısıtma farklı kategoriler).`,

    // Query 2: Market research — who are the players in this specific niche?
    `${specialtiesStr || brand.sector || brandDesc} sektöründe Türkiye ve dünyada faaliyet gösteren firmalar hangileri? ` +
    `Her birinin web sitesi, ana ürünleri ve hangi alt kategoride olduğu nedir? ` +
    `Detaylı liste ver. Türkiye pazarındaki firmalara öncelik ver.`,
  ];

  console.log("[competitor-discoverer] Running 2 Sonar queries...");

  const results = await Promise.allSettled(
    queries.map((q) => querySonar(q)),
  );

  const texts = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter(Boolean);

  console.log(`[competitor-discoverer] Got ${texts.length}/2 Sonar results`);

  return texts.join("\n\n--- ARASTIRMA 2 ---\n\n");
}

// ─── Claude Opus Analysis ────────────────────────────

async function analyzeWithClaude(
  brand: BrandContext,
  sonarResearch: string,
): Promise<DiscoveryResult> {
  const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey, timeout: 60_000 });

  const specialtiesStr = brand.specialties.length > 0
    ? brand.specialties.join(", ")
    : "belirtilmedi";

  const prompt = `Sen GH7.ai'nin rakip analiz motorusun. Bir firmanın GERÇEK rakiplerini belirleyeceksin.

KRİTİK KURAL: Rakipler AYNI ÜRÜN KATEGORİSİNDE olmalı. Sadece benzer sektör yetmez!

ÖRNEKLER:
- ISITMAX elektrikli yerden ısıtma ve heat trace yapıyorsa:
  - YANLIŞ rakipler: Warmhaus, Rehau, Uponor, Vaillant (bunlar SULU sistem firmaları - farklı ürün kategorisi!)
  - DOĞRU rakipler: Nexans Türkiye, Devi/Danfoss elektrikli ısıtma, Ensto, Thermopads (bunlar ELEKTRİKLİ ısıtma - aynı kategori!)
- Bir avukat için rakip başka avukatlar, muhasebeciler değil.
- Bir diş kliniği için rakip başka diş klinikleri, göz merkezleri değil.

FİRMA BİLGİLERİ:
- Ad: ${brand.name}
- Domain: ${brand.domain}
- Sektör: ${brand.sector ?? "belirtilmedi"}
- Uzmanlık Alanları: ${specialtiesStr}
- Şehir: ${brand.city ?? "belirtilmedi"}
- Tip: ${brand.type}
- Kullanıcının belirttiği rakipler: ${brand.competitorNames.length > 0 ? brand.competitorNames.join(", ") : "belirtilmedi"}

WEB ARAŞTIRMA SONUÇLARI (Perplexity Sonar ile gerçek zamanlı):
${sonarResearch.slice(0, 8000)}

GÖREV:
1. Firma bilgilerini ve web araştırmasını analiz et
2. Firmanın TAM OLARAK ne yaptığını anla (hangi alt ürün kategorisi, hangi hedef pazar)
3. AYNI ürün kategorisinde GERÇEK rakipleri belirle
4. Her rakip için neden rakip olduğunu, ürünlerini ve domain'ini yaz
5. Kullanıcının belirttiği rakipleri DOĞRULA — aynı kategorideyse dahil et, farklı kategorideyse HARIÇ TUT ve nedenini açıkla

SADECE JSON döndür — başka hiçbir şey yazma:
{
  "nicheDescription": "Firmanın nişi ve alt kategorisi — 1-2 cümle detaylı açıklama. Örnek: ISITMAX elektrikli yerden ısıtma kabloları/matları, heat trace sistemleri ve endüstriyel boru ısıtma çözümleri üretiyor.",
  "competitors": [
    {
      "name": "Firma Adı",
      "domain": "firma.com veya firma.com.tr",
      "reason": "Neden bu firma doğrudan rakip — max 2 cümle, somut ürün/pazar örtüşmesini belirt",
      "products": ["ürün/hizmet1", "ürün/hizmet2", "ürün/hizmet3"],
      "relevance": "direct"
    }
  ]
}

KURALLAR:
- EN AZ 6, EN FAZLA 10 rakip döndür — kullanıcı bu listeden 3 tane seçecek.
- KALİTE > SAYI: Emin olmadığın firmayı EKLEME. 10'a ulaşmak için uydurma.
- "direct": Aynı ürün/hizmet kategorisinde doğrudan rakip (öncelik)
- "indirect": Yakın/komşu kategoride, kısmen rekabet ediyor
- Domain bulunamadıysa boş string ("") koy
- Her rakibin GERÇEKTEN aynı ürünü/hizmeti sunduğundan EMİN OL
- Türkiye pazarındaki firmalara ağırlık ver ama global markalar da dahil
- KRİTİK: ${brand.name} firmaSININ KENDİSİNİ rakip listesine KOYMA! Domain "${brand.domain}" olan firmayı ASLA listeye ekleme.
- DOĞRULAMA: Rakip firmanın web sitesinin GERÇEKTEN var olduğundan ve açılabildiğinden emin ol. Sonar araştırmasında bahsedilmeyen, uydurma veya artık mevcut olmayan firmaları EKLEME.
- KATEGORİ DOĞRULAMA: Sadece genel sektör adı (ısıtma, soğutma, yazılım) değil, SPESİFİK ürün/hizmet alt kategorisi eşleşmesi ara. Örnek: "yerden ısıtma" ile "kombi" FARKLI kategorilerdir.
- ÖNCELİK: Kullanıcının belirttiği rakipleri (eğer varsa) EN BAŞA koy ve doğrula. Sonra Sonar araştırmasından doğrulanmış olanları ekle.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (might be wrapped in ```json blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[competitor-discoverer] Could not extract JSON from Claude response");
      return { competitors: [], nicheDescription: "" };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Turkish-aware normalization for self-filter
    const normTr = (s: string) =>
      s.toLowerCase()
        .replace(/ı/g, "i").replace(/İ/g, "i")
        .replace(/ğ/g, "g").replace(/Ğ/g, "g")
        .replace(/ü/g, "u").replace(/Ü/g, "u")
        .replace(/ş/g, "s").replace(/Ş/g, "s")
        .replace(/ö/g, "o").replace(/Ö/g, "o")
        .replace(/ç/g, "c").replace(/Ç/g, "c")
        .trim();

    const brandNorm = normTr(brand.name);
    const brandDomainClean = brand.domain
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.(com|net|org|io|ai|tr|com\.tr)$/g, "")
      .trim();

    const competitors: DiscoveredCompetitor[] = (parsed.competitors ?? [])
      .slice(0, 10)
      .map((c: Record<string, unknown>) => ({
        name: String(c.name ?? ""),
        domain: String(c.domain ?? ""),
        reason: String(c.reason ?? ""),
        products: Array.isArray(c.products) ? c.products.map(String) : [],
        relevance: c.relevance === "indirect" ? "indirect" as const : "direct" as const,
      }))
      .filter((c: DiscoveredCompetitor) => c.name.length > 0)
      .filter((c: DiscoveredCompetitor) => {
        const cNorm = normTr(c.name);
        const cDomain = c.domain.toLowerCase().replace(/^www\./, "");
        // Exclude if competitor name matches brand name
        if (cNorm === brandNorm) return false;
        if (brandNorm.length > 3 && cNorm.includes(brandNorm)) return false;
        if (cNorm.length > 3 && brandNorm.includes(cNorm)) return false;
        // Exclude if competitor domain matches brand domain
        if (cDomain && cDomain === brand.domain.toLowerCase().replace(/^www\./, "")) return false;
        if (brandDomainClean.length > 3 && cNorm.includes(brandDomainClean)) return false;
        return true;
      })
      // Additional own-brand and validation filters
      .filter((c: DiscoveredCompetitor) => isValidCompetitorName(c.name))
      .filter((c: DiscoveredCompetitor) => !isOwnBrand(c.name, brand.name, brand.domain));

    return {
      competitors,
      nicheDescription: String(parsed.nicheDescription ?? ""),
    };
  } catch (err) {
    console.error("[competitor-discoverer] Claude analysis failed:", err);
    return { competitors: [], nicheDescription: "" };
  }
}

// ─── Main Export ─────────────────────────────────────

export async function discoverCompetitors(
  brand: BrandContext,
): Promise<DiscoveryResult> {
  const startTime = Date.now();
  console.log(`[competitor-discoverer] Starting discovery for "${brand.name}" (${brand.sector})`);

  // Step 1: Sonar web research
  const sonarResearch = await researchCompetitors(brand);

  if (!sonarResearch) {
    console.warn("[competitor-discoverer] No Sonar data received, skipping");
    return { competitors: [], nicheDescription: "" };
  }

  // Step 2: Claude Opus structured analysis
  const result = await analyzeWithClaude(brand, sonarResearch);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(
    `[competitor-discoverer] Done in ${elapsed}s — found ${result.competitors.length} competitors for "${brand.name}"`,
  );

  if (result.competitors.length > 0) {
    console.log("[competitor-discoverer] Niche:", result.nicheDescription);
    for (const c of result.competitors) {
      console.log(`  - ${c.name} (${c.relevance}): ${c.reason.slice(0, 80)}`);
    }
  }

  return result;
}
