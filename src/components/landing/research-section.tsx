"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const STATS = [
  {
    source: "Gartner, 2025",
    value: "%25",
    description:
      "Geleneksel arama motoru trafigi 2026'ya kadar dusecek. Kullanicilar AI yanitlarini tercih ediyor.",
  },
  {
    source: "Princeton / ACM KDD, 2024",
    value: "%40",
    description:
      "GEO optimizasyonu yapilan icerikler, AI yanitlarinda %40'a kadar daha fazla gorunurluk kazaniyor.",
  },
  {
    source: "Bain & Company, 2025",
    value: "%60",
    description:
      "Google aramalarinin %60'i artik hicbir siteye tiklanmadan sonuclaniyor. AI ozetleri trafik caliyor.",
  },
];

export function ResearchSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-[#09090B] text-white py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-4">
          Arastirma Verileri
        </div>
        <h2
          className="font-extrabold text-white leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Bu bir trend degil,
          <br />
          yapisal bir donusum
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Princeton, Stanford ve Gartner arastirmalarinin ortak sonucu: arama motorlari donusuyor, hazir olmayanlar gorunmez kalacak.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 rounded-2xl overflow-hidden mt-12">
          {STATS.map((stat) => (
            <div key={stat.value} className="bg-zinc-900 p-8 sm:p-10">
              <div className="text-[10px] text-zinc-600 uppercase tracking-[0.1em] font-semibold mb-3">
                {stat.source}
              </div>
              <div className="text-[36px] font-extrabold tracking-tight mb-2" style={{ letterSpacing: "-0.03em" }}>
                {stat.value}
              </div>
              <div className="text-[13px] text-zinc-500 leading-[1.5]">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
