"use client";

import { AIPlatformIcon, PLATFORM_INFO } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

interface Ranking {
  name: string;
  position: number;
  platformCount: number;
}

interface Platform {
  platform: string;
  mentioned: boolean;
}

interface BlogHeroProps {
  query: string;
  rankings: Ranking[];
  platforms: Platform[];
  runCount: number;
  runDate: string;
  sectorTag?: string | null;
  queryLanguage?: string;
}

const PLATFORM_KEY_MAP: Record<string, AIPlatform> = {
  chatgpt: "chatgpt",
  claude: "claude",
  gemini: "gemini",
  perplexity: "perplexity",
  google_aio: "google_aio",
  copilot: "copilot",
};

export function BlogHero({
  query,
  rankings,
  platforms,
  runCount,
  runDate,
  sectorTag,
  queryLanguage = "tr",
}: BlogHeroProps) {
  const activePlatforms = platforms.filter((p) => p.mentioned);
  const dateStr = new Date(runDate).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
  const headerLabel = queryLanguage === "tr" ? "Yapay zekaya sorduk" : "We asked AI";

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#212121] p-8 md:p-12"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#212121] text-xs font-extrabold">
            G7
          </div>
          <span className="text-white text-lg font-bold">GH7.ai</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {activePlatforms.slice(0, 5).map((p) => {
            const key = PLATFORM_KEY_MAP[p.platform];
            return (
              <span
                key={p.platform}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-white/70 text-xs font-semibold"
              >
                {key && <AIPlatformIcon platform={key} size={14} colored />}
                {key ? PLATFORM_INFO[key].name : p.platform}
              </span>
            );
          })}
          {queryLanguage !== "tr" && (
            <span className="px-3 py-1 rounded-md bg-white/15 text-white text-xs font-bold">
              {queryLanguage.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Header label */}
      <div className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">
        {headerLabel}
      </div>

      {/* Query title */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-8 max-w-xl">
        &ldquo;{query}&rdquo;
      </h1>

      {/* Rankings */}
      {rankings.length > 0 && (
        <div className="flex flex-wrap gap-6 md:gap-10 mb-6">
          {rankings.slice(0, 3).map((r, i) => (
            <div key={r.name} className="flex flex-col">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  i === 0
                    ? "text-green-500"
                    : i === 1
                      ? "text-white/70"
                      : "text-white/40"
                }`}
              >
                {i + 1}. sira
              </span>
              <span
                className={`text-lg md:text-2xl font-extrabold ${
                  i === 0
                    ? "text-green-500"
                    : i === 1
                      ? "text-white"
                      : "text-white/40"
                }`}
              >
                {r.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="text-white/25 text-xs font-medium">
        {activePlatforms.length} platform · {runCount} tekrar · {dateStr} verisi
        {sectorTag && ` · ${sectorTag}`}
      </div>
    </div>
  );
}
