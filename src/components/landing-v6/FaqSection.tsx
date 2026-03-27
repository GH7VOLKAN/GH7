"use client";

const faqs = [
  {
    q: "GH7.ai tam olarak ne yapar?",
    a: "Markanizin ChatGPT, Claude, Gemini, Perplexity ve Google AI gibi yapay zeka platformlarindaki gorunurlugunu olcer, rakiplerinizle karsilastirir ve haftalik raporlar sunar."
  },
  {
    q: "Sonuclar ne kadar surede cikiyor?",
    a: "Ucretsiz test 60 saniyede sonuc verir. Abonelik sonrasi ilk tam rapor 24 saat icinde hazirlenir, sonrasinda haftalik otomatik guncellenir."
  },
  {
    q: "SEO ile GEO arasindaki fark ne?",
    a: "SEO arama motorlarinda siralama optimizasyonudur. GEO (Generative Engine Optimization) ise yapay zeka platformlarinda onerilme optimizasyonudur. GH7.ai, GEO&apos;ya odaklanir."
  },
  {
    q: "Hangi AI platformlarini takip ediyorsunuz?",
    a: "ChatGPT, Claude, Gemini, Perplexity, Google AI Overview ve Microsoft Copilot olmak uzere 6 buyuk platformu takip ediyoruz."
  },
  {
    q: "Rakiplerimi de gorebiliyor muyum?",
    a: "Evet. Paketinize gore 2 ile sinirsiz rakibi takip edebilir, prompt bazinda karsilastirma yapabilirsiniz."
  },
  {
    q: "Ucretsiz test icin kayit gerekiyor mu?",
    a: "Hayir. Domain veya isminizi girin, 60 saniyede sonuclari gorun. Kredi karti veya kayit gerekmez."
  },
];

export default function FaqSection() {
  return (
    <section className="faq-sec reveal" id="faq">
      <span className="faq-tag">SSS</span>
      <h2 className="faq-title">Sik sorulan sorular</h2>
      <div className="faq-wrap">
        {faqs.map((f, i) => (
          <details key={i} className="faq">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
