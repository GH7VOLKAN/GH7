/**
 * GH7 Audit — 43 madde master listesi (Brief N v4 Aşama 1).
 *
 * 43 madde 3 BOYUT'a ayrılmıştır:
 *   A) SITE_INTERNAL      — Site-içi denetim (15 madde, A1-A4)
 *   B) AUTHORITY_SIGNALS  — Otorite sinyalleri (13 madde, B1-B4)
 *   C) EXTERNAL_SOURCES   — Dış kaynak varlığı (15 madde, C1-C5; kapı bazlı)
 *
 * Her madde bir katmana hizmet eder:
 *   - NICHE     — Niş bilinirlik (AI seni buluyor mu?)
 *   - CATEGORY  — Kategori hakimiyeti (AI seni kategorinin otoritesi biliyor mu?)
 *   - SOURCE    — Kaynak hakimiyeti (AI'ın referans aldığı yerlerde var mısın?)
 *
 * Her maddede `legacyCode` alanı var — eski Brief G audit kayıtlarını yeni
 * koda eşler (Aşama 2'de migration script kullanır).
 */

// ─────────────────────────────────────────────────────
// Boyut + sub-boyut taksonomisi
// ─────────────────────────────────────────────────────

export const AUDIT_BOYUTLAR = {
  SITE_INTERNAL: {
    code: "SITE_INTERNAL",
    label: "Site-İçi",
    description:
      "Kendi sitenin AI tarafından görülebilirliği: crawler izinleri, yapılandırılmış veri, içerik kalitesi, teknik temel.",
    itemCount: 15,
    servesLayer: "NICHE",
  },
  AUTHORITY_SIGNALS: {
    code: "AUTHORITY_SIGNALS",
    label: "Otorite Sinyalleri",
    description:
      "Sektörün otoritesi olarak tanınmak: Wikipedia, backlink profili, PR, thought leadership.",
    itemCount: 13,
    servesLayer: "CATEGORY",
  },
  EXTERNAL_SOURCES: {
    code: "EXTERNAL_SOURCES",
    label: "Dış Kaynak Varlığı",
    description:
      "AI'ın cevabını oluştururken referans aldığı 3. taraf platformlarda varlığın: Tripadvisor, Booking, Google Business, sektörel dizinler.",
    itemCount: 15,
    servesLayer: "SOURCE",
  },
} as const;

export type AuditBoyutCode = keyof typeof AUDIT_BOYUTLAR;
export type ServesLayer = "NICHE" | "CATEGORY" | "SOURCE";

export const AUDIT_SUB_BOYUTLAR = {
  A1: { boyut: "SITE_INTERNAL", label: "AI Crawler İzinleri", order: 1 },
  A2: { boyut: "SITE_INTERNAL", label: "Yapılandırılmış Veri", order: 2 },
  A3: { boyut: "SITE_INTERNAL", label: "İçerik Kalitesi", order: 3 },
  A4: { boyut: "SITE_INTERNAL", label: "Teknik Temel", order: 4 },
  B1: { boyut: "AUTHORITY_SIGNALS", label: "Dış Otorite Sayfaları", order: 5 },
  B2: { boyut: "AUTHORITY_SIGNALS", label: "Backlink Profili", order: 6 },
  B3: { boyut: "AUTHORITY_SIGNALS", label: "PR ve Medya Varlığı", order: 7 },
  B4: { boyut: "AUTHORITY_SIGNALS", label: "Thought Leadership", order: 8 },
  C1: { boyut: "EXTERNAL_SOURCES", label: "Google Ekosistemi", order: 9 },
  C2: {
    boyut: "EXTERNAL_SOURCES",
    label: "Seyahat / Konaklama Platformları",
    order: 10,
  },
  C3: {
    boyut: "EXTERNAL_SOURCES",
    label: "Sektörel Özel Platformlar",
    order: 11,
  },
  C4: { boyut: "EXTERNAL_SOURCES", label: "Sosyal Medya Otoritesi", order: 12 },
  C5: {
    boyut: "EXTERNAL_SOURCES",
    label: "Video ve Zengin İçerik",
    order: 13,
  },
} as const;

export type AuditSubBoyutCode = keyof typeof AUDIT_SUB_BOYUTLAR;

