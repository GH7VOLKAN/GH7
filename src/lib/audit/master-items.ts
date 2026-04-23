/**
 * GH7 Audit — 43 madde master listesi (Brief G Aşama 1).
 *
 * Bu liste sabit. Kategori tanımları + her madde için:
 *   code, category, title, descriptionStatic (neden önemli),
 *   difficulty, estimatedHours, measurementMethod
 *
 * Pipeline (AŞAMA 2-3) bu listeyi okuyup:
 *   - DataForSEO / Perplexity verisinden status üretir
 *   - Opus her madde için marka-özel talimat yazar
 */

export const AUDIT_CATEGORIES = {
  "ai-crawler": {
    code: "ai-crawler",
    label: "AI Crawler Erişimi",
    description:
      "GPTBot, ClaudeBot, PerplexityBot gibi AI botlarının sitenize erişimi ve içeriğinizi okuma yeteneği.",
    order: 1,
  },
  entity: {
    code: "entity",
    label: "Marka Entity Tanımı",
    description:
      "AI platformların markanızı bir 'varlık' olarak tanıması ve doğru bilgiyle eşleştirmesi.",
    order: 2,
  },
  "structured-data": {
    code: "structured-data",
    label: "Yapılandırılmış Veri",
    description:
      "JSON-LD, schema.org ve diğer structured data işaretlemelerinin AI okunabilirliği.",
    order: 3,
  },
  "content-ai": {
    code: "content-ai",
    label: "İçerik AI-Readability",
    description:
      "İçeriğinizin AI modelleri tarafından kolay okunabilir, chunk'lanabilir ve cevap olarak kullanılabilir olması.",
    order: 4,
  },
  "query-match": {
    code: "query-match",
    label: "Sorgu Eşleşmesi",
    description:
      "Hedef sorguların içerikte doğru yerlerde geçmesi ve AI cevaplarda öncelikli kaynak olmanız.",
    order: 5,
  },
  authority: {
    code: "authority",
    label: "Otorite ve Güven",
    description:
      "Dış kaynaklardan markanıza gelen sinyaller: backlink, mention, sosyal kanıt.",
    order: 6,
  },
  "ai-platform": {
    code: "ai-platform",
    label: "AI Platform Spesifik",
    description:
      "ChatGPT, Claude, Gemini, Perplexity, Google AIO platformlarında gerçek performans ölçümleri.",
    order: 7,
  },
} as const;

export type AuditCategoryCode = keyof typeof AUDIT_CATEGORIES;

export type AuditMasterItem = {
  index: number;
  code: string;
  category: AuditCategoryCode;
  title: string;
  descriptionStatic: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  measurementMethod: "dataforseo" | "perplexity" | "opus-eval" | "manual";
};

