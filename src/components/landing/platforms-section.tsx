"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PLATFORMS = [
  { name: "ChatGPT", type: "Sohbet AI" },
  { name: "Gemini", type: "Google AI" },
  { name: "AI Overview", type: "Google Arama" },
  { name: "Perplexity", type: "AI Arama" },
  { name: "Claude", type: "Anthropic AI" },
  { name: "Copilot", type: "Microsoft AI" },
];

export function PlatformsSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section border-t border-b border-[#E5E7EB] py-10 px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-5 text-center">
          6 AI Platformunda Anlık İzleme
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-[#E5E7EB] rounded-[10px] overflow-hidden">
          {PLATFORMS.map((p, i) => (
            <div
              key={p.name}
              className="px-4 py-4 text-center"
              style={{
                borderRight:
                  i === PLATFORMS.length - 1
                    ? "none"
                    : "1px solid #E5E7EB",
              }}
            >
              <div className="text-[13px] font-bold text-[#09090B]">
                {p.name}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                {p.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
