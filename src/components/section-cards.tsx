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

interface SectionCardsProps {
  mentionScore: number;
  mentionTrend: number;
  readinessScore: number;
  readinessTrend: number;
  activePromptCount: number;
  totalSourceCount: number;
}

export function SectionCards({
  mentionScore,
  mentionTrend,
  readinessScore,
  readinessTrend,
  activePromptCount,
  totalSourceCount,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI Bahsedilme Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {mentionScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {mentionTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {mentionTrend >= 0 ? "+" : ""}
              {mentionTrend}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {mentionTrend >= 0 ? "Yükselişte" : "Düşüşte"}{" "}
            {mentionTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            4 AI platformundaki bahsedilme
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Site Hazırlık Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {readinessScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {readinessTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {readinessTrend >= 0 ? "+" : ""}
              {readinessTrend}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {readinessTrend >= 0 ? "Yükselişte" : "Düşüşte"}{" "}
            {readinessTrend >= 0 ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Teknik ve içerik hazırlığı
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Aktif Prompt</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activePromptCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Takip</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Takip edilen promptlar
          </div>
          <div className="text-muted-foreground">
            Sektör promptları izleniyor
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Toplam Kaynak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSourceCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Aktif</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kaynak domainler
          </div>
          <div className="text-muted-foreground">
            AI yanıtlarında atıf kaynakları
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
