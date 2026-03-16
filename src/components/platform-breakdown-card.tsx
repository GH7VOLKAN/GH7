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
    <Card>
      <CardHeader>
        <CardTitle>Platform Bazlı Görünürlük</CardTitle>
        <CardDescription>
          {hasWeeklyData
            ? `Bu hafta ${weeklyRate.totalScans} taramada ${weeklyRate.mentionedInScans} kez önerildiniz`
            : "Her yapay zekanın sizi ne sıklıkta önerdiği"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {platforms.map((p) => {
            const colors = PLATFORM_COLORS[p.platform];
            const label = platformLabels[p.platform];
            const pct = p.total > 0 ? Math.round((p.mentioned / p.total) * 100) : 0;
            const weeklyPlatform = weeklyRate?.perPlatform[p.platform];

            return (
              <div
                key={p.platform}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-5 transition-all hover:border-border hover:shadow-sm"
              >
                {/* Platform ikon + isim */}
                <div className="flex items-center gap-2">
                  <div className={`flex size-8 items-center justify-center rounded-lg ${colors.bg}`}>
                    <PlatformIcon platform={p.platform} size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold leading-none">{label.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{label.company}</p>
                  </div>
                </div>

                {/* Skor daire */}
                <div className="relative flex size-[72px] items-center justify-center">
                  <svg className="size-[72px]" viewBox="0 0 72 72">
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/60"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="30"
                      fill="none"
                      stroke={colors.hex}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${(pct / 100) * 188.5} 188.5`}
                      transform="rotate(-90 36 36)"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute text-xl font-bold tabular-nums">
                    {pct}<span className="text-xs font-normal text-muted-foreground">%</span>
                  </span>
                </div>

                {/* Mention bilgisi */}
                <div className="flex flex-col items-center gap-0.5">
                  <p className="text-center text-[11px] text-muted-foreground">
                    {p.total > 0 ? (
                      <>
                        <span className="font-semibold text-foreground">{p.mentioned}</span>
                        /{p.total} soruda öneriyor
                      </>
                    ) : (
                      "Henüz taranmadı"
                    )}
                  </p>
                  {hasWeeklyData && weeklyPlatform && weeklyPlatform.total > 0 && (
                    <p className="text-center text-[10px] text-muted-foreground/70">
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
