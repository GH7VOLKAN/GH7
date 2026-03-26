"use client";

import { useFadeIn } from "@/hooks/use-fade-in";
import Link from "next/link";

const CITY_PINS = [
  { name: "İstanbul", left: "28%", top: "25%", score: 82, color: "#22C55E" },
  { name: "Balıkesir", left: "20%", top: "40%", score: 91, color: "#22C55E" },
  { name: "İzmir", left: "12%", top: "52%", score: 65, color: "#EAB308" },
  { name: "Bursa", left: "32%", top: "34%", score: 58, color: "#EAB308" },
  { name: "Ankara", left: "48%", top: "36%", score: 71, color: "#22C55E" },
  { name: "Konya", left: "40%", top: "62%", score: 38, color: "#EF4444" },
  { name: "Antalya", left: "25%", top: "74%", score: 45, color: "#EF4444" },
  { name: "Trabzon", left: "72%", top: "22%", score: 22, color: "#EF4444" },
  { name: "Erzurum", left: "82%", top: "44%", score: 15, color: "#D4D4D8" },
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
    <section
      ref={ref}
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
          81 İl Takibi
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          Her il ayrı bir pazar.
          <br />
          Her ilde ayrı rakip.
        </h2>
        <p className="text-[15px] text-[#6B7280] leading-[1.7] max-w-[500px] mb-10">
          İstanbul&apos;da 1 numara olup Ankara&apos;da görünmüyor olabilirsiniz.
          GH7 farkı il il gösterir.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 items-start">
          {/* Map area */}
          <div className="border border-[#E5E7EB] rounded-[14px] bg-[#F9FAFB] p-7 relative min-h-[300px]">
            {CITY_PINS.map((city) => (
              <div
                key={city.name}
                className="absolute flex flex-col items-center gap-px -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-[1.15] hover:z-10"
                style={{ left: city.left, top: city.top }}
              >
                <div
                  className="w-3 h-3 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: city.color,
                    boxShadow: "0 1px 3px rgba(0,0,0,.12)",
                  }}
                />
                <div className="text-[7px] font-bold text-[#6B7280] whitespace-nowrap bg-white/90 px-[3px] rounded-sm">
                  {city.name}
                </div>
                <div
                  className="text-[8px] font-extrabold"
                  style={{ color: city.color }}
                >
                  {city.score}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-2.5">
            {SIDEBAR_STATS.map((stat) => (
              <div
                key={stat.label}
                className="border border-[#E5E7EB] rounded-[10px] p-4"
              >
                <div
                  className="text-[24px] font-extrabold"
                  style={{ letterSpacing: "-0.02em", color: stat.color }}
                >
                  {stat.num}
                </div>
                <div className="text-[11px] text-[#6B7280]">{stat.label}</div>
              </div>
            ))}
            <Link
              href="/analiz"
              className="mt-2 bg-[#09090B] text-white border-none py-3.5 rounded-[9px] text-[13px] font-semibold cursor-pointer w-full text-center no-underline block"
            >
              Kendi illerinizi analiz edin &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
