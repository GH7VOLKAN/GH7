import Anthropic from "@anthropic-ai/sdk";
import { querySonar } from "./sonar-research";
import { withCache, cacheKeys } from "@/lib/cache";

export interface AuditCheckResult {
  label: string;
  status: "pass" | "fail" | "partial";
  score: number; // 0, 5, or 10
  detail: string;
  recommendation: string | null;
  raasEligible: boolean;
}

export interface AuditCategoryResult {
  name: string;
  checks: AuditCheckResult[];
}

export interface SonarWebPresence {
  hasGoogleBusiness: boolean;
  directories: string[];
  thirdPartyContent: string[];
  sonarSummary: string;
}

export interface OpusAnalysis {
  overallScore: number;
  summary: string;
  topPriority: string[];
  strengths: string[];
  weaknesses: string[];
  checkDetails: Array<{
    label: string;
    status: "PASS" | "WARNING" | "FAIL";
    explanation: string;
    recommendation: string;
  }>;
}

export interface AuditResult {
  categories: AuditCategoryResult[];
  sonarWebPresence?: SonarWebPresence;
  opusAnalysis?: OpusAnalysis;
}

function normalizeDomain(raw: string): string {
  let d = raw.trim();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.replace(/\/+$/, "");
  return d;
}

async function safeFetch(
  url: string,
): Promise<{ ok: boolean; text: string; status: number }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GH7Bot/1.0; +https://gh7.ai)",
      },
      redirect: "follow",
    });
    const text = await res.text();
    return { ok: res.ok, text, status: res.status };
  } catch (err) {
    console.error(`[site-auditor] safeFetch failed for ${url}:`, err instanceof Error ? err.message : err);
    return { ok: false, text: "", status: 0 };
  }
}

function check(
  label: string,
  status: "pass" | "fail" | "partial",
  detail: string,
  recommendation: string | null,
  raasEligible = false,
): AuditCheckResult {
  const score = status === "pass" ? 10 : status === "partial" ? 5 : 0;
  return { label, status, score, detail, recommendation, raasEligible };
}

function checkJsonLd(
  html: string,
  type: string,
  label: string,
  raasEligible: boolean,
): AuditCheckResult {
  const typeLabels: Record<string, string> = {
    Product: "ürün tanıtım",
    Organization: "kurum tanıtım",
    FAQPage: "sıkça sorulan sorular",
    BreadcrumbList: "sayfa yol haritası",
  };
  const turkishType = typeLabels[type] ?? type;
  const regex = new RegExp(`"@type"\\s*:\\s*"${type}"`, "i");
  if (regex.test(html)) {
    return check(label, "pass", `${label} verisi bulundu.`, null, raasEligible);
  }
  return check(
    label,
    "fail",
    `${label} verisi bulunamadı.`,
    `Sayfanıza ${turkishType} bilgisi ekleyin — yapay zekalar bu bilgileri kullanarak sizi daha iyi tanır.`,
    raasEligible,
  );
}

function checkStructuredData(html: string): AuditCategoryResult {
  return {
    name: "Yapılandırılmış Veri",
    checks: [
      checkJsonLd(html, "Product", "Ürün Tanıtım Bilgisi", true),
      checkJsonLd(html, "Organization", "Kurum Tanıtım Bilgisi", false),
      checkJsonLd(html, "FAQPage", "Sıkça Sorulan Sorular Bilgisi", true),
      checkJsonLd(html, "BreadcrumbList", "Sayfa Yol Haritası", true),
    ],
  };
}

