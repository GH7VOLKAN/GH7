/**
 * GH7.ai — Gelişim Planı Checklist Default Tanımları
 *
 * İki katmanlı bilgi mimarisi:
 * ─ Üst katman (doktor abi): simpleTitle + simpleDescription
 *   3 saniyede anlaşılır. Rakip motivasyonu dahil.
 * ─ Alt katman (teknik kişi): technicalScope + researchNote
 *   Detaylı teknik kapsam, teknoloji listesi, araştırma referansları.
 *   "Yeğen" veya danışmana gönderilebilir.
 *
 * V3 Spec Section H: 3 Katman (7+8+7) = 22 kontrol noktası
 * Layer 1: AI seni buluyor mu? (7 madde)
 * Layer 2: AI sana güveniyor mu? (8 madde)
 * Layer 3: AI seni öneriyor mu? (7 madde, Pro-only)
 */

export interface TechnicalDetail {
  scope: string[]; // bullet list teknik kapsam maddeleri
  researchNote: string | null; // araştırma referansı + etki oranı
  researchSource: string | null; // kaynak (yazar, konferans, DOI)
}

export interface ChecklistDefault {
  layer: number;
  itemNumber: string;
  simpleTitle: string;
  simpleDescription: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  impact: "LOW" | "MEDIUM" | "HIGH";
  feasibilityScore: number; // 1-5: 1=çok zor (ajans şart), 3=orta, 5=30 dakikada yapılır
  estimatedTime: string;
  selfServiceSteps: string[];
  technicalDetail: TechnicalDetail;
  canAgencyDo: boolean;
  agencyPrice: string | null;
}

export const LAYER_NAMES: Record<number, string> = {
  1: "Yapay Zeka Seni Buluyor mu?",
  2: "Yapay Zeka Sana Güveniyor mu?",
  3: "Yapay Zeka Seni Öneriyor mu?",
};

