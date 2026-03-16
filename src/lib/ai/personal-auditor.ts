/**
 * GH7.ai — Kisisel Marka Auditor
 *
 * Perplexity Sonar ile 3 paralel web arastirmasi yaparak
 * kisisel markanin dijital varligini 7 kategoride denetler.
 *
 * Sonuc: AuditResult (site-auditor.ts ile ayni interface)
 * Her kategori 1 check: pass(10) / partial(5) / fail(0)
 * Toplam max: 70 → readinessScore = (earned/70)*100
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult, AuditCategoryResult, AuditCheckResult } from "./site-auditor";

// ─── Types ─────────────────────────────────────────────

interface PersonalBrandInfo {
  name: string;
  domain: string;
  profession: string | null;
  city: string | null;
  sector: string | null;
  specialties: string[];
}

interface SonarAuditData {
  digitalPresence: string;
  thirdPartyContent: string;
  googleSocial: string;
}

// ─── Sonar Queries ─────────────────────────────────────

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
    }),
  });

  if (!res.ok) {
    throw new Error(`Perplexity API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * 3 paralel Sonar sorgusu ile kisisel markanin dijital varligini tara
 */
async function gatherSonarData(brand: PersonalBrandInfo): Promise<SonarAuditData> {
  const personDesc = [
    brand.name,
    brand.profession,
    brand.city,
  ].filter(Boolean).join(" ");

  const specialtiesStr = brand.specialties.length > 0
    ? brand.specialties.join(", ")
    : brand.profession ?? "";

  // 3 paralel sorgu
  const [digitalPresence, thirdPartyContent, googleSocial] = await Promise.all([
    // Sorgu 1: Dijital varlik (LinkedIn, website, GBP, dizinler)
    querySonar(
      `"${brand.name}" ${brand.profession ?? ""} ${brand.city ?? ""} hakkinda detayli arastirma yap. ` +
      `Bu kisinin LinkedIn profili var mi? Kisisel web sitesi var mi (domain: ${brand.domain})? ` +
      `Google Business Profile veya Google Maps kaydi var mi? ` +
      `Sektorel dizinlerde (doktortakvimi, avukatara, sikayetvar vb.) kayitli mi? ` +
      `Her birini ayri ayri belirt.`
    ).catch(() => ""),

    // Sorgu 2: Ucuncu taraf icerik (haberler, roportajlar, makaleler)
    querySonar(
      `"${brand.name}" ${brand.profession ?? ""} hakkinda ucuncu taraf icerikler var mi? ` +
      `Haber siteleri, dergi roportajlari, blog yazilari, podcast katilimlari, ` +
      `konferans konusmalari veya akademik yayinlari var mi? ` +
      `${specialtiesStr} alaninda otorite olarak gosterilmis mi? Detayli bilgi ver.`
    ).catch(() => ""),

    // Sorgu 3: Google ve sosyal medya gorunumu
    querySonar(
      `"${brand.name}" ${brand.profession ?? ""} ${brand.city ?? ""} arandiginda ne cikiyor? ` +
      `Google arama sonuclarinda gorunur mu? ` +
      `Twitter/X, Instagram, YouTube, Facebook, TikTok gibi sosyal medya platformlarinda ` +
      `aktif profilleri var mi? ` +
      `Sosyal medyada etkilesim aliyor mu? Detayli bilgi ver.`
    ).catch(() => ""),
  ]);

  return { digitalPresence, thirdPartyContent, googleSocial };
}

// ─── Claude Haiku Analysis ─────────────────────────────

/**
 * Sonar verilerini Claude Haiku ile 7 kategoride analiz et
 */
