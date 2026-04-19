/**
 * 43-Item Structured GEO Audit Engine
 *
 * Birleştirir:
 * - HTML analizi (mevcut site-auditor.ts)
 * - Perplexity Sonar (entity, social, media)
 * - DataForSEO (backlinks, keywords, competitors)
 * - Mevcut AI scan verisi (6 AI platform madde)
 *
 * Her madde 0/5/10 puanlanır.
 * Kullanıcı tipine göre ağırlıklı genel skor hesaplanır.
 */

import { prisma } from "@/lib/db";
import {
  AUDIT_ITEMS,
  calculateOverallScore,
  type UserType,
  type AuditCategory,
} from "./user-type-weights";
import { querySonar } from "./sonar-research";
import {
  getBacklinksOverview,
  getKeywordVolumes,
  getCompetitorDomains,
  isDataForSeoAvailable,
} from "@/lib/integrations/dataforseo";
import { calculateEstimatedLoss } from "./estimated-loss";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/redis";

/**
 * Bir rakibin tek madde için değeri ve durumu.
 * Her audit item'ın `competitorValues` array'i max 3 tane bundan içerir.
 */
export interface CompetitorValue {
  name: string;
  url?: string;
  value?: string | number;
  status?: "pass" | "partial" | "fail";
}

export interface AuditItemResult {
  key: string;
  label: string;
  category: AuditCategory;
  status: "pass" | "partial" | "fail";
  score: 0 | 5 | 10;
  value?: string | number;
  /** @deprecated Geriye dönük uyum için kalır; yeni audit'lerde competitorValues kullanılır. */
  competitorValue?: string | number;
  /**
   * 3 rakip için madde başına değer ve durum.
   * runAudit43 `competitors` parametresi verildiğinde doldurulur.
   */
  competitorValues?: CompetitorValue[];
  recommendation?: string;
}

/** Ana rakip referansı (max 3). Her biri audit motoru tarafından ayrı taranır. */
export interface CompetitorRef {
  name: string;
  url: string;
}

export interface Audit43Input {
  url: string;
  brandName: string;
  userType: UserType;
  sector?: string;
  location?: string;
  /** @deprecated Tek rakip URL'i — yeni akışta competitors kullanılır. */
  competitorUrl?: string;
  /** Max 3 ana rakip. Her biri için paralel audit çalışır. */
  competitors?: CompetitorRef[];
  keywords?: string[]; // Arama hacmi için
  brandId?: string; // Mevcut scan verisi varsa
}

