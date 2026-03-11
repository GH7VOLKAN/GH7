"use client";

import { PlatformKey, platformLabels, PlatformData } from "@/lib/mock-data";
import { getScoreColor, getScoreBg, formatTrend } from "@/lib/utils";

interface PlatformCardProps {
  platform: PlatformKey;
  data: PlatformData;
}

export function PlatformCard({ platform, data }: PlatformCardProps) {
  const label = platformLabels[platform];

  return (
    <div className="group rounded-[14px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium tracking-[-0.02em]">{label.name}</p>
          <p className="text-xs text-muted-foreground">{label.company}</p>
        </div>
        <span className={`text-3xl font-black tracking-[-0.05em] ${getScoreColor(data.score)}`}>
          {data.score}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(data.score)}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {data.mentioned ? "Bahsediliyor" : "Bahsedilmiyor"} · {data.sentiment}
        </span>
        <span className={data.trend > 0 ? "text-score-high" : data.trend < 0 ? "text-score-low" : ""}>
          Son 4 hafta: {data.trend > 0 ? "\u2191" : data.trend < 0 ? "\u2193" : ""} {formatTrend(data.trend)}
        </span>
      </div>
    </div>
  );
}
