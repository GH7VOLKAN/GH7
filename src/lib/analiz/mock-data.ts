/**
 * Mock sample data. Gerçek API'lar bağlanana kadar /api/analiz route'ları
 * bu veriyi döner. Prototip HTML'deki ISITMAX örneğiyle birebir.
 */

import type { AnalysisResult, DetectResult, AuditItem } from "./types";

export const MOCK_DETECT: DetectResult = {
  domain: "isitmax.com",
  sector: "Isıtma sistemleri",
  products: [
    { id: "p1", name: "Yerden ısıtma sistemleri", subcatCount: 42 },
    { id: "p2", name: "Isıtma kablosu (heat trace)", subcatCount: 18 },
    { id: "p3", name: "Varil ve tank ısıtıcı", subcatCount: 12 },
    { id: "p4", name: "Sera ısıtma sistemleri", subcatCount: 9 },
    { id: "p5", name: "Jeotermal ısı pompaları", subcatCount: 6 },
  ],
  competitorsByProductId: {
    p1: [
      { id: "c1", domain: "danfoss.com.tr", mentions: { perplexity: 1, chatgpt: 2 } },
      { id: "c2", domain: "rehau.com", mentions: { perplexity: 2, gemini: 1 } },
      { id: "c3", domain: "henco.com.tr", mentions: { chatgpt: 3, claude: 2 } },
      { id: "c4", domain: "uponor.com", mentions: { perplexity: 3 } },
      { id: "c5", domain: "wavin.com", mentions: { gemini: 4 } },
    ],
    p2: [
      { id: "c6", domain: "raychem.com", mentions: { chatgpt: 1 } },
      { id: "c7", domain: "nvent.com", mentions: { perplexity: 2 } },
      { id: "c8", domain: "danfoss.com.tr", mentions: { claude: 1 } },
      { id: "c9", domain: "thermon.com", mentions: { gemini: 3 } },
      { id: "c10", domain: "bartec.de", mentions: { chatgpt: 4 } },
    ],
    p3: [
      { id: "c11", domain: "hotwatt.com", mentions: { perplexity: 2 } },
      { id: "c12", domain: "watlow.com", mentions: { chatgpt: 1 } },
      { id: "c13", domain: "tempco.com", mentions: { gemini: 3 } },
      { id: "c14", domain: "chromalox.com", mentions: { claude: 2 } },
      { id: "c15", domain: "omega.com", mentions: { perplexity: 1 } },
    ],
    p4: [
      { id: "c16", domain: "priva.com", mentions: { chatgpt: 1 } },
      { id: "c17", domain: "cmf-greenhouses.com", mentions: { perplexity: 2 } },
    ],
    p5: [
      { id: "c18", domain: "viessmann.com.tr", mentions: { chatgpt: 1 } },
      { id: "c19", domain: "vaillant.com.tr", mentions: { gemini: 2 } },
      { id: "c20", domain: "bosch.com.tr", mentions: { perplexity: 1 } },
    ],
  },
};