export interface Audit43Result {
  url: string;
  brandName: string;
  userType: UserType;
  overallScore: number;
  categoryScores: Record<AuditCategory, number>;
  competitorScore?: number;
  competitorName?: string;
  competitorUrl?: string;
  /** Ana 3 rakip için skorlar (varsa). */
  competitors?: Array<{ name: string; url: string; overallScore: number }>;
  items: AuditItemResult[];
  estimatedMonthlyLoss: number;
  estimatedYearlyLoss: number;
  rawDataforseo?: Record<string, unknown>;
  rawAiVisibility?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════
// HTML Analysis Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Rakip siteler çoğunlukla bot-UA'lı request'leri bloklar (Cloudflare, WAF).
 * Bu yüzden modern Chrome UA + standart browser header'ları ile fetch
 * ediyoruz. Aksi halde rakiplerden HTML dönmez → competitorValues 0/fail.
 */
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch(cleanUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(
        `[fetchHtml] ${cleanUrl} returned ${res.status} — content blocked or unreachable`,
      );
      return null;
    }
    const html = await res.text();
    if (!html || html.length < 100) {
      console.warn(
        `[fetchHtml] ${cleanUrl} returned very short content (${html.length} chars) — likely blocked or empty`,
      );
    }
    return html;
  } catch (err) {
    console.warn(
      `[fetchHtml] ${url} failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

function checkJsonLd(html: string, type: string): boolean {
  const pattern = new RegExp(`"@type"\\s*:\\s*"${type}"`, "i");
  return pattern.test(html);
}

function checkMetaTag(html: string, name: string): boolean {
  const pattern = new RegExp(`<meta[^>]*(?:name|property)\\s*=\\s*["']${name}["']`, "i");
  return pattern.test(html);
}

function countMatches(html: string, pattern: RegExp): number {
  const matches = html.match(pattern);
  return matches?.length ?? 0;
}

// ═══════════════════════════════════════════════════════════
// Category 1: İçerik Otoritesi (10 madde)
// ═══════════════════════════════════════════════════════════

async function auditContent(html: string, url: string): Promise<Partial<Record<string, AuditItemResult>>> {
  const results: Partial<Record<string, AuditItemResult>> = {};

  // Blog sayısı (blog/makale/haber path'i içeren link sayısı)
  const blogLinks = countMatches(html, /href=["'][^"']*(?:blog|makale|haber|post)[^"']*["']/gi);
  results["content.blog_count"] = {
    key: "content.blog_count",
    label: "Blog sayısı",
    category: "content",
    status: blogLinks >= 20 ? "pass" : blogLinks >= 10 ? "partial" : "fail",
    score: blogLinks >= 20 ? 10 : blogLinks >= 10 ? 5 : 0,
    value: `${blogLinks} içerik`,
    recommendation: blogLinks < 10 ? "En az 10 blog/makale yayınlayın" : undefined,
  };

  // Ortalama derinlik (ana sayfadaki text uzunluğu bir gösterge)
  const textContent = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textContent.split(" ").length;
  results["content.depth"] = {
    key: "content.depth",
    label: "Ortalama içerik derinliği",
    category: "content",
    status: wordCount >= 800 ? "pass" : wordCount >= 400 ? "partial" : "fail",
    score: wordCount >= 800 ? 10 : wordCount >= 400 ? 5 : 0,
    value: `${wordCount} kelime (homepage)`,
    recommendation: wordCount < 400 ? "Sayfalarınızı 800+ kelimeye çıkarın" : undefined,
  };

  // Konu çeşitliliği (farklı kategori linkleri)
  const categoryLinks = new Set(
    Array.from(html.matchAll(/href=["']([^"']*(?:kategori|category|konu|topic)[^"']*)["']/gi))
      .map((m) => m[1])
  );
  results["content.variety"] = {
    key: "content.variety",
    label: "Konu çeşitliliği",
    category: "content",
    status: categoryLinks.size >= 5 ? "pass" : categoryLinks.size >= 2 ? "partial" : "fail",
    score: categoryLinks.size >= 5 ? 10 : categoryLinks.size >= 2 ? 5 : 0,
    value: `${categoryLinks.size} kategori`,
  };

  // İçerik güncelliği — son 6 ay (tarih pattern'leri)
  const thisYear = new Date().getFullYear();
  const recentYears = [thisYear, thisYear - 1];
  const hasRecentContent = recentYears.some((y) => html.includes(String(y)));
  results["content.recency"] = {
    key: "content.recency",
    label: "İçerik güncelliği",
    category: "content",
    status: hasRecentContent ? "pass" : "fail",
    score: hasRecentContent ? 10 : 0,
    recommendation: !hasRecentContent ? "Son 6 ayda içerik yayınlayın" : undefined,
  };

  // FAQ format (question mark + answer pattern)
  const hasFaq = /faq|sıkça sorulan|soru.*cevap/i.test(html);
  results["content.faq_format"] = {
    key: "content.faq_format",
    label: "Soru-cevap format",
    category: "content",
    status: hasFaq ? "pass" : "fail",
    score: hasFaq ? 10 : 0,
    recommendation: !hasFaq ? "FAQ sayfası ekleyin (AI'lar çok seviyor)" : undefined,
  };

  // How-to rehberi
  const hasHowTo = /nasıl yapılır|adım adım|rehber|how to/i.test(html);
  results["content.howto"] = {
    key: "content.howto",
    label: "How-to rehberi",
    category: "content",
    status: hasHowTo ? "pass" : "fail",
    score: hasHowTo ? 10 : 0,
  };

  // Karşılaştırma yazısı
  const hasComparison = /karşılaştırma|vs\.|en iyi.*mi|daha iyi/i.test(html);
  results["content.comparison"] = {
    key: "content.comparison",
    label: "Karşılaştırma yazısı",
    category: "content",
    status: hasComparison ? "pass" : "fail",
    score: hasComparison ? 10 : 0,
  };

  // İstatistik içerik
  const hasStats = countMatches(html, /%\d{1,3}|istatistik|araştırma|veri/gi) > 5;
  results["content.statistics"] = {
    key: "content.statistics",
    label: "İstatistik içerik",
    category: "content",
    status: hasStats ? "pass" : "fail",
    score: hasStats ? 10 : 0,
  };

  // Orijinal araştırma (mock — gerçekte daha karmaşık analiz gerektirir)
  const hasResearch = /araştırma|case study|vaka analizi|anket/i.test(html);
  results["content.original_research"] = {
    key: "content.original_research",
    label: "Orijinal araştırma",
    category: "content",
    status: hasResearch ? "partial" : "fail",
    score: hasResearch ? 5 : 0,
    recommendation: "Orijinal araştırma/anket yayınlayın",
  };

  // E-E-A-T sinyalleri (yazar, about, iletişim)
  const hasAbout = /hakkımızda|about|kurucu/i.test(html);
  const hasContact = /iletişim|contact|telefon|email/i.test(html);
  const hasAuthor = /yazar|author|by\s+[A-Z]/i.test(html);
  const eeatScore = [hasAbout, hasContact, hasAuthor].filter(Boolean).length;
  results["content.eeat"] = {
    key: "content.eeat",
    label: "E-E-A-T sinyalleri",
    category: "content",
    status: eeatScore === 3 ? "pass" : eeatScore >= 1 ? "partial" : "fail",
    score: eeatScore === 3 ? 10 : eeatScore >= 1 ? 5 : 0,
    value: `${eeatScore}/3 sinyal`,
  };

  return results;
}

// ═══════════════════════════════════════════════════════════
// Category 2: Yapılandırılmış Veri (8 madde)
// ═══════════════════════════════════════════════════════════

function auditSchema(html: string): Partial<Record<string, AuditItemResult>> {
  const types: Array<[string, string, string]> = [
    ["schema.organization", "Organization", "Organization schema"],
    ["schema.localbusiness", "LocalBusiness", "LocalBusiness schema"],
    ["schema.product", "Product", "Product schema"],
    ["schema.faq", "FAQPage", "FAQ schema"],
    ["schema.howto", "HowTo", "HowTo schema"],
    ["schema.review", "Review", "Review schema"],
    ["schema.breadcrumb", "BreadcrumbList", "BreadcrumbList schema"],
    ["schema.person", "Person", "Person schema"],
  ];

  const results: Partial<Record<string, AuditItemResult>> = {};

  for (const [key, schemaType, label] of types) {
    const found = checkJsonLd(html, schemaType);
    results[key] = {
      key,
      label,
      category: "schema",
      status: found ? "pass" : "fail",
      score: found ? 10 : 0,
      value: found ? "Mevcut" : "Yok",
      recommendation: !found ? `${schemaType} JSON-LD ekleyin` : undefined,
    };
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// Category 3: Entity & Kimlik (7 madde) — Sonar'dan
// ═══════════════════════════════════════════════════════════

async function auditEntity(
  brandName: string,
  domain: string,
  location?: string
): Promise<Partial<Record<string, AuditItemResult>>> {
  const results: Partial<Record<string, AuditItemResult>> = {};

  // makeCacheKey artık Türkçe-aware normalize ediyor, manual .toLowerCase() gereksiz
  const cacheKey = makeCacheKey("audit-entity", brandName, domain);
  const cached = await cacheGet<Partial<Record<string, AuditItemResult>>>(cacheKey);
  if (cached) return cached;

  // Tek Sonar çağrısı ile tüm entity kontrollerini yap
  const prompt = `"${brandName}" markası hakkında aşağıdaki soruları kısaca yanıtla:

1. Google Knowledge Panel'i var mı? (evet/hayır)
2. Wikipedia veya Wikidata entry var mı? (evet/hayır)
3. LinkedIn Company/Profile sayfası güçlü mü? (güçlü/zayıf/yok)
4. Google Business Profile kaydı var mı ve aktif mi? (aktif/pasif/yok)
5. NAP bilgileri (isim, adres, telefon) tutarlı mı? (tutarlı/tutarsız/bilinmiyor)
6. Sektör dizinlerinde kayıtlı mı? (evet/hayır/birkaç)
7. Google'da marka adı arandığında 1. sıradaki sonuç kendi sitesi mi? (evet/hayır)

Sadece ${location ? `${location} bölgesinde ` : ""}Türkiye'deki varlığını değerlendir.
JSON formatında dön: { knowledge_panel: true/false, wikidata: true/false, linkedin: "strong/weak/none", gbp: "active/passive/none", nap: "consistent/inconsistent/unknown", directories: "many/few/none", brand_ranking: true/false }`;

  try {
    const response = await querySonar(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    results["entity.knowledge_panel"] = {
      key: "entity.knowledge_panel",
      label: "Knowledge Panel",
      category: "entity",
      status: data.knowledge_panel ? "pass" : "fail",
      score: data.knowledge_panel ? 10 : 0,
    };
    results["entity.wikidata"] = {
      key: "entity.wikidata",
      label: "Wikipedia/Wikidata",
      category: "entity",
      status: data.wikidata ? "pass" : "fail",
      score: data.wikidata ? 10 : 0,
    };
    results["entity.linkedin"] = {
      key: "entity.linkedin",
      label: "LinkedIn",
      category: "entity",
      status: data.linkedin === "strong" ? "pass" : data.linkedin === "weak" ? "partial" : "fail",
      score: data.linkedin === "strong" ? 10 : data.linkedin === "weak" ? 5 : 0,
    };
    results["entity.gbp"] = {
      key: "entity.gbp",
      label: "Google Business Profile",
      category: "entity",
      status: data.gbp === "active" ? "pass" : data.gbp === "passive" ? "partial" : "fail",
      score: data.gbp === "active" ? 10 : data.gbp === "passive" ? 5 : 0,
    };
    results["entity.nap"] = {
      key: "entity.nap",
      label: "NAP tutarlılığı",
      category: "entity",
      status: data.nap === "consistent" ? "pass" : data.nap === "inconsistent" ? "fail" : "partial",
      score: data.nap === "consistent" ? 10 : data.nap === "inconsistent" ? 0 : 5,
    };
    results["entity.directories"] = {
      key: "entity.directories",
      label: "Sektör dizinleri",
      category: "entity",
      status: data.directories === "many" ? "pass" : data.directories === "few" ? "partial" : "fail",
      score: data.directories === "many" ? 10 : data.directories === "few" ? 5 : 0,
    };
    results["entity.brand_ranking"] = {
      key: "entity.brand_ranking",
      label: "Marka araması 1. sıra",
      category: "entity",
      status: data.brand_ranking ? "pass" : "fail",
      score: data.brand_ranking ? 10 : 0,
    };
  } catch (err) {
    console.error("[audit-43] Entity Sonar error:", err);
    // Tüm entity skorlarını 0 yap
    for (const item of AUDIT_ITEMS.filter((i) => i.category === "entity")) {
      results[item.key] = {
        key: item.key,
        label: item.label,
        category: "entity",
        status: "fail",
        score: 0,
      };
    }
  }

  await cacheSet(cacheKey, results, 7 * 24 * 60 * 60);
  return results;
}

// ═══════════════════════════════════════════════════════════
// Category 4: Teknik Erişilebilirlik (7 madde)
// ═══════════════════════════════════════════════════════════

async function auditTech(url: string, html: string): Promise<Partial<Record<string, AuditItemResult>>> {
  const results: Partial<Record<string, AuditItemResult>> = {};
  const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
  const urlObj = new URL(cleanUrl);
  const origin = urlObj.origin;

  // AI Bot erişimi — robots.txt oku
  let aiBotsAllowed = false;
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(8000) });
    if (robotsRes.ok) {
      const robotsText = await robotsRes.text();
      const bots = ["GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot"];
      const disallowed = bots.filter((bot) => {
        const botPattern = new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`, "i");
        return botPattern.test(robotsText);
      });
      aiBotsAllowed = disallowed.length === 0;
    } else {
      aiBotsAllowed = true; // Robots yoksa default allow
    }
  } catch {
    aiBotsAllowed = false;
  }

  results["tech.ai_bots"] = {
    key: "tech.ai_bots",
    label: "AI botları erişimi",
    category: "tech",
    status: aiBotsAllowed ? "pass" : "fail",
    score: aiBotsAllowed ? 10 : 0,
    recommendation: !aiBotsAllowed ? "robots.txt'ten AI botlarını engellemeyin" : undefined,
  };

  // Sitemap
  let sitemapOk = false;
  try {
    const sitemapRes = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
    sitemapOk = sitemapRes.ok;
  } catch {}
  results["tech.sitemap"] = {
    key: "tech.sitemap",
    label: "Sitemap.xml",
    category: "tech",
    status: sitemapOk ? "pass" : "fail",
    score: sitemapOk ? 10 : 0,
  };

  // HTTPS
  results["tech.https"] = {
    key: "tech.https",
    label: "HTTPS",
    category: "tech",
    status: urlObj.protocol === "https:" ? "pass" : "fail",
    score: urlObj.protocol === "https:" ? 10 : 0,
  };

  // PageSpeed (PageSpeed Insights API ile — env var gerekir)
  // Basit version: HTML boyutuna göre tahmin
  const htmlKb = html.length / 1024;
  const pageSpeedScore = htmlKb < 500 ? 10 : htmlKb < 1500 ? 5 : 0;
  results["tech.pagespeed"] = {
    key: "tech.pagespeed",
    label: "Sayfa hızı",
    category: "tech",
    status: pageSpeedScore === 10 ? "pass" : pageSpeedScore === 5 ? "partial" : "fail",
    score: pageSpeedScore as 0 | 5 | 10,
    value: `${Math.round(htmlKb)}KB HTML`,
  };

  // Mobile uyumluluk — viewport meta
  const hasViewport = /viewport/i.test(html) && /initial-scale|width=device-width/i.test(html);
  results["tech.mobile"] = {
    key: "tech.mobile",
    label: "Mobile uyumluluk",
    category: "tech",
    status: hasViewport ? "pass" : "fail",
    score: hasViewport ? 10 : 0,
  };

  // Canonical
  const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
  results["tech.canonical"] = {
    key: "tech.canonical",
    label: "Canonical tag",
    category: "tech",
    status: hasCanonical ? "pass" : "fail",
    score: hasCanonical ? 10 : 0,
  };

  // Hreflang
  const hasHreflang = /<link[^>]*hreflang=/i.test(html);
  results["tech.hreflang"] = {
    key: "tech.hreflang",
    label: "Hreflang",
    category: "tech",
    status: hasHreflang ? "pass" : "fail",
    score: hasHreflang ? 10 : 0,
    recommendation: !hasHreflang ? "Çok dilli site ise hreflang ekleyin" : undefined,
  };

  return results;
}

// ═══════════════════════════════════════════════════════════
// Category 5: Dış Referanslar (5 madde) — DataForSEO
// ═══════════════════════════════════════════════════════════

async function auditExternal(
  domain: string,
  brandName: string
): Promise<{ results: Partial<Record<string, AuditItemResult>>; rawDfs: Record<string, unknown> }> {
  const results: Partial<Record<string, AuditItemResult>> = {};
  const rawDfs: Record<string, unknown> = {};

  const backlinks = await getBacklinksOverview(domain);
  rawDfs.backlinks = backlinks;

  if (backlinks) {
    // Toplam backlink
    results["external.backlinks"] = {
      key: "external.backlinks",
      label: "Toplam backlink",
      category: "external",
      status: backlinks.totalBacklinks >= 100 ? "pass" : backlinks.totalBacklinks >= 30 ? "partial" : "fail",
      score: backlinks.totalBacklinks >= 100 ? 10 : backlinks.totalBacklinks >= 30 ? 5 : 0,
      value: backlinks.totalBacklinks.toLocaleString("tr-TR"),
    };

    // Referring domains
    results["external.referring_domains"] = {
      key: "external.referring_domains",
      label: "Referring domain sayısı",
      category: "external",
      status: backlinks.referringDomains >= 30 ? "pass" : backlinks.referringDomains >= 10 ? "partial" : "fail",
      score: backlinks.referringDomains >= 30 ? 10 : backlinks.referringDomains >= 10 ? 5 : 0,
      value: backlinks.referringDomains.toLocaleString("tr-TR"),
    };

    // Otorite (domain rank)
    results["external.authority"] = {
      key: "external.authority",
      label: "Otorite referansları",
      category: "external",
      status: backlinks.domainRank >= 50 ? "pass" : backlinks.domainRank >= 25 ? "partial" : "fail",
      score: backlinks.domainRank >= 50 ? 10 : backlinks.domainRank >= 25 ? 5 : 0,
      value: `DR ${backlinks.domainRank}`,
    };
  } else {
    // DataForSEO yoksa fail
    ["external.backlinks", "external.referring_domains", "external.authority"].forEach((key) => {
      const item = AUDIT_ITEMS.find((i) => i.key === key)!;
      results[key] = { key, label: item.label, category: "external", status: "fail", score: 0 };
    });
  }

  // Sosyal mention + medya coverage → Sonar
  try {
    const socialPrompt = `"${brandName}" markası hakkında:
1. Son 6 ayda Twitter/X, Reddit veya LinkedIn'de organik bahsedilme var mı? (çok/az/yok)
2. Haber siteleri, blog yazıları veya podcast'lerde bahsedildi mi? (evet/hayır)
JSON: { social: "many/few/none", media: true/false }`;
    const socialResponse = await querySonar(socialPrompt);
    const socialData = JSON.parse(socialResponse.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    results["external.social"] = {
      key: "external.social",
      label: "Sosyal mention",
      category: "external",
      status: socialData.social === "many" ? "pass" : socialData.social === "few" ? "partial" : "fail",
      score: socialData.social === "many" ? 10 : socialData.social === "few" ? 5 : 0,
    };
    results["external.media"] = {
      key: "external.media",
      label: "Basın/medya coverage",
      category: "external",
      status: socialData.media ? "pass" : "fail",
      score: socialData.media ? 10 : 0,
    };
  } catch {
    results["external.social"] = { key: "external.social", label: "Sosyal mention", category: "external", status: "fail", score: 0 };
    results["external.media"] = { key: "external.media", label: "Basın/medya coverage", category: "external", status: "fail", score: 0 };
  }

  return { results, rawDfs };
}

// ═══════════════════════════════════════════════════════════
// Category 6: AI Platform Görünürlüğü (6 madde) — Mevcut scan verisi
// ═══════════════════════════════════════════════════════════

async function auditAiVisibility(brandId?: string): Promise<{
  results: Partial<Record<string, AuditItemResult>>;
  rawAi: Record<string, unknown>;
  totalMentionRate: number;
}> {
  const results: Partial<Record<string, AuditItemResult>> = {};
  const rawAi: Record<string, unknown> = {};

  if (!brandId) {
    // Ücretsiz audit için brandId yok — bu kategoriyi skip et
    AUDIT_ITEMS.filter((i) => i.category === "ai").forEach((item) => {
      results[item.key] = {
        key: item.key,
        label: item.label,
        category: "ai",
        status: "fail",
        score: 0,
        recommendation: "Pro ile haftalık tarama başlatın",
      };
    });
    return { results, rawAi, totalMentionRate: 0 };
  }

  // Son scan'den platform bazlı mention oranları
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  if (!lastScan) {
    AUDIT_ITEMS.filter((i) => i.category === "ai").forEach((item) => {
      results[item.key] = { key: item.key, label: item.label, category: "ai", status: "fail", score: 0 };
    });
    return { results, rawAi, totalMentionRate: 0 };
  }

  const allResults = await prisma.promptResult.findMany({
    where: { scanId: lastScan.id },
    select: { platform: true, mentioned: true },
  });

  const platformRates: Record<string, number> = {};
  const platformTotals: Record<string, number> = {};
  const platformMentioned: Record<string, number> = {};

  for (const r of allResults) {
    platformTotals[r.platform] = (platformTotals[r.platform] ?? 0) + 1;
    if (r.mentioned) {
      platformMentioned[r.platform] = (platformMentioned[r.platform] ?? 0) + 1;
    }
  }

  const platforms: Array<[string, string, string]> = [
    ["ai.chatgpt", "chatgpt", "ChatGPT"],
    ["ai.claude", "claude", "Claude"],
    ["ai.gemini", "gemini", "Gemini"],
    ["ai.perplexity", "perplexity", "Perplexity"],
    ["ai.google_aio", "google_aio", "Google AIO"],
  ];

  for (const [key, platformKey, label] of platforms) {
    const total = platformTotals[platformKey] ?? 0;
    const mentioned = platformMentioned[platformKey] ?? 0;
    const rate = total > 0 ? mentioned / total : 0;
    platformRates[platformKey] = rate;

    results[key] = {
      key,
      label: `${label} önerilme oranı`,
      category: "ai",
      status: rate >= 0.5 ? "pass" : rate >= 0.2 ? "partial" : "fail",
      score: rate >= 0.5 ? 10 : rate >= 0.2 ? 5 : 0,
      value: `%${Math.round(rate * 100)}`,
    };
  }

  // Genel skor
  const totalMentioned = Object.values(platformMentioned).reduce((a, b) => a + b, 0);
  const totalResults = Object.values(platformTotals).reduce((a, b) => a + b, 0);
  const overallRate = totalResults > 0 ? totalMentioned / totalResults : 0;

  results["ai.overall"] = {
    key: "ai.overall",
    label: "Genel AI görünürlük skoru",
    category: "ai",
    status: overallRate >= 0.5 ? "pass" : overallRate >= 0.2 ? "partial" : "fail",
    score: overallRate >= 0.5 ? 10 : overallRate >= 0.2 ? 5 : 0,
    value: `%${Math.round(overallRate * 100)}`,
  };

  rawAi.platformRates = platformRates;
  rawAi.overallRate = overallRate;

  return { results, rawAi, totalMentionRate: overallRate };
}

// ═══════════════════════════════════════════════════════════
// Ana Orchestrator
// ═══════════════════════════════════════════════════════════

/**
 * Bir site için ana audit sonuç toplayıcısı.
 * User ve her rakip için AYNI fonksiyon çalışır — kod DRY.
 */
async function runSiteAudit(
  siteUrl: string,
  siteName: string,
  options: {
    location?: string;
    brandId?: string;
    skipAi?: boolean;
  } = {},
): Promise<{
  results: Partial<Record<string, AuditItemResult>>;
  externalRaw?: Record<string, unknown>;
  aiRaw?: Record<string, unknown>;
  totalMentionRate?: number;
  overallScore: number;
}> {
  const html = (await fetchHtml(siteUrl)) ?? "";
  const domain = siteUrl.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // 6 audit fonksiyonu paralel
  const [contentRes, schemaRes, entityRes, techRes, externalData, aiData] =
    await Promise.all([
      auditContent(html, siteUrl),
      Promise.resolve(auditSchema(html)),
      auditEntity(siteName, domain, options.location),
      auditTech(siteUrl, html),
      auditExternal(domain, siteName),
      options.skipAi
        ? Promise.resolve({
            results: {} as Partial<Record<string, AuditItemResult>>,
            totalMentionRate: 0,
            rawAi: undefined,
          })
        : auditAiVisibility(options.brandId),
    ]);

  const results: Partial<Record<string, AuditItemResult>> = {
    ...contentRes,
    ...schemaRes,
    ...entityRes,
    ...techRes,
    ...externalData.results,
    ...aiData.results,
  };

  // overall score hesabı (rakip için de user tipinde ağırlık kullan)
  const itemScores: Record<string, number> = {};
  AUDIT_ITEMS.forEach((def) => {
    itemScores[def.key] = results[def.key]?.score ?? 0;
  });
  const { overall } = calculateOverallScore("firma", itemScores);

  return {
    results,
    externalRaw: externalData.rawDfs,
    aiRaw: aiData.rawAi,
    totalMentionRate: aiData.totalMentionRate,
    overallScore: overall,
  };
}

/**
 * Tek bir audit item için user ve rakip değerlerini birleştirir.
 */
function mergeCompetitorValues(
  userItem: AuditItemResult | undefined,
  def: { key: string; label: string; category: AuditCategory },
  competitorResults: Array<{
    name: string;
    url: string;
    results: Partial<Record<string, AuditItemResult>>;
  }>,
): AuditItemResult {
  const base: AuditItemResult =
    userItem ?? {
      key: def.key,
      label: def.label,
      category: def.category,
      status: "fail" as const,
      score: 0 as const,
    };

  if (competitorResults.length === 0) return base;

  const competitorValues: CompetitorValue[] = competitorResults.map((c) => {
    const compItem = c.results[def.key];
    return {
      name: c.name,
      url: c.url,
      value: compItem?.value,
      status: compItem?.status,
    };
  });

  // Backward compat: en iyi (pass tercih, sonra partial) rakip değerini
  // tek string olarak competitorValue alanına da koy
  const bestComp =
    competitorValues.find((c) => c.status === "pass") ??
    competitorValues.find((c) => c.status === "partial") ??
    competitorValues[0];

  return {
    ...base,
    competitorValue: bestComp?.value,
    competitorValues,
  };
}

export async function runAudit43(input: Audit43Input): Promise<Audit43Result> {
  const { url, brandName, userType, sector, location, brandId, keywords } =
    input;

  // Rakip listesi: competitors parametre önce, yoksa legacy competitorUrl (tek)
  const competitorList: CompetitorRef[] = (input.competitors ?? []).slice(0, 3);
  if (
    competitorList.length === 0 &&
    input.competitorUrl &&
    input.competitorUrl.trim()
  ) {
    const compDomain = input.competitorUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    competitorList.push({ name: compDomain, url: input.competitorUrl });
  }

  console.log(
    `[audit-43] Starting audit: user=${brandName} (${url}), competitors=${competitorList.length} (${competitorList.map((c) => c.name).join(", ")})`,
  );

  // User audit + 3 rakip audit hepsi PARALEL
  const [userAudit, ...competitorAudits] = await Promise.all([
    runSiteAudit(url, brandName, { location, brandId, skipAi: false }),
    ...competitorList.map((c) =>
      runSiteAudit(c.url, c.name, {
        location,
        // skipAi: true — rakip için AI görünürlük scan'i çalıştırma (maliyet + gereksiz)
        skipAi: true,
      }).catch((err) => {
        console.error(`[audit-43] Competitor audit failed for ${c.name}:`, err);
        return {
          results: {} as Partial<Record<string, AuditItemResult>>,
          overallScore: 0,
          externalRaw: undefined,
          aiRaw: undefined,
          totalMentionRate: 0,
        };
      }),
    ),
  ]);

  const competitorResultsWithMeta = competitorList.map((c, i) => ({
    name: c.name,
    url: c.url,
    results: competitorAudits[i]?.results ?? {},
    overallScore: competitorAudits[i]?.overallScore ?? 0,
  }));

  // Tüm 43 maddeyi build et, her birine competitorValues ekle
  const items: AuditItemResult[] = AUDIT_ITEMS.map((def) =>
    mergeCompetitorValues(userAudit.results[def.key], def, competitorResultsWithMeta),
  );

  // Skor hesabı (user için)
  const itemScores: Record<string, number> = {};
  items.forEach((i) => (itemScores[i.key] = i.score));
  const { overall, byCategory } = calculateOverallScore(userType, itemScores);

  // aiData ve externalData referansı korunmalı (estimatedLoss + return için)
  const aiData = {
    totalMentionRate: userAudit.totalMentionRate ?? 0,
    rawAi: userAudit.aiRaw,
  };
  const externalData = {
    rawDfs: userAudit.externalRaw,
  };

  // Tahmini kayıp
  let estimatedMonthlyLoss = 0;
  let estimatedYearlyLoss = 0;

  if (keywords && keywords.length > 0 && isDataForSeoAvailable()) {
    const volumes = await getKeywordVolumes(keywords);
    const totalVolume = volumes.reduce((sum, v) => sum + v.searchVolume, 0);

    const loss = calculateEstimatedLoss({
      userType,
      sector,
      totalSearchVolume: totalVolume,
      competitorMentionRate: 0.7, // Default rakip tahmini (düşmanı varsay)
      yourMentionRate: aiData.totalMentionRate,
    });

    estimatedMonthlyLoss = loss.monthlyLoss;
    estimatedYearlyLoss = loss.yearlyLoss;
  } else if (keywords && keywords.length > 0) {
    // DataForSEO yoksa fallback: sektöre göre tahmini hacim
    const estimatedVolumePerKw = 500; // tahmini
    const totalVolume = keywords.length * estimatedVolumePerKw;
    const loss = calculateEstimatedLoss({
      userType,
      sector,
      totalSearchVolume: totalVolume,
      competitorMentionRate: 0.7,
      yourMentionRate: aiData.totalMentionRate,
    });
    estimatedMonthlyLoss = loss.monthlyLoss;
    estimatedYearlyLoss = loss.yearlyLoss;
  }

  // Rakip skorları — her rakibin kendi 43 madde tabanlı overallScore'u
  const competitorsOut = competitorResultsWithMeta.map((c) => ({
    name: c.name,
    url: c.url,
    overallScore: c.overallScore,
  }));

  // Legacy tek rakip alanları: ilk rakip (en yüksek puanlı değil, listede ilk)
  const firstComp = competitorsOut[0];
  const competitorScore = firstComp?.overallScore;
  const competitorName = firstComp?.name;
  const competitorUrl = firstComp?.url ?? input.competitorUrl;

  return {
    url,
    brandName,
    userType,
    overallScore: overall,
    categoryScores: byCategory,
    competitorScore,
    competitorName,
    competitorUrl,
    competitors: competitorsOut.length > 0 ? competitorsOut : undefined,
    items,
    estimatedMonthlyLoss,
    estimatedYearlyLoss,
    rawDataforseo: externalData.rawDfs,
    rawAiVisibility: aiData.rawAi,
  };
}
