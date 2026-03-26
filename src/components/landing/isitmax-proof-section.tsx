"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const STEPS = [
  {
    num: "01",
    title: "ChatGPT\u2019ye sorduk",
    desc: "İsıtmax çıktı ama 50 farklı soruda ne olduğunu bilmiyorduk.",
  },
  {
    num: "02",
    title: "Analiz yaptık",
    desc: "Bazı sorgularda rakipler öndeydi.",
  },
  {
    num: "03",
    title: "Optimizasyon yaptık",
    desc: "Schema ekledik, GEO skoru 71\u219274.",
  },
  {
    num: "04",
    title: "GH7\u2019yi kurduk",
    desc: "Bu süreci otomatize ettik.",
  },
];

const KEYWORDS = [
  { label: "en iyi kombi markası", pct: 92, color: "#09090B" },
  { label: "yerden ısıtma sistemleri", pct: 85, color: "#09090B" },
  { label: "doğalgaz kombi fiyatları", pct: 78, color: "#09090B" },
  { label: "ısıtma çözümleri karşılaştırma", pct: 64, color: "#09090B" },
  { label: "çatıda kar buz eritme", pct: 22, color: "#EF4444" },
];

export function IsitmaxProofSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
          Gerçek Veri &middot; Canlı Sonuçlar
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          Önce kendimiz için yaptık
        </h2>
        <p className="text-[15px] text-[#6B7280] leading-[1.7] max-w-[520px] mb-12">
          ISITMAX.com — 1M+ aylık ziyaretçiye sahip ısıtma sektörü lideri.
          GH7 ile AI görünürlüğünü takip edip optimize eden ilk firma.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: 4-step story */}
          <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`flex gap-5 py-6 ${
                  i < STEPS.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <div className="text-[13px] font-bold text-[#D1D5DB] shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[#09090B] mb-1">
                    {step.title}
                  </div>
                  <div className="text-[13px] text-[#6B7280] leading-[1.6]">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Metrics panel */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-7 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 bg-[#09090B] rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold">
                IS
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#09090B]">
                  ISITMAX
                </div>
                <div className="text-[11px] text-[#9CA3AF]">
                  isitmax.com &middot; Isıtma Sistemleri
                </div>
              </div>
            </div>

            {/* Big GEO Score */}
            <div className="mb-6">
              <div className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.1em] font-bold mb-1">
                GEO Skoru
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[56px] font-extrabold text-[#09090B]"
                  style={{ letterSpacing: "-0.04em", lineHeight: 1 }}
                >
                  74
                </span>
                <span className="text-[14px] font-semibold text-[#22C55E]">
                  &uarr;3
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-px bg-[#E5E7EB] rounded-lg overflow-hidden mb-6">
              <div className="bg-white p-4">
                <div className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.08em] font-bold mb-1">
                  Ses Payı
                </div>
                <div className="text-[22px] font-extrabold text-[#09090B]" style={{ letterSpacing: "-0.03em" }}>
                  %26
                </div>
                <div className="text-[11px] text-[#22C55E] font-semibold">
                  &uarr;%2
                </div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.08em] font-bold mb-1">
                  Kapsam
                </div>
                <div className="text-[22px] font-extrabold text-[#09090B]" style={{ letterSpacing: "-0.03em" }}>
                  %100
                </div>
                <div className="text-[11px] text-[#6B7280] font-semibold">
                  &rarr; sabit
                </div>
              </div>
              <div className="bg-white p-4">
                <div className="text-[10px] text-[#9CA3AF] uppercase tracking-[0.08em] font-bold mb-1">
                  Ort. Sıra
                </div>
                <div className="text-[22px] font-extrabold text-[#09090B]" style={{ letterSpacing: "-0.03em" }}>
                  1.4
                </div>
                <div className="text-[11px] text-[#22C55E] font-semibold">
                  &uarr;0.1
                </div>
              </div>
            </div>

            {/* Keyword Bars */}
            <div className="flex flex-col gap-3">
              {KEYWORDS.map((kw) => (
                <div key={kw.label}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[12px] text-[#6B7280]">
                      {kw.label}
                    </span>
                    <span className="text-[12px] font-bold text-[#09090B]">
                      %{kw.pct}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${kw.pct}%`,
                        backgroundColor: kw.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