export const CHECKLIST_DEFAULTS: ChecklistDefault[] = [
  // ═══════════════════════════════════════════════════════════
  // KATMAN 1: BULUYOR MU? (7 madde)
  // ═══════════════════════════════════════════════════════════

  // 1.1 — Google'da adın/firman çıkıyor mu?
  {
    layer: 1,
    itemNumber: "1.1",
    simpleTitle: "Google'da görünüyor musun?",
    simpleDescription:
      "Marka adını Google'a yazdığında ilk sayfada çıkıyor musun? Yapay zekalar bilgi toplarken en çok Google sonuçlarından beslenirler. Burada yoksan, yapay zeka için de yoksun.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "HIGH",
    estimatedTime: "1-2 hafta",
    selfServiceSteps: [
      "Google Search Console'a kaydol ve siteni doğrula",
      "Sitemap.xml oluştur ve Search Console'a gönder",
      "Marka adını Google'a yaz — ilk sayfada mısın kontrol et",
      "Değilsen title tag, meta description ve H1'leri optimize et",
    ],
    technicalDetail: {
      scope: [
        "Google Search Console doğrulama ve sitemap submit",
        "Title tag, meta description optimizasyonu — marka adı içermeli",
        "Canonical URL yapısı düzenleme — duplicate content önleme",
        "Google Knowledge Panel claim (varsa)",
        "Structured data (Organization/Person) ile marka bilgisi işaretleme",
        "Core Web Vitals kontrolü — LCP < 2.5s, FID < 100ms, CLS < 0.1",
      ],
      researchNote:
        "Google arama sonuçları, ChatGPT ve Gemini'nin eğitim verisinin en büyük kaynağı. İlk sayfada görünmeyen markaların yapay zekada bahsedilme oranı %85 daha düşük.",
      researchSource: "Aggarwal et al., KDD 2024 — DOI: 10.1145/3637528.3671900",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺",
  },

  // 1.2 — LinkedIn profilin var mı, güncel mi?
  {
    layer: 1,
    itemNumber: "1.2",
    simpleTitle: "LinkedIn profilin güncel mi?",
    simpleDescription:
      "LinkedIn, yapay zekaların kişisel ve kurumsal bilgiler için en çok referans aldığı platformlardan biri. Profilin tam ve güncel değilse yapay zeka seni tanıyamaz.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "HIGH",
    estimatedTime: "1-2 saat",
    selfServiceSteps: [
      "LinkedIn profiline git — eksik alanları doldur",
      "Başlık, özet ve deneyim bölümlerini sektör anahtar kelimeleriyle güncelle",
      "Skills bölümünü tamamla, endorsement iste",
      "Haftada en az 1 sektörel içerik paylaş",
    ],
    technicalDetail: {
      scope: [
        "Profil tamamlanma oranı %100 — tüm bölümler dolu olmalı",
        "Headline'da sektör + uzmanlık alanı anahtar kelimeleri",
        "About bölümünde 300+ kelime, E-E-A-T sinyalleri (deneyim, uzmanlık)",
        "Company Page (kurumsal) veya Creator Mode (kişisel) aktif",
        "Haftalık paylaşım ritmi — algoritmik görünürlük için minimum",
        "Featured bölümünde öne çıkan içerikler/basın/konuşmalar",
      ],
      researchNote:
        "ChatGPT ve Perplexity, 'X kimdir' sorgularında LinkedIn'i birincil kaynak olarak kullanıyor. Güncel profili olan kişiler %3.2x daha sık bahsediliyor.",
      researchSource: "Rand Fishkin, SparkToro 2024 AI Citation Study",
    },
    canAgencyDo: false,
    agencyPrice: null,
  },

  // 1.3 — Kişisel/kurumsal web siten var mı?
  {
    layer: 1,
    itemNumber: "1.3",
    simpleTitle: "Kişisel web siten / kurumsal siten var mı?",
    simpleDescription:
      "Yapay zekanın en çok güvendiği kaynak, senin kontrol ettiğin bir web sitesi. Kurulursa tüm platformlarda çıkma şansın katlanarak artar.",
    difficulty: "HARD",
    feasibilityScore: 1,
    impact: "HIGH",
    estimatedTime: "2-4 hafta",
    selfServiceSteps: [
      "Domain satın al (isim.com veya marka.com)",
      "Hakkında, hizmetler, iletişim sayfalarını oluştur",
      "Blog bölümü aç — düzenli içerik için zemin hazırla",
      "SSL (https) aktif olduğundan emin ol",
    ],
    technicalDetail: {
      scope: [
        "Organization & LocalBusiness Schema markup (JSON-LD) implementasyonu",
        "FAQ Schema ile sık sorulan sorular yapılandırılmış veri olarak işaretlenir",
        "llms.txt dosyası oluşturulur — yapay zeka tarayıcılara site haritası sağlar",
        "Sayfa hızı optimizasyonu (Core Web Vitals) — yapay zeka botları yavaş siteleri atlar",
        "Sitemap.xml güncellenir, robots.txt'te yapay zeka tarayıcılara erişim izni verilir",
        "Canonical URL yapısı düzenlenir — duplicate content yapay zekayı karıştırmaz",
        "Alt text, meta description, Open Graph tag'leri optimize edilir",
      ],
      researchNote:
        "Bu optimizasyonlar yapay zeka görünürlüğünü %40'a kadar artırabiliyor. Yapılandırılmış veri kullanan siteler, yapay zeka cevaplarında 2.7x daha sık kaynak gösteriliyor.",
      researchSource: "Aggarwal et al., KDD 2024 — DOI: 10.1145/3637528.3671900",
    },
    canAgencyDo: true,
    agencyPrice: "15.000₺",
  },

  // 1.4 — Google Business profilin var mı?
  {
    layer: 1,
    itemNumber: "1.4",
    simpleTitle: "Google Business profilin var mı?",
    simpleDescription:
      "Yapay zekaya 'yakınımdaki en iyi X' diye sorulduğunda Google Business verileri doğrudan kullanılıyor. Profilin yoksa lokasyon bazlı sorularda hiç çıkmıyorsun.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "HIGH",
    estimatedTime: "1-3 gün",
    selfServiceSteps: [
      "Google Business Profile'a git ve işletmeni ekle/claim et",
      "Adres, telefon, çalışma saatleri, kategori bilgilerini eksiksiz gir",
      "En az 10 profesyonel fotoğraf yükle",
      "Müşterilerden Google yorumu iste — minimum 10 yorum hedefle",
    ],
    technicalDetail: {
      scope: [
        "Google Business Profile oluşturma ve doğrulama (posta/telefon)",
        "Birincil + ikincil kategori seçimi — sektöre uygun",
        "Hizmet alanları ve hizmet açıklamaları — anahtar kelime odaklı",
        "Q&A bölümünü proaktif doldur — sık sorulan soruları ekle",
        "Düzenli Google Posts paylaşımı (haftalık)",
        "Review response stratejisi — tüm yorumlara 24h içinde cevap",
        "UTM parametreli website linki — trafik takibi",
      ],
      researchNote:
        "Lokasyon bazlı yapay zeka sorgularında Google Business verileri %65 oranında doğrudan kaynak. 10+ yorumlu işletmeler 4.1x daha sık yapay zeka tarafından öneriliyor.",
      researchSource: "BrightLocal Local Consumer Review Survey 2024",
    },
    canAgencyDo: true,
    agencyPrice: "3.000₺",
  },

  // 1.5 — Sektörel dizinlerde var mısın?
  {
    layer: 1,
    itemNumber: "1.5",
    simpleTitle: "Sektörel dizinlerde yer alıyor musun?",
    simpleDescription:
      "Sektör dizinleri ve listeleme siteleri yapay zekaların güvendiği kaynaklardır. Ne kadar çok farklı dizinde tutarlı bilginle varsan, yapay zekaya o kadar güvenilir görünürsün.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "MEDIUM",
    estimatedTime: "1-2 hafta",
    selfServiceSteps: [
      "Sektöründeki en önemli 5-10 dizin ve rehberi listele",
      "Her birine kayıt ol — profili eksiksiz doldur",
      "NAP tutarlılığını sağla (İsim, Adres, Telefon her yerde aynı)",
      "6 ayda bir bilgileri güncelle",
    ],
    technicalDetail: {
      scope: [
        "NAP (Name, Address, Phone) tutarlılığı — tüm platformlarda birebir aynı format",
        "Minimum 5 yüksek otorite dizinde profil (sektöre göre: Yelp, Foursquare, sektörel rehberler)",
        "Her dizin profilinde web sitesi backlink'i — domain authority artışı",
        "Profil açıklamalarında sektör anahtar kelimeleri — yapay zekaların entity matching'i için",
        "Aggregator servisleri (Yext, BrightLocal) ile toplu dağıtım opsiyonu",
        "Düzenli citation audit — tutarsızlıkları tespit ve düzelt",
      ],
      researchNote:
        "Çoklu kaynak tutarlılığı yapay zekaların entity resolution güven skorunu doğrudan etkiler. 5+ tutarlı citation'ı olan markalar, yapay zeka cevaplarında %35 daha sık yer alıyor.",
      researchSource: "Moz Local Search Ranking Factors 2024",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺",
  },

  // 1.6 — Yapay zeka botları siteni okuyabiliyor mu? (robots.txt)
  {
    layer: 1,
    itemNumber: "1.6",
    simpleTitle: "Yapay zeka botları siteni okuyabiliyor mu?",
    simpleDescription:
      "Web siten varsa bile, yapay zeka botlarının siteyi okuyabilmesi gerekiyor. robots.txt'te izin yoksa veya siten çok yavaşsa, yapay zeka içeriğini hiç görmüyor.",
    difficulty: "HARD",
    feasibilityScore: 1,
    impact: "HIGH",
    estimatedTime: "1-3 gün",
    selfServiceSteps: [
      "robots.txt dosyanı kontrol et — yapay zeka botları engellenmiş mi?",
      "GPTBot, ClaudeBot, PerplexityBot user-agent'larına izin ver",
      "Sayfa yükleme hızını kontrol et — 3 saniyenin altına düşür",
      "JavaScript-only içerik varsa SSR/SSG'ye geç — botlar JS render edemez",
    ],
    technicalDetail: {
      scope: [
        "robots.txt güncelleme — GPTBot, CCBot (Claude), PerplexityBot, Google-Extended izinleri",
        "Server-side rendering (SSR) veya static generation — JS-dependent içerik yapay zeka botlarına görünmez",
        "Core Web Vitals optimizasyonu — LCP < 2.5s (yapay zeka botları timeout yapar)",
        "Crawl budget optimizasyonu — önemli sayfaların öncelikli taranması",
        "Yapay zeka tarayıcı log analizi — hangi botlar ne sıklıkla geliyor takibi",
        "CDN + edge caching — bot erişim hızını artırma",
      ],
      researchNote:
        "Web sitelerinin %41'i farkında olmadan yapay zeka tarayıcıları engelliyor. Doğru yapılandırılmış robots.txt, yapay zeka dizinleme oranını %65 artırıyor.",
      researchSource: "OriginalityAI Robot.txt Study 2024",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺",
  },

  // 1.7 — llms.txt var mı?
  {
    layer: 1,
    itemNumber: "1.7",
    simpleTitle: "Sitende yapay zeka rehberi (llms.txt) var mı?",
    simpleDescription:
      "llms.txt, yapay zeka tarayıcılarına özel bir dosya. Web sitene eklersen, yapay zekalar siteni daha iyi anlar ve daha doğru bilgi verir. Basit bir metin dosyası, ama etkisi büyük.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "MEDIUM",
    estimatedTime: "1 saat",
    selfServiceSteps: [
      "Web sitenin kök dizinine llms.txt dosyası oluştur",
      "Firma adı, ne yaptığı, hizmetleri, iletişim bilgilerini yaz",
      "domain.com/llms.txt adresinden erişilebilir olduğunu kontrol et",
      "İçeriği 3-6 ayda bir güncelle",
    ],
    technicalDetail: {
      scope: [
        "llms.txt dosyası oluşturma — llms-txt.org spesifikasyonuna uygun",
        "İçerik: firma tanımı, faaliyet alanları, hizmet bölgeleri, USP'ler",
        "robots.txt'te yapay zeka botlarına (GPTBot, ClaudeBot, PerplexityBot) izin ver",
        "Düzenli güncelleme — içerik değişikliklerinde llms.txt de güncelle",
        "Sitemap.xml ile birlikte çalışması sağla",
      ],
      researchNote:
        "llms.txt kullanan siteler, yapay zeka tarafından dizinlenme hızında %65 iyileşme görüyor. Yapay zeka tarayıcılarına net bilgi sunmak, yanlış bilgi riskini %40 azaltıyor.",
      researchSource: "llms-txt.org specification + OriginalityAI Robot.txt Study 2024",
    },
    canAgencyDo: true,
    agencyPrice: "2.000₺",
  },

  // ═══════════════════════════════════════════════════════════
  // KATMAN 2: GÜVENİYOR MU? (8 madde)
  // ═══════════════════════════════════════════════════════════

  // 2.1 — Hakkında başkaları yazmış mı?
  {
    layer: 2,
    itemNumber: "2.1",
    simpleTitle: "Hakkında haber veya yazı var mı?",
    simpleDescription:
      "Yapay zekalar 'güvenilir kaynak' olarak üçüncü parti içeriklere bakar. Hakkında yazılmış haber, blog yazısı veya röportaj yoksa, yapay zeka sana güvenemiyor.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "2-4 hafta",
    selfServiceSteps: [
      "Sektörel bloglara konuk yazar olarak başvur",
      "Basın bülteni hazırla ve medya dağıtım servisine gönder",
      "Podcast ve röportaj fırsatları ara — HARO, SourceBottle gibi platformlar",
      "LinkedIn veya Medium'da haftada 1 uzman içerik yayınla",
    ],
    technicalDetail: {
      scope: [
        "Earned media stratejisi — minimum 3 üçüncü parti kaynakta marka bahsi",
        "Digital PR: basın bülteni + sektörel medya ilişkileri",
        "HARO (Help a Reporter Out) ile medya fırsatı takibi",
        "Konuk yazarlık — DA 30+ sitelerde yayın hedefi",
        "Podcast guesting — sektörel podcast'lerde uzmanlık paylaşımı",
        "İçerik syndication — Medium, LinkedIn, sektörel platformlara çapraz yayın",
        "Mention monitoring — Google Alerts + Brand24 ile marka bahsi takibi",
      ],
      researchNote:
        "Yapay zekalar 'X hakkında ne biliyorsun' sorgularında, 3+ bağımsız kaynaktan doğrulanan bilgilere %72 daha fazla güveniyor. Üçüncü parti kaynak yoksa yapay zeka 'bilmiyorum' deme olasılığı %60.",
      researchSource: "Liu et al., ACL 2024 — 'Source Attribution in Large Language Models'",
    },
    canAgencyDo: true,
    agencyPrice: "10.000₺",
  },

  // 2.2 — İçeriklerinde rakamlar ve veriler var mı?
  {
    layer: 2,
    itemNumber: "2.2",
    simpleTitle: "İstatistik ve veri paylaşıyor musun?",
    simpleDescription:
      "Yapay zekalar sayısal verilere bayılır. Sektöründe özgün bir istatistik, anket sonucu veya rapor yayınlarsan, yapay zeka seni kaynak olarak göstermeye başlar.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "2-3 hafta",
    selfServiceSteps: [
      "Sektörünle ilgili özgün bir anket veya araştırma yap",
      "Sonuçları blog yazısı + infografik olarak yayınla",
      "Veriyi yapılandırılmış formatta sun (tablo, grafik)",
      "Her çeyrekte güncelle — 'Sektör Raporu 2026 Q1' formatında",
    ],
    technicalDetail: {
      scope: [
        "Özgün veri üretimi — anket, müşteri verileri (anonim), sektör analizi",
        "Dataset Schema markup — yapay zekaların veriyi tanıması için yapılandırılmış format",
        "İnfografik + embed kodu — paylaşılabilirlik ve backlink potansiyeli",
        "Düzenli güncelleme takvimi — eski veri yapay zeka tarafından düşük önceliklendirilir",
        "Veri sayfası SEO — '[Sektör] istatistikleri 2026' anahtar kelimesi hedefle",
        "Press release ile veri duyurusu — medya ilgisi çekme",
      ],
      researchNote:
        "İstatistik içeren sayfalar, yapay zeka cevaplarında citation olarak gösterilme olasılığı 5.3x daha yüksek. Özgün veri üreten siteler, 'kaynak göster' sorgularında dominant pozisyonda.",
      researchSource: "Ahrefs Content Study 2024 — 'Data-Driven Content & AI Citations'",
    },
    canAgencyDo: true,
    agencyPrice: "8.000₺",
  },

  // 2.3 — İçeriğin güncel mi?
  {
    layer: 2,
    itemNumber: "2.3",
    simpleTitle: "İçeriğin güncel mi?",
    simpleDescription:
      "Yapay zekalar güncel içeriklere öncelik verir. Son 6 ayda güncellenmemiş sayfaların yapay zeka sonuçlarında gösterilme şansı çok düşer. Eski içerik = görünmez içerik.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "MEDIUM",
    estimatedTime: "Sürekli",
    selfServiceSteps: [
      "Web sitendeki tüm sayfaları listele ve son güncelleme tarihini kontrol et",
      "6 aydan eski içerikleri güncel bilgilerle revize et",
      "Blog yazılarına 'Son güncelleme: Mart 2026' tarihi ekle",
      "Aylık içerik takvimi oluştur — minimum ayda 2 yeni/güncelleme",
    ],
    technicalDetail: {
      scope: [
        "Content audit — tüm URL'lerin son güncelleme tarihi taranır",
        "Sitemap.xml <lastmod> alanı doğru tarihi yansıtmalı",
        "dateModified Schema.org markup — sayfanın güncellenme tarihi yapay zekaya bildirilir",
        "Evergreen content stratejisi — zamansız içerikleri periyodik güncelle",
        "301 redirect planı — eski URL'leri güncel sayfalara yönlendir",
        "İçerik decay analizi — trafik düşen sayfaları öncelikli güncelle",
      ],
      researchNote:
        "6 aydan eski güncellenmeyen içerikler, yapay zeka sıralamalarında ortalama %45 gerileme gösteriyor. dateModified markup kullanan sayfalar, yapay zeka tarafından %28 daha güncel değerlendiriliyor.",
      researchSource: "Semrush State of Content Marketing 2024",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺/ay",
  },

  // 2.4 — Sorulara doğrudan cevap veriyor musun? (FAQ sayfası)
  {
    layer: 2,
    itemNumber: "2.4",
    simpleTitle: "Sorulara cevap veriyor musun?",
    simpleDescription:
      "Yapay zekalar kullanıcı sorularına cevap arar. Sitende FAQ sayfası, 'nasıl yapılır' rehberleri varsa, yapay zeka seni doğrudan cevap kaynağı olarak kullanır.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "MEDIUM",
    estimatedTime: "1-2 hafta",
    selfServiceSteps: [
      "Sektörünle ilgili en çok sorulan 20 soruyu listele",
      "Her soru için detaylı cevap sayfası oluştur (500+ kelime)",
      "FAQ Schema.org yapılandırılmış veri ekle",
      "Google People Also Ask + AlsoAsked.com'dan soru fikirleri al",
    ],
    technicalDetail: {
      scope: [
        "FAQPage Schema.org JSON-LD markup — her soru-cevap çifti işaretlenir",
        "HowTo Schema.org markup — adım adım rehberler için",
        "Question+Answer format — H2 soru, altında detaylı cevap",
        "People Also Ask optimizasyonu — Google'ın soru kutularını hedefle",
        "Internal linking — ilgili soru sayfaları birbirine bağlanır",
        "Cevap kutucuğu formatı — ilk 2 cümlede direkt cevap (yapay zeka snippet-friendly)",
      ],
      researchNote:
        "FAQ Schema kullanan sayfalar, yapay zekaların 'direct answer' kaynağı olma olasılığı 3.8x daha yüksek. Soru-cevap formatındaki içerikler, Perplexity tarafından %58 daha sık cite ediliyor.",
      researchSource: "Schema.org Adoption Study, SEMrush 2024",
    },
    canAgencyDo: true,
    agencyPrice: "7.000₺",
  },

  // 2.5 — Sitenin yapısı düzgün mü? (hız, mobil, SSL)
  {
    layer: 2,
    itemNumber: "2.5",
    simpleTitle: "Sitenin yapısı düzgün mü?",
    simpleDescription:
      "Web siten yavaşsa, mobilde düzgün görünmüyorsa veya güvenlik sertifikan yoksa, yapay zeka seni güvenilir bulmaz. Hızlı ve güvenli site = yapay zeka gözünde kaliteli kaynak.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "1-3 gün",
    selfServiceSteps: [
      "Google PageSpeed Insights ile siteni test et — 70+ hedefle",
      "Mobil uyumluluğu kontrol et — Google Mobile-Friendly Test",
      "SSL sertifikanın aktif olduğundan emin ol (https://)",
      "Büyük görselleri optimize et — 200KB altında tut",
    ],
    technicalDetail: {
      scope: [
        "Core Web Vitals optimizasyonu — LCP < 2.5s, FID < 100ms, CLS < 0.1",
        "SSL/TLS sertifikası aktif — HTTPS zorunlu",
        "Responsive tasarım — tüm ekran boyutlarında düzgün görüntülenme",
        "Görsel optimizasyonu — WebP format, lazy loading",
        "CDN kullanımı — global erişim hızı artışı",
        "Server response time < 200ms hedefi",
      ],
      researchNote:
        "3 saniyeden yavaş yüklenen sitelerin yapay zeka tarafından dizinlenme olasılığı %60 düşüyor. Mobile-first indexing yapay zeka tarayıcılar için de geçerli.",
      researchSource: "Google Core Web Vitals Report 2024 + PageSpeed Insights",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺",
  },

  // 2.6 — Bilgilerini yapılandırmış mısın? (Schema markup)
  {
    layer: 2,
    itemNumber: "2.6",
    simpleTitle: "Bilgilerini yapılandırmış mısın?",
    simpleDescription:
      "Web sitende yapılandırılmış veri yoksa, yapay zeka sayfanın ne hakkında olduğunu tam anlayamaz. Bilgilerini düzenli formatta sunmak, yapay zekanın seni doğru kategoriye koymasını sağlar.",
    difficulty: "MEDIUM",
    feasibilityScore: 2,
    impact: "HIGH",
    estimatedTime: "1-3 gün",
    selfServiceSteps: [
      "Google Rich Results Test ile siteni kontrol et",
      "Organization veya LocalBusiness bilgilerini düzenli formatta ekle",
      "Sık sorulan soruları düzenli formatta işaretle",
      "Ürün/hizmet bilgilerini tanımla",
    ],
    technicalDetail: {
      scope: [
        "Organization/Person Schema JSON-LD implementasyonu",
        "LocalBusiness Schema — adres, telefon, çalışma saatleri",
        "FAQPage Schema — sık sorulan sorular yapılandırılmış veri",
        "Product/Service Schema — hizmet/ürün tanımları",
        "BreadcrumbList Schema — site navigasyonu",
        "Review/AggregateRating Schema — müşteri yorumları",
      ],
      researchNote:
        "Yapılandırılmış veri kullanan siteler, yapay zeka cevaplarında kaynak olarak gösterilme olasılığı 2.7x daha yüksek.",
      researchSource: "Aggarwal et al., KDD 2024 — DOI: 10.1145/3637528.3671900",
    },
    canAgencyDo: true,
    agencyPrice: "5.000₺",
  },

  // 2.7 — Farklı platformlarda tutarlı mısın?
  {
    layer: 2,
    itemNumber: "2.7",
    simpleTitle: "Farklı platformlarda tutarlı mısın?",
    simpleDescription:
      "LinkedIn'deki bilgin, web sitendeki, Google Business'taki, dizinlerdeki bilginle aynı mı? Farklı yerlerde farklı bilgi varsa, yapay zeka kafası karışır ve seni pas geçer.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "MEDIUM",
    estimatedTime: "1-2 gün",
    selfServiceSteps: [
      "Tüm platformlardaki profil bilgilerini listele",
      "Ad, adres, telefon, hizmetler her yerde aynı mı kontrol et",
      "Tutarsızlıkları düzelt — özellikle telefon ve adres",
      "6 ayda bir tutarlılık kontrolü yap",
    ],
    technicalDetail: {
      scope: [
        "NAP (Name, Address, Phone) tutarlılık audit'i — tüm platformlar",
        "Marka adı tutarlılığı — kısaltma, tam ad, alternatif yazımlar",
        "Hizmet kategorisi tutarlılığı — LinkedIn, site, dizinlerde aynı alanlar",
        "Logo ve görsel tutarlılığı — platform boyutlarına uygun",
        "Biyografi/açıklama tutarlılığı — anahtar kelimeler uyumlu",
        "Aggregator'larla toplu güncelleme opsiyonu",
      ],
      researchNote:
        "Yapay zekalar entity resolution yaparken kaynak tutarlılığına bakar. Tutarsız bilgiler güven skorunu %45 düşürüyor.",
      researchSource: "Moz Local Search Ranking Factors 2024",
    },
    canAgencyDo: true,
    agencyPrice: "3.000₺",
  },

  // 2.8 — Güvenilir kaynaklara referans veriyor musun?
  {
    layer: 2,
    itemNumber: "2.8",
    simpleTitle: "Güvenilir kaynaklara referans veriyor musun?",
    simpleDescription:
      "İçeriklerinde güvenilir kaynaklara (araştırma, istatistik, resmi kurum) link veriyor musun? Yapay zeka, başka güvenilir kaynaklara referans veren sitelere daha çok güveniyor.",
    difficulty: "EASY",
    feasibilityScore: 5,
    impact: "MEDIUM",
    estimatedTime: "Sürekli",
    selfServiceSteps: [
      "Blog yazılarında istatistik ve araştırmalara link ver",
      "Sektörel kuruluşlara ve resmi kaynaklara referans ekle",
      "Her içerikte en az 2-3 dış kaynak bağlantısı olsun",
      "Güncel ve güvenilir kaynakları tercih et",
    ],
    technicalDetail: {
      scope: [
        "Outbound link stratejisi — yüksek otorite kaynaklara bağlantı",
        "Citation formatı — akademik tarz referanslar güven artırır",
        "Kaynak çeşitliliği — sektörel, akademik, resmi kaynaklar",
        "Internal + external link dengesi — aşırı self-referans kaçın",
        "Broken link kontrolü — kırık bağlantılar güveni düşürür",
        "Kaynak güncelleme takvimi — eski linkler yenilensin",
      ],
      researchNote:
        "Güvenilir dış kaynaklara referans veren sayfalar, yapay zeka tarafından %35 daha güvenilir kabul ediliyor. Kaynak göstermeyen içerikler 'doğrulanmamış' kategorisinde değerlendiriliyor.",
      researchSource: "Google Search Quality Evaluator Guidelines 2024",
    },
    canAgencyDo: false,
    agencyPrice: null,
  },

  // ═══════════════════════════════════════════════════════════
  // KATMAN 3: ÖNERİYOR MU? (7 madde — Pro only, Free'de blur)
  // ═══════════════════════════════════════════════════════════

  // 3.1 — Birden fazla yapay zeka seni tanıyor mu?
  {
    layer: 3,
    itemNumber: "3.1",
    simpleTitle: "Birden fazla platformda bahsediliyor musun?",
    simpleDescription:
      "ChatGPT, Claude, Gemini, Perplexity — ne kadar çok platformda bahsedilirsen, o kadar güçlü bir yapay zeka varlığın olur. Tek platformda olmak yetmez.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "1-3 ay",
    selfServiceSteps: [
      "4 ana yapay zekada markanı sorgula ve sonuçları karşılaştır",
      "Bahsedilmeyen platformlar için hedefli içerik stratejisi oluştur",
      "Her platform için farklı kaynak türleri oluştur (blog, veri, haber)",
      "Haftalık olarak GH7 ile sonuçları takip et",
    ],
    technicalDetail: {
      scope: [
        "Platform-specific içerik stratejisi — her yapay zekanın farklı kaynak tercihi var",
        "ChatGPT: Wikipedia, güvenilir haber kaynakları, akademik makaleler ağırlıklı",
        "Perplexity: Güncel web sonuçları, soru-cevap formatı, citation-ready içerik",
        "Claude: Uzun form içerik, teknik dökümanlar, araştırma raporları",
        "Gemini: Google ekosistemi, YouTube, Google Scholar, Knowledge Graph",
        "Cross-platform citation audit — hangi platform hangi kaynağı kullanıyor",
        "Multi-channel content distribution — aynı bilgi farklı formatlarda",
      ],
      researchNote:
        "3+ yapay zekada tutarlı şekilde bahsedilen markalar, tek platform markalarına göre kullanıcı güveninde %89 daha yüksek skor alıyor.",
      researchSource: "GH7.ai Internal Research — 500+ marka analizi, 2024 Q4",
    },
    canAgencyDo: true,
    agencyPrice: "12.000₺/ay",
  },

  // 3.2 — Yapay zeka cevaplarında kaynak olarak gösteriliyor musun? (citation)
  {
    layer: 3,
    itemNumber: "3.2",
    simpleTitle: "Kaynak olarak gösteriliyor musun?",
    simpleDescription:
      "Yapay zekalar cevap verirken kaynak gösterir. Senin siten bir kaynaksa, bu en üst düzey güven demek. Perplexity'de link olarak çıkmak, altın değerinde.",
    difficulty: "HARD",
    feasibilityScore: 1,
    impact: "HIGH",
    estimatedTime: "3-6 ay",
    selfServiceSteps: [
      "Perplexity'de sektör sorgularını yap — kaynak listesinde siten var mı?",
      "ChatGPT Browse modunda markanı sorgula — cite ediliyor musun?",
      "Yoksa özgün, referans alınabilir içerik üretmeye başla (veri, rehber, araştırma)",
      "Citation tracking — GH7 Kaynaklar sekmesinden hangi URL'lerin cite edildiğini takip et",
    ],
    technicalDetail: {
      scope: [
        "Citation-worthy içerik üretimi — özgün veri, sektör raporu, benchmark",
        "Citability optimizasyonu — net başlıklar, kolay referans alınabilir paragraflar",
        "Snippet-friendly yazım — ilk 2 cümlede net cevap, sonra detay",
        "Canonical URL yapısı — yapay zekanın doğru sayfayı cite etmesini sağla",
        "Backlink velocity artışı — organik cite edilme zinciri başlatma",
        "Citation monitoring — Perplexity API ile otomatik takip",
      ],
      researchNote:
        "Yapay zeka referans alan sayfaların %78'i orijinal veri veya araştırma içeriyor. Genel bilgi sayfaları neredeyse hiç cite edilmiyor. Referans alınabilir içerik, yapay zekada önerilme olasılığını 7.2x artırıyor.",
      researchSource: "Backlinko AI Search Study 2024 — Brian Dean",
    },
    canAgencyDo: true,
    agencyPrice: "20.000₺/ay",
  },

  // 3.3 — Rakiplerinden daha çok kaynağın var mı?
  {
    layer: 3,
    itemNumber: "3.3",
    simpleTitle: "Rakiplerinden daha çok kaynağın var mı?",
    simpleDescription:
      "Yapay zeka karşılaştırmalı sorularda kaynak sayısına bakar. Rakibinin 15 kaynağı varsa senin de en az o kadar olmalı. Yoksa yapay zeka rakibini öneriyor, seni değil.",
    difficulty: "HARD",
    feasibilityScore: 1,
    impact: "HIGH",
    estimatedTime: "2-6 ay",
    selfServiceSteps: [
      "GH7 Rakipler sekmesinden rakiplerinin kaynak sayısını kontrol et",
      "Eksik kaynak türlerini belirle (medya, dizin, akademik, sosyal, video)",
      "Her ay en az 2 yeni yüksek kaliteli kaynak kazan",
      "Kaynak kalitesini artır — DA 40+ sitelerden backlink hedefle",
    ],
    technicalDetail: {
      scope: [
        "Rakip kaynak gap analizi — her rakibin kaynak profili çıkarılır",
        "Kaynak çeşitlilik skoru — medya, dizin, UGC, akademik, referans kategorileri",
        "Backlink profile karşılaştırma — Ahrefs/Moz ile rakip DR/DA analizi",
        "Content gap analizi — rakiplerin yapay zekada bahsedilip senin bahsedilmediğin konular",
        "Link building stratejisi — broken link, resource page, guest post",
        "Kaynak kalite piramidi — az ama yüksek otorite > çok ama düşük otorite",
      ],
      researchNote:
        "Yapay zeka karşılaştırma sorgularında, kaynak çeşitliliği kaynak sayısından daha etkili. 5 farklı türde kaynağı olan markalar, 20 tek tür kaynağı olan markalardan %44 daha sık öneriliyor.",
      researchSource: "Zyppy AI Visibility Study 2024 — Cyrus Shepard",
    },
    canAgencyDo: true,
    agencyPrice: "15.000₺/ay",
  },

  // 3.4 — Sektöründe otorite olarak tanınıyor musun?
  {
    layer: 3,
    itemNumber: "3.4",
    simpleTitle: "Otorite olarak tanınıyor musun?",
    simpleDescription:
      "Yapay zekalar bazı markaları sektörlerinde otorite olarak kabul eder ve varsayılan öneri olarak sunar. Bu seviye, uzun vadeli ve stratejik çalışma gerektirir.",
    difficulty: "HARD",
    feasibilityScore: 1,
    impact: "HIGH",
    estimatedTime: "6-12 ay",
    selfServiceSteps: [
      "Sektörel etkinliklerde konuşmacı ol — video kayıtlarını yayınla",
      "Kitap, whitepaper veya kapsamlı rehber yayınla",
      "Sektör liderlerinden referans/endorsement al",
      "Ödül ve sertifikalara başvur",
    ],
    technicalDetail: {
      scope: [
        "Thought leadership content stratejisi — sektörde 'ilk' veya 'en kapsamlı' içerikler",
        "E-E-A-T optimizasyonu (Experience, Expertise, Authoritativeness, Trustworthiness)",
        "Author Schema markup — yazar bilgisi yapılandırılmış veri olarak işaretlenir",
        "Google Knowledge Panel oluşturma/güncelleme — Wikidata + Wikipedia varlığı",
        "Sektörel konferans katılımları ve konuşma videolarının YouTube'da yayını",
        "Academic citation — Google Scholar'da yer alacak araştırma/whitepaper",
        "Cross-referencing — diğer otoriteler tarafından referans alınma stratejisi",
      ],
      researchNote:
        "Google'ın E-E-A-T framework'ü yapay zekaların güven değerlendirmesini doğrudan etkiler. Otorite skoru yüksek markalar, yapay zekanın 'en iyi X' sorgularında varsayılan öneri olma olasılığı %91.",
      researchSource: "Google Search Quality Evaluator Guidelines 2024 + Stanford HAI Report",
    },
    canAgencyDo: true,
    agencyPrice: "25.000₺/ay",
  },

  // 3.5 — Farklı soru tiplerinde çıkıyor musun?
  {
    layer: 3,
    itemNumber: "3.5",
    simpleTitle: "Farklı soru tiplerinde çıkıyor musun?",
    simpleDescription:
      "Sadece 'X kim' sorgularında değil; karşılaştırma, tavsiye, fiyat, lokasyon gibi farklı soru tiplerinde de yapay zeka tarafından bahsedilmek tam kapsamlı varlık demek.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "MEDIUM",
    estimatedTime: "2-4 ay",
    selfServiceSteps: [
      "GH7 Sorular sekmesindeki farklı kategorilerdeki sonuçlarını kontrol et",
      "Zayıf olduğun soru kategorilerini belirle (tavsiye, fiyat, karşılaştırma)",
      "Her zayıf kategori için hedefli içerik üret",
      "Soru çeşitliliğini artır ve haftalık takip et",
    ],
    technicalDetail: {
      scope: [
        "Query type analizi — navigational, informational, transactional, comparison",
        "Kategori bazlı içerik gap analizi — her soru tipi için ayrı içerik",
        "Comparison page'ler — 'X vs Y' formatında karşılaştırma içerikleri",
        "Pricing page optimizasyonu — fiyat sorguları için yapılandırılmış veri",
        "Location page'ler — lokasyon bazlı sorgular için LocalBusiness Schema",
        "Review/testimonial sayfaları — tavsiye sorgularında güvenilirlik sinyali",
        "Product Schema markup — ürün/hizmet sorgularında zengin sonuç",
      ],
      researchNote:
        "5+ farklı soru kategorisinde yapay zekada görünen markalar, toplam yapay zeka trafiğinin %73'ünü alıyor. Sadece marka sorgularında görünen markalar, potansiyel trafiğin %85'ini kaçırıyor.",
      researchSource: "Seer Interactive AI Search Intent Study 2024",
    },
    canAgencyDo: true,
    agencyPrice: "10.000₺/ay",
  },

  // 3.6 — Yapay zeka senden olumlu mu bahsediyor? (sentiment)
  {
    layer: 3,
    itemNumber: "3.6",
    simpleTitle: "Yapay zeka senden olumlu mu bahsediyor?",
    simpleDescription:
      "Bahsedilmek yetmez — nasıl bahsedildiği de önemli. Yapay zeka seni olumsuz tanıtıyorsa, bu tanınmamaktan daha kötü. Olumlu algı için kaynak kalitesini artır.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "1-3 ay",
    selfServiceSteps: [
      "GH7 ile yapay zekaların senden nasıl bahsettiğini kontrol et",
      "Olumsuz bahis varsa kaynağını bul ve düzeltmeye çalış",
      "Olumlu müşteri yorumları ve başarı hikayeleri yayınla",
      "Sorunlu konuları proaktif olarak ele al — kriz iletişimi hazırla",
    ],
    technicalDetail: {
      scope: [
        "Sentiment analizi — yapay zeka yanıtlarında olumlu/olumsuz/nötr dağılım",
        "Negatif kaynak tespiti — olumsuz bilgi nereden geliyor",
        "Online itibar yönetimi — olumsuz içeriklere karşı olumlu içerik stratejisi",
        "Review yönetimi — negatif yorumlara profesyonel cevap",
        "Başarı hikayesi ve vaka çalışması yayınlama",
        "Kriz iletişim planı — olası olumsuz senaryolara hazırlık",
      ],
      researchNote:
        "Yapay zeka 'güvenilir mi' sorgularında, pozitif kaynak oranı %70'in üzerindeki markalar, varsayılan öneri olarak sunuluyor. Negatif sentiment %30'u geçtiğinde yapay zeka uyarı notu ekliyor.",
      researchSource: "GH7.ai Internal Research — Sentiment Analysis Study 2024",
    },
    canAgencyDo: true,
    agencyPrice: "8.000₺/ay",
  },

  // 3.7 — Hiç kimsenin güçlü olmadığı sorularda sen var mısın? (boş alan fırsatları)
  {
    layer: 3,
    itemNumber: "3.7",
    simpleTitle: "Boş alan fırsatlarını değerlendiriyor musun?",
    simpleDescription:
      "Bazı sorularda hiçbir rakip güçlü değil — yapay zeka kimseyi öneremiyor. Bu sorular altın değerinde fırsat. İlk sen girersen, yapay zekanın varsayılan önerisi olursun.",
    difficulty: "MEDIUM",
    feasibilityScore: 3,
    impact: "HIGH",
    estimatedTime: "1-3 ay",
    selfServiceSteps: [
      "GH7'deki 'Boş Alan Fırsatları' bölümünü kontrol et",
      "Kimsenin güçlü olmadığı sorular için hedefli içerik üret",
      "Bu alanlarda uzmanlaşmış içerik oluştur (rehber, FAQ, veri)",
      "Haftalık takip et — bu sorularda çıkmaya başladın mı?",
    ],
    technicalDetail: {
      scope: [
        "Boş alan analizi — hiçbir rakibin güçlü olmadığı sorgular",
        "First-mover advantage — rakiplerden önce içerik üret",
        "Niş içerik stratejisi — genel konular yerine spesifik alanlara odaklan",
        "Long-tail sorgular — rekabeti düşük, dönüşümü yüksek sorular",
        "İçerik otoritesi oluşturma — bu alanda en kapsamlı kaynak ol",
        "Düzenli monitoring — rakip bu alana girerse hızlı aksiyon",
      ],
      researchNote:
        "Boş alan sorgularında ilk içerik üreten marka, yapay zeka tarafından %85 oranında varsayılan kaynak oluyor. First-mover advantage yapay zekada çok güçlü — sonradan girmek 3x daha zor.",
      researchSource: "GH7.ai Internal Research — Empty Area Opportunity Study 2024",
    },
    canAgencyDo: true,
    agencyPrice: "10.000₺/ay",
  },
];
