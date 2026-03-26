"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const GEO_PLATFORMS = [
  {
    name: "ChatGPT",
    desc: "OpenAI\u2019nın sohbet tabanlı AI\u2019sı. Kullanıcıların en çok soru sorduğu platform.",
  },
  {
    name: "Gemini",
    desc: "Google\u2019un AI asistanı. Android ve Google ekosistemiyle entegre.",
  },
  {
    name: "AI Overview",
    desc: "Google arama sonuçlarındaki AI özeti. Sıfır tıkla sonuçların kaynağı.",
  },
  {
    name: "Perplexity",
    desc: "Kaynak gösteren AI arama motoru. Akademik ve profesyonel kullanım.",
  },
  {
    name: "Claude",
    desc: "Anthropic\u2019in AI\u2019sı. Uzun içerik analizi ve güvenilirlikte öne çıkan platform.",
  },
  {
    name: "Copilot",
    desc: "Microsoft\u2019un AI asistanı. Bing, Edge ve Office entegrasyonu.",
  },
];

export function GeoSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      id="geo"
      className="fi-section bg-[#F9FAFB] border-t border-b border-[#E5E7EB] py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className="font-extrabold leading-[1.1] mb-3.5"
            style={{
              fontSize: "clamp(28px, 4.2vw, 46px)",
              letterSpacing: "-0.035em",
            }}
          >
            GEO Nedir?
          </h2>
          <p className="text-[15px] text-[#6B7280] leading-[1.7] max-w-[500px] mx-auto">
            SEO sizi Google&apos;da sıralar. GEO sizi AI&apos;da önerir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#E5E7EB] rounded-[14px] overflow-hidden">
          {GEO_PLATFORMS.map((p) => (
            <div key={p.name} className="bg-white p-7">
              <div className="text-[15px] font-bold text-[#09090B] mb-1.5">
                {p.name}
              </div>
              <div className="text-[13px] text-[#6B7280] leading-[1.6]">
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