async function analyzeWithClaude(
  brand: PersonalBrandInfo,
  sonarData: SonarAuditData,
): Promise<AuditCategoryResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key not configured");

  const client = new Anthropic({ apiKey });

  const prompt = `Sen GH7.ai'nin kisisel marka denetim motorusun. Asagidaki web arastirma verilerini analiz ederek kisinin dijital varligini 7 kategoride degerlendir.

KISI BILGILERI:
- Ad Soyad: ${brand.name}
- Meslek: ${brand.profession ?? "belirtilmedi"}
- Sehir: ${brand.city ?? "belirtilmedi"}
- Alan: ${brand.sector ?? "belirtilmedi"}
- Uzmanliklar: ${brand.specialties.join(", ") || "belirtilmedi"}
- Domain: ${brand.domain}

WEB ARASTIRMA VERILERI:

--- Dijital Varlik Taramasi ---
${sonarData.digitalPresence.slice(0, 2000) || "Veri bulunamadi"}

--- Ucuncu Taraf Icerik ---
${sonarData.thirdPartyContent.slice(0, 2000) || "Veri bulunamadi"}

--- Google ve Sosyal Medya ---
${sonarData.googleSocial.slice(0, 2000) || "Veri bulunamadi"}

KURALLAR:
1. Her kategori icin status belirle: "pass" (varlik mevcut ve aktif), "partial" (kismen mevcut), "fail" (bulunamadi)
2. Her kategori icin kisa bir detail (tespit) ve recommendation (onerilen aksiyon) yaz
3. raasEligible: GH7.ai ekibinin bu isi musteri adina yapip yapamayacagi (true/false)
4. Eger Sonar verilerinde bilgi yoksa veya belirsizse, "fail" ver — abartma yapma

JSON formatinda dondur — baska hicbir sey yazma:
[
  {
    "category": "LinkedIn Profili",
    "check": "Aktif LinkedIn Profili",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  },
  {
    "category": "Kişisel Web Sitesi",
    "check": "Kişisel Web Sitesi",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  },
  {
    "category": "Google Business",
    "check": "Google Business Profile",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  },
  {
    "category": "Sektörel Dizinler",
    "check": "Sektörel Dizin Kayıtları",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  },
  {
    "category": "Üçüncü Taraf İçerik",
    "check": "Haber ve Röportajlar",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  },
  {
    "category": "Google Arama Sonuçları",
    "check": "Google Arama Görünürlüğü",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": false
  },
  {
    "category": "Sosyal Medya",
    "check": "Aktif Sosyal Medya Profilleri",
    "status": "pass|partial|fail",
    "detail": "tespit metni",
    "recommendation": "oneri metni veya null",
    "raasEligible": true/false
  }
]`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

    const parsed: Array<{
      category: string;
      check: string;
      status: "pass" | "partial" | "fail";
      detail: string;
      recommendation: string | null;
      raasEligible: boolean;
    }> = JSON.parse(jsonStr);

    // Her parsed item'i AuditCategoryResult formatina donustur
    return parsed.map((item) => {
      const score = item.status === "pass" ? 10 : item.status === "partial" ? 5 : 0;
      const checkResult: AuditCheckResult = {
        label: item.check,
        status: item.status,
        score,
        detail: item.detail,
        recommendation: item.recommendation,
        raasEligible: item.raasEligible,
      };

      return {
        name: item.category,
        checks: [checkResult],
      } as AuditCategoryResult;
    });
  } catch (err) {
    console.error("[personal-auditor] Claude analysis failed:", err);
    return getFailedCategories();
  }
}

// ─── Fallback ──────────────────────────────────────────

function getFailedCategories(): AuditCategoryResult[] {
  const categories = [
    { name: "LinkedIn Profili", check: "Aktif LinkedIn Profili" },
    { name: "Kişisel Web Sitesi", check: "Kişisel Web Sitesi" },
    { name: "Google Business", check: "Google Business Profile" },
    { name: "Sektörel Dizinler", check: "Sektörel Dizin Kayıtları" },
    { name: "Üçüncü Taraf İçerik", check: "Haber ve Röportajlar" },
    { name: "Google Arama Sonuçları", check: "Google Arama Görünürlüğü" },
    { name: "Sosyal Medya", check: "Aktif Sosyal Medya Profilleri" },
  ];

  return categories.map((cat) => ({
    name: cat.name,
    checks: [
      {
        label: cat.check,
        status: "fail" as const,
        score: 0,
        detail: "Analiz tamamlanamadı — veri bulunamadı.",
        recommendation: "Dijital varlığınızı oluşturmak için bu alanda aksiyon alın.",
        raasEligible: false,
      },
    ],
  }));
}

// ─── Main Export ────────────────────────────────────────

/**
 * Kisisel marka auditi calistir
 * 1. 3 Sonar sorgusu paralel (dijital varlik, ucuncu taraf, Google/sosyal)
 * 2. Claude Haiku ile 7 kategori analizi
 * 3. AuditResult donusu (site-auditor.ts uyumlu)
 */
export async function runPersonalAudit(brand: PersonalBrandInfo): Promise<AuditResult> {
  try {
    // Sonar verileri topla
    const sonarData = await gatherSonarData(brand);

    // Hic veri gelemediyse direkt fail dondur
    if (!sonarData.digitalPresence && !sonarData.thirdPartyContent && !sonarData.googleSocial) {
      console.warn("[personal-auditor] No Sonar data received, returning all fail");
      return { categories: getFailedCategories() };
    }

    // Claude ile analiz
    const categories = await analyzeWithClaude(brand, sonarData);

    // 7 kategori gelmemisse fallback ile tamamla
    if (categories.length < 7) {
      const fallback = getFailedCategories();
      const existingNames = new Set(categories.map((c) => c.name));
      for (const fb of fallback) {
        if (!existingNames.has(fb.name)) {
          categories.push(fb);
        }
      }
    }

    return { categories };
  } catch (err) {
    console.error("[personal-auditor] Fatal error:", err);
    return { categories: getFailedCategories() };
  }
}
