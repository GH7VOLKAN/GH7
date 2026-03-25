"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PLATFORMS = [
  { name: "ChatGPT", abbr: "GP", color: "#10A37F", type: "Sohbet tabanli AI" },
  { name: "Gemini", abbr: "Ge", color: "#8B5CF6", type: "Google AI asistani" },
  { name: "AI Overview", abbr: "AO", color: "#4285F4", type: "Google arama AI ozeti" },
  { name: "Perplexity", abbr: "Px", color: "#22D3EE", type: "AI arama motoru" },
  { name: "Claude", abbr: "Cl", color: "#D97706", type: "Anthropic AI" },
  { name: "Copilot", abbr: "Co", color: "#00BCF2", type: "Microsoft AI" },
];

export function PlatformsSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-zinc-50 py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          6 Platform · 81 Il
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Tek dashboard,
          <br />
          tum AI&apos;lar
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Musterilerinizin kullandigi her yapay zeka platformunu tek bir ekrandan takip edin. Her platformun farkli siralama mantigi var — GH7 hepsini ayri analiz eder.
        </p>

        <div className="flex gap-3 flex-wrap mt-12">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 border border-zinc-200 rounded-xl px-5 py-4 flex-1 min-w-[160px]"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.abbr}
              </div>
              <div>
                <div className="text-[14px] font-semibold">{p.name}</div>
                <div className="text-[11px] text-zinc-400">{p.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
