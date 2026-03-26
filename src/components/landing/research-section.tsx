"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const STATS = [
  {
    source: "Gartner",
    value: "%25",
    description:
      "Geleneksel arama trafiği 2026\u2019ya kadar düşecek. Kullanıcılar AI yanıtlarını tercih ediyor.",
  },
  {
    source: "Princeton",
    value: "%40",
    description:
      "GEO optimize edilen içerikler AI yanıtlarında %40\u2019a kadar daha fazla görünürlük kazanıyor.",
  },
  {
    source: "Bain",
    value: "%60",
    description:
      "Google aramalarının %60\u2019ı hiçbir siteye tıklanmadan sonuçlanıyor.",
  },
];

export function ResearchSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#F9FAFB] border-t border-b border-[#E5E7EB] py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
          Araştırma
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-10"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          Bu bir trend değil,
          <br />
          yapısal bir dönüşüm
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E7EB] rounded-[14px] overflow-hidden">
          {STATS.map((stat) => (
            <div key={stat.source} className="bg-white p-8 sm:p-10">
              <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] mb-3">
                {stat.source}
              </div>
              <div
                className="font-extrabold mb-2"
                style={{
                  fontSize: "clamp(48px, 6vw, 64px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div className="text-[13px] text-[#6B7280] leading-[1.6]">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
