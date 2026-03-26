"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const FAQS = [
  {
    q: "GEO nedir, neden SEO\u2019dan farklıdır?",
    a: "GEO (Generative Engine Optimization), içeriğinizi yapay zeka motorlarının güvenilir kaynak olarak referans alması için optimize etme disiplinidir. SEO Google\u2019da sıralama hedefler; GEO AI\u2019ların sizi doğrudan önermesini hedefler.",
  },
  {
    q: "4 profil tipinden hangisini seçmeliyim?",
    a: "Firma: şirket/marka görünürlüğü. Kişi: doktor, avukat gibi bireysel marka. E-Ticaret: Trendyol/Hepsiburada ürün takibi. Export: yabancı müşterilere ulaşma. Free analizle deneyin, sistem profilinize uygun analizi otomatik yapar.",
  },
  {
    q: "Free analiz gerçekten tam analiz mi?",
    a: "Evet. Free\u2019de tüm platformlar, tüm metrikler, tüm rakipler, tüm AI yanıtları tam açık gösterilir. Pro\u2019nun farkı haftalık otomatik takip, Business\u2019ın farkı aksiyon araçlarıdır.",
  },
  {
    q: "Pro ve Business arasındaki fark ne?",
    a: "Pro = monitoring. Durumunuzu gösterir: haftalık takip, sıralama savaşı, trend grafikleri, bildirimler. Business = monitoring + aksiyon araçları. Ne yapacağınızı söyler, araçları verir, yaptığınızı doğrular, işe yaradığını gösterir.",
  },
  {
    q: "Ajans paketleri nasıl çalışıyor?",
    a: "Tek seferlik hizmet paketleri. Schema markup, içerik optimizasyonu, export dil paketi gibi. Aylık abonelik yok — ihtiyacınız olan paketi alırsınız, ajans uygular.",
  },
  {
    q: "Export analizi hangi dilleri destekliyor?",
    a: "İngilizce, Almanca, Arapça, Rusça, Fransızca, Hollandaca. Hedef pazarınızın dilinde sorgular oluşturulur ve o dilde AI platformlarında analiz yapılır.",
  },
];

export function FaqSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
      id="faq"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
            SSS
          </div>
          <h2
            className="font-extrabold leading-[1.1]"
            style={{
              fontSize: "clamp(28px, 4.2vw, 46px)",
              letterSpacing: "-0.035em",
            }}
          >
            Merak edilenler
          </h2>
        </div>

        <div className="max-w-[680px] mx-auto">
          {FAQS.map((faq) => (
            <details key={faq.q} className="border-b border-[#F3F4F6] group">
              <summary className="py-5 text-[14px] font-semibold cursor-pointer list-none flex justify-between items-center gap-4 text-[#09090B]">
                {faq.q}
                <span className="text-[18px] text-[#D1D5DB] shrink-0 group-open:hidden">
                  +
                </span>
                <span className="text-[18px] text-[#D1D5DB] shrink-0 hidden group-open:inline">
                  &minus;
                </span>
              </summary>
              <p className="text-[13px] text-[#6B7280] leading-[1.7] pb-5">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
