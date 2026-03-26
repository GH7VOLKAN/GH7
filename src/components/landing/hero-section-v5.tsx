"use client";

import Link from "next/link";
import { useFadeIn } from "@/hooks/use-fade-in";

export function HeroSectionV5() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section pt-[160px] pb-[80px] px-5 sm:px-10"
    >
      <div className="max-w-[860px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="text-[13px] text-[#9CA3AF] font-medium tracking-[0.06em] mb-5">
          Generative Engine Optimization
        </div>

        {/* Headline */}
        <h1
          className="font-extrabold leading-[0.95] mb-6"
          style={{
            fontSize: "clamp(52px, 7.5vw, 88px)",
            letterSpacing: "-0.05em",
          }}
        >
          Yapay zeka
          <br />
          sizi öneriyor{" "}
          <span className="text-[#D1D5DB]">mu?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] sm:text-[17px] text-[#6B7280] leading-[1.65] max-w-[560px] mx-auto mb-9">
          ChatGPT, Gemini, Perplexity ve Google AI Overview — müşterileriniz
          artık bu platformlara soruyor. Sizi buluyorlar mı, yoksa rakibinizi mi?
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Link
            href="/analiz"
            className="bg-[#09090B] text-white px-7 py-3.5 rounded-[10px] text-[14px] font-semibold no-underline hover:bg-[#18181B] transition-colors"
          >
            Ücretsiz Analiz &rarr;
          </Link>
          <a
            href="#geo"
            className="border border-[#E5E7EB] text-[#09090B] px-7 py-3.5 rounded-[10px] text-[14px] font-semibold no-underline hover:border-[#D1D5DB] transition-colors"
          >
            GEO Nedir?
          </a>
        </div>

        {/* Trust note */}
        <p className="text-[12px] text-[#9CA3AF]">
          Kredi kartı gerekmez &middot; 60 saniye
        </p>
      </div>
    </section>
  );
}