// Legacy category sistem — UI/eski kod geçişi için korunuyor.
// Yeni kod boyut/subBoyut kullanmalı.
export const AUDIT_CATEGORIES = {
  "ai-crawler": {
    code: "ai-crawler",
    label: "AI Crawler İzinleri",
    description: "GPTBot, ClaudeBot gibi AI botlarının erişimi.",
    order: 1,
  },
  "structured-data": {
    code: "structured-data",
    label: "Yapılandırılmış Veri",
    description: "JSON-LD, schema.org işaretlemeleri.",
    order: 2,
  },
  "content-quality": {
    code: "content-quality",
    label: "İçerik Kalitesi",
    description: "Derinlik, hakkımızda, iletişim zenginliği, blog arşivi.",
    order: 3,
  },
  "technical-base": {
    code: "technical-base",
    label: "Teknik Temel",
    description: "Mobile uyum, hız, SSL, meta tag'ler.",
    order: 4,
  },
  "authority-pages": {
    code: "authority-pages",
    label: "Dış Otorite Sayfaları",
    description: "Wikipedia, Wikidata, Google Knowledge Graph.",
    order: 5,
  },
  backlinks: {
    code: "backlinks",
    label: "Backlink Profili",
    description: "Referring domain, anchor dağılımı, editorial linkler.",
    order: 6,
  },
  "pr-media": {
    code: "pr-media",
    label: "PR ve Medya",
    description: "Sektörel medya, haber, ödül, influencer işbirlikleri.",
    order: 7,
  },
  thought: {
    code: "thought",
    label: "Thought Leadership",
    description: "Kurucu sözleri, sektörel içerik, etkinlik katılımı.",
    order: 8,
  },
  google: {
    code: "google",
    label: "Google Ekosistemi",
    description: "Google Business Profile, Maps, Reviews.",
    order: 9,
  },
  travel: {
    code: "travel",
    label: "Seyahat Platformları",
    description: "Tripadvisor, Booking, Hotels.com, Etstur.",
    order: 10,
  },
  sectoral: {
    code: "sectoral",
    label: "Sektörel Platformlar",
    description: "Sektöre özel marketplace ve dizinler.",
    order: 11,
  },
  social: {
    code: "social",
    label: "Sosyal Medya",
    description: "Instagram Business, LinkedIn Company.",
    order: 12,
  },
  "video-rich": {
    code: "video-rich",
    label: "Video ve Fotoğraf",
    description: "YouTube varlığı, zengin fotoğraf arşivi.",
    order: 13,
  },
} as const;

export type AuditCategoryCode = keyof typeof AUDIT_CATEGORIES;

// ─────────────────────────────────────────────────────
// Item tipi
// ─────────────────────────────────────────────────────

export type AuditMasterItem = {
  /** 1-43 sıralı index (pipeline batch'leri kullanıyor) */
  index: number;
  /** Yeni kod formatı: "A1.1", "B2.3", "C1.2" */
  code: string;
  /** Brief G dönemi eski kod — DB migration için */
  legacyCode?: string;
  /** Boyut: SITE_INTERNAL | AUTHORITY_SIGNALS | EXTERNAL_SOURCES */
  boyut: AuditBoyutCode;
  /** Alt-boyut: A1, A2, ..., C5 */
  subBoyut: AuditSubBoyutCode;
  /** Kategori (legacy) — AUDIT_CATEGORIES anahtarı */
  category: AuditCategoryCode;
  /** Bu madde hangi görünürlük katmanına hizmet eder */
  servesLayer: ServesLayer;
  /** Madde firma / kisi / eticaret / yurtdisi kapılarında geçerli mi */
  gates: ReadonlyArray<"FIRMA" | "KISI" | "ETICARET" | "YURTDISI">;
  title: string;
  descriptionStatic: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  measurementMethod: "dataforseo" | "perplexity" | "opus-eval" | "manual";
};

// ─────────────────────────────────────────────────────
// 43 madde — Brief N v4 Aşama 1
// ─────────────────────────────────────────────────────

const ALL_GATES = ["FIRMA", "KISI", "ETICARET", "YURTDISI"] as const;
const FIRMA_ONLY = ["FIRMA"] as const;

