import type { PlatformKey } from "@/lib/types";
import { platformLabels } from "@/lib/types";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

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
            className={`inline-flex ${isActive ? "" : "opacity-25 grayscale"}`}
            title={platformLabels[platform]?.name ?? platform}
          >
            <AIPlatformIcon
              platform={platform as AIPlatform}
              size={14}
              colored={isActive}
            />
          </span>
        );
      })}
    </div>
  );
}
