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
import { PlatformIcon } from "@/components/platform-icon";
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
  const platformRanking: Record<PlatformKey, { name: string; isUser: boolean }[]> = {
    chatgpt: [],
    claude: [],
    gemini: [],
    perplexity: [],
  };

  for (const plat of ["chatgpt", "claude", "gemini", "perplexity"] as PlatformKey[]) {
    const sorted = [...ranking]
      .sort((a, b) => (b.perPlatform[plat]?.mentioned ?? 0) - (a.perPlatform[plat]?.mentioned ?? 0))
      .slice(0, 3);
    platformRanking[plat] = sorted.map((s) => ({
      name: s.isUser ? "Sen" : s.name,
      isUser: s.isUser,
    }));
  }

  return (
    <Card className="border border-border/50 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground">Senin Yerine Kim Öneriliyor?</CardTitle>
        <CardDescription>
          Yapay zekalar seni ne sıklıkla öneriyor, rakiplerin ne durumda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar chart */}
        <div className="space-y-3">
          {ranking.map((entry) => {
            const barWidth = totalResults > 0
              ? Math.max((entry.mentionCount / maxMentions) * 100, 4)
              : 0;

            return (
              <div key={entry.name} className="flex items-center gap-3">
                <div className={`w-32 truncate text-sm ${entry.isUser ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                  {entry.isUser ? "Sen" : entry.name}
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        entry.isUser
                          ? "bg-foreground"
                          : "bg-muted-foreground/30"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className={`shrink-0 text-xs ${entry.isUser ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {entry.mentionCount}/{totalResults} soruda
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform bazlı top 3 sıralaması */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["chatgpt", "claude", "gemini", "perplexity"] as PlatformKey[]).map((plat) => {
            const label = platformLabels[plat];
            const top3 = platformRanking[plat];
            return (
              <div key={plat} className="rounded-xl border border-border/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <PlatformIcon platform={plat} size={14} />
                  <span className="text-xs font-medium text-foreground">{label.name}</span>
                </div>
                <div className="space-y-0.5">
                  {top3.map((item, rank) => (
                    <div key={rank} className={`text-xs ${item.isUser ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                      {rank + 1}. {item.name}
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
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Detaylı karşılaştırma
            <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