export const AUDIT_MASTER_ITEMS: AuditMasterItem[] = [
  // ═══ Kategori 1: AI Crawler Erişimi (6) ═══
  {
    index: 1,
    code: "ai-crawler-robots",
    category: "ai-crawler",
    title: "GPTBot, ClaudeBot, PerplexityBot robots.txt'de allow",
    descriptionStatic:
      "ChatGPT, Claude ve Perplexity gibi AI platformları web sitenizi bot'ları aracılığıyla tarar. Eğer robots.txt dosyanızda bu bot'lar engellenmişse, AI platformlar sizin içeriğinizi öğrenemez ve kullanıcı sorularında markanızdan bahsedemez. GPTBot, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended bot'larına 'Allow' vermek, AI görünürlüğünüzün temel taşıdır.",
    difficulty: "easy",
    estimatedHours: 1,
    measurementMethod: "dataforseo",
  },
  {
    index: 2,
    code: "llms-txt",
    category: "ai-crawler",
    title: "llms.txt dosyası mevcut ve güncel",
    descriptionStatic:
      "llms.txt, AI dil modelleri için özel olarak tasarlanmış bir standarttır (Anthropic öncülüğünde). Robots.txt'nin AI uyarlaması gibidir. Dosyada markanızın temel bilgileri, hangi sayfalarda ne bulunacağı ve AI'ya yardımcı olacak özet bilgiler yer alır. Domain root'unda /llms.txt yolunda erişilebilir olmalı.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 3,
    code: "llms-full-txt",
    category: "ai-crawler",
    title: "llms-full.txt detaylı marka tanımı",
    descriptionStatic:
      "llms-full.txt, llms.txt'nin genişletilmiş halidir — tam marka dokümantasyonu, ürün/hizmet kataloğu ve sıkça sorulan soruları içerir. AI platformlar bu dosyayı kullanarak markanızla ilgili çok daha zengin bir context oluşturur. Uzun dokümantasyon ekleyebilir, ürün detaylarını madde madde yazabilirsiniz.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 4,
    code: "cdn-bot-block",
    category: "ai-crawler",
    title: "Cloudflare/CDN AI bot block kapalı",
    descriptionStatic:
      "Cloudflare varsayılan olarak bazı AI bot'larını 'Bot Fight Mode' ile engelleyebilir. Eğer CDN ayarlarınızda AI bot'ları bloke edildiyse robots.txt'de 'Allow' yazmanız yeterli olmaz — istek hiç sitenize ulaşmaz. Cloudflare 'AI Scrapers and Crawlers' ayarını manuel kontrol etmek gerekir.",
    difficulty: "easy",
    estimatedHours: 1,
    measurementMethod: "dataforseo",
  },
  {
    index: 5,
    code: "ssr-active",
    category: "ai-crawler",
    title: "Server-side rendering aktif",
    descriptionStatic:
      "Bazı AI bot'lar JavaScript execute etmez (örn. PerplexityBot). Tamamen client-side rendered bir SPA (React, Vue SPA) AI bot için boş sayfa görünür. Next.js/Astro/Nuxt gibi SSR (server-side rendering) veya SSG (static generation) kullanmak kritiktir. İçerik ilk HTML response'ta render edilmiş olmalı.",
    difficulty: "hard",
    estimatedHours: 16,
    measurementMethod: "dataforseo",
  },
  {
    index: 6,
    code: "bot-logs",
    category: "ai-crawler",
    title: "AI bot hit logları aktif",
    descriptionStatic:
      "Hangi AI bot'unun ne sıklıkta sitenizi taradığını görmek için access log analizi yapılmalı. Cloudflare Analytics, Vercel Analytics veya server log'ları üzerinden GPTBot, ClaudeBot, PerplexityBot hit sayıları ölçülebilir. Bu veri hangi içeriğinizin AI için öncelikli olduğunu gösterir.",
    difficulty: "medium",
    estimatedHours: 3,
    measurementMethod: "manual",
  },

  // ═══ Kategori 2: Marka Entity Tanımı (8) ═══
  {
    index: 7,
    code: "brand-entity-schema",
    category: "entity",
    title: "Brand entity schema (Organization + sameAs)",
    descriptionStatic:
      "Organization schema.org işaretlemesi ile markanızı AI platformlara tanıtırsınız. 'sameAs' field'ı içinde Wikipedia, Wikidata, LinkedIn, X/Twitter gibi platform linkleri yer alır — bu AI için 'bu marka işte bu' referans noktasıdır. Entity graph'da markanızı tanımlanmış bir varlık yapar.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 8,
    code: "about-page-rich",
    category: "entity",
    title: "About sayfası 500+ kelime, first-person",
    descriptionStatic:
      "Hakkımızda/About sayfası AI için birinci öncelikli kimlik kaynağıdır. 500+ kelime ile, 'biz kimiz, neden varız, kim için çalışıyoruz' sorularını birinci tekil/çoğul şahıstan yanıtlamalı. Kuruluş hikayesi, misyon, ekip, lokasyon, hizmet edilen kitle — hepsi bu sayfada toplanmalı.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 9,
    code: "team-page-linkedin",
    category: "entity",
    title: "Founder/takım sayfası + LinkedIn",
    descriptionStatic:
      "Kurucular ve ekip üyelerinin LinkedIn bağlantılı profil sayfası AI'ya 'bu marka gerçek insanlar tarafından yönetiliyor' sinyali verir. Her üye için kısa biyografi + LinkedIn URL + rol + uzmanlık alanı. E-E-A-T (Experience, Expertise, Authority, Trust) için kritik.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 10,
    code: "founding-info-data",
    category: "entity",
    title: "Kuruluş tarihi, lokasyon, büyüklük structured",
    descriptionStatic:
      "Organization schema içinde 'foundingDate', 'address', 'numberOfEmployees' gibi alanlar doldurulmalı. AI 'X firma ne zaman kuruldu?' sorularında bu structured veriyi direkt çeker. Structured data olmadan metin içinde söylenen bilgiler daha az güvenilir sinyaldir.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 11,
    code: "brand-bio-short",
    category: "entity",
    title: "Brand bio 50-80 kelime AI-kopyalayabilir özet",
    descriptionStatic:
      "AI platformlar cevaplarında 50-100 kelimelik marka özetleri kullanır. Sitenizde bu 'bio' formatında net, özetlenmiş, benzersiz bir paragraf varsa AI onu olduğu gibi çekebilir. Footer, About sayfası üstü veya dedicated bir brand-bio bölümü ideal.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "opus-eval",
  },
  {
    index: 12,
    code: "faq-identity",
    category: "entity",
    title: "FAQ: X firması kim/ne/nerede",
    descriptionStatic:
      "Sıkça Sorulan Sorular bölümünde markanızla ilgili temel kimlik soruları olmalı: 'X nedir?', 'X nerededir?', 'X'i kim kurdu?', 'X hangi sektörde çalışır?'. Bu sorular AI'nın doğrudan kullanıcı cevaplarında kaynak olarak gösterdiği içeriktir. FAQPage schema ile işaretlenmeli.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "opus-eval",
  },
  {
    index: 13,
    code: "press-mentions",
    category: "entity",
    title: "Press mentions / basın listesi",
    descriptionStatic:
      "'Basında Biz' veya 'Press' sayfası AI için otorite sinyalidir. Hangi haber sitelerinde, dergilerde, podcastlerde bahsedildiğinizi listelemek — link veya logo ile — markanızın kredibilitesini artırır. AI 'X güvenilir mi?' sorularında bu sinyali kullanır.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 14,
    code: "social-proof",
    category: "entity",
    title: "Müşteri sayısı, yıl, ülke somut rakamlar",
    descriptionStatic:
      "'180+ proje', '7 ülkede hizmet', '15 yıllık deneyim', '1000+ memnun müşteri' gibi somut rakamlar AI için concrete data point'leridir. Vague ifadelerden ('yıllardır', 'birçok müşteri') kaçınılmalı. Rakamlar hem metin içinde hem structured data'da geçmeli.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "opus-eval",
  },

  // ═══ Kategori 3: Yapılandırılmış Veri (6) ═══
  {
    index: 15,
    code: "jsonld-schema-type",
    category: "structured-data",
    title: "JSON-LD sektöre uygun schema type",
    descriptionStatic:
      "Schema.org'da sektörünüze uygun özel type kullanmak (generic 'Organization' yerine 'LodgingBusiness', 'Restaurant', 'LocalBusiness', 'Product', 'Service') AI'nın sizi doğru kategoride bulmasını sağlar. Bungalov işletmesi için 'LodgingBusiness', üretici için 'Product', danışman için 'ProfessionalService'.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 16,
    code: "breadcrumb-schema",
    category: "structured-data",
    title: "BreadcrumbList tüm iç sayfalarda",
    descriptionStatic:
      "BreadcrumbList schema AI'ya sayfa hiyerarşisini anlatır: 'Bu sayfa Anasayfa > Kategori > Ürün yolunda'. AI bu yapıyı kullanarak içerik ilişkilerini kurar ve 'X kategorisinde ne var?' sorularında doğru sayfaları öne çıkarır.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },
  {
    index: 17,
    code: "faqpage-schema",
    category: "structured-data",
    title: "FAQPage schema FAQ içeriğinde",
    descriptionStatic:
      "FAQ sayfanızda sadece HTML <details> değil, FAQPage schema.org işaretlemesi de olmalı. AI bu structured data'yı direkt cevap olarak kullanır. Google AIO ve ChatGPT bu format için özellikle optimize.",
    difficulty: "easy",
    estimatedHours: 2,
    measurementMethod: "dataforseo",
  },
  {
    index: 18,
    code: "review-schema",
    category: "structured-data",
    title: "Review/AggregateRating schema",
    descriptionStatic:
      "Müşteri yorumları varsa Review ve AggregateRating schema ile işaretlenmeli. '4.8/5 - 127 yorum' gibi rich snippet'ler AI cevaplarında 'bu marka nasıl?' sorusuna sayısal cevap olarak çıkar. Gerçek yorumlar olmadan sahte rating eklenmemeli (Google ceza verir).",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 19,
    code: "speakable-schema",
    category: "structured-data",
    title: "Speakable schema (sesli arama)",
    descriptionStatic:
      "Speakable schema, AI asistanlarına (Alexa, Google Assistant, Siri) hangi içeriğin sesli okunması için uygun olduğunu söyler. Özellikle makale/blog yazılarında TL;DR özet için ideal. Bu ayrım sesli AI arama pazarında öne çıkmayı sağlar.",
    difficulty: "medium",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },
  {
    index: 20,
    code: "howto-schema",
    category: "structured-data",
    title: "HowTo schema rehber içeriklerinde",
    descriptionStatic:
      "'Nasıl yapılır' içerikleri varsa HowTo schema ile step-by-step işaretlenmeli. AI 'X nasıl yapılır?' sorularında bu structured data'dan doğrudan step liste çeker. Her adım için time, cost, supply bilgileri eklenebilir.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },

  // ═══ Kategori 4: İçerik AI-Readability (8) ═══
  {
    index: 21,
    code: "heading-hierarchy",
    category: "content-ai",
    title: "H1-H2-H3 hiyerarşisi semantic",
    descriptionStatic:
      "AI içeriği outline halinde okur: H1 = ana konu, H2 = alt konular, H3 = detay. Her sayfada tek H1, mantıklı H2 sıralaması, gereksiz h-level atlama yok. 'design için h1 kullanma' antipattern — tipografi için değil structure için kullanılmalı.",
    difficulty: "easy",
    estimatedHours: 3,
    measurementMethod: "dataforseo",
  },
  {
    index: 22,
    code: "paragraph-length",
    category: "content-ai",
    title: "Paragraf 3-4 cümle max",
    descriptionStatic:
      "AI metin chunk'lama yaparken paragraf sınırlarını kullanır. Uzun paragraflar (8+ cümle) AI için tek chunk olur, cevap olarak parçalanamaz. 3-4 cümlelik paragraflar AI'nın granüler bilgi çekmesini kolaylaştırır.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 23,
    code: "sentence-readability",
    category: "content-ai",
    title: "Flesch readability 60+",
    descriptionStatic:
      "Flesch Reading Ease skoru 60+ (lise seviyesi) AI'nın içeriği doğru parse etmesini kolaylaştırır. Uzun cümleler, teknik jargon, parantez içinde parantez AI için zor. 15-20 kelime ortalama cümle uzunluğu, aktif yapı, sade kelime tercihi.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 24,
    code: "list-usage",
    category: "content-ai",
    title: "Bullet + numbered list yoğun",
    descriptionStatic:
      "AI liste formatını direkt cevap olarak alır. 'En iyi 5 özellik' sorusuna 5-madde bullet list AI için mükemmel cevaptır. Önemli bilgiler mutlaka listelenmeli — paragrafta kaybolmamalı. Her ana sayfada en az 2-3 list olmalı.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 25,
    code: "definition-boxes",
    category: "content-ai",
    title: "X nedir tanım kutuları",
    descriptionStatic:
      "'X nedir?' formatında net tanım paragrafları AI'nın 'definition extraction' için idealdir. Her teknik terim için 1-2 cümlelik tanım kutusu (h2 + paragraf). 'Bungalov nedir?' = 'Bungalov, tek katlı, tipik olarak ahşap veya beton yapıdan...' formatı.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 26,
    code: "qna-sections",
    category: "content-ai",
    title: "Q&A section her ana sayfada",
    descriptionStatic:
      "AI'nın en sık kullandığı içerik formatı: soru-cevap. Her ana sayfada (özellikle ürün/hizmet sayfalarında) 5-10 soruluk Q&A bölümü olmalı. Sorular kullanıcı arama niyetiyle birebir uyumlu: 'Edremit'te bungalov fiyatları nedir?' gibi real sorgu.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 27,
    code: "markdown-friendly",
    category: "content-ai",
    title: "Clean HTML markdown-friendly",
    descriptionStatic:
      "Div-soup (div içinde div içinde div), inline style'lar, non-semantic tag'ler AI için gürültüdür. Semantic HTML (<article>, <section>, <header>, <nav>), minimal inline style, class/id semantic isimlendirme. AI markdown conversion yaparken temiz HTML'i direkt metne çevirebilir.",
    difficulty: "hard",
    estimatedHours: 12,
    measurementMethod: "opus-eval",
  },
  {
    index: 28,
    code: "content-depth",
    category: "content-ai",
    title: "1200+ kelime key sayfalarda",
    descriptionStatic:
      "Ana sayfa, ürün sayfaları, kategori sayfaları gibi 'key pages'de minimum 1200 kelime içerik olmalı. Bu authority sinyali hem SEO hem AI için. Kısa içerikli sayfalar 'thin content' olarak değerlendirilir, AI cevaplarda bu sayfaları öne çıkarmaz.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "dataforseo",
  },

  // ═══ Kategori 5: Sorgu Eşleşmesi (7) ═══
  {
    index: 29,
    code: "title-exact-match",
    category: "query-match",
    title: "Target sorgular başlık exact match",
    descriptionStatic:
      "Hedeflediğiniz sorgu neyse sayfanın H1 ve title tag'inde exact olarak geçmeli. 'Edremit bungalov' hedefliyorsanız title 'Edremit Bungalov - ...' olmalı. AI query matching'de title öncelikli sinyaldir. Sinonim kullanmak değil, arama niyetindeki kelimeyi birebir kullanmak.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "dataforseo",
  },
  {
    index: 30,
    code: "longtail-variations",
    category: "query-match",
    title: "Long-tail sorgu varyasyonları",
    descriptionStatic:
      "Ana sorgunun yanı sıra long-tail varyasyonları da içerikte geçmeli: 'Edremit bungalov' + 'Edremit'te aile dostu bungalov' + 'Edremit ucuz bungalov' + 'Edremit özel havuzlu bungalov'. AI semantic search yapar, varyasyonlar kapsama alanını genişletir.",
    difficulty: "medium",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 31,
    code: "location-queries",
    category: "query-match",
    title: "Lokasyon bazlı sorgular",
    descriptionStatic:
      "'X şehir/ilçe' lokasyon sorguları özellikle lokal hizmetler için kritik. Şehir, ilçe, mahalle, bölge bilgileri içerik ve schema'da belirgin olmalı. 'Balıkesir'de ısıtma sistemi', 'Edremit'te özel havuzlu' gibi spesifik sorgular hedeflenmeli.",
    difficulty: "easy",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },
  {
    index: 32,
    code: "comparison-pages",
    category: "query-match",
    title: "Karşılaştırma sayfaları (X vs Y)",
    descriptionStatic:
      "'X vs Y' karşılaştırma içerikleri AI için high-value. 'Apartman vs bungalov tatil', 'Yerden ısıtma vs klima' gibi karşılaştırmalar AI'nın karar vermeye çalışan kullanıcıya direkt sunduğu formatır. Tablo formatında + pro/con listesi ideal.",
    difficulty: "medium",
    estimatedHours: 8,
    measurementMethod: "opus-eval",
  },
  {
    index: 33,
    code: "listicle-content",
    category: "query-match",
    title: "Liste içeriği (en iyi 10 X)",
    descriptionStatic:
      "'En iyi 10 Edremit otel', '5 Balıkesir tatil köyü' gibi listicle içerikleri AI'nın en çok cevap verdiği formatır. Kendi markanız listede olmasa bile sektör listeleri yazmak authority ve context sağlar — 'X konusunda bilgili kaynak' olursunuz.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "opus-eval",
  },
  {
    index: 34,
    code: "seasonal-queries",
    category: "query-match",
    title: "Sezonsal/güncel sorgu (yıl ekli)",
    descriptionStatic:
      "Yıl ekli sorgular ('2026 en iyi X', 'yaz 2026 tatil') AI için freshness sinyali. İçeriği yıllık güncellemek, 2024 yazılmış bir içeriği 2026'ya update etmek, yeni sezonsal sayfalar açmak AI görünürlüğünde öne çıkarır.",
    difficulty: "easy",
    estimatedHours: 6,
    measurementMethod: "opus-eval",
  },
  {
    index: 35,
    code: "competitor-mentions",
    category: "query-match",
    title: "Rakip mention doğal (context içinde)",
    descriptionStatic:
      "Rakiplerinizi içerikte doğal context'te zikretmek (karşılaştırma, referans, sektör analizi) AI'nın sizi rakiplerle aynı 'semantic neighborhood'a yerleştirmesini sağlar. 'X ile benzer hizmet veren Y, Z markalarına göre biz...' gibi doğal mention AI için sektör context'i kurar.",
    difficulty: "medium",
    estimatedHours: 4,
    measurementMethod: "opus-eval",
  },

  // ═══ Kategori 6: Otorite ve Güven (5) ═══
  {
    index: 36,
    code: "backlink-authority",
    category: "authority",
    title: "Backlink sayısı ve kalitesi",
    descriptionStatic:
      "Backlink — diğer sitelerden size verilen linkler — AI için hala otorite sinyalidir. DataForSEO Backlinks API ile DR (Domain Rating), referring domains count, anchor text çeşitliliği ölçülür. Kalitesiz spam linkler yerine az ama yüksek DR linkler değerli.",
    difficulty: "hard",
    estimatedHours: 40,
    measurementMethod: "dataforseo",
  },
  {
    index: 37,
    code: "wikipedia-mention",
    category: "authority",
    title: "Wikipedia mention/page varlığı",
    descriptionStatic:
      "Wikipedia'da bahsedilmek veya sayfanızın olması AI için tier-1 authority sinyali. Büyük markalar için Wikipedia page, küçük markalar için Wikipedia makalelerinde pasif mention hedeflenebilir. Not: Wikipedia kendi kriterleri var, zorla sayfa oluşturulamaz.",
    difficulty: "hard",
    estimatedHours: 20,
    measurementMethod: "perplexity",
  },
  {
    index: 38,
    code: "forum-discussions",
    category: "authority",
    title: "Reddit/Quora/forum discussion",
    descriptionStatic:
      "Reddit, Quora, Ekşi Sözlük gibi platformlarda organik marka discussion'ları AI için güçlü sosyal kanıttır. AI bu forum'lardan real user sentiment'ı çeker. Marka ile ilgili threads, review'lar, tavsiye post'ları bu kategoride değerlendirilir.",
    difficulty: "medium",
    estimatedHours: 10,
    measurementMethod: "perplexity",
  },
  {
    index: 39,
    code: "video-mentions",
    category: "authority",
    title: "YouTube/video content'te marka",
    descriptionStatic:
      "YouTube video açıklamaları, başlıkları ve transcript'lerinde marka mention'ı AI için multimedia authority signal. Kendi YouTube kanalınız + diğer kanallarda pasif mention + influencer videolarında geçme kombinasyonu ideal.",
    difficulty: "medium",
    estimatedHours: 15,
    measurementMethod: "perplexity",
  },
  {
    index: 40,
    code: "press-coverage",
    category: "authority",
    title: "Press release/haber mention",
    descriptionStatic:
      "Haber sitelerinde, sektör dergilerinde, online press release platformlarında yer almak AI'nın 'bu marka haberlerde geçiyor, otorite' sinyalini almasını sağlar. Hürriyet, Milliyet, sektörel siteler + global PR distribution siteleri.",
    difficulty: "hard",
    estimatedHours: 20,
    measurementMethod: "perplexity",
  },

  // ═══ Kategori 7: AI Platform Spesifik (3) ═══
  {
    index: 41,
    code: "chatgpt-mention",
    category: "ai-platform",
    title: "ChatGPT hangi sorgularda bahsediyor",
    descriptionStatic:
      "ChatGPT'de gerçek test: hedef sorgularınızda markanız bahsediliyor mu? Perplexity Sonar API ile otomatik test edilir. 'Balıkesir bungalov' sorgusu ChatGPT'ye yöneltildiğinde İdavilla geçiyor mu? Hangi pozisyonda? Ne bağlamda?",
    difficulty: "hard",
    estimatedHours: 0,
    measurementMethod: "perplexity",
  },
  {
    index: 42,
    code: "multi-platform-coverage",
    category: "ai-platform",
    title: "Claude/Perplexity/Gemini kapsama",
    descriptionStatic:
      "Sadece ChatGPT değil, Claude, Gemini, Perplexity'de de görünürlük test edilir. Her platform farklı bilgi kaynaklarını önceliklendirir. Bir platformda görünüyor diğerinde yoksa, o platforma özel optimizasyon gerekir.",
    difficulty: "hard",
    estimatedHours: 0,
    measurementMethod: "perplexity",
  },
  {
    index: 43,
    code: "google-aio-mention",
    category: "ai-platform",
    title: "Google AIO mention hızı",
    descriptionStatic:
      "Google AI Overviews (AIO) arama sonuçlarında üstte çıkan AI-generated cevaplar. Hedef sorgularınızda AIO'da yer almak en yüksek görünürlük. SerpAPI ile AIO içerisinde mention varlığı ve link source olarak gösterilme durumu ölçülür.",
    difficulty: "hard",
    estimatedHours: 0,
    measurementMethod: "perplexity",
  },
];

export function getItemByCode(code: string): AuditMasterItem | undefined {
  return AUDIT_MASTER_ITEMS.find((item) => item.code === code);
}

export function getItemsByCategory(
  category: AuditCategoryCode,
): AuditMasterItem[] {
  return AUDIT_MASTER_ITEMS.filter((item) => item.category === category);
}
