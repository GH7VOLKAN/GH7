"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const CITY_PINS = [
  { name: "İstanbul", left: "28%", top: "25%", score: 82, color: "#22C55E" },
  { name: "Balıkesir", left: "20%", top: "38%", score: 91, color: "#22C55E" },
  { name: "İzmir", left: "12%", top: "50%", score: 65, color: "#EAB308" },
  { name: "Bursa", left: "32%", top: "33%", score: 58, color: "#EAB308" },
  { name: "Ankara", left: "48%", top: "35%", score: 71, color: "#22C55E" },
  { name: "Konya", left: "40%", top: "60%", score: 38, color: "#EF4444" },
  { name: "Antalya", left: "25%", top: "72%", score: 45, color: "#EF4444" },
  { name: "Trabzon", left: "72%", top: "22%", score: 22, color: "#EF4444" },
  { name: "Erzurum", left: "82%", top: "42%", score: 15, color: "#D4D4D8" },
  { name: "Diyarbakır", left: "68%", top: "52%", score: 12, color: "#D4D4D8" },
];

const SIDEBAR_STATS = [
  { num: "3", label: "Güçlü il (70+)", color: "#22C55E" },
  { num: "2", label: "Orta (40-69)", color: "#EAB308" },
  { num: "3", label: "Zayıf (1-39)", color: "#EF4444" },
  { num: "73", label: "Takip dışı", color: "#D4D4D8" },
];

export function TurkeyMapSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-zinc-50 py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Yerel Görünürlük
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Her il ayrı bir pazar.
          <br />
          Her ilde ayrı rakip.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          İstanbul&apos;da 1 numara olup Ankara&apos;da hiç görünmeyebilirsiniz. Bir müşteri &quot;Ankara&apos;da en iyi ısıtma firması&quot; diye sorduğunda AI kimi öneriyor? GH7 bunu il il gösterir.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 md:gap-12 mt-12 items-start">
          {/* Map */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 overflow-hidden">
            <div className="w-full aspect-[2/1] relative bg-zinc-100 rounded-xl overflow-hidden">
              {CITY_PINS.map((city) => (
                <div
                  key={city.name}
                  className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-[1.15] hover:z-10"
                  style={{ left: city.left, top: city.top }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: city.color, boxShadow: "0 1px 4px rgba(0,0,0,.15)" }}
                  />
                  <div className="text-[8px] font-bold text-zinc-600 whitespace-nowrap bg-white/90 px-1 rounded-sm">
                    {city.name}
                  </div>
                  <div className="text-[9px] font-extrabold" style={{ color: city.color }}>
                    {city.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col md:flex-col flex-row flex-wrap gap-3">
            {SIDEBAR_STATS.map((stat) => (
              <div
                key={stat.label}
                className="border border-zinc-200 rounded-xl p-5 flex justify-between items-center flex-1 min-w-[140px]"
              >
                <div>
                  <div
                    className="text-[28px] font-extrabold"
                    style={{ letterSpacing: "-0.02em", color: stat.color }}
                  >
                    {stat.num}
                  </div>
                  <div className="text-[12px] text-zinc-500 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
            <button className="mt-2 bg-[#09090B] text-white border-none py-3.5 rounded-[10px] text-[14px] font-semibold cursor-pointer w-full text-center">
              Kendi illerinizi analiz edin →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
