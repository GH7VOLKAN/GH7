"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const METRICS = [
  { value: "74", label: "GEO Skoru (0-100)", change: "↑ 3 bu hafta" },
  { value: "%26", label: "AI Ses Payı — sektörde en yüksek", change: "↑ %2" },
  { value: "1.4", label: "Ortalama AI sırası (1 = en iyi)", change: "↑ 0.1" },
  { value: "%100", label: "Kapsam — tüm aramalarda görünüyor", change: "→ stabil" },
  { value: "5/5", label: "Platform — her AI\u2019da referans kaynağı", change: "✓", noBorder: true },
];

export function IsitmaxProofSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#FAFAFA] border-t border-b border-zinc-100 py-[72px] sm:py-[100px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Gerçek Veri · Canlı Sonuçlar
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Önce kendimiz için yaptık
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
          ISITMAX.com — 1M+ aylık ziyaretçiye sahip ısıtma sektörü lideri. GH7 ile AI görünürlüğünü takip edip optimize eden ilk firma.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10 items-start">
          {/* Left — metrics + quote */}
          <div className="flex flex-col gap-5">
            {METRICS.map((m) => (
              <div
                key={m.value}
                className={`flex items-baseline gap-3 py-4 ${m.noBorder ? "" : "border-b border-zinc-100"}`}
              >
                <div className="text-[32px] font-extrabold" style={{ letterSpacing: "-0.02em" }}>
                  {m.value}
                </div>
                <div className="text-[13px] text-zinc-500">{m.label}</div>
                <div className="text-[11px] text-[#22C55E] font-semibold ml-auto">{m.change}</div>
              </div>
            ))}

            <div className="border-l-[3px] border-zinc-200 pl-5 mt-3">
              <p className="text-[16px] font-medium leading-[1.5] text-zinc-600 italic">
                &ldquo;3 ayda ChatGPT&apos;de sektörümüzün 1 numaralı önerisi olduk. Rakiplerimizi ürün bazlı takip ediyoruz — hangi üründe kim önde, anında görüyoruz.&rdquo;
              </p>
              <div className="text-[12px] text-zinc-400 mt-2">
                ISITMAX A.Ş. · isitmax.com · 1M+ aylık ziyaretçi
              </div>
            </div>
          </div>

          {/* Right — visual placeholder */}
          <div className="border border-zinc-200 rounded-[14px] bg-[#FAFAFA] flex items-center justify-center text-zinc-300 text-[12px] font-medium min-h-[480px]">
            ISITMAX Dashboard Ekran Görüntüsü
          </div>
        </div>
      </div>
    </section>
  );
}