export const AUDIT_MASTER_ITEMS: AuditMasterItem[] = [
  // ═══ A1 — AI Crawler İzinleri (3 madde) ═══
  {
    index: 1,
    code: "A1.1",
    legacyCode: "ai-crawler-robots",
    boyut: "SITE_INTERNAL",
    subBoyut: "A1",
    category: "ai-crawler",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "robots.txt — AI crawler izinleri",
    descriptionStatic:
      "GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended (Gemini) ve Bytespider (TikTok) için robots.txt'de açık 'Allow' olmalı veya blok bulunmamalı. AI platformlar siteni bu botlarla tarar — bloklanmış bir botun beslediği modelde markan görünmez.",
    difficulty: "easy",
    estimatedHours: 1,
    measurementMethod: "dataforseo",
  },
  {
    index: 2,
    code: "A1.2",
    legacyCode: "llms-txt",
    boyut: "SITE_INTERNAL",
    subBoyut: "A1",
    category: "ai-crawler",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "llms.txt dosyası mevcut",
    descriptionStatic:
      "Site kökünde /llms.txt dosyası AI dil modelleri için markanın kısa özetini verir. En az 100 kelime; marka adı, temel faaliyet, hedef kitle ve lokasyon olmalı. AI'nın hızlı bir context kurmasını sağlar.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 3,
    code: "A1.3",
    legacyCode: "llms-full-txt",
    boyut: "SITE_INTERNAL",
    subBoyut: "A1",
    category: "ai-crawler",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "llms-full.txt kapsamlı marka dokümantasyonu",
    descriptionStatic:
      "llms.txt'nin genişletilmiş hali. Site kökünde /llms-full.txt, 300+ kelime; marka kimliği, misyon, değerler, ürün/hizmet kataloğu, sıkça sorulan sorular. AI uzun cevaplar üretirken bu dosyadan zengin context çeker.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },

  // ═══ A2 — Yapılandırılmış Veri (4 madde) ═══
  {
    index: 4,
    code: "A2.1",
    legacyCode: "brand-entity-schema",
    boyut: "SITE_INTERNAL",
    subBoyut: "A2",
    category: "structured-data",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Organization / LocalBusiness schema (JSON-LD)",
    descriptionStatic:
      "JSON-LD formatında Organization veya LocalBusiness schema. name, url, logo, address, telephone ve sameAs (sosyal medya, Wikipedia, Wikidata linkleri) alanları dolu olmalı. Entity graph'ında markan tanımlanmış bir varlık haline gelir.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 5,
    code: "A2.2",
    legacyCode: "jsonld-schema-type",
    boyut: "SITE_INTERNAL",
    subBoyut: "A2",
    category: "structured-data",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Kapı-özel schema tipi",
    descriptionStatic:
      "Firma için LocalBusiness/Organization, kişi için Person (+author, jobTitle), e-ticaret için Product + Offer + Brand, yurt dışı için Organization + inLanguage çok dilli. Generic 'Organization' yerine sektöre-özel tip AI'nın doğru kategoride bulmasını sağlar.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 6,
    code: "A2.3",
    legacyCode: "breadcrumb-schema",
    boyut: "SITE_INTERNAL",
    subBoyut: "A2",
    category: "structured-data",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "BreadcrumbList tüm iç sayfalarda",
    descriptionStatic:
      "Her iç sayfada BreadcrumbList JSON-LD. URL hiyerarşisi (Anasayfa > Kategori > Ürün) AI'ya sayfa ilişkisini anlatır. Kategori sayfaları ve ürün sayfaları için kritik.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },
  {
    index: 7,
    code: "A2.4",
    legacyCode: "faqpage-schema",
    boyut: "SITE_INTERNAL",
    subBoyut: "A2",
    category: "structured-data",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "FAQPage schema (3+ soru-cevap)",
    descriptionStatic:
      "Sıkça sorulan sorular sayfasında FAQPage schema ile en az 3 soru-cevap. Markanın temel soruları (kim, nerede, nasıl, fiyat) dahil. AI doğrudan bu structured içerikten cevap çeker; Google AIO ve ChatGPT bu formatı önceliklendirir.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },

  // ═══ A3 — İçerik Kalitesi (4 madde) ═══
  {
    index: 8,
    code: "A3.1",
    legacyCode: "content-depth",
    boyut: "SITE_INTERNAL",
    subBoyut: "A3",
    category: "content-quality",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Ana sayfa derinliği (1000+ kelime)",
    descriptionStatic:
      "Ana sayfada en az 1000 kelime, H1/H2/H3 hiyerarşisi doğru. Marka hikayesi + değer teklifi + öne çıkan özellikler. Thin content AI'da öne çıkmaz.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "dataforseo",
  },
  {
    index: 9,
    code: "A3.2",
    legacyCode: "about-page-rich",
    boyut: "SITE_INTERNAL",
    subBoyut: "A3",
    category: "content-quality",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Hakkımızda sayfası (500+ kelime)",
    descriptionStatic:
      "Hakkımızda sayfasında 500+ kelime: kurucu bilgisi, kuruluş yılı, lokasyon, misyon. Güven sinyalleri (sertifika, dernek üyeliği, ödül) eklenmeli. E-E-A-T (deneyim, uzmanlık, otorite, güven) için kritik.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 10,
    code: "A3.3",
    legacyCode: "location-queries",
    boyut: "SITE_INTERNAL",
    subBoyut: "A3",
    category: "content-quality",
    servesLayer: "NICHE",
    gates: FIRMA_ONLY,
    title: "İletişim sayfası zenginliği",
    descriptionStatic:
      "İletişim sayfasında tam adres (mahalle + cadde + posta kodu), formatted telefon, email, Google Maps embed, çalışma saatleri. LocalBusiness schema ile eşleşen veri olmalı.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 11,
    code: "A3.4",
    legacyCode: "blog-archive",
    boyut: "SITE_INTERNAL",
    subBoyut: "A3",
    category: "content-quality",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Blog / içerik arşivi (10+ içerik, güncel)",
    descriptionStatic:
      "En az 10 sektörel içerik, son 6 ayda en az 1 güncelleme. Blog AI'nın 'bu marka sektörde aktif' sinyali almasını sağlar. Her içerik sektörel bilgi değeri taşımalı, sadece promosyon olmamalı.",
    difficulty: "medium",
    estimatedHours: 20,
    measurementMethod: "dataforseo",
  },

  // ═══ A4 — Teknik Temel (4 madde) ═══
  {
    index: 12,
    code: "A4.1",
    legacyCode: "mobile-responsive",
    boyut: "SITE_INTERNAL",
    subBoyut: "A4",
    category: "technical-base",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Mobile responsive + hız",
    descriptionStatic:
      "Responsive tasarım + mobil Lighthouse skoru 80+. AI'nın mobil kaynakları indexing öncelikleri yüksek. Mobile-first index çağında ayrı mobil site yerine responsive single-code base.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "dataforseo",
  },
  {
    index: 13,
    code: "A4.2",
    legacyCode: "site-speed",
    boyut: "SITE_INTERNAL",
    subBoyut: "A4",
    category: "technical-base",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Site hızı (Lighthouse 85+, LCP < 2.5s)",
    descriptionStatic:
      "Desktop Lighthouse Performance 85+, Largest Contentful Paint 2.5 saniyeden az. Core Web Vitals AI crawler'lar için de kalite sinyali. Yavaş siteler index önceliği kaybeder.",
    difficulty: "hard",
    estimatedHours: 16,
    measurementMethod: "dataforseo",
  },
  {
    index: 14,
    code: "A4.3",
    legacyCode: "ssl-security",
    boyut: "SITE_INTERNAL",
    subBoyut: "A4",
    category: "technical-base",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "SSL ve güvenlik header'ları",
    descriptionStatic:
      "HTTPS zorunlu, geçerli sertifika, HSTS + CSP + X-Frame-Options. Güvenlik zafiyeti olan siteler AI cevaplarında daha az referans alır.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 15,
    code: "A4.4",
    legacyCode: "meta-tags",
    boyut: "SITE_INTERNAL",
    subBoyut: "A4",
    category: "technical-base",
    servesLayer: "NICHE",
    gates: ALL_GATES,
    title: "Meta tag'ler + OpenGraph",
    descriptionStatic:
      "Her sayfada benzersiz title, 150-160 karakterlik meta description, og:title/og:image/og:description, Twitter cards. Sosyal paylaşım + AI scraper'lar bu metadata'yı birinci kaynak olarak kullanır.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },

  // ═══ B1 — Dış Otorite Sayfaları (3 madde) ═══
  {
    index: 16,
    code: "B1.1",
    legacyCode: "wikipedia-mention",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B1",
    category: "authority-pages",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Wikipedia varlığı (TR ve opsiyonel EN)",
    descriptionStatic:
      "Türkçe Wikipedia sayfası veya Wikipedia makalelerinde bahsedilme. Min. 500 kelime, 3+ bağımsız referans. Wikipedia tier-1 otorite sinyali; AI modelleri eğitim verisinde ağır ağırlık verir.",
    difficulty: "hard",
    estimatedHours: 20,
    measurementMethod: "perplexity",
  },
  {
    index: 17,
    code: "B1.2",
    legacyCode: "wikidata-entry",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B1",
    category: "authority-pages",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Wikidata entry + doğru 'instance of'",
    descriptionStatic:
      "Wikidata ID'si, doğru instance of kategorisi (örn. Q1145036 bungalov tesisi), resmi site linki. Wikidata, AI Knowledge Graph'ın altyapısıdır.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "perplexity",
  },
  {
    index: 18,
    code: "B1.3",
    legacyCode: "knowledge-graph",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B1",
    category: "authority-pages",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Google Knowledge Panel + DBpedia",
    descriptionStatic:
      "Google'da marka adı aratıldığında sağda Knowledge Panel çıkıyor mu? DBpedia'da doğru kategorizasyon. Google'ın knowledge ekosistemi AI cevaplarına direkt beslenir.",
    difficulty: "hard",
    estimatedHours: 12,
    measurementMethod: "perplexity",
  },

  // ═══ B2 — Backlink Profili (3 madde) ═══
  {
    index: 19,
    code: "B2.1",
    legacyCode: "backlink-authority",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B2",
    category: "backlinks",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Referring domain sayısı ve kalite (DR 30+)",
    descriptionStatic:
      "DataForSEO Backlinks ile referring domain sayısı sektör ortalaması üstü. DR (Domain Rating) 30+ domain'lerin oranı >%40. Spam değil, kalite ağırlıklı backlink profili.",
    difficulty: "hard",
    estimatedHours: 40,
    measurementMethod: "dataforseo",
  },
  {
    index: 20,
    code: "B2.2",
    legacyCode: "anchor-distribution",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B2",
    category: "backlinks",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Anchor text dağılımı doğal",
    descriptionStatic:
      "Marka adı anchor %30-50, doğal dağılım (URL, generic, brand, exact match karışık). Over-optimized exact match anchor spam sinyali. Anchor text çeşitliliği AI'nın marka ilişkilerini kurmasını sağlar.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "dataforseo",
  },
  {
    index: 21,
    code: "B2.3",
    legacyCode: "editorial-links",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B2",
    category: "backlinks",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Editorial link varlığı (haber + sektörel)",
    descriptionStatic:
      "Hürriyet, Milliyet, Sabah, NTV, Ekonomist, sektörel medya gibi editorial kaynaklarda en az 3 link. Editorial linkler reklam değil, içerik bağlamında verilir — AI için en değerli otorite sinyali.",
    difficulty: "hard",
    estimatedHours: 30,
    measurementMethod: "perplexity",
  },

  // ═══ B3 — PR ve Medya Varlığı (4 madde) ═══
  {
    index: 22,
    code: "B3.1",
    legacyCode: "press-coverage",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B3",
    category: "pr-media",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Sektörel medyada bahsedilme (son 12 ay)",
    descriptionStatic:
      "Sektöre özel medyada (Hotels Magazine, Turizm Aktüel, Digital Age gibi) son 12 ayda en az 1 haber veya röportaj. AI'nın 'bu marka sektörde aktif' sinyalini almasını sağlar.",
    difficulty: "hard",
    estimatedHours: 20,
    measurementMethod: "perplexity",
  },
  {
    index: 23,
    code: "B3.2",
    legacyCode: "press-mentions",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B3",
    category: "pr-media",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Haber değeri olan içerik (basın bülteni, demeç)",
    descriptionStatic:
      "Basın bülteni yayınları, genel medyada röportaj/demeç, yeni ürün/hizmet duyuruları. Tek seferlik değil, sürekli yayın akışı. AI 'bu marka haberlerde geçiyor' otorite sinyali.",
    difficulty: "hard",
    estimatedHours: 15,
    measurementMethod: "perplexity",
  },
  {
    index: 24,
    code: "B3.3",
    legacyCode: "awards-certifications",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B3",
    category: "pr-media",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Ödül / sertifika / dernek üyeliği",
    descriptionStatic:
      "Sektörel ödüller (Altın Pusula, Stevie, sektöre özel), ISO/Michelin/Green Key gibi uluslararası sertifikalar, sektörel dernek/oda üyeliği. AI bu sinyalleri otorite skorlamasında kullanır.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "opus-eval",
  },
  {
    index: 25,
    code: "B3.4",
    legacyCode: "influencer-mentions",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B3",
    category: "pr-media",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Influencer / gazeteci işbirlikleri",
    descriptionStatic:
      "YouTube video bahsedilmesi, bağımsız blog yazıları (kendi dışında), podcast konukluğu. Social proof + semantic neighborhood — AI'nın markayı benzer otoritelerle eşlemesini sağlar.",
    difficulty: "medium",
    estimatedHours: 15,
    measurementMethod: "perplexity",
  },

  // ═══ B4 — Thought Leadership (3 madde) ═══
  {
    index: 26,
    code: "B4.1",
    legacyCode: "founder-voice",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B4",
    category: "thought",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Kurucu / uzman sözleri (röportaj, makale, video)",
    descriptionStatic:
      "Kurucu veya marka uzmanı adına sektörel röportaj, görüş makalesi, konuşma videosu. AI 'bu markanın arkasında gerçek uzman var' signal'ı — kategori otoritesi için kritik.",
    difficulty: "medium",
    estimatedHours: 12,
    measurementMethod: "opus-eval",
  },
  {
    index: 27,
    code: "B4.2",
    legacyCode: "sector-content",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B4",
    category: "thought",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Sektörel içerik üretimi (rehber, rapor, analiz)",
    descriptionStatic:
      "Kendi blogunda sektörel analizler, trend raporları, karşılaştırma rehberleri. Sadece promosyon değil, bilgi-değeri üreten içerik. AI bu içerikleri 'bilgili kaynak' olarak gösterir.",
    difficulty: "hard",
    estimatedHours: 30,
    measurementMethod: "opus-eval",
  },
  {
    index: 28,
    code: "B4.3",
    legacyCode: "event-participation",
    boyut: "AUTHORITY_SIGNALS",
    subBoyut: "B4",
    category: "thought",
    servesLayer: "CATEGORY",
    gates: ALL_GATES,
    title: "Etkinlik / konferans katılımı",
    descriptionStatic:
      "Konuşmacı olarak sektörel etkinlik katılımı, panel düzenleme, workshop. Etkinliklerin kayıtları, görüntüleri, haber yansımaları — AI'nın 'sektörde görünür uzman' tanımını güçlendirir.",
    difficulty: "medium",
    estimatedHours: 20,
    measurementMethod: "perplexity",
  },

  // ═══ C1 — Google Ekosistemi (3 madde) — Firma kapısı ═══
  {
    index: 29,
    code: "C1.1",
    legacyCode: "google-business-profile",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C1",
    category: "google",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Google Business Profile (tam doldurulmuş)",
    descriptionStatic:
      "Google Business Profile oluşturulmuş, kategori doğru, çalışma saatleri ve tüm alanlar dolu, 10+ fotoğraf. Google AI Overview ve Maps AI cevaplarında bu profili birinci kaynak alır.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },
  {
    index: 30,
    code: "C1.2",
    legacyCode: "google-maps",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C1",
    category: "google",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Google Maps entegrasyonu + review linki",
    descriptionStatic:
      "Sitede Google Maps embed, Maps'te konum doğru işaretlenmiş, review linki site üzerinden paylaşılabilir. Lokal AI cevaplarında (yakınımda, nerede) Maps verisi öne çıkar.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 31,
    code: "C1.3",
    legacyCode: "google-reviews",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C1",
    category: "google",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Google Reviews (50+ yorum, 4.5+ puan, cevap aktif)",
    descriptionStatic:
      "En az 50 yorum (sektör bazında farklılaşır), 4.5/5 üstü ortalama, sahibi cevapları düzenli. Review count AI'nın güven skorlamasında direkt etkili.",
    difficulty: "hard",
    estimatedHours: 30,
    measurementMethod: "perplexity",
  },

  // ═══ C2 — Seyahat / Konaklama Platformları (4 madde) ═══
  {
    index: 32,
    code: "C2.1",
    legacyCode: "tripadvisor",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C2",
    category: "travel",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Tripadvisor profili (claim + 30+ review)",
    descriptionStatic:
      "Tripadvisor profili claim edilmiş, tam bilgi dolu, en az 30 yorum. Tripadvisor AI'ların kategori sorgularında en sık referans aldığı kaynak — sektörel otoriteyi belgeleyen adres.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "perplexity",
  },
  {
    index: 33,
    code: "C2.2",
    legacyCode: "booking-com",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C2",
    category: "travel",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Booking.com listesi + zengin fotoğraf",
    descriptionStatic:
      "Booking.com'da aktif, fotoğraf zengin, fiyatlandırma güncel. Booking AI'ın 'önerilen konaklama' cevaplarında direkt beslediği kaynak.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "perplexity",
  },
  {
    index: 34,
    code: "C2.3",
    legacyCode: "hotels-expedia",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C2",
    category: "travel",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Hotels.com / Expedia listesi (review 8+)",
    descriptionStatic:
      "Hotels.com veya Expedia'da liste, review skoru 8/10 üstü. Uluslararası AI cevaplarında özellikle yabancı kullanıcılar için referans kaynak.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "perplexity",
  },
  {
    index: 35,
    code: "C2.4",
    legacyCode: "etstur-tatilcom",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C2",
    category: "travel",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Etstur / Tatil.com listesi (Türkçe platform)",
    descriptionStatic:
      "Etstur, Tatil.com, Otelz gibi Türkçe konaklama platformlarında listeleme. Türkçe AI sorgularında lokal platformlar birinci referans.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "perplexity",
  },

  // ═══ C3 — Sektörel Özel Platformlar (4 madde, sektöre göre değişken) ═══
  {
    index: 36,
    code: "C3.1",
    legacyCode: "sectoral-platform-1",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C3",
    category: "sectoral",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Sektörel platform #1 (sektöre göre)",
    descriptionStatic:
      "Restaurant: Zomato/Foursquare; Konaklama: Agoda/Otelz; Hizmet: Armut.com; Emlak: Hepsiemlak/Sahibinden. Sektörün en çok kullanılan özel platformunda varlık.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "perplexity",
  },
  {
    index: 37,
    code: "C3.2",
    legacyCode: "sectoral-platform-2",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C3",
    category: "sectoral",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Sektörel platform #2",
    descriptionStatic:
      "İkincil sektörel platformda varlık — ikincil arama kaynaklarını yakalamak için. AI kaynak çeşitliliği arayanlara alternatif öner.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "perplexity",
  },
  {
    index: 38,
    code: "C3.3",
    legacyCode: "sectoral-directory",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C3",
    category: "sectoral",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Sektörel dizin / katalog",
    descriptionStatic:
      "Sektörel yellow pages, oda rehberi, dernek üye listesi, B2B katalog. Niş ama otorite sayılan dizinler AI'nın kategori authority hesabında pay sahibi.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 39,
    code: "C3.4",
    legacyCode: "review-platform",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C3",
    category: "sectoral",
    servesLayer: "SOURCE",
    gates: FIRMA_ONLY,
    title: "Review platformları (Şikayetvar, Ekşi Sözlük)",
    descriptionStatic:
      "Şikayetvar'da yanıt oranı yüksek, çözülmüş şikayetler. Ekşi Sözlük'te marka başlığı var, nötr-pozitif ağırlıklı. AI sentiment analizinde bu platformlar direkt kullanılır.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "perplexity",
  },

  // ═══ C4 — Sosyal Medya Otoritesi (2 madde) ═══
  {
    index: 40,
    code: "C4.1",
    legacyCode: "instagram-business",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C4",
    category: "social",
    servesLayer: "SOURCE",
    gates: ALL_GATES,
    title: "Instagram Business (1000+ takipçi, aktif)",
    descriptionStatic:
      "Instagram Business hesap, mümkünse verified, en az 1000 takipçi, son 30 günde düzenli post. Instagram AI görsel ve lokal sorgularda referans alıyor.",
    difficulty: "medium",
    estimatedHours: 15,
    measurementMethod: "perplexity",
  },
  {
    index: 41,
    code: "C4.2",
    legacyCode: "linkedin-company",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C4",
    category: "social",
    servesLayer: "SOURCE",
    gates: ALL_GATES,
    title: "LinkedIn Company Page (dolu, aktif)",
    descriptionStatic:
      "LinkedIn Company Page profili tam, employee count görünür, son 30 günde post. B2B AI sorgularda LinkedIn birincil otorite kaynağı.",
    difficulty: "easy",
    estimatedHours: 5,
    measurementMethod: "perplexity",
  },

  // ═══ C5 — Video ve Zengin İçerik (2 madde) ═══
  {
    index: 42,
    code: "C5.1",
    legacyCode: "youtube-presence",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C5",
    category: "video-rich",
    servesLayer: "SOURCE",
    gates: ALL_GATES,
    title: "YouTube kanal veya marka içeren video",
    descriptionStatic:
      "Kendi YouTube kanalı (tanıtım, müşteri videoları) VEYA bağımsız kanallarda markayı gösteren video içeriği. AI video platformlarından transcript çekip referans alır.",
    difficulty: "medium",
    estimatedHours: 15,
    measurementMethod: "perplexity",
  },
  {
    index: 43,
    code: "C5.2",
    legacyCode: "photo-richness",
    boyut: "EXTERNAL_SOURCES",
    subBoyut: "C5",
    category: "video-rich",
    servesLayer: "SOURCE",
    gates: ALL_GATES,
    title: "Zengin fotoğraf arşivi (Google Images, stock)",
    descriptionStatic:
      "Google Images'ta marka adı aratıldığında çok sayıda fotoğraf, Unsplash/Shutterstock gibi stock sitelerinde varlık. Multimedia AI cevaplarında görsel zenginlik otorite sinyali.",
    difficulty: "medium",
    estimatedHours: 12,
    measurementMethod: "opus-eval",
  },
];

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

export function getItemByCode(code: string): AuditMasterItem | undefined {
  return AUDIT_MASTER_ITEMS.find(
    (item) => item.code === code || item.legacyCode === code,
  );
}

export function getItemsByCategory(
  category: AuditCategoryCode,
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) => item.category === category);
}

export function getItemsByBoyut(
  boyut: AuditBoyutCode,
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) => item.boyut === boyut);
}

export function getItemsBySubBoyut(
  subBoyut: AuditSubBoyutCode,
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) => item.subBoyut === subBoyut);
}

