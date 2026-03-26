"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const FAQS = [
  {
    q: "GEO nedir, neden SEO\u2019dan farklıdır?",
    a: "GEO (Generative Engine Optimization), içeriğinizi yapay zeka motorlarının güvenilir kaynak olarak referans alması için optimize etme disiplinidir. SEO Google\u2019da sıralama hedefler; GEO AI\u2019ların sizi doğrudan önermesini hedefler. Princeton Üniversitesi araştırması, GEO\u2019nun görünürlüğü %40\u2019a kadar artırdığını göstermiştir.",
  },
  {
    q: "4 profil tipinden hangisini seçmeliyim?",
    a: "Firma: şirket/marka görünürlüğü. Kişi: doktor, avukat gibi bireysel marka. E-Ticaret: Trendyol/Hepsiburada ürün takibi. Export: yabancı müşterilere ulaşma. Free analizle deneyin, sistem profilinize uygun analizi otomatik yapar.",
  },
  {
    q: "Free analiz gerçekten tam analiz mi, blur var mı?",
    a: "Hayır, blur yok. Free\u2019de tüm platformlar, tüm metrikler, tüm rakipler, tüm AI yanıtları tam açık gösterilir. Pro\u2019nun farkı haftalık otomatik takip ve değişim bildirimidir.",
  },
  {
    q: "Ajans hizmeti (RaaS) ne demek?",
    a: "Results as a Service. Business paketinde GEO ajansımız sizin için çalışır — içerik, schema, entity building, citation. Siz dashboard\u2019dan takip edersiniz, biz iyileştiririz.",
  },
  {
    q: "Export analizi hangi dilleri destekliyor?",
    a: "İngilizce, Almanca, Arapça, Rusça, Fransızca, Hollandaca. Hedef pazarınızın dilinde sorgular oluşturulur ve o dilde AI platformlarında analiz yapılır.",
  },
  {
    q: "Blog yazıları otomatik mi üretiliyor?",
    a: "Evet. Her analiz sonrası Opus modeli, verilerinize dayalı SEO uyumlu blog yazısı üretir. Bu hem GEO görünürlüğünüzü artırır hem de organik trafik getirir. Bir taşla iki kuş.",
  },
];

export function FaqSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[100px] px-5 sm:px-10" id="sss">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          SSS
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Merak edilenler
        </h2>

        <div className="max-w-[620px] mt-10">
          {FAQS.map((faq) => (
            <details key={faq.q} className="border-b border-zinc-100 group">
              <summary className="py-[18px] text-[14px] font-semibold cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-[16px] text-zinc-400 group-open:hidden">+</span>
                <span className="text-[16px] text-zinc-400 hidden group-open:inline">&minus;</span>
              </summary>
              <p className="text-[13px] text-zinc-500 leading-[1.7] pb-[18px]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