const AUDIT_ITEMS: AuditItem[] = [
  // Teknik altyapı (8)
  { id: "a1",  group: "Teknik altyapı",          title: "FAQ şeması (FAQPage JSON-LD)",              impact: "high",   you: "no",      them: "yes" },
  { id: "a2",  group: "Teknik altyapı",          title: "Product schema — ana ürün sayfalarında",    impact: "high",   you: "partial", them: "yes" },
  { id: "a3",  group: "Teknik altyapı",          title: "Organization schema",                       impact: "medium", you: "yes",     them: "yes" },
  { id: "a4",  group: "Teknik altyapı",          title: "HowTo schema",                              impact: "medium", you: "no",      them: "yes" },
  { id: "a5",  group: "Teknik altyapı",          title: "Sitemap.xml güncelliği",                    impact: "low",    you: "yes",     them: "yes" },
  { id: "a6",  group: "Teknik altyapı",          title: "robots.txt — AI botlarına izin",            impact: "medium", you: "yes",     them: "yes" },
  { id: "a7",  group: "Teknik altyapı",          title: "llms.txt dosyası",                          impact: "high",   you: "no",      them: "no"  },
  { id: "a8",  group: "Teknik altyapı",          title: "Core Web Vitals (LCP, INP, CLS)",           impact: "medium", you: "no",      them: "yes" },
  // İçerik yapısı (10)
  { id: "a9",  group: "İçerik yapısı",           title: "Kategori başına kapsamlı rehber içerik",    impact: "high",   you: "partial", them: "yes" },
  { id: "a10", group: "İçerik yapısı",           title: "Karşılaştırma yazıları (vs diğer markalar)",impact: "high",   you: "no",      them: "yes" },
  { id: "a11", group: "İçerik yapısı",           title: "Soru-cevap sayfaları (SSS)",                impact: "medium", you: "no",      them: "yes" },
  { id: "a12", group: "İçerik yapısı",           title: "Vaka çalışması / case study",               impact: "medium", you: "yes",     them: "yes" },
  { id: "a13", group: "İçerik yapısı",           title: "Ürün karşılaştırma tabloları",              impact: "medium", you: "no",      them: "yes" },
  { id: "a14", group: "İçerik yapısı",           title: "Hesaplayıcı araçlar (fiyat, m², güç)",      impact: "medium", you: "yes",     them: "partial" },
  { id: "a15", group: "İçerik yapısı",           title: "Blog — sektör analizleri",                  impact: "low",    you: "yes",     them: "yes" },
  { id: "a16", group: "İçerik yapısı",           title: "Blog — güncellik (son 30 gün)",             impact: "medium", you: "no",      them: "yes" },
  { id: "a17", group: "İçerik yapısı",           title: "İçerik uzunluğu (min 1500 kelime)",         impact: "low",    you: "yes",     them: "yes" },
  { id: "a18", group: "İçerik yapısı",           title: "Görsel çeşitliliği (şema, diyagram)",       impact: "low",    you: "no",      them: "yes" },
  // Otorite sinyalleri (10)
  { id: "a19", group: "Otorite sinyalleri",      title: "Üçüncü taraf anılma (Reddit, Ekşi, forum)", impact: "high",   you: "no",      them: "partial" },
  { id: "a20", group: "Otorite sinyalleri",      title: "YouTube varlığı",                           impact: "medium", you: "no",      them: "yes" },
  { id: "a21", group: "Otorite sinyalleri",      title: "Wikipedia / Wikidata kaydı",                impact: "high",   you: "no",      them: "yes" },
  { id: "a22", group: "Otorite sinyalleri",      title: "Google Business Profile — tam",             impact: "medium", you: "yes",     them: "yes" },
  { id: "a23", group: "Otorite sinyalleri",      title: "Müşteri incelemeleri (agregat puan)",       impact: "low",    you: "yes",     them: "yes" },
  { id: "a24", group: "Otorite sinyalleri",      title: "Sektör derneği üyeliği",                    impact: "low",    you: "yes",     them: "yes" },
  { id: "a25", group: "Otorite sinyalleri",      title: "Backlink — sektör siteleri",                impact: "medium", you: "yes",     them: "yes" },
  { id: "a26", group: "Otorite sinyalleri",      title: "Basın bültenleri",                          impact: "low",    you: "no",      them: "yes" },
  { id: "a27", group: "Otorite sinyalleri",      title: "Kurucu / uzman kimliği görünür",            impact: "medium", you: "partial", them: "yes" },
  { id: "a28", group: "Otorite sinyalleri",      title: "Konuk yazılar / podcast",                   impact: "low",    you: "yes",     them: "yes" },
  // Yapılandırılmış veri (8)
  { id: "a29", group: "Yapılandırılmış veri",    title: "Ürün özellik tablosu — standart format",    impact: "medium", you: "partial", them: "yes" },
  { id: "a30", group: "Yapılandırılmış veri",    title: "Fiyat bilgisi — açık ve güncel",            impact: "high",   you: "no",      them: "yes" },
  { id: "a31", group: "Yapılandırılmış veri",    title: "Stok durumu — gerçek zamanlı",              impact: "low",    you: "yes",     them: "yes" },
  { id: "a32", group: "Yapılandırılmış veri",    title: "Teknik veri sayfası PDF",                   impact: "low",    you: "yes",     them: "yes" },
  { id: "a33", group: "Yapılandırılmış veri",    title: "Garanti koşulları — yapılandırılmış",       impact: "low",    you: "partial", them: "yes" },
  { id: "a34", group: "Yapılandırılmış veri",    title: "Kargo / teslimat bilgisi",                  impact: "low",    you: "yes",     them: "yes" },
  { id: "a35", group: "Yapılandırılmış veri",    title: "Sertifika / standart bilgisi",              impact: "medium", you: "yes",     them: "no"  },
  { id: "a36", group: "Yapılandırılmış veri",    title: "İade politikası — yapılandırılmış",         impact: "low",    you: "partial", them: "yes" },
  // Marka sinyalleri (7)
  { id: "a37", group: "Marka sinyalleri",        title: "\"[Marka] nedir / kimdir\" içeriği",        impact: "high",   you: "no",      them: "partial" },
  { id: "a38", group: "Marka sinyalleri",        title: "Hakkımızda — kapsamlı",                     impact: "medium", you: "yes",     them: "yes" },
  { id: "a39", group: "Marka sinyalleri",        title: "Kurucu hikâyesi",                           impact: "low",    you: "no",      them: "yes" },
  { id: "a40", group: "Marka sinyalleri",        title: "Ekip sayfası",                              impact: "low",    you: "yes",     them: "no"  },
  { id: "a41", group: "Marka sinyalleri",        title: "Referans müşteri logoları",                 impact: "medium", you: "yes",     them: "yes" },
  { id: "a42", group: "Marka sinyalleri",        title: "Sosyal medya — aktif kanallar",             impact: "low",    you: "partial", them: "partial" },
  { id: "a43", group: "Marka sinyalleri",        title: "LinkedIn şirket sayfası — güncel",          impact: "low",    you: "no",      them: "partial" },
];

