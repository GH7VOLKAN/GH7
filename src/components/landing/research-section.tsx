"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const STATS = [
  {
    source: "Gartner, 2025",
    value: "%25",
    description:
      "Geleneksel arama trafiği 2026\u2019ya kadar düşecek. Kullanıcılar AI yanıtlarını tercih ediyor.",
  },
  {
    source: "Princeton / ACM KDD, 2024",
    value: "%40",
    description:
      "GEO optimize edilen içerikler AI yanıtlarında %40\u2019a kadar daha fazla görünürlük kazanıyor.",
  },
  {
    source: "Bain & Company, 2025",
    value: "%60",
    description:
      "Google aramalarının %60\u2019ı hiçbir siteye tıklanmadan sonuçlanıyor. AI özetleri trafiği yönlendiriyor.",
  },
];

export function ResearchSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#FAFAFA] border-t border-b border-zinc-100 py-[72px] sm:py-[100px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Araştırma Verileri
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Bu bir trend değil,
          <br />
          yapısal bir dönüşüm
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
          Princeton, Stanford ve Gartner araştırmalarının ortak sonucu: arama dönüşüyor, hazır olmayanlar görünmez kalacak.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 rounded-[14px] overflow-hidden mt-10">
          {STATS.map((stat) => (
            <div key={stat.value} className="bg-white p-8 sm:p-8">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-2.5">
                {stat.source}
              </div>
              <div className="text-[32px] font-extrabold mb-1.5" style={{ letterSpacing: "-0.03em" }}>
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
