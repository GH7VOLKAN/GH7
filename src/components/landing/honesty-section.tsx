"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const ITEMS = [
  "Bunu 50 farklı soruyla,",
  "5 farklı platformda,",
  "3 farklı ilde,",
  "her hafta tekrarlayıp,",
  "sonuçları karşılaştırıp,",
  "değişimi takip edip,",
  "rakiplerinizi izleyip,",
  "neyin işe yaradığını anlayıp,",
  "buna göre aksiyon almak...",
];

export function HonestySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      id="analiz"
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[640px] mx-auto">
        {/* Opening */}
        <h2
          className="font-extrabold leading-[1.1] mb-5"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          Bunu kendiniz de yapabilirsiniz.
        </h2>
        <p className="text-[15px] text-[#6B7280] leading-[1.7] mb-10">
          ChatGPT&apos;yi açın. &ldquo;Sektörümde en iyi firma hangisi?&rdquo;
          yazın. Cevabı görün.
        </p>

        {/* AMA */}
        <div
          className="font-extrabold text-[#09090B] mb-8"
          style={{
            fontSize: "clamp(36px, 5vw, 60px)",
            letterSpacing: "-0.04em",
          }}
        >
          Ama...
        </div>

        {/* List items */}
        <div className="flex flex-col mb-10">
          {ITEMS.map((item) => (
            <div
              key={item}
              className="text-[15px] text-[#6B7280] py-3.5 border-b border-[#F3F4F6] leading-[1.5]"
            >
              &mdash; {item}
            </div>
          ))}
        </div>

        {/* Conclusion */}
        <div
          className="font-extrabold text-[#09090B] mb-10"
          style={{
            fontSize: "clamp(28px, 4vw, 48px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Bunu kimse sürdüremez.
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E5E7EB] mb-10" />

        {/* GH7 answer */}
        <div
          className="font-extrabold text-[#09090B] mb-3"
          style={{
            fontSize: "clamp(24px, 3.5vw, 40px)",
            letterSpacing: "-0.035em",
            lineHeight: 1.15,
          }}
        >
          GH7 bunu sizin yerinize yapar.
        </div>
        <p className="text-[15px] text-[#6B7280] leading-[1.7] mb-8">
          Her hafta. Her platformda. Her ilde.
          <br />
          Siz sadece sonuçları görürsünüz.
        </p>

        <a
          href="#pricing"
          className="inline-block text-[14px] font-semibold text-[#09090B] underline underline-offset-4 decoration-[#D1D5DB] hover:decoration-[#09090B] transition-colors"
        >
          Fiyatları gör &rarr;
        </a>
      </div>
    </section>
  );
}