export const MOCK_ANALYSIS: AnalysisResult = {
  yourDomain: "isitmax.com",
  yourBrandName: "ISITMAX",
  productName: "Yerden ısıtma sistemleri",
  competitorDomain: "danfoss.com.tr",
  competitorBrandName: "Danfoss",
  queries: [
    {
      id: "q1",
      text: "en iyi yerden ısıtma markaları Türkiye",
      answers: [
        {
          provider: "perplexity",
          mentionedYou: true,
          mentionedThem: true,
          yourRank: 4,
          text:
            "Türkiye'de yerden ısıtma denilince akla gelen markalar: Danfoss, Rehau, Henco ve Isıtmax. Danfoss termostat ve kontrol sistemleriyle, Rehau ise PEX boru teknolojisiyle öne çıkıyor.",
        },
        {
          provider: "chatgpt",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text:
            "Türkiye pazarında öne çıkan yerden ısıtma markaları arasında Danfoss, Rehau, Uponor ve Henco sayılabilir. Danfoss'un akıllı termostatları kurulum kolaylığı sağlar.",
        },
        {
          provider: "claude",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text:
            "Türkiye'de yerden ısıtma için Danfoss, Rehau ve Henco en çok tercih edilen markalar arasında. Her birinin farklı fiyat segmentinde ürünleri var.",
        },
        {
          provider: "gemini",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text:
            "Yerden ısıtma sistemleri için güvenilir markalar Danfoss, Rehau, Wavin ve Uponor olarak öne çıkıyor.",
        },
        {
          provider: "google_aio",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text:
            "Türkiye'deki yerden ısıtma pazarında Danfoss, Rehau ve Uponor markaları en sık tercih edilenler arasında yer alıyor.",
        },
      ],
    },
    {
      id: "q2",
      text: "yerden ısıtma hangi marka daha sağlam",
      answers: [
        {
          provider: "chatgpt",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text: "Dayanıklılık açısından Danfoss ve Rehau sektörde öne çıkıyor. Danfoss'un 25 yıllık garantisi uzun vadeli güvence sunuyor.",
        },
        {
          provider: "claude",
          mentionedYou: false,
          mentionedThem: true,
          yourRank: null,
          text: "Dayanıklılık için Danfoss ve Rehau sektörde öne çıkıyor. Danfoss'un 25 yıllık garantisi ve Rehau'nun peroksit-crosslinked PEX-A boruları uzun vadeli güvence sunuyor.",
        },
        { provider: "gemini",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Uzun ömürlü çözümler için Danfoss ve Uponor tercih edilebilir." },
        { provider: "perplexity",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss en uzun garantiyi veren üreticilerden biri." },
        { provider: "google_aio",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss kalite standardı yüksek markalardan." },
      ],
    },
    {
      id: "q3",
      text: "ısıtma kablosu PEX borusu tavsiye",
      answers: [
        { provider: "chatgpt",     mentionedYou: false, mentionedThem: true, yourRank: null, text: "PEX boru için Rehau ve Danfoss sektörün referans markaları." },
        { provider: "claude",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Rehau PEX-A boruları ve Danfoss kontrol ekipmanı çoğu projede birlikte kullanılıyor." },
        { provider: "gemini",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss ürün gamı bu alanda kapsamlı." },
        { provider: "perplexity",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Rehau ve Danfoss kombinasyonu en yaygın tercih." },
        { provider: "google_aio",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "PEX boru tavsiyesinde Danfoss öne çıkıyor." },
      ],
    },
    {
      id: "q4",
      text: "villa zemin ısıtma sistemi kurulum",
      answers: [
        { provider: "chatgpt",     mentionedYou: false, mentionedThem: true, yourRank: null, text: "Villa projelerinde Danfoss ve Uponor kurulum çözümleri yaygın." },
        { provider: "claude",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss komple çözüm paketi sunuyor." },
        { provider: "gemini",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Büyük villa projelerinde Danfoss tercih edilir." },
        { provider: "perplexity",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Villa zemin ısıtmasında Danfoss yaygın bir seçim." },
        { provider: "google_aio",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Villa projelerinde Danfoss sistemlerine sık rastlanıyor." },
      ],
    },
    {
      id: "q5",
      text: "yerden ısıtma fiyat karşılaştırma 2026",
      answers: [
        { provider: "chatgpt",     mentionedYou: false, mentionedThem: true, yourRank: null, text: "2026 fiyatlarında Danfoss premium segmentte konumlanıyor." },
        { provider: "claude",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Fiyat / performans açısından Danfoss ve Rehau başı çekiyor." },
        { provider: "gemini",      mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss ve Uponor fiyat karşılaştırmasında öne çıkıyor." },
        { provider: "perplexity",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "Danfoss sistemleri referans fiyat alınıyor." },
        { provider: "google_aio",  mentionedYou: false, mentionedThem: true, yourRank: null, text: "2026 güncellenmiş fiyatlarda Danfoss öne çıkan marka." },
      ],
    },
  ],
  audit: AUDIT_ITEMS,
  cached: false,
  generatedAt: new Date().toISOString(),
};
