"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PLANS = [
  {
    name: "Ucretsiz",
    price: "₺0",
    period: "",
    desc: "Tek seferlik gorunurluk analizi",
    featured: false,
    features: [
      "5 arama kelimesi",
      "1 il",
      "Sadece AI Overview",
      "GEO Skoru",
      "Rakip tespiti",
    ],
    advantagesTitle: "Icerir",
    advantages: [
      "Anlik analiz raporu",
      "Temel rakip karsilastirmasi",
    ],
    btnText: "Ucretsiz Analiz Et",
    btnStyle: "ghost" as const,
  },
  {
    name: "Pro Firma",
    price: "₺2.495",
    period: "/ay",
    desc: "Surekli takip + ajans onerileri",
    featured: true,
    features: [
      "50 arama kelimesi",
      "3 il dahil (+₺295/ek il)",
      "5 AI platformu",
      "Haftalik otomatik analiz",
      "Detayli rakip takibi",
      "PDF rapor indirme",
      "WhatsApp haftalik ozet",
    ],
    advantagesTitle: "Pro Avantajlari",
    advantages: [
      "Il bazli isi haritasi",
      "AI yanit ornekleri (AI sizi nasil anlatiyor)",
      "Keyword discovery (AI'nin onerdigi aramalar)",
      "Trend grafigi (haftalik gelisim)",
      "Iyilestirme onerileri (aksiyonlanabilir)",
    ],
    btnText: "Pro'ya Baslayin",
    btnStyle: "white" as const,
  },
  {
    name: "Business",
    price: "₺7.495",
    period: "/ay",
    desc: "Genis takip + ajans destegi (RaaS)",
    featured: false,
    features: [
      "150 arama kelimesi",
      "10 il dahil",
      "6 AI platformu + Grok",
      "Gunluk analiz",
      "Sinirsiz rakip takibi",
      "API erisimi",
      "Oncelikli destek",
    ],
    advantagesTitle: "Business Avantajlari",
    advantages: [
      "GEO Ajans hizmeti (RaaS) — biz optimize ederiz",
      "Aylik strateji toplantisi",
      "Icerik + schema + entity calismasi",
      "White-label raporlama",
      "Ozel musteri temsilcisi",
    ],
    btnText: "Iletisime Gecin",
    btnStyle: "black" as const,
  },
];

export function PricingSectionV3() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10" id="fiyat">
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Fiyatlandirma
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Net fiyat. Gizli maliyet yok.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden mt-12">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col p-7 sm:p-10 text-left ${
                plan.featured ? "bg-[#09090B] text-white" : "bg-white"
              }`}
            >
              <div className={`text-[13px] font-semibold mb-3 ${plan.featured ? "text-green-500" : ""}`}>
                {plan.name}
              </div>
              <div className={`text-[32px] font-extrabold mb-1 ${plan.featured ? "text-white" : ""}`} style={{ letterSpacing: "-0.03em" }}>
                {plan.price}
                {plan.period && <span className="text-[14px] font-normal text-zinc-400">{plan.period}</span>}
              </div>
              <div className="text-[12px] text-zinc-400 mb-6 leading-[1.5]">
                {plan.desc}
              </div>

              <ul className="list-none p-0 flex-1 mb-6">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className={`text-[13px] py-[5px] flex gap-2 leading-[1.4] ${
                      plan.featured ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    <span className={`text-[11px] shrink-0 mt-0.5 ${plan.featured ? "text-zinc-600" : "text-zinc-300"}`}>→</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className={`mt-auto pt-4 border-t mb-5 ${plan.featured ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-400 mb-2">
                  {plan.advantagesTitle}
                </div>
                {plan.advantages.map((adv) => (
                  <div
                    key={adv}
                    className={`text-[12px] py-[3px] leading-[1.4] ${
                      plan.featured ? "text-zinc-500" : "text-zinc-500"
                    }`}
                  >
                    {adv}
                  </div>
                ))}
              </div>

              <button
                className={`w-full text-center py-[13px] rounded-[10px] text-[14px] font-semibold cursor-pointer border-none ${
                  plan.btnStyle === "white"
                    ? "bg-white text-[#09090B]"
                    : plan.btnStyle === "black"
                    ? "bg-[#09090B] text-white"
                    : "bg-zinc-50 text-[#09090B] border border-zinc-200"
                }`}
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
