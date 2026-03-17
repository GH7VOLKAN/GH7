"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformIcon, PLATFORM_COLORS } from "@/components/platform-icon";
import { platformLabels, type PlatformKey } from "@/lib/types";

interface PlatformStat {
  platform: PlatformKey;
  mentioned: number;
  total: number;
}

interface WeeklyRate {
  totalScans: number;
  mentionedInScans: number;
  perPlatform: Record<PlatformKey, { mentioned: number; total: number }>;
}

interface PlatformBreakdownCardProps {
  platforms: PlatformStat[];
  weeklyRate?: WeeklyRate;
}

export function PlatformBreakdownCard({ platforms, weeklyRate }: PlatformBreakdownCardProps) {
  const hasWeeklyData = weeklyRate && weeklyRate.totalScans > 1;

  // SVG donut config
  const size = 80;
  const center = size / 2;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card className="border border-border/50 shadow-sm rounded-2xl transition-shadow hover:shadow-md">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-bold tracking-tight text-foreground">
          Platform Bazlı Görünürlük
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {hasWeeklyData
            ? `Bu hafta ${weeklyRate.totalScans} taramada ${weeklyRate.mentionedInScans} kez önerildiniz`
            : "Her yapay zekanın sizi ne sıklıkta önerdiği"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {platforms.map((p) => {
            const colors = PLATFORM_COLORS[p.platform];
            const label = platformLabels[p.platform];
            const pct = p.total > 0 ? Math.round((p.mentioned / p.total) * 100) : 0;
            const weeklyPlatform = weeklyRate?.perPlatform[p.platform];

            return (
              <div
                key={p.platform}
                className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-white px-4 py-6 transition-all hover:shadow-md dark:bg-card"
              >
                {/* Platform icon + name */}
                <div className="flex items-center gap-2">
                  <div className={`flex size-8 items-center justify-center rounded-lg ${colors.bg}`}>
                    <PlatformIcon platform={p.platform} size={18} />
                  </div>
                  <p className="text-sm font-semibold leading-none text-foreground">{label.name}</p>
                </div>

                {/* Circular progress donut */}
                <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-muted"
                    />
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={colors.hex}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                      transform={`rotate(-90 ${center} ${center})`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold tabular-nums text-foreground">
                    {pct}<span className="text-xs font-normal text-muted-foreground">%</span>
                  </span>
                </div>

                {/* Mentioned / total count */}
                <div className="flex flex-col items-center gap-1">
                  <p className="text-center text-xs text-muted-foreground">
                    {p.total > 0 ? (
                      <>
                        <span className="font-bold tabular-nums text-foreground">{p.mentioned}</span>
                        <span className="text-muted-foreground">/{p.total} soruda öneriyor</span>
                      </>
                    ) : (
                      "Henüz taranmadı"
                    )}
                  </p>
                  {hasWeeklyData && weeklyPlatform && weeklyPlatform.total > 0 && (
                    <p className="text-center text-[10px] text-muted-foreground/60">
                      Haftalık: {weeklyPlatform.mentioned}/{weeklyPlatform.total}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
