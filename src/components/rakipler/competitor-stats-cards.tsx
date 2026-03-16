"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, ShieldIcon, SwordsIcon, UsersIcon, SparklesIcon } from "lucide-react";
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
  userReadinessScore,
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

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Bahsedilme Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {userMentionScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <SwordsIcon className="size-3" />
              Siz
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalMentions}/{totalResults} soruda bahsedildiniz
          </div>
          <div className="text-muted-foreground">
            4 AI platformunda toplam bahsedilme oranınız
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Hazırlık Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {userReadinessScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ShieldIcon className="size-3" />
              Siz
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Teknik altyapı değerlendirmesi
          </div>
          <div className="text-muted-foreground">
            Yapılandırılmış veri, meta etiketler ve schema.org kontrolü
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lider Rakip Farkı</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {mentionGap > 0 ? "+" : ""}{mentionGap}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {mentionGap > 0 ? <TrendingDownIcon className="size-3" /> : <TrendingUpIcon className="size-3" />}
              {mentionGap > 0 ? "Geride" : "Önde"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {topCompetitor?.name ?? "Rakip yok"} {mentionGap > 0 ? "önde" : mentionGap < 0 ? "geride" : "eşit"}
          </div>
          <div className="text-muted-foreground">
            {mentionGap > 0
              ? "Rakibiniz yapay zekalarda sizden daha sik bahsediliyor"
              : mentionGap < 0
                ? "Yapay zekalarda rakibinizden daha sik bahsediliyorsunuz"
                : "En güçlü rakibinizle aynı düzeydesiniz"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Takip Edilen Rakip</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {competitorRows.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <UsersIcon className="size-3" />
              Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex flex-wrap gap-1.5">
            {aiDiscoveredCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <SparklesIcon className="size-3" />
                AI: {aiDiscoveredCount}
              </Badge>
            )}
            {manualCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                Manuel: {manualCount}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground">
            Perplexity Sonar + Claude ile keşfedilen ve manuel eklenen rakipler
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
