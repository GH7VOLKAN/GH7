import type { Report } from "./types";

/** Sample report (real ISITMAX data) — used to verify the renderer + types. */
export const sampleReport: Report = {
  brand: "ISITMAX",
  product: "AI Görünürlük",
  date: "2026-05-31",
  lang: "tr",
  sections: [
    {
      type: "summary",
      title: "Durum",
      body:
        "ISITMAX kendi ürünlerinde (yerden ısıtma, heat trace, ısı ceketi) AI aramada güçlü: Claude %79, Google %71, Perplexity %60.\n\nEn zayıf nokta Gemini (%40) — çıktığında #1 sırada ama çıkma oranı düşük. Önerilen ama her yerde değil.",
    },
    {
      type: "visibility",
      title: "Motor bazında görünürlük",
      engines: [
        { name: "ChatGPT", pct: 0, avgPos: null, note: "Ölçülemedi (kota)" },
        { name: "Claude", pct: 79, avgPos: 1.9 },
        { name: "Gemini", pct: 40, avgPos: 1.2, note: "Çıkınca zirvede" },
        { name: "Perplexity", pct: 60, avgPos: 2.4 },
        { name: "Google", pct: 71, avgPos: 4.7 },
      ],
    },
    {
      type: "competitors",
      title: "Seni geçen rakipler",
      rows: [
        { name: "Form Mühendislik", where: "Claude, Perplexity, Gemini", note: "Heat trace sorgularında en sık öneri." },
        { name: "EHT Mühendislik", where: "Claude, Perplexity" },
        { name: "MTM Elektrik", where: "Gemini" },
      ],
    },
    {
      type: "sourceMap",
      title: "AI'ların atıf verdiği kaynaklar",
      sources: [
        { domain: "isitmax.com", count: 168, klass: "own" },
        { domain: "formmuhendislik.com", count: 77, klass: "comp" },
        { domain: "ehtmuhendislik.com", count: 57, klass: "comp" },
        { domain: "heattrace.com.tr", count: 35, klass: "neutral" },
        { domain: "viessmann.com.tr", count: 23, klass: "neutral" },
      ],
    },
    {
      type: "gaps",
      title: "Sorgu-bazlı içerik açıkları",
      items: [
        {
          query: "Heat trace kablo self-regulating mi sabit güçlü mü, hangi üreticiden?",
          diagnosis:
            "Form Mühendislik tek sayfada her iki kablo tipini SKU'larla kapsıyor ve Türkiye distribütörü olduğunu belirtiyor. Senin sitende karşılaştırma + tedarikçi cevabı veren sayfa yok.",
          contentGap: [
            "Self-regulating vs sabit güçlü karşılaştırma tablosu (10+ kriter)",
            "'Hangisini seçmeliyim?' karar ağacı",
            "Türkiye tedarikçi/marka listesi",
          ],
          faq: [
            {
              q: "Self-regulating ve sabit güçlü ısıtıcı kablo arasındaki fark nedir?",
              a: "Self-regulating kablo her noktasında sıcaklığa göre gücünü otomatik ayarlar ve üst üste sarılabilir; sabit güçlü kablo uzunluğu boyunca sabit W/m verir ama termostat gerektirir.",
            },
          ],
          jsonLd:
            '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>',
          actions: [
            "/heat-trace-kablo-secim-rehberi pillar sayfasını yayınla",
            "Karşılaştırma tablosunu HTML <table> + structured data ile ekle",
            "Türkiye tedarikçi bölümü ekle (otorite sinyali)",
          ],
        },
      ],
    },
  ],
};
