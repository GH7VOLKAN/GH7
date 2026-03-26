"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PLATFORMS = [
  { letter: "G", name: "ChatGPT", type: "Sohbet tabanlı AI" },
  { letter: "G", name: "Gemini", type: "Google AI asistanı" },
  { letter: "A", name: "AI Overview", type: "Google arama AI özeti" },
  { letter: "P", name: "Perplexity", type: "AI arama motoru" },
  { letter: "C", name: "Claude", type: "Anthropic AI" },
  { letter: "C", name: "Copilot", type: "Microsoft AI" },
];

export function PlatformsSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[100px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          6 AI Platformu · Tek Dashboard
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Her platformun sıralama mantığı farklı
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
          Aynı soruyu ChatGPT ve Gemini&apos;ye sorduğunuzda farklı firmalar önerilir. GH7 hepsini ayrı analiz eder, farkı gösterir.
        </p>

        <div className="flex gap-2.5 flex-wrap mt-10">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 border border-zinc-200 rounded-[11px] px-4 py-3.5 flex-1 min-w-[150px]"
            >
              <div className="w-7 h-7 rounded-[7px] border-[1.5px] border-zinc-200 flex items-center justify-center text-[11px] font-extrabold text-zinc-500">
                {p.letter}
              </div>
              <div>
                <div className="text-[13px] font-semibold">{p.name}</div>
                <div className="text-[10px] text-zinc-400">{p.type}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual placeholder */}
        <div className="border border-zinc-200 rounded-[14px] bg-[#FAFAFA] flex items-center justify-center text-zinc-300 text-[12px] font-medium min-h-[240px] mt-8">
          Platform Bazlı Karşılaştırma Görseli
        </div>
      </div>
    </section>
  );
}