function checkContent(html: string): AuditCategoryResult {
  const checks: AuditCheckResult[] = [];

  // Meta description
  const metaMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
  ) ?? html.match(
    /<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i,
  );
  if (metaMatch) {
    const len = metaMatch[1].length;
    if (len >= 50 && len <= 160) {
      checks.push(
        check("Meta Açıklaması", "pass", `Meta açıklaması bulundu (${len} karakter).`, null),
      );
    } else {
      checks.push(
        check(
          "Meta Açıklaması",
          "partial",
          `Meta açıklaması ${len} karakter (ideal: 50-160).`,
          "Meta açıklamasını 50-160 karakter arasında tutun.",
        ),
      );
    }
  } else {
    checks.push(
      check(
        "Meta Açıklaması",
        "fail",
        "Meta açıklaması bulunamadı.",
        "Sayfanıza description meta etiketi ekleyin.",
      ),
    );
  }

  // H1 count
  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches?.length ?? 0;
  if (h1Count === 1) {
    checks.push(check("Başlık Hiyerarşisi (H1)", "pass", "Tek H1 etiketi bulundu.", null));
  } else if (h1Count > 1) {
    checks.push(
      check(
        "Başlık Hiyerarşisi (H1)",
        "partial",
        `${h1Count} adet H1 etiketi bulundu.`,
        "Sayfada yalnızca 1 adet H1 etiketi kullanın.",
      ),
    );
  } else {
    checks.push(
      check(
        "Başlık Hiyerarşisi (H1)",
        "fail",
        "H1 etiketi bulunamadı.",
        "Sayfanıza ana başlık olarak bir H1 etiketi ekleyin.",
      ),
    );
  }

  // Word count
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch
    ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 300) {
    checks.push(
      check("Kelime Sayısı", "pass", `${wordCount} kelime bulundu.`, null),
    );
  } else if (wordCount >= 100) {
    checks.push(
      check(
        "Kelime Sayısı",
        "partial",
        `${wordCount} kelime bulundu (ideal: 300+).`,
        "Sayfanızdaki içerik miktarını artırın (en az 300 kelime).",
      ),
    );
  } else {
    checks.push(
      check(
        "Kelime Sayısı",
        "fail",
        `Yalnızca ${wordCount} kelime bulundu.`,
        "Sayfanıza daha fazla özgün içerik ekleyin (en az 300 kelime).",
      ),
    );
  }

  return { name: "İçerik", checks };
}

async function checkTechnical(
  domain: string,
  html: string,
): Promise<{ category: AuditCategoryResult; robotsText: string }> {
  const checks: AuditCheckResult[] = [];

  // HTTPS
  const httpsRes = await safeFetch(`https://${domain}`);
  checks.push(
    httpsRes.ok
      ? check("HTTPS", "pass", "Site HTTPS üzerinden erişilebilir.", null)
      : check(
          "HTTPS",
          "fail",
          "Site HTTPS üzerinden erişilemiyor.",
          "SSL sertifikası ekleyerek HTTPS'yi etkinleştirin.",
        ),
  );

  // Canonical URL
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  checks.push(
    canonicalMatch
      ? check("Canonical URL", "pass", "Canonical URL etiketi bulundu.", null)
      : check(
          "Canonical URL",
          "fail",
          "Canonical URL etiketi bulunamadı.",
          'Sayfanıza <link rel="canonical"> etiketi ekleyin.',
          true,
        ),
  );

  // robots.txt
  const robotsRes = await safeFetch(`https://${domain}/robots.txt`);
  checks.push(
    robotsRes.ok
      ? check("robots.txt", "pass", "robots.txt dosyası bulundu.", null)
      : check(
          "robots.txt",
          "fail",
          "robots.txt dosyası bulunamadı.",
          "Site kök dizinine robots.txt dosyası ekleyin.",
          true,
        ),
  );

  // sitemap.xml
  const sitemapRes = await safeFetch(`https://${domain}/sitemap.xml`);
  const hasSitemapInRobots = robotsRes.text
    .toLowerCase()
    .includes("sitemap:");
  checks.push(
    sitemapRes.ok || hasSitemapInRobots
      ? check("sitemap.xml", "pass", "Sitemap bulundu.", null)
      : check(
          "sitemap.xml",
          "fail",
          "sitemap.xml bulunamadı.",
          "XML sitemap oluşturun ve robots.txt'ye ekleyin.",
          true,
        ),
  );

  return { category: { name: "Teknik", checks }, robotsText: robotsRes.text };
}

