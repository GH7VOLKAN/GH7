"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon, SwordsIcon, UsersIcon, SparklesIcon } from "lucide-react";
import type { PlatformKey } from "@/lib/types";

interface CompetitorRow {
  name: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
  source: string;
}

interface CompetitorStatsCardsProps {
  rows: CompetitorRow[];
  userMentionScore: number;
  userReadinessScore: number;
  totalResults: number;
  totalMentions: number;
  aiDiscoveredCount: number;
  manualCount: number;
}

export function CompetitorStatsCards({
  rows,
  userMentionScore,
  totalResults,
  totalMentions,
  aiDiscoveredCount,
  manualCount,
}: CompetitorStatsCardsProps) {
  const competitorRows = rows.filter((r) => !r.isUser);
  const topCompetitor = competitorRows.sort((a, b) => b.mentionScore - a.mentionScore)[0];
  const mentionGap = topCompetitor
    ? topCompetitor.mentionScore - userMentionScore
    : 0;

  const mentionPercent = totalResults > 0 ? Math.round((totalMentions / totalResults) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Card 1: Bahsedilme Durumu */}
      <div className="border border-border/50 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SwordsIcon className="size-4" />
            Bahsedilme Durumu
          </div>
          <Badge variant="outline">Siz</Badge>
        </div>
        <div className="text-lg font-semibold">
          {totalResults} soruda {totalMentions} kez önerildiniz
        </div>
        <div className="w-full">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-foreground transition-all"
              style={{ width: `${mentionPercent}%` }}
            />
          </div>
          <div className="mt-1.5 text-xs text-muted-foreground">
            Toplam bahsedilme oranı: %{mentionPercent}
          </div>
        </div>
      </div>

      {/* Card 2: En Güçlü Rakip */}
      <div className="border border-border/50 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {mentionGap > 0 ? (
              <TrendingDownIcon className="size-4" />
            ) : (
              <TrendingUpIcon className="size-4" />
            )}
            En Güçlü Rakip
          </div>
          <Badge variant="outline">
            {topCompetitor?.name ?? "Rakip yok"}
          </Badge>
        </div>
        {topCompetitor ? (
          <div className={`text-lg font-semibold ${mentionGap > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
            {mentionGap > 0
              ? `${topCompetitor.name} senden ${mentionGap} soru daha fazla öneriliyor`
              : mentionGap < 0
                ? `Sen ${topCompetitor.name}'den daha çok öneriliyorsun`
                : `${topCompetitor.name} ile aynı seviyedesin`}
          </div>
        ) : (
          <div className="text-lg font-semibold text-muted-foreground">
            Henüz rakip eklenmedi
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {mentionGap > 0
            ? "Farkı kapatmak için içeriklerini ve stratejilerini incele"
            : mentionGap < 0
              ? "Harika gidiyorsun, bu avantajı korumaya devam et!"
              : "Rekabet dengede, bir adım öne geçmek senin elinde"}
        </div>
      </div>

      {/* Card 3: Takip Edilen Rakipler */}
      <div className="border border-border/50 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UsersIcon className="size-4" />
            Takip Edilen Rakipler
          </div>
          <Badge variant="outline">{competitorRows.length} aktif</Badge>
        </div>
        <div className="text-2xl font-semibold tabular-nums">
          {competitorRows.length}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {aiDiscoveredCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <SparklesIcon className="size-3" />
              AI ile keşfedilen: {aiDiscoveredCount}
            </Badge>
          )}
          {manualCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              Manuel eklenen: {manualCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