export function getItemsByServesLayer(
  layer: ServesLayer,
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) => item.servesLayer === layer);
}

export function getItemsByGate(
  gate: "FIRMA" | "KISI" | "ETICARET" | "YURTDISI",
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) =>
    (item.gates as readonly string[]).includes(gate),
  );
}

/** Legacy code → new code mapping (Aşama 2 migration için) */
export function mapLegacyCode(legacyCode: string): string | undefined {
  return AUDIT_MASTER_ITEMS.find((i) => i.legacyCode === legacyCode)?.code;
}

/** Aşama 1 doğrulama: 15 + 13 + 15 = 43 olmalı */
export function validateMasterList(): {
  ok: boolean;
  counts: Record<AuditBoyutCode, number>;
  total: number;
} {
  const counts = {
    SITE_INTERNAL: getItemsByBoyut("SITE_INTERNAL").length,
    AUTHORITY_SIGNALS: getItemsByBoyut("AUTHORITY_SIGNALS").length,
    EXTERNAL_SOURCES: getItemsByBoyut("EXTERNAL_SOURCES").length,
  };
  const total = AUDIT_MASTER_ITEMS.length;
  const ok =
    counts.SITE_INTERNAL === 15 &&
    counts.AUTHORITY_SIGNALS === 13 &&
    counts.EXTERNAL_SOURCES === 15 &&
    total === 43;
  return { ok, counts, total };
}