function checkExternalPlatforms(html: string): AuditCategoryResult {
  const checks: AuditCheckResult[] = [];

  // Social media links
  const socialPatterns = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "twitter.com",
    "x.com",
    "youtube.com",
  ];
  const foundSocials = socialPatterns.filter((p) =>
    html.toLowerCase().includes(p),
  );
  if (foundSocials.length >= 3) {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "pass",
        `${foundSocials.length} sosyal medya linki bulundu.`,
        null,
      ),
    );
  } else if (foundSocials.length >= 1) {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "partial",
        `Yalnızca ${foundSocials.length} sosyal medya linki bulundu.`,
        "Daha fazla sosyal medya profil linki ekleyin (en az 3).",
      ),
    );
  } else {
    checks.push(
      check(
        "Sosyal Medya Linkleri",
        "fail",
        "Sosyal medya linki bulunamadı.",
        "Sayfanıza sosyal medya profil linklerinizi ekleyin.",
      ),
    );
  }

  // Google Business indicators
  const gbpPatterns = [
    "maps.google",
    "google.com/maps",
    "goo.gl/maps",
    '"LocalBusiness"',
    '"@type":"LocalBusiness"',
  ];
  const hasGbp = gbpPatterns.some((p) => html.toLowerCase().includes(p.toLowerCase()));
  checks.push(
    hasGbp
      ? check(
          "Google Business Göstergeleri",
          "pass",
          "Google Maps veya LocalBusiness verisi bulundu.",
          null,
        )
      : check(
          "Google Business Göstergeleri",
          "fail",
          "Google Business göstergesi bulunamadı.",
          "Google Haritalar linki veya LocalBusiness yapılandırılmış verisi ekleyin.",
        ),
  );

  return { name: "Dış Platform", checks };
}

