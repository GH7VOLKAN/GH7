import type { PlatformKey } from "@/lib/types";
import { platformLabels } from "@/lib/types";

const ALL_PLATFORMS: PlatformKey[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
];

interface PlatformDotsProps {
  activePlatforms: PlatformKey[];
}

export function PlatformDots({ activePlatforms }: PlatformDotsProps) {
  return (
    <div className="flex items-center gap-1.5" title={activePlatforms.map((p) => platformLabels[p]?.name ?? p).join(", ")}>
      {ALL_PLATFORMS.map((platform) => {
        const isActive = activePlatforms.includes(platform);
        return (
          <span
            key={platform}
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              isActive ? "bg-foreground" : "bg-border"
            }`}
            title={platformLabels[platform]?.name ?? platform}
          />
        );
      })}
    </div>
  );
}
