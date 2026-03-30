export interface AjansPaketFaq {
  q: string;
  a: string;
}

export interface AjansPaket {
  id: string;
  title: string;
  price: number;
  shortDesc: string;
  longDesc: string;
  duration: string;
  checklist: string[];
  faq: AjansPaketFaq[];
}

export const AJANS_PAKETLERI: AjansPaket[] = [
  {
    id: "schema-markup",
    title: "Schema Markup Paketi",
    price: 2990,
    shortDesc: "Tüm sayfalarınıza AI uyumlu yapılandırılmış veri eklenir.",
    longDesc:
      "Web sitenizin tüm sayfalarına Organization, Product, FAQ, HowTo ve LocalBusiness schema markup eklenir. AI motorları sitenizi yapılandırılmış veri olarak okur, önerme oranınız artar.",
    duration: "3-5 iş günü",
    checklist: [
      "Mevcut site analizi ve schema audit",
      "Organization ve LocalBusiness schema ekleme",
      "Ürün sayfalarına Product schema ekleme",
      "FAQ sayfalarına FAQPage schema ekleme",
      "Google Rich Results Test ile doğrulama",
      "Teslim raporu",
    ],
    faq: [
      {
        q: "Schema markup nedir?",
        a: "Web sayfanızdaki bilgileri yapılandırılmış formatta tanımlayan kod parçacıklarıdır. AI motorları bu verileri okuyarak sitenizi daha iyi anlar.",
      },
      {
        q: "Mevcut sitemde değişiklik yapılacak mı?",
        a: "Sadece HTML head bölümüne JSON-LD formatında kod eklenir. Görsel değişiklik olmaz.",
      },
    ],
  },
  {
    id: "icerik-optimizasyonu",
    title: "İçerik Optimizasyonu",
    price: 4990,
    shortDesc: "10 sayfa AI referans alacak formatta yeniden yazılır.",
    longDesc:
      "En önemli 10 sayfanız AI platformlarının referans vermek isteyeceği formatta yeniden yapılandırılır. FAQ bölümleri, yapılandırılmış başlıklar, kaynak referansları eklenir.",
    duration: "7-10 iş günü",
    checklist: [
      "Sayfa önceliklendirme analizi",
      "10 sayfanın AI uyumlu yeniden yazımı",
      "Her sayfaya FAQ bölümü ekleme",
      "Başlık ve meta açıklama optimizasyonu",
      "İç linkleme stratejisi uygulama",
      "Teslim raporu ve karşılaştırma",
    ],
    faq: [
      {
        q: "Hangi sayfalar optimize edilecek?",
        a: "GH7 analiz sonuçlarına göre en düşük AI görünürlüğe sahip 10 sayfa belirlenir.",
      },
      {
        q: "Mevcut içerikler silinecek mi?",
        a: "Hayır. Mevcut içerikler korunur, AI uyumlu bölümler eklenir ve yapı güçlendirilir.",
      },
    ],
  },
  {
    id: "entity-building",
    title: "Entity Building",
    price: 3490,
    shortDesc: "Markanızı AI'ların güvenilir kaynak olarak tanıtma.",
    longDesc:
      "Markanızın dijital varlığı güçlendirilir. Wikipedia, Wikidata, Google Knowledge Graph, sektörel dizinler ve otoriteli platformlarda marka varlığı oluşturulur.",
    duration: "10-15 iş günü",
    checklist: [
      "Mevcut dijital varlık analizi",
      "Sektörel dizin kayıtları",
      "Google Business profil optimizasyonu",
      "Üçüncü parti platform profilleri",
      "Tutarlılık kontrolü (NAP)",
      "Aylık ilerleme raporu",
    ],
    faq: [
      {
        q: "Entity building ne işe yarar?",
        a: "AI motorları güvenilir kaynakları tanırken dijital varlık genişliğine bakar. Ne kadar çok güvenilir platformda varsa, o kadar çok önerilirsiniz.",
      },
      {
        q: "Sonuçları ne zaman görürüm?",
        a: "İlk etkiler 2-4 hafta içinde görülmeye başlar. Tam etki 2-3 ay sürer.",
      },
    ],
  },
  {
    id: "citation-paketi",
    title: "Citation Paketi",
    price: 2490,
    shortDesc: "Sektörel platformlarda referans ağı oluşturma.",
    longDesc:
      "AI platformlarının kaynak olarak kullandığı sektörel sitelerde, forumlarda ve dizinlerde markanızın referans alınmasını sağlar.",
    duration: "5-7 iş günü",
    checklist: [
      "Sektörel kaynak haritası çıkarma",
      "10 platformda profil oluşturma",
      "İçerik katkısı ve referans bağlantıları",
      "Forum ve topluluk katılımı stratejisi",
      "Takip ve raporlama",
    ],
    faq: [
      {
        q: "Hangi platformlarda çalışılacak?",
        a: "Sektörünüze göre belirlenir. Forumlar, dizinler, haber siteleri, sektörel portallar ve review platformları hedeflenir.",
      },
    ],
  },
  {
    id: "llms-txt",
    title: "llms.txt + robots.txt",
    price: 990,
    shortDesc: "AI botlarına sitenizi tanıtan teknik dosyalar.",
    longDesc:
      "AI motorlarının sitenizi tarayabilmesi için gerekli teknik dosyalar oluşturulur ve yapılandırılır. llms.txt dosyası AI botlarına sitenizin yapısını anlatır.",
    duration: "1-2 iş günü",
    checklist: [
      "Mevcut robots.txt analizi",
      "AI bot erişim izinleri yapılandırma",
      "llms.txt dosyası oluşturma",
      "Sitemap.xml kontrolü ve güncelleme",
      "Test ve doğrulama",
    ],
    faq: [
      {
        q: "llms.txt nedir?",
        a: "Web sitenizin AI botlarına kendini tanıttığı bir dosyadır. Hangi sayfaların önemli olduğunu, ne hakkında olduğunuzu anlatır.",
      },
    ],
  },
  {
    id: "export-dil",
    title: "Export Dil Paketi",
    price: 3990,
    shortDesc: "5 sayfanın hedef dilde GEO uyumlu çevirisi.",
    longDesc:
      "Uluslararası pazarlara açılmak isteyen firmalar için 5 kritik sayfanın hedef dilde GEO optimize çevirisi yapılır. Sadece çeviri değil, hedef pazardaki AI platformları için optimize edilmiş içerik.",
    duration: "5-7 iş günü",
    checklist: [
      "Hedef pazar ve dil analizi",
      "5 sayfanın GEO uyumlu çevirisi",
      "Hedef dilde schema markup",
      "Hedef dilde meta etiketler",
      "Hreflang etiketleri kurulumu",
      "Kalite kontrolü (native speaker)",
    ],
    faq: [
      {
        q: "Hangi dillere çeviri yapılıyor?",
        a: "İngilizce, Almanca, Arapça, Rusça, Fransızca ve İspanyolca desteklenmektedir.",
      },
    ],
  },
  {
    id: "video-icerik",
    title: "Video İçerik Danışmanlığı",
    price: 1990,
    shortDesc: "AI'ın referans alacağı video stratejisi.",
    longDesc:
      "YouTube ve diğer video platformlarında AI motorlarının referans alacağı video içerik stratejisi oluşturulur. Başlık, açıklama, etiket ve transkript optimizasyonu dahildir.",
    duration: "3-5 iş günü",
    checklist: [
      "Mevcut video içerik analizi",
      "10 video konu önerisi",
      "Başlık ve açıklama şablonları",
      "SEO + GEO uyumlu etiket stratejisi",
      "Transkript optimizasyon rehberi",
      "YouTube schema markup rehberi",
    ],
    faq: [
      {
        q: "Video çekimi dahil mi?",
        a: "Hayır. Bu paket strateji ve optimizasyon danışmanlığıdır. Video üretimi ayrıca planlanır.",
      },
    ],
  },
];
