/**
 * 43 madde × 4 kullanıcı tipi için ağırlık matrisi.
 *
 * Her tipe göre hangi maddelerin daha önemli olduğunu belirler.
 * Toplam ağırlık 1.0 olacak şekilde normalize edilir.
 *
 * Kategoriler:
 * - content: İçerik Otoritesi (10 madde)
 * - schema: Yapılandırılmış Veri (8 madde)
 * - entity: Entity & Kimlik (7 madde)
 * - tech: Teknik Erişilebilirlik (7 madde)
 * - external: Dış Referanslar (5 madde)
 * - ai: AI Platform Görünürlüğü (6 madde)
 */

export type UserType = "firma" | "kisi" | "eticaret" | "yurtdisi";

export type AuditCategory = "content" | "schema" | "entity" | "tech" | "external" | "ai";

// Kategori bazında kullanıcı tipine göre ağırlıklar (%).
export const CATEGORY_WEIGHTS: Record<UserType, Record<AuditCategory, number>> = {
  firma: {
    content: 15,
    schema: 18,
    entity: 22,   // Local SEO & kimlik ağırlıklı
    tech: 15,
    external: 15,
    ai: 15,
  },
  kisi: {
    content: 25,  // E-E-A-T & derin içerik ağırlıklı
    schema: 10,
    entity: 25,   // Personal brand identity
    tech: 10,
    external: 15,
    ai: 15,
  },
  eticaret: {
    content: 20,  // Ürün karşılaştırma & incelemeler
    schema: 25,   // Product + Review schema kritik
    entity: 15,
    tech: 15,
    external: 10,
    ai: 15,
  },
  yurtdisi: {
    content: 18,
    schema: 17,
    entity: 20,   // International entity sinyalleri
    tech: 20,     // hreflang, mobile, pagespeed
    external: 10,
    ai: 15,
  },
};

// 43 madde tanımları
export interface AuditItem {
  key: string;
  category: AuditCategory;
  label: string;
  description: string;
  // Bu madde hangi kullanıcı tipi için "kritik" olarak işaretlenecek (görselde vurgu)
  criticalFor: UserType[];
}

