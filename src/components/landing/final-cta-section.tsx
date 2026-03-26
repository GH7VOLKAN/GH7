"use client";

import { useFadeIn } from "@/hooks/use-fade-in";
import Link from "next/link";

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
        <Link
          href="/analiz?type=firma"
          className="flex-1 min-w-[110px] py-3.5 bg-white text-[#09090B] rounded-[10px] text-[13px] font-semibold no-underline text-center"
        >
          Firma
        </Link>
        <Link
          href="/analiz?type=kisi"
          className="flex-1 min-w-[110px] py-3.5 bg-white/[0.08] text-white border border-zinc-700 rounded-[10px] text-[13px] font-semibold no-underline text-center"
        >
          Kişi
        </Link>
        <Link
          href="/analiz?type=eticaret"
          className="flex-1 min-w-[110px] py-3.5 bg-white/[0.08] text-white border border-zinc-700 rounded-[10px] text-[13px] font-semibold no-underline text-center"
        >
          E-Ticaret
        </Link>
        <Link
          href="/analiz?type=export"
          className="flex-1 min-w-[110px] py-3.5 bg-white/[0.08] text-white border border-zinc-700 rounded-[10px] text-[13px] font-semibold no-underline text-center"
        >
          Export
        </Link>
      </div>

      <p className="text-[11px] text-zinc-600">
        Bir ISITMAX projesidir &middot; 1M+ aylık ziyaretçi
      </p>
    </section>
  );
}
