"use client";

import { useFadeIn } from "@/hooks/use-fade-in";
import {
  AIPlatformIcon,
  getPlatformLabel,
  type AIPlatform,
} from "@/components/ui/ai-platform-badge";

const PLATFORMS: { key: AIPlatform; type: string }[] = [
  { key: "chatgpt", type: "Sohbet tabanlı AI" },
  { key: "gemini", type: "Google AI asistanı" },
  { key: "google_aio", type: "Google arama AI özeti" },
  { key: "perplexity", type: "AI arama motoru" },
  { key: "claude", type: "Anthropic AI" },
  { key: "copilot", type: "Microsoft AI" },
];

export function PlatformsSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-zinc-50 py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          6 Platform · 81 İl
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Tek dashboard,
          <br />
          tüm AI&apos;lar
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Müşterilerinizin kullandığı her yapay zeka platformunu tek bir ekrandan takip edin. Her platformun farklı sıralama mantığı var — GH7 hepsini ayrı analiz eder.
        </p>

        <div className="flex gap-3 flex-wrap mt-12">
          {PLATFORMS.map((p) => (
            <div
              key={p.key}
              className="flex items-center gap-2.5 border border-zinc-200 rounded-xl px-5 py-4 flex-1 min-w-[160px]"
            >
              <AIPlatformIcon platform={p.key} size="lg" />
              <div>
                <div className="text-[14px] font-semibold">{getPlatformLabel(p.key)}</div>
                <div className="text-[11px] text-zinc-400">{p.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
