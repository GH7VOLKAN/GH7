"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlatformKey } from "@/lib/types";

interface PlatformStat {
  platform: PlatformKey;
  mentioned: number;
  total: number;
}

interface PlatformBreakdownCardProps {
  platforms: PlatformStat[];
}

const PLATFORM_CONFIG: Record<
  PlatformKey,
  { name: string; color: string; bgColor: string; darkBgColor: string }
> = {
  chatgpt: {
    name: "ChatGPT",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100",
    darkBgColor: "dark:bg-emerald-900/40",
  },
  claude: {
    name: "Claude",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/40",
  },
  gemini: {
    name: "Gemini",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100",
    darkBgColor: "dark:bg-blue-900/40",
  },
  perplexity: {
    name: "Perplexity",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-900/40",
  },
};

export function PlatformBreakdownCard({ platforms }: PlatformBreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yapay Zekalar Sizi Ne Kadar Taniyor?</CardTitle>
        <CardDescription>
          Her yapay zekanin sizi ne siklikta onerdigi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((p) => {
            const config = PLATFORM_CONFIG[p.platform];
            const pct = p.total > 0 ? Math.round((p.mentioned / p.total) * 100) : 0;

            return (
              <div
                key={p.platform}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors ${config.bgColor} ${config.darkBgColor}`}
              >
                {/* Platform name */}
                <span className={`text-xs font-bold ${config.color}`}>
                  {config.name}
                </span>

                {/* Score ring */}
                <div className="relative flex size-16 items-center justify-center">
                  <svg className="size-16" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-black/5 dark:text-white/10"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
                      transform="rotate(-90 32 32)"
                      className={config.color}
                    />
                  </svg>
                  <span className="absolute text-lg font-bold tabular-nums">
                    {pct}
                  </span>
                </div>

                {/* Mention rate text */}
                <p className="text-center text-[10px] leading-tight text-muted-foreground">
                  {p.total > 0 ? (
                    <>
                      {p.total} sorunun{" "}
                      <strong className="text-foreground">{p.mentioned}</strong>
                      &apos;{p.mentioned > 1 ? "i" : ""}nde oneriyor
                    </>
                  ) : (
                    "Henuz taranmadi"
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
