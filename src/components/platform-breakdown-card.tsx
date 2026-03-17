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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((p) => {
            const colors = PLATFORM_COLORS[p.platform];
            const label = platformLabels[p.platform];
            const pct = p.total > 0 ? Math.round((p.mentioned / p.total) * 100) : 0;
            const weeklyPlatform = weeklyRate?.perPlatform[p.platform];

            return (
              <div
                key={p.platform}
                className="flex flex-col gap-3 rounded-xl bg-white p-4 transition-all hover:shadow-md dark:bg-card"
                style={{ borderLeft: `4px solid ${colors.hex}` }}
              >
                {/* Platform icon + name */}
                <div className="flex items-center gap-2">
                  <div className={`flex size-7 items-center justify-center rounded-lg ${colors.bg}`}>
                    <PlatformIcon platform={p.platform} size={16} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{label.name}</span>
                </div>

                {/* Natural language stat */}
                <p className="text-xs text-muted-foreground leading-snug">
                  {p.total > 0 ? (
                    <>
                      <span className="font-bold text-foreground">{p.mentioned}</span>/{p.total} soruda öneriyor
                    </>
                  ) : (
                    "Henüz taranmadı"
                  )}
                </p>

                {/* Horizontal bar */}
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors.hex,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                    %{pct}
                  </span>
                </div>

                {/* Weekly data */}
                {hasWeeklyData && weeklyPlatform && weeklyPlatform.total > 0 && (
                  <p className="text-[10px] text-muted-foreground/60">
                    Haftalık: {weeklyPlatform.mentioned}/{weeklyPlatform.total}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
