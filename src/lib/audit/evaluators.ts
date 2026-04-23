/**
 * 43 madde evaluator (Brief G Aşama 2).
 *
 * Her madde için: DataForSEO / Perplexity verisinden status + rawMetrics üretir.
 * Bazı maddeler opus-eval (Aşama 3'te Opus yorumlar) — burada default warning.
 *
 * Strateji:
 * - Kategori 1 (AI Crawler): robots/llms/llms-full fetch + HTML JS analiz
 * - Kategori 2-3 (Entity/Structured): HTML içinde JSON-LD & schema tarama
 * - Kategori 4 (Content-AI): paragraph length, heading hierarchy, word count
 * - Kategori 5 (Query-Match): opus-eval default
 * - Kategori 6 (Authority): backlinks + perplexity
 * - Kategori 7 (AI Platform): perplexity mentions
 */

import type { AuditMasterItem } from "./master-items";
import type { OnPageResult, RobotsResult, FileCheckResult, BacklinksSummary } from "./dataforseo";
import type { MentionCheck } from "./perplexity";

export type EvalStatus = "passed" | "warning" | "critical" | "not-applicable";

export type EvalInput = {
  domain: string;
  brandName: string;
  sector: string | null;
  dataForSeo: {
    onPage: OnPageResult;
    backlinks: BacklinksSummary;
    robotsTxt: RobotsResult;
    llmsTxt: FileCheckResult;
    llmsFullTxt: FileCheckResult;
  };
  perplexity: {
    mentions: MentionCheck[];
  };
};

export type EvalOutput = {
  status: EvalStatus;
  rawMetrics: Record<string, unknown>;
};

// Ham veri alanlarına safe erişim için helper'lar
function getSummary(input: EvalInput): Record<string, unknown> {
  return (input.dataForSeo.onPage.summary ?? {}) as Record<string, unknown>;
}

function getHomepage(input: EvalInput): Record<string, unknown> | undefined {
  return input.dataForSeo.onPage.pages?.[0] as
    | Record<string, unknown>
    | undefined;
}

function pagesAll(input: EvalInput): Array<Record<string, unknown>> {
  return input.dataForSeo.onPage.pages ?? [];
}

// ───────────────────────────────────────────────────────
// Evaluator map
// ───────────────────────────────────────────────────────