async function checkAIAccess(
  domain: string,
  html: string,
  robotsText: string,
): Promise<AuditCategoryResult> {
  const checks: AuditCheckResult[] = [];

  // 1. llms.txt check
  const llmsRes = await safeFetch(`https://${domain}/llms.txt`);
  checks.push(
    llmsRes.ok
      ? check("llms.txt", "pass", "llms.txt dosyası bulundu.", null)
      : check(
          "llms.txt",
          "fail",
          "llms.txt dosyası bulunamadı.",
          "Sitenize llms.txt dosyasi ekleyin. Bu dosya yapay zekalarin sitenizi daha iyi anlamasini saglar.",
        ),
  );

  // 2. AI Crawler check in robots.txt
  const aiCrawlers = ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot"];
  const lines = robotsText.split("\n").map((l) => l.trim());

  let currentUserAgent = "";
  const blockedAgents = new Set<string>();

  for (const line of lines) {
    const uaMatch = line.match(/^user-agent:\s*(.+)/i);
    if (uaMatch) {
      currentUserAgent = uaMatch[1].trim().toLowerCase();
      continue;
    }
    const disallowMatch = line.match(/^disallow:\s*\/\s*$/i);
    if (disallowMatch) {
      if (currentUserAgent === "*") {
        // Wildcard block — applies to all unless overridden
        for (const crawler of aiCrawlers) {
          blockedAgents.add(crawler.toLowerCase());
        }
      } else {
        blockedAgents.add(currentUserAgent);
      }
    }
  }

  const allowedCrawlers = aiCrawlers.filter(
    (c) => !blockedAgents.has(c.toLowerCase()),
  );

  if (allowedCrawlers.length === aiCrawlers.length && robotsText.length > 0) {
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "pass",
        `Tüm yapay zeka botlarına erişim açık (${aiCrawlers.join(", ")}).`,
        null,
      ),
    );
  } else if (allowedCrawlers.length > 0 && allowedCrawlers.length < aiCrawlers.length) {
    const blocked = aiCrawlers.filter((c) => blockedAgents.has(c.toLowerCase()));
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "partial",
        `Bazı yapay zeka botları engelleniyor: ${blocked.join(", ")}.`,
        "robots.txt dosyanizda yapay zeka botlarina (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) erisim izni verin.",
      ),
    );
  } else {
    checks.push(
      check(
        "Yapay Zeka Bot Erişimi",
        "fail",
        robotsText.length === 0
          ? "robots.txt bulunamadı, yapay zeka bot erişimi belirlenemedi."
          : "Tüm yapay zeka botları engelleniyor.",
        "robots.txt dosyanizda yapay zeka botlarina (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) erisim izni verin.",
      ),
    );
  }

  // 3. Open Graph / Social Preview check
  const hasOgTitle = /<meta\s[^>]*property=["']og:title["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:title["'][^>]*>/i.test(html);
  const hasOgDesc = /<meta\s[^>]*property=["']og:description["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:description["'][^>]*>/i.test(html);
  const hasOgImage = /<meta\s[^>]*property=["']og:image["'][^>]*>/i.test(html) ||
    /<meta\s[^>]*content=["'][^"']*["']\s[^>]*property=["']og:image["'][^>]*>/i.test(html);

  const ogCount = [hasOgTitle, hasOgDesc, hasOgImage].filter(Boolean).length;
  const ogMissing: string[] = [];
  if (!hasOgTitle) ogMissing.push("og:title");
  if (!hasOgDesc) ogMissing.push("og:description");
  if (!hasOgImage) ogMissing.push("og:image");

  if (ogCount === 3) {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "pass",
        "Tüm Open Graph etiketleri bulundu (og:title, og:description, og:image).",
        null,
      ),
    );
  } else if (ogCount >= 1) {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "partial",
        `Eksik Open Graph etiketleri: ${ogMissing.join(", ")}.`,
        "Sayfaniza Open Graph etiketleri (og:title, og:description, og:image) ekleyin. Yapay zekalar bu bilgileri kullanir.",
      ),
    );
  } else {
    checks.push(
      check(
        "Open Graph Etiketleri",
        "fail",
        "Open Graph etiketleri bulunamadı.",
        "Sayfaniza Open Graph etiketleri (og:title, og:description, og:image) ekleyin. Yapay zekalar bu bilgileri kullanir.",
      ),
    );
  }

  return { name: "Yapay Zeka Erişimi", checks };
}

/**
 * Google PageSpeed Insights API (ücretsiz) — performans + SEO skorları.
 */
async function checkPerformance(domain: string): Promise<AuditCategoryResult> {
  const checks: AuditCheckResult[] = [];

  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : "";
    const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${domain}&strategy=mobile&category=performance&category=seo${keyParam}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pageSpeedData } = await withCache<any>(
      cacheKeys.pageSpeed(domain),
      24 * 60 * 60, // 24 hours
      async () => {
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error(`PageSpeed HTTP ${res.status}`);
        return res.json();
      },
    );

    const data = pageSpeedData;
    const lighthouse = data.lighthouseResult;

    // Performance score
    const perfScore = Math.round((lighthouse?.categories?.performance?.score ?? 0) * 100);
    checks.push(
      check(
        "Sayfa Performansı",
        perfScore >= 70 ? "pass" : perfScore >= 40 ? "partial" : "fail",
        `Mobil performans puanı: ${perfScore}/100.`,
        perfScore < 70 ? "Sayfanızın yüklenme hızını artırın. Görselleri sıkıştırın ve gereksiz kodları temizleyin." : null,
        true,
      ),
    );

    // SEO score
    const seoScore = Math.round((lighthouse?.categories?.seo?.score ?? 0) * 100);
    checks.push(
      check(
        "Teknik Erişilebilirlik",
        seoScore >= 80 ? "pass" : seoScore >= 50 ? "partial" : "fail",
        `Teknik erişilebilirlik puanı: ${seoScore}/100.`,
        seoScore < 80 ? "Sayfanızın arama motorları ve yapay zekalar tarafından okunabilirliğini artırın." : null,
      ),
    );

    // LCP (Largest Contentful Paint)
    const lcpMs = lighthouse?.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
    const lcpSec = (lcpMs / 1000).toFixed(1);
    checks.push(
      check(
        "Sayfa Açılış Hızı",
        lcpMs <= 2500 ? "pass" : lcpMs <= 4000 ? "partial" : "fail",
        `Sayfanız ${lcpSec} saniyede açılıyor.`,
        lcpMs > 2500 ? "Sayfanızın 2.5 saniye altında açılmasını hedefleyin." : null,
      ),
    );

    // CLS (Cumulative Layout Shift)
    const cls = lighthouse?.audits?.["cumulative-layout-shift"]?.numericValue ?? 0;
    checks.push(
      check(
        "Görsel Kararlılık",
        cls <= 0.1 ? "pass" : cls <= 0.25 ? "partial" : "fail",
        `Sayfa kayma puanı: ${cls.toFixed(3)} (ideal: 0.1 altı).`,
        cls > 0.1 ? "Sayfadaki görseller ve reklamlar yer değiştirmeye neden oluyor. Boyutlarını belirtin." : null,
      ),
    );

    // Mobile usability
    const mobileOk = lighthouse?.categories?.performance?.score >= 0.5;
    checks.push(
      check(
        "Mobil Uyumluluk",
        mobileOk ? "pass" : "partial",
        mobileOk ? "Site mobil cihazlarda iyi çalışıyor." : "Mobil uyumluluk iyileştirilebilir.",
        mobileOk ? null : "Sitenizin mobil deneyimini iyileştirin.",
      ),
    );
  } catch (err) {
    console.error("[site-auditor] PageSpeed check failed:", err);
    checks.push(
      check(
        "Sayfa Performansı",
        "partial",
        "Performans testi şu an yapılamadı.",
        "Bir sonraki kontrolde tekrar denenecek.",
      ),
    );
  }

  return { name: "Performans", checks };
}