export const AUDIT_ITEMS: AuditItem[] = [
  // ═══ İÇERİK OTORİTESİ (10) ═══
  { key: "content.blog_count", category: "content", label: "Blog sayısı", description: "Sitenizde en az 10 içerik olması beklenir.", criticalFor: ["firma", "kisi"] },
  { key: "content.depth", category: "content", label: "Ortalama içerik derinliği", description: "Ortalama 800+ kelime derinliğinde içerik.", criticalFor: ["firma", "kisi", "eticaret"] },
  { key: "content.variety", category: "content", label: "Konu çeşitliliği", description: "En az 5 farklı konu başlığı.", criticalFor: ["firma", "kisi"] },
  { key: "content.recency", category: "content", label: "İçerik güncelliği (son 6 ay)", description: "Son 6 ayda yayınlanmış içerik mevcut mu?", criticalFor: ["firma", "kisi", "eticaret"] },
  { key: "content.faq_format", category: "content", label: "Soru-cevap format", description: "FAQ tarzı içerik (AI'lar çok seviyor).", criticalFor: ["firma", "kisi", "eticaret"] },
  { key: "content.howto", category: "content", label: "How-to rehberi", description: "Adım adım rehber içerik.", criticalFor: ["firma", "kisi"] },
  { key: "content.comparison", category: "content", label: "Karşılaştırma yazısı", description: "Ürün/hizmet karşılaştırması.", criticalFor: ["eticaret"] },
  { key: "content.statistics", category: "content", label: "İstatistik içerik", description: "Veri, grafik, araştırma sonucu.", criticalFor: ["kisi"] },
  { key: "content.original_research", category: "content", label: "Orijinal araştırma", description: "Sektörel anket, case study, veri analizi.", criticalFor: ["kisi"] },
  { key: "content.eeat", category: "content", label: "E-E-A-T sinyalleri", description: "Yazar bilgisi, kaynak gösterimi, tarih.", criticalFor: ["kisi"] },

  // ═══ YAPILANDIRILMIŞ VERİ (8) ═══
  { key: "schema.organization", category: "schema", label: "Organization schema", description: "Şirket bilgileri JSON-LD.", criticalFor: ["firma"] },
  { key: "schema.localbusiness", category: "schema", label: "LocalBusiness schema", description: "Adres, telefon, saat JSON-LD.", criticalFor: ["firma"] },
  { key: "schema.product", category: "schema", label: "Product schema", description: "Ürün bilgileri JSON-LD.", criticalFor: ["eticaret"] },
  { key: "schema.faq", category: "schema", label: "FAQ schema", description: "Sık sorulan sorular JSON-LD.", criticalFor: ["firma", "eticaret"] },
  { key: "schema.howto", category: "schema", label: "HowTo schema", description: "Adım adım rehber JSON-LD.", criticalFor: ["firma"] },
  { key: "schema.review", category: "schema", label: "Review schema", description: "Müşteri yorumu JSON-LD.", criticalFor: ["eticaret"] },
  { key: "schema.breadcrumb", category: "schema", label: "BreadcrumbList schema", description: "Site navigasyonu JSON-LD.", criticalFor: ["eticaret"] },
  { key: "schema.person", category: "schema", label: "Person schema", description: "Kişi profili JSON-LD.", criticalFor: ["kisi"] },

  // ═══ ENTITY & KİMLİK (7) ═══
  { key: "entity.knowledge_panel", category: "entity", label: "Knowledge Panel", description: "Google Knowledge Panel mevcut mu?", criticalFor: ["firma", "kisi", "yurtdisi"] },
  { key: "entity.wikidata", category: "entity", label: "Wikipedia/Wikidata", description: "Wikidata entry mevcut mu?", criticalFor: ["kisi", "yurtdisi"] },
  { key: "entity.linkedin", category: "entity", label: "LinkedIn Company/Profil", description: "LinkedIn varlığı ve optimizasyonu.", criticalFor: ["firma", "kisi", "yurtdisi"] },
  { key: "entity.gbp", category: "entity", label: "Google Business Profile", description: "GBP kaydı ve güncel bilgiler.", criticalFor: ["firma", "eticaret"] },
  { key: "entity.nap", category: "entity", label: "NAP tutarlılığı", description: "Name, Address, Phone her yerde aynı.", criticalFor: ["firma"] },
  { key: "entity.directories", category: "entity", label: "Sektör dizinleri", description: "Sektörel dizin kayıtları (Armut, ŞikayetVar vb).", criticalFor: ["firma", "eticaret"] },
  { key: "entity.brand_ranking", category: "entity", label: "Marka araması 1. sıra", description: "Kendi marka adınızı arattığınızda 1. sırada mısınız?", criticalFor: ["firma", "eticaret"] },

  // ═══ TEKNİK ERİŞİLEBİLİRLİK (7) ═══
  { key: "tech.ai_bots", category: "tech", label: "AI botları erişimi", description: "GPTBot, ClaudeBot, Google-Extended robots.txt'te izinli.", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "tech.sitemap", category: "tech", label: "Sitemap.xml", description: "Güncel sitemap mevcut ve indexlenmiş.", criticalFor: ["firma", "eticaret", "yurtdisi"] },
  { key: "tech.pagespeed", category: "tech", label: "Sayfa hızı", description: "Core Web Vitals (LCP, CLS, INP) geçiyor.", criticalFor: ["eticaret", "yurtdisi"] },
  { key: "tech.mobile", category: "tech", label: "Mobile uyumluluk", description: "Mobile-first indexing geçiyor.", criticalFor: ["firma", "eticaret", "yurtdisi"] },
  { key: "tech.https", category: "tech", label: "HTTPS", description: "SSL sertifikası geçerli ve aktif.", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "tech.canonical", category: "tech", label: "Canonical tag", description: "Canonical URL doğru tanımlı.", criticalFor: ["eticaret"] },
  { key: "tech.hreflang", category: "tech", label: "Hreflang", description: "Çok dilli site için hreflang tag'leri.", criticalFor: ["yurtdisi"] },

  // ═══ DIŞ REFERANSLAR (5) ═══
  { key: "external.backlinks", category: "external", label: "Toplam backlink", description: "En az 100 kaliteli backlink.", criticalFor: ["firma", "eticaret", "yurtdisi"] },
  { key: "external.referring_domains", category: "external", label: "Referring domain sayısı", description: "En az 30 farklı domain'den referans.", criticalFor: ["firma", "eticaret", "yurtdisi"] },
  { key: "external.authority", category: "external", label: "Otorite referansları", description: "High-DR sitelerden referans (DR>50).", criticalFor: ["kisi", "yurtdisi"] },
  { key: "external.social", category: "external", label: "Sosyal mention", description: "Twitter, Reddit, LinkedIn mention'ları.", criticalFor: ["kisi"] },
  { key: "external.media", category: "external", label: "Basın/medya coverage", description: "Haber siteleri, röportaj, podcast.", criticalFor: ["kisi", "firma"] },

  // ═══ AI PLATFORM GÖRÜNÜRLÜĞÜ (6) ═══
  { key: "ai.chatgpt", category: "ai", label: "ChatGPT önerilme oranı", description: "ChatGPT'de sorgularda ne sıklıkla öneriliyorsunuz?", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "ai.claude", category: "ai", label: "Claude önerilme oranı", description: "Claude'da sorgularda ne sıklıkla öneriliyorsunuz?", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "ai.gemini", category: "ai", label: "Gemini önerilme oranı", description: "Gemini'de sorgularda ne sıklıkla öneriliyorsunuz?", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "ai.perplexity", category: "ai", label: "Perplexity önerilme oranı", description: "Perplexity'de sorgularda ne sıklıkla öneriliyorsunuz?", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
  { key: "ai.google_aio", category: "ai", label: "Google AIO önerilme oranı", description: "Google AI Overview'da görünürlük.", criticalFor: ["firma", "eticaret"] },
  { key: "ai.overall", category: "ai", label: "Genel AI görünürlük skoru", description: "5 platform ortalaması (weighted by position).", criticalFor: ["firma", "kisi", "eticaret", "yurtdisi"] },
];

export function getItemsByCategory(category: AuditCategory): AuditItem[] {
  return AUDIT_ITEMS.filter((i) => i.category === category);
}

export function isCriticalForUser(itemKey: string, userType: UserType): boolean {
  const item = AUDIT_ITEMS.find((i) => i.key === itemKey);
  return item?.criticalFor.includes(userType) ?? false;
}

/**
 * Kullanıcı tipi için toplam ağırlıklı skor hesapla.
 * Her madde 0/5/10 puan alır. Kategori skorları ortalamalı.
 * Genel skor: kategori ağırlıklarına göre ağırlıklı ortalama (0-100).
 */
export function calculateOverallScore(
  userType: UserType,
  itemScores: Record<string, number> // key → 0/5/10
): { overall: number; byCategory: Record<AuditCategory, number> } {
  const categoryScores: Record<AuditCategory, number> = {
    content: 0,
    schema: 0,
    entity: 0,
    tech: 0,
    external: 0,
    ai: 0,
  };

  const categoryCounts: Record<AuditCategory, number> = {
    content: 0,
    schema: 0,
    entity: 0,
    tech: 0,
    external: 0,
    ai: 0,
  };

  for (const item of AUDIT_ITEMS) {
    const score = itemScores[item.key] ?? 0;
    categoryScores[item.category] += score;
    categoryCounts[item.category]++;
  }

  // Kategori skorlarını 0-100'e normalize et
  const byCategory: Record<AuditCategory, number> = {
    content: 0,
    schema: 0,
    entity: 0,
    tech: 0,
    external: 0,
    ai: 0,
  };
  for (const cat of Object.keys(categoryScores) as AuditCategory[]) {
    const maxPossible = categoryCounts[cat] * 10;
    byCategory[cat] = maxPossible > 0 ? Math.round((categoryScores[cat] / maxPossible) * 100) : 0;
  }

  // Genel skor: kullanıcı tipine göre ağırlıklı ortalama
  const weights = CATEGORY_WEIGHTS[userType];
  let weightedSum = 0;
  let totalWeight = 0;
  for (const cat of Object.keys(byCategory) as AuditCategory[]) {
    weightedSum += byCategory[cat] * weights[cat];
    totalWeight += weights[cat];
  }

  const overall = Math.round(weightedSum / totalWeight);

  return { overall, byCategory };
}
