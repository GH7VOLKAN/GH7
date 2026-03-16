"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompetitorRankEntry } from "@/lib/dal/overview";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { PlatformIcon, PLATFORM_COLORS } from "@/components/platform-icon";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

interface CompetitorRankingCardProps {
  ranking: CompetitorRankEntry[];
  totalResults: number;
}

export function CompetitorRankingCard({ ranking, totalResults }: CompetitorRankingCardProps) {
  if (ranking.length === 0) return null;

  const maxMentions = Math.max(...ranking.map((r) => r.mentionCount), 1);

  // Platform bazlı sıralama (top 3 per platform)
  const platformRanking: Record<PlatformKey, string[]> = {
    chatgpt: [],
    claude: [],
    gemini: [],
    perplexity: [],
  };

  for (const plat of ["chatgpt", "claude", "gemini", "perplexity"] as PlatformKey[]) {
    const sorted = [...ranking]
      .sort((a, b) => (b.perPlatform[plat]?.mentioned ?? 0) - (a.perPlatform[plat]?.mentioned ?? 0))
      .slice(0, 3);
    platformRanking[plat] = sorted.map((s) => s.isUser ? "Sen" : s.name);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senin Yerine Kim Öneriliyor?</CardTitle>
        <CardDescription>
          Yapay zekaların seni yerine önerdiği markalar — tarama sonuçlarından
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar chart */}
        <div className="space-y-3">
          {ranking.map((entry, i) => {
            const barWidth = totalResults > 0
              ? Math.max((entry.mentionCount / maxMentions) * 100, 4)
              : 0;
            const pct = totalResults > 0
              ? Math.round((entry.mentionCount / totalResults) * 100)
              : 0;

            return (
              <div key={entry.name} className="flex items-center gap-3">
                <div className={`w-32 truncate text-sm ${entry.isUser ? "font-bold" : "font-medium"}`}>
                  {entry.isUser ? `${entry.name} (sen)` : entry.name}
                  {i === 0 && !entry.isUser && (
                    <span className="ml-1 text-[10px] text-muted-foreground">en sık</span>
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-5 flex-1 overflow-hidden rounded-md bg-muted">
                    <div
                      className={`h-full rounded-md transition-all duration-700 ${
                        entry.isUser
                          ? "bg-foreground"
                          : "bg-foreground/30"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className={`w-16 text-right text-xs tabular-nums ${entry.isUser ? "font-bold" : "text-muted-foreground"}`}>
                    {entry.mentionCount}/{totalResults} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform bazlı sıralama */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["chatgpt", "claude", "gemini", "perplexity"] as PlatformKey[]).map((plat) => {
            const colors = PLATFORM_COLORS[plat];
            const label = platformLabels[plat];
            const top3 = platformRanking[plat];
            return (
              <div key={plat} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center gap-1.5">
                  <PlatformIcon platform={plat} size={14} />
                  <span className={`text-xs font-semibold ${colors.text}`}>{label.name}</span>
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {top3.map((name, rank) => (
                    <div key={rank} className={`text-xs ${name === "Sen" ? "font-bold" : "text-muted-foreground"}`}>
                      {rank + 1}.{name}
                    </div>
                  ))}
                  {top3.length === 0 && (
                    <div className="text-xs text-muted-foreground/60">—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Link to Rakipler page */}
        <div className="flex justify-end">
          <Link
            href="/dashboard/rakipler"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Detaylı karşılaştırma
            <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
