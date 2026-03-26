"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PLANS = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "",
    desc: "Tek seferlik tam analiz — blur yok, her şey açık",
    featured: false,
    features: [
      "4 profil tipi desteklenir",
      "Tüm AI platformları",
      "10 sorgu (firma/kişi) veya 1 ürün (e-ticaret) veya 1 pazar (export)",
      "Rakip tespiti + sıralama",
      "Opus kişiselleştirilmiş analiz",
      "Teknik audit",
    ],
    btnText: "Ücretsiz Analiz Et",
    btnClass: "bg-white text-[#09090B] border border-zinc-200",
  },
  {
    name: "Pro",
    price: "₺2.495",
    period: "/ay",
    desc: "Haftalık otomatik takip + değişim bildirimi",
    featured: true,
    features: [
      "1 proje (firma/kişi/e-ticaret/export)",
      "50 sorgu veya 30 ürün veya 5 pazar",
      "5 AI platformu + 3 il",
      "Haftalık otomatik analiz + varyasyon",
      "Ürün bazlı sıralama savaşı",
      "\u201CRakibi geçtiniz!\u201D bildirimleri",
      "PDF rapor + WhatsApp haftalık özet",
      "Trend grafiği + gelişim planı",
      "Otomatik blog üretimi (Opus)",
    ],
    btnText: "Pro\u2019ya Başlayın",
    btnClass: "bg-[#09090B] text-white",
  },
  {
    name: "Business",
    price: "₺7.495",
    period: "/ay",
    desc: "Çoklu proje + GEO ajans hizmeti (RaaS)",
    featured: false,
    features: [
      "3 proje (karma: firma+kişi+export vb.)",
      "Sınırsız sorgu + ürün + pazar",
      "6 AI platformu + 10 il",
      "Günlük analiz",
      "GEO Ajans hizmeti dahil",
      "İçerik + schema + entity çalışması",
      "Aylık strateji toplantısı",
      "White-label raporlama",
      "API erişimi",
    ],
    btnText: "İletişime Geçin",
    btnClass: "bg-[#09090B] text-white",
  },
];

export function PricingSectionV3() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[100px] px-5 sm:px-10" id="fiyat">
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Fiyatlandırma
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Net fiyat. Gizli maliyet yok.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px] mx-auto">
          4 profil tipi için tek fiyat. Firma, kişi, e-ticaret veya export — Pro ile haftalık otomatik takip başlar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-[14px] overflow-hidden mt-10">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col p-8 text-left ${plan.featured ? "bg-[#FAFAFA]" : "bg-white"}`}
            >
              <div className={`text-[12px] font-bold uppercase tracking-[0.08em] mb-2.5 ${plan.featured ? "text-[#09090B]" : "text-zinc-400"}`}>
                {plan.name}
              </div>
              <div className="text-[30px] font-extrabold mb-1" style={{ letterSpacing: "-0.03em" }}>
                {plan.price}
                {plan.period && <span className="text-[13px] font-normal text-zinc-400">{plan.period}</span>}
              </div>
              <div className="text-[12px] text-zinc-400 mb-5 leading-[1.4]">
                {plan.desc}
              </div>

              <ul className="list-none p-0 flex-1 mb-5">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="text-[12px] text-zinc-600 py-1 flex gap-[7px] leading-[1.4]"
                  >
                    <span className="text-zinc-300 text-[10px] shrink-0 mt-0.5">→</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full text-center py-3 rounded-[9px] text-[13px] font-semibold cursor-pointer border-none ${plan.btnClass}`}
              >
                {plan.btnText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
