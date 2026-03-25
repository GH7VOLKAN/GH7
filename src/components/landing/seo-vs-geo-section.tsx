"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

export function SeoVsGeoSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10" id="geo">
      <div className="max-w-[680px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          SEO vs GEO
        </div>
        <blockquote className="border-l-4 border-[#09090B] pl-6">
          <p
            className="font-extrabold leading-[1.25]"
            style={{ fontSize: "clamp(20px, 3vw, 26px)", letterSpacing: "-0.02em" }}
          >
            SEO sizi Google&apos;da sıralar.
            <br />
            GEO ise yapay zekanın sizi güvenilir kaynak olarak önermesini sağlar.
          </p>
        </blockquote>
        <p className="text-[13px] text-zinc-400 mt-6">
          — Princeton / ACM KDD, 2024
        </p>
      </div>
    </section>
  );
}
