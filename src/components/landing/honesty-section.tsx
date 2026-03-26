"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

export function HonestySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#FAFAFA] border-t border-b border-zinc-100 py-[72px] sm:py-[100px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left — text */}
        <div className="max-w-[620px]">
          <h2
            className="font-extrabold leading-[1.1] mb-0"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.035em" }}
          >
            Bunu kendiniz de
            <br />
            yapabilirsiniz.
          </h2>
          <p className="text-[14px] text-zinc-500 leading-[1.7] mt-4 mb-6">
            ChatGPT&apos;yi açın, sorunuzu yazın. Bedava, iki dakika sürer. Ama...
          </p>

          <div className="flex flex-col gap-1 mb-7 pl-0.5">
            <span className="text-[15px] text-zinc-500">
              Bunu <strong className="text-[#09090B]">50 farklı soruyla</strong>,
            </span>
            <span className="text-[15px] text-zinc-500">
              <strong className="text-[#09090B]">5 farklı platformda</strong>,
            </span>
            <span className="text-[15px] text-zinc-500">
              <strong className="text-[#09090B]">3 farklı ilde</strong>,
            </span>
            <span className="text-[15px] text-zinc-500">
              <strong className="text-[#09090B]">her hafta</strong> tekrarlayıp,
            </span>
            <span className="text-[15px] text-zinc-500">
              sonuçları <strong className="text-[#09090B]">karşılaştırıp</strong>,
            </span>
            <span className="text-[15px] text-zinc-500">
              rakiplerinizi <strong className="text-[#09090B]">izleyip</strong>,
            </span>
            <span className="text-[15px] text-zinc-500">
              buna göre <strong className="text-[#09090B]">aksiyon almak...</strong>
            </span>
          </div>

          <div
            className="font-extrabold mb-6"
            style={{ fontSize: "clamp(22px, 3.2vw, 32px)", letterSpacing: "-0.02em" }}
          >
            Bunu kimse sürdüremez.
          </div>

          <div className="h-px bg-zinc-200 mb-6" />

          <div
            className="font-extrabold mb-2"
            style={{ fontSize: "clamp(22px, 3.2vw, 32px)", letterSpacing: "-0.02em" }}
          >
            GH7 bunu sizin yerinize yapar.
          </div>
          <p className="text-[13px] text-zinc-500">
            Her hafta. Her platformda. Her ilde. Her dilde.
          </p>
        </div>

        {/* Right — visual placeholder */}
        <div className="border border-zinc-200 rounded-[14px] bg-[#FAFAFA] flex items-center justify-center text-zinc-300 text-[12px] font-medium min-h-[380px]">
          Animasyonlu Platform Karşılaştırma Görseli
        </div>
      </div>
    </section>
  );
}