const EVALUATORS: Record<string, (input: EvalInput) => EvalOutput> = {
  // ══ Kategori 1: AI Crawler ══
  "ai-crawler-robots": (input) => {
    const r = input.dataForSeo.robotsTxt;
    if (!r.exists) {
      return {
        status: "warning",
        rawMetrics: { reason: "robots.txt yok — varsayılan tüm izinli" },
      };
    }
    const all =
      r.allowsGPTBot &&
      r.allowsClaudeBot &&
      r.allowsPerplexityBot &&
      r.allowsGoogleExtended;
    const some =
      r.allowsGPTBot ||
      r.allowsClaudeBot ||
      r.allowsPerplexityBot ||
      r.allowsGoogleExtended;
    return {
      status: all ? "passed" : some ? "warning" : "critical",
      rawMetrics: {
        exists: true,
        allowsGPTBot: r.allowsGPTBot,
        allowsClaudeBot: r.allowsClaudeBot,
        allowsPerplexityBot: r.allowsPerplexityBot,
        allowsGoogleExtended: r.allowsGoogleExtended,
      },
    };
  },

  "llms-txt": (input) => {
    const f = input.dataForSeo.llmsTxt;
    return {
      status: f.exists ? "passed" : "critical",
      rawMetrics: { exists: f.exists, length: f.length },
    };
  },

  "llms-full-txt": (input) => {
    const f = input.dataForSeo.llmsFullTxt;
    return {
      status: f.exists && f.length >= 2000 ? "passed" : f.exists ? "warning" : "critical",
      rawMetrics: { exists: f.exists, length: f.length },
    };
  },

  "cdn-bot-block": (input) => {
    // DataForSEO crawl'ı başarılıysa CDN en azından crawl'a izin vermiş.
    // Tam CDN ayarı (Cloudflare AI Scrapers) API'den okunamaz → warning.
    const pages = pagesAll(input).length;
    return {
      status: pages > 0 ? "warning" : "critical",
      rawMetrics: {
        crawledPages: pages,
        note: "Cloudflare AI Scrapers ayarı manuel kontrol gerekir",
      },
    };
  },

  "ssr-active": (input) => {
    // DataForSEO enable_javascript kapalı tarama yapsaydı ayırt edilirdi.
    // MVP: homepage content_size > 10000 karakter → SSR var varsayımı
    const home = getHomepage(input);
    const size = (home?.size ?? home?.content_size ?? 0) as number;
    return {
      status: size > 10000 ? "passed" : size > 2000 ? "warning" : "critical",
      rawMetrics: { homepageSize: size },
    };
  },

  "bot-logs": () => ({
    status: "warning",
    rawMetrics: { note: "Access log analizi manuel — kullanıcı doğrular" },
  }),

  // ══ Kategori 2: Entity ══
  "brand-entity-schema": (input) => {
    const home = getHomepage(input);
    const jsonLds = extractJsonLd(home);
    const hasOrg = jsonLds.some(
      (j) =>
        j["@type"] === "Organization" ||
        (Array.isArray(j["@type"]) && j["@type"].includes("Organization")),
    );
    const hasSameAs = jsonLds.some((j) => Array.isArray((j as Record<string, unknown>).sameAs));
    return {
      status: hasOrg && hasSameAs ? "passed" : hasOrg ? "warning" : "critical",
      rawMetrics: { hasOrganization: hasOrg, hasSameAs },
    };
  },

  "about-page-rich": (input) => {
    // /hakkimizda, /about, /hakkinda sayfası var mı + kelime sayısı
    const about = pagesAll(input).find((p) => {
      const url = String(p.url ?? "").toLowerCase();
      return /\/(hakkimizda|hakkinda|about|about-us)/.test(url);
    });
    if (!about) {
      return { status: "critical", rawMetrics: { found: false } };
    }
    const plainText = String(about.plain_text_size ?? about.size ?? 0);
    const words = Number(about.plain_text_word_count ?? 0);
    return {
      status: words >= 500 ? "passed" : words >= 200 ? "warning" : "critical",
      rawMetrics: { found: true, words, plainTextSize: Number(plainText) },
    };
  },

  "team-page-linkedin": (input) => {
    const team = pagesAll(input).find((p) => {
      const url = String(p.url ?? "").toLowerCase();
      return /\/(ekip|team|kurucu|founder|biz)/.test(url);
    });
    return {
      status: team ? "warning" : "warning",
      rawMetrics: { found: !!team, note: "LinkedIn link kontrolü Opus ile" },
    };
  },

  "founding-info-data": (input) => {
    const home = getHomepage(input);
    const jsonLds = extractJsonLd(home);
    const org = jsonLds.find((j) => {
      const t = j["@type"];
      return t === "Organization" || (Array.isArray(t) && t.includes("Organization"));
    });
    if (!org) return { status: "critical", rawMetrics: { hasOrg: false } };

    const hasFounding = !!(org as Record<string, unknown>).foundingDate;
    const hasAddress = !!(org as Record<string, unknown>).address;
    const hasEmployees = !!(org as Record<string, unknown>).numberOfEmployees;
    const filled = [hasFounding, hasAddress, hasEmployees].filter(Boolean).length;

    return {
      status: filled === 3 ? "passed" : filled >= 1 ? "warning" : "critical",
      rawMetrics: { hasFounding, hasAddress, hasEmployees },
    };
  },

  "brand-bio-short": () => ({
    status: "warning",
    rawMetrics: { note: "Bio paragrafı Opus ile değerlendirilir" },
  }),

  "faq-identity": (input) => {
    const hasFaqPage = pagesAll(input).some((p) => {
      const url = String(p.url ?? "").toLowerCase();
      return /\/(sss|faq|sikca-sorulan)/.test(url);
    });
    const hasFaqSchema = jsonLdHasType(input, "FAQPage");
    return {
      status: hasFaqPage && hasFaqSchema ? "passed" : hasFaqPage || hasFaqSchema ? "warning" : "critical",
      rawMetrics: { hasFaqPage, hasFaqSchema },
    };
  },

  "press-mentions": () => ({
    status: "warning",
    rawMetrics: { note: "Press listesi Opus + Perplexity ile değerlendirilir" },
  }),

  "social-proof": () => ({
    status: "warning",
    rawMetrics: { note: "Somut rakamlar Opus ile değerlendirilir" },
  }),

  // ══ Kategori 3: Structured Data ══
  "jsonld-schema-type": (input) => {
    const home = getHomepage(input);
    const jsonLds = extractJsonLd(home);
    const types = jsonLds
      .map((j) => j["@type"])
      .flat()
      .filter(Boolean);
    const hasSpecific = types.some(
      (t) =>
        typeof t === "string" &&
        ["LodgingBusiness", "Product", "Service", "LocalBusiness", "Restaurant", "ProfessionalService"].includes(t),
    );
    return {
      status: hasSpecific ? "passed" : types.length > 0 ? "warning" : "critical",
      rawMetrics: { types },
    };
  },

  "breadcrumb-schema": (input) => {
    const has = jsonLdHasType(input, "BreadcrumbList");
    return {
      status: has ? "passed" : "critical",
      rawMetrics: { hasBreadcrumbList: has },
    };
  },

  "faqpage-schema": (input) => {
    const has = jsonLdHasType(input, "FAQPage");
    return {
      status: has ? "passed" : "critical",
      rawMetrics: { hasFAQPage: has },
    };
  },

  "review-schema": (input) => {
    const hasReview =
      jsonLdHasType(input, "Review") || jsonLdHasType(input, "AggregateRating");
    return {
      status: hasReview ? "passed" : "warning",
      rawMetrics: { hasReview },
    };
  },

  "speakable-schema": (input) => {
    const has = jsonLdHasType(input, "SpeakableSpecification");
    return {
      status: has ? "passed" : "warning",
      rawMetrics: { hasSpeakable: has },
    };
  },

  "howto-schema": (input) => {
    const has = jsonLdHasType(input, "HowTo");
    return {
      status: has ? "passed" : "warning",
      rawMetrics: { hasHowTo: has },
    };
  },

  // ══ Kategori 4: Content-AI ══
  "heading-hierarchy": (input) => {
    const home = getHomepage(input);
    const meta = (home?.meta ?? {}) as Record<string, unknown>;
    const htags = (meta.htags ?? {}) as Record<string, unknown>;
    const h1 = Array.isArray(htags.h1) ? htags.h1 : [];
    const h2 = Array.isArray(htags.h2) ? htags.h2 : [];
    const h1Count = h1.length;
    const h2Count = h2.length;
    const ok = h1Count === 1 && h2Count >= 2;
    return {
      status: ok ? "passed" : h1Count === 1 ? "warning" : "critical",
      rawMetrics: { h1Count, h2Count },
    };
  },

  "paragraph-length": () => ({
    status: "warning",
    rawMetrics: { note: "Paragraf uzunluğu Opus ile kontrol" },
  }),

  "sentence-readability": () => ({
    status: "warning",
    rawMetrics: { note: "Flesch skoru Opus ile hesaplanır" },
  }),

  "list-usage": () => ({
    status: "warning",
    rawMetrics: { note: "Liste yoğunluğu Opus ile değerlendirilir" },
  }),

  "definition-boxes": () => ({
    status: "warning",
    rawMetrics: { note: "Tanım kutuları Opus ile değerlendirilir" },
  }),

  "qna-sections": (input) => {
    const hasQna =
      jsonLdHasType(input, "FAQPage") ||
      pagesAll(input).some((p) =>
        /\/(sss|faq)/i.test(String(p.url ?? "")),
      );
    return {
      status: hasQna ? "passed" : "warning",
      rawMetrics: { hasQna },
    };
  },

  "markdown-friendly": () => ({
    status: "warning",
    rawMetrics: { note: "Semantic HTML Opus ile değerlendirilir" },
  }),

  "content-depth": (input) => {
    const home = getHomepage(input);
    const words = Number(home?.plain_text_word_count ?? 0);
    return {
      status: words >= 1200 ? "passed" : words >= 600 ? "warning" : "critical",
      rawMetrics: { homepageWords: words },
    };
  },

  // ══ Kategori 5: Query-Match (çoğu Opus) ══
  "title-exact-match": (input) => {
    const home = getHomepage(input);
    const meta = (home?.meta ?? {}) as Record<string, unknown>;
    const title = String(meta.title ?? "");
    return {
      status: title.length > 10 && title.length < 70 ? "warning" : "critical",
      rawMetrics: {
        title,
        note: "Sorgu eşleşmesi Opus ile değerlendirilir",
      },
    };
  },

  "longtail-variations": () => ({
    status: "warning",
    rawMetrics: { note: "Long-tail Opus ile değerlendirilir" },
  }),

  "location-queries": () => ({
    status: "warning",
    rawMetrics: { note: "Lokasyon sorguları Opus ile değerlendirilir" },
  }),

  "comparison-pages": () => ({
    status: "warning",
    rawMetrics: { note: "Karşılaştırma sayfaları Opus ile değerlendirilir" },
  }),

  "listicle-content": () => ({
    status: "warning",
    rawMetrics: { note: "Listicle içerik Opus ile değerlendirilir" },
  }),

  "seasonal-queries": () => ({
    status: "warning",
    rawMetrics: { note: "Sezonsal sorgular Opus ile değerlendirilir" },
  }),

  "competitor-mentions": () => ({
    status: "warning",
    rawMetrics: { note: "Rakip mention Opus ile değerlendirilir" },
  }),

  // ══ Kategori 6: Authority ══
  "backlink-authority": (input) => {
    const b = (input.dataForSeo.backlinks ?? {}) as Record<string, unknown>;
    const rank = Number(b.rank ?? 0);
    const refDomains = Number(b.referring_domains ?? 0);
    const backlinks = Number(b.backlinks ?? 0);

    const status: EvalStatus =
      rank >= 200 || refDomains >= 50
        ? "passed"
        : rank >= 50 || refDomains >= 10
          ? "warning"
          : "critical";

    return {
      status,
      rawMetrics: { rank, refDomains, backlinks },
    };
  },

  "wikipedia-mention": (input) => {
    const citations = input.perplexity.mentions
      .flatMap((m) => m.citations)
      .join(" ");
    const hasWiki = /wikipedia\.org/i.test(citations);
    return {
      status: hasWiki ? "passed" : "warning",
      rawMetrics: { hasWikipedia: hasWiki },
    };
  },

  "forum-discussions": (input) => {
    const citations = input.perplexity.mentions
      .flatMap((m) => m.citations)
      .join(" ");
    const hasForum = /(reddit|quora|eksisozluk|eksi\.co)/i.test(citations);
    return {
      status: hasForum ? "passed" : "warning",
      rawMetrics: { hasForum },
    };
  },

  "video-mentions": (input) => {
    const citations = input.perplexity.mentions
      .flatMap((m) => m.citations)
      .join(" ");
    const hasVideo = /(youtube\.com|youtu\.be|vimeo\.com)/i.test(citations);
    return {
      status: hasVideo ? "passed" : "warning",
      rawMetrics: { hasVideo },
    };
  },

  "press-coverage": (input) => {
    const citations = input.perplexity.mentions
      .flatMap((m) => m.citations)
      .join(" ");
    // Türk haber siteleri
    const hasPress = /(hurriyet|milliyet|sabah|cnn|ntv|cumhuriyet|bloomberg|webrazzi)/i.test(citations);
    return {
      status: hasPress ? "passed" : "warning",
      rawMetrics: { hasPress },
    };
  },

  // ══ Kategori 7: AI Platform ══
  "chatgpt-mention": (input) => {
    // Perplexity Sonar proxy olarak ChatGPT-benzeri ölçüm veriyor.
    const mentions = input.perplexity.mentions;
    const mentionedCount = mentions.filter((m) => m.brandMentioned).length;
    const ratio = mentions.length > 0 ? mentionedCount / mentions.length : 0;
    return {
      status:
        ratio >= 0.8 ? "passed" : ratio >= 0.4 ? "warning" : "critical",
      rawMetrics: { mentionedCount, totalQueries: mentions.length, ratio },
    };
  },

  "multi-platform-coverage": (input) => {
    const mentions = input.perplexity.mentions;
    const mentionedCount = mentions.filter((m) => m.brandMentioned).length;
    return {
      status: mentionedCount >= 3 ? "passed" : mentionedCount >= 1 ? "warning" : "critical",
      rawMetrics: {
        mentionedCount,
        note: "Tek platform (Sonar) ölçüldü — çoklu platform sonraki sprint",
      },
    };
  },

  "google-aio-mention": () => ({
    status: "warning",
    rawMetrics: { note: "Google AIO ölçümü SerpAPI ile sonraki sprint" },
  }),
};