/**
 * Layer 3: Perplexity Sonar — Web varlığı kontrolü.
 * Google Business, dizinler, üçüncü taraf içerik tarar.
 */
async function checkWebPresence(domain: string): Promise<SonarWebPresence> {
  try {
    const sonarSummary = await querySonar(
      `${domain} web sitesi hakkında bilgi ver. Google Business profili var mı? ` +
      `Hangi dizinlerde kayıtlı? Hakkında üçüncü taraf içerik (haber, röportaj) var mı?`
    );

    const lower = sonarSummary.toLowerCase();

    // Google Business detection
    const hasGoogleBusiness =
      (lower.includes("google") && (lower.includes("business") || lower.includes("maps") || lower.includes("işletme") || lower.includes("isletme"))) ||
      lower.includes("google my business") ||
      lower.includes("google haritalar");

    // Directory detection
    const directoryPatterns = [
      { pattern: /sikayetvar|şikayetvar/i, name: "ŞikayetVar" },
      { pattern: /ekşi sözlük|eksisozluk/i, name: "Ekşi Sözlük" },
      { pattern: /sahibinden/i, name: "Sahibinden" },
      { pattern: /n11/i, name: "N11" },
      { pattern: /hepsiburada/i, name: "Hepsiburada" },
      { pattern: /trendyol/i, name: "Trendyol" },
      { pattern: /yelp/i, name: "Yelp" },
      { pattern: /foursquare/i, name: "Foursquare" },
      { pattern: /tripadvisor/i, name: "TripAdvisor" },
      { pattern: /doktortakvimi/i, name: "DoktorTakvimi" },
      { pattern: /avukatara/i, name: "AvukatAra" },
      { pattern: /bulmaca/i, name: "Bulmaca" },
      { pattern: /enuygun/i, name: "EnUygun" },
      { pattern: /gelbeseiten|yellow\s*pages|sarı\s*sayfalar/i, name: "Sarı Sayfalar" },
      { pattern: /sektorel dizin|sektörel dizin|firma rehberi/i, name: "Sektörel Dizin" },
    ];
    const directories: string[] = [];
    for (const dp of directoryPatterns) {
      if (dp.pattern.test(sonarSummary)) {
        directories.push(dp.name);
      }
    }

    // Third party content detection
    const thirdPartyContent: string[] = [];
    const thirdPartyPatterns = [
      { pattern: /haber|news|gazete/i, label: "Haber" },
      { pattern: /röportaj|roportaj|interview|mülakat/i, label: "Röportaj" },
      { pattern: /makale|article|blog\s*yazı/i, label: "Makale" },
      { pattern: /podcast/i, label: "Podcast" },
      { pattern: /konferans|conference|summit|etkinlik/i, label: "Konferans" },
      { pattern: /akademik|yayın|araştırma|research/i, label: "Akademik Yayın" },
      { pattern: /ödül|award|başarı/i, label: "Ödül/Başarı" },
      { pattern: /youtube|video/i, label: "Video İçerik" },
    ];
    for (const tp of thirdPartyPatterns) {
      if (tp.pattern.test(sonarSummary)) {
        thirdPartyContent.push(tp.label);
      }
    }

    return { hasGoogleBusiness, directories, thirdPartyContent, sonarSummary };
  } catch (err) {
    console.error("[site-auditor] Layer 3 (Sonar web presence) failed:", err);
    return {
      hasGoogleBusiness: false,
      directories: [],
      thirdPartyContent: [],
      sonarSummary: "",
    };
  }
}

/**
 * Layer 4: Claude Opus — Tüm audit verilerini sentezle ve 0-100 skor ver.
 */
