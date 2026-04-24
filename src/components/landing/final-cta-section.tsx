"use client";

import { useFadeIn } from "@/hooks/use-fade-in";
import Link from "next/link";
import { GATES, GATE_CONFIG } from "@/lib/gates/config";

export function FinalCtaSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#09090B] text-white py-[80px] sm:py-[120px] px-5 sm:px-10 text-center"
    >
      <h2
        className="font-extrabold text-white leading-[1.1] max-w-[560px] mx-auto mb-8"
        style={{
          fontSize: "clamp(28px, 4.2vw, 46px)",
          letterSpacing: "-0.035em",
        }}
      >
        Yapay zekanın sizi
        <br />
        tanımasını sağlayın
      </h2>

      <div className="flex gap-2 max-w-[520px] mx-auto flex-wrap justify-center mb-6">
        {GATES.map((code) => {
          const info = GATE_CONFIG[code];
          const isActive = info.status === "active";

          if (isActive) {
            return (
              <Link
                key={code}
                href={`/analiz?type=${code}`}
                className="relative flex-1 min-w-[110px] py-3.5 bg-white text-[#09090B] rounded-[10px] text-[13px] font-semibold no-underline text-center"
              >
                {info.label}
              </Link>
            );
          }
          return (
            <span
              key={code}
              aria-disabled
              title={`${info.label} — ${info.launchDate ?? "yakında"}`}
              className="relative flex-1 min-w-[110px] py-3.5 bg-white/[0.04] text-white/60 border border-zinc-800 rounded-[10px] text-[13px] font-semibold text-center cursor-not-allowed"
            >
              <span>{info.label}</span>
              <span className="absolute -top-2 right-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300">
                Yakında
              </span>
            </span>
          );
        })}
      </div>

      <p className="text-[11px] text-zinc-600">
        Bir ISITMAX projesidir &middot; 1M+ aylık ziyaretçi
      </p>
    </section>
  );
}