// ───────────────────────────────────────────────────────
// Yardımcılar
// ───────────────────────────────────────────────────────

function extractJsonLd(
  page: Record<string, unknown> | undefined,
): Array<Record<string, unknown>> {
  if (!page) return [];
  // DataForSEO OnPage "structured_data" veya "schema" alanı
  const candidates = [
    page.structured_data,
    page.schema,
    (page as Record<string, unknown>).json_ld,
  ].filter(Boolean);

  const flat: Array<Record<string, unknown>> = [];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      for (const item of c) {
        if (item && typeof item === "object") flat.push(item as Record<string, unknown>);
      }
    } else if (c && typeof c === "object") {
      flat.push(c as Record<string, unknown>);
    }
  }
  return flat;
}

function jsonLdHasType(input: EvalInput, typeName: string): boolean {
  const pages = pagesAll(input);
  for (const p of pages) {
    const jsonLds = extractJsonLd(p);
    for (const j of jsonLds) {
      const t = j["@type"];
      if (t === typeName) return true;
      if (Array.isArray(t) && t.includes(typeName)) return true;
    }
  }
  return false;
}

// ───────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────

export function evaluateItem(
  item: AuditMasterItem,
  input: EvalInput,
): EvalOutput {
  const evaluator = EVALUATORS[item.code];
  if (!evaluator) {
    return {
      status: "warning",
      rawMetrics: { note: `Evaluator not implemented for ${item.code}` },
    };
  }
  try {
    return evaluator(input);
  } catch (err) {
    return {
      status: "warning",
      rawMetrics: { error: String(err) },
    };
  }
}
