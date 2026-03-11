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
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import type { PlatformKey } from "@/lib/types";

interface CompetitorRow {
  name: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
}

interface CompetitorStatsCardsProps {
  rows: CompetitorRow[];
  userMentionScore: number;
  userReadinessScore: number;
}

export function CompetitorStatsCards({
  rows,
  userMentionScore,
  userReadinessScore,
}: CompetitorStatsCardsProps) {
  const competitorCount = rows.filter((r) => !r.isUser).length;
  const topCompetitor = rows
    .filter((r) => !r.isUser)
    .sort((a, b) => b.mentionScore - a.mentionScore)[0];
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
              <TrendingUpIcon />
              Siz
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            4 AI platformunda
          </div>
          <div className="text-muted-foreground">
            Sizin bahsedilme skoru
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
              <TrendingUpIcon />
              Siz
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Teknik ve içerik hazırlığı
          </div>
          <div className="text-muted-foreground">
            Yapılandırılmış veri, platform, içerik
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
              {mentionGap > 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
              {mentionGap > 0 ? "Geride" : "Önde"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {topCompetitor?.name ?? "—"} {mentionGap > 0 ? "önde" : "geride"}
          </div>
          <div className="text-muted-foreground">
            Bahsedilme skoru farkı
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Takip Edilen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {competitorCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Aktif</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Rakip takip ediliyor
          </div>
          <div className="text-muted-foreground">
            Sektör karşılaştırması
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