async function analyzeWithOpus(
  domain: string,
  categories: AuditCategoryResult[],
  sonarWebPresence: SonarWebPresence,
): Promise<OpusAnalysis | null> {
  try {
    const apiKey = process.env.GH7_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[site-auditor] Layer 4: Anthropic API key not configured");
      return null;
    }

    const client = new Anthropic({ apiKey, timeout: 60_000 });

    // Format layer 1+2 results for the prompt
    const httpChecksText = categories
      .map((cat) => {
        const checksStr = cat.checks
          .map((c) => `  - ${c.label}: ${c.status.toUpperCase()} — ${c.detail}`)
          .join("\n");
        return `[${cat.name}]\n${checksStr}`;
      })
      .join("\n\n");

    // Format Sonar results
    const sonarText = sonarWebPresence.sonarSummary
      ? `Google Business: ${sonarWebPresence.hasGoogleBusiness ? "EVET" : "HAYIR"}
Dizinler: ${sonarWebPresence.directories.length > 0 ? sonarWebPresence.directories.join(", ") : "Bulunamadı"}
Üçüncü Taraf İçerik: ${sonarWebPresence.thirdPartyContent.length > 0 ? sonarWebPresence.thirdPartyContent.join(", ") : "Bulunamadı"}
Sonar Özeti: ${sonarWebPresence.sonarSummary.slice(0, 2000)}`
      : "Sonar verisi alınamadı";

    const prompt = `Sen GH7.ai'nin site audit uzmanısın.

SİTE: ${domain}
HTTP KONTROLLER:
${httpChecksText}

WEB VARLIĞI:
${sonarText}

Tüm verileri analiz et ve 0-100 arası bir 'Yapay Zeka Hazırlık Skoru' ver.

Her kontrol için:
- Durum: PASS / WARNING / FAIL
- Açıklama (doktor abi dili, teknik terim yok)
- Öneri (ne yapılmalı)

Ayrıca:
- overallScore: 0-100
- summary: 2-3 cümle genel değerlendirme
- topPriority: en önemli 3 aksiyon
- strengths: güçlü yanlar
- weaknesses: zayıf yanlar

SADECE JSON döndür — başka hiçbir şey yazma:
{
  "overallScore": 0-100,
  "summary": "2-3 cümle genel değerlendirme",
  "topPriority": ["aksiyon 1", "aksiyon 2", "aksiyon 3"],
  "strengths": ["güçlü yan 1", "güçlü yan 2"],
  "weaknesses": ["zayıf yan 1", "zayıf yan 2"],
  "checkDetails": [
    {
      "label": "kontrol adı",
      "status": "PASS|WARNING|FAIL",
      "explanation": "açıklama",
      "recommendation": "öneri"
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[site-auditor] Layer 4: Could not extract JSON from Opus response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      overallScore: Math.min(100, Math.max(0, Number(parsed.overallScore) || 0)),
      summary: String(parsed.summary ?? ""),
      topPriority: Array.isArray(parsed.topPriority) ? parsed.topPriority.map(String).slice(0, 5) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 5) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String).slice(0, 5) : [],
      checkDetails: Array.isArray(parsed.checkDetails)
        ? parsed.checkDetails.map((d: Record<string, unknown>) => ({
            label: String(d.label ?? ""),
            status: (["PASS", "WARNING", "FAIL"].includes(String(d.status)) ? String(d.status) : "WARNING") as "PASS" | "WARNING" | "FAIL",
            explanation: String(d.explanation ?? ""),
            recommendation: String(d.recommendation ?? ""),
          })).slice(0, 30)
        : [],
    };
  } catch (err) {
    console.error("[site-auditor] Layer 4 (Opus analysis) failed:", err);
    return null;
  }
}

export async function runSiteAudit(rawDomain: string): Promise<AuditResult> {
  const domain = normalizeDomain(rawDomain);
  console.log(`[site-auditor] Starting audit for "${domain}" (raw: "${rawDomain}")`);

  // Try HTTPS first, then fall back to HTTP
  let homeRes = await safeFetch(`https://${domain}`);
  if (!homeRes.ok) {
    console.log(`[site-auditor] HTTPS failed (${homeRes.status}), trying HTTP...`);
    homeRes = await safeFetch(`http://${domain}`);
  }
  // Also try with www. prefix if bare domain failed
  if (!homeRes.ok && !domain.startsWith("www.")) {
    console.log(`[site-auditor] Trying with www. prefix...`);
    homeRes = await safeFetch(`https://www.${domain}`);
    if (!homeRes.ok) {
      homeRes = await safeFetch(`http://www.${domain}`);
    }
  }

  if (!homeRes.ok) {
    console.error(`[site-auditor] Site unreachable after all attempts: ${domain}`);
    // Site unreachable — return all fail
    const failCheck = (label: string, raas = false): AuditCheckResult =>
      check(label, "fail", "Site erişilemedi.", "Sitenizin erişilebilir olduğundan emin olun.", raas);

    return {
      categories: [
        {
          name: "Yapılandırılmış Veri",
          checks: [
            failCheck("Ürün Tanıtım Bilgisi", true),
            failCheck("Kurum Tanıtım Bilgisi"),
            failCheck("Sıkça Sorulan Sorular Bilgisi", true),
            failCheck("Sayfa Yol Haritası", true),
          ],
        },
        {
          name: "İçerik",
          checks: [
            failCheck("Meta Açıklaması"),
            failCheck("Başlık Hiyerarşisi (H1)"),
            failCheck("Kelime Sayısı"),
          ],
        },
        {
          name: "Teknik",
          checks: [
            failCheck("HTTPS"),
            failCheck("Canonical URL", true),
            failCheck("robots.txt", true),
            failCheck("sitemap.xml", true),
          ],
        },
        {
          name: "Dış Platform",
          checks: [
            failCheck("Sosyal Medya Linkleri"),
            failCheck("Google Business Göstergeleri"),
          ],
        },
        {
          name: "Yapay Zeka Erişimi",
          checks: [
            failCheck("llms.txt"),
            failCheck("Yapay Zeka Bot Erişimi"),
            failCheck("Open Graph Etiketleri"),
          ],
        },
        {
          name: "Performans",
          checks: [
            failCheck("Sayfa Performansı", true),
            failCheck("Teknik Erişilebilirlik"),
            failCheck("Sayfa Açılış Hızı"),
            failCheck("Görsel Kararlılık"),
            failCheck("Mobil Uyumluluk"),
          ],
        },
      ],
    };
  }

  const html = homeRes.text;

  // Run all checks in parallel for speed
  const [technicalResult, aiAccess, performance] = await Promise.all([
    checkTechnical(domain, html),
    checkAIAccess(domain, html, ""), // robotsText will be filled after
    checkPerformance(domain),
  ]);

  // Re-run AI access with actual robotsText
  const aiAccessFinal = await checkAIAccess(domain, html, technicalResult.robotsText);

  const categories = [
    checkStructuredData(html),
    checkContent(html),
    technicalResult.category,
    checkExternalPlatforms(html),
    aiAccessFinal,
    performance,
  ];

  // ── Layer 3: Perplexity Sonar web presence check ──
  let sonarWebPresence: SonarWebPresence | undefined;
  try {
    sonarWebPresence = await checkWebPresence(domain);
    console.log(`[site-auditor] Layer 3 complete — GBP: ${sonarWebPresence.hasGoogleBusiness}, dirs: ${sonarWebPresence.directories.length}, 3rd-party: ${sonarWebPresence.thirdPartyContent.length}`);
  } catch (err) {
    console.error("[site-auditor] Layer 3 failed, continuing without Sonar data:", err);
  }

  // ── Layer 4: Claude Opus analysis + scoring ──
  let opusAnalysis: OpusAnalysis | undefined;
  try {
    const opusResult = await analyzeWithOpus(
      domain,
      categories,
      sonarWebPresence ?? { hasGoogleBusiness: false, directories: [], thirdPartyContent: [], sonarSummary: "" },
    );
    if (opusResult) {
      opusAnalysis = opusResult;
      console.log(`[site-auditor] Layer 4 complete — overallScore: ${opusAnalysis.overallScore}`);
    }
  } catch (err) {
    console.error("[site-auditor] Layer 4 failed, continuing without Opus analysis:", err);
  }

  return {
    categories,
    ...(sonarWebPresence ? { sonarWebPresence } : {}),
    ...(opusAnalysis ? { opusAnalysis } : {}),
  };
}
