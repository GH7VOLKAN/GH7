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
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  MessageSquareIcon,
  UsersIcon,
} from "lucide-react";

interface SectionCardsProps {
  mentionScore: number;
  mentionTrend: number;
  totalMentionCount: number;
  totalResultCount: number;
  lastScanTimeAgo: string | null;
  topCompetitorName: string | null;
  topCompetitorGap: number;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <MinusIcon className="size-3" />
        Sabit
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={
        value > 0
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }
    >
      {value > 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {value > 0 ? "+" : ""}
      {value}
    </Badge>
  );
}

export function SectionCards({
  mentionScore,
  mentionTrend,
  totalMentionCount,
  totalResultCount,
  lastScanTimeAgo,
  topCompetitorName,
  topCompetitorGap,
}: SectionCardsProps) {
  const mentionRate = totalResultCount > 0
    ? Math.round((totalMentionCount / totalResultCount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
      {/* Kart 1: Yapay Zeka Seni Ne Kadar Tanıyor? */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <MessageSquareIcon className="size-3.5" />
            Yapay zeka seni ne kadar tanıyor?
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalResultCount > 0
              ? `${totalMentionCount}/${totalResultCount}`
              : `${mentionScore}/100`}
          </CardTitle>
          <CardAction>
            <TrendBadge value={mentionTrend} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {/* Progress bar */}
          <div className="flex w-full items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 transition-all duration-1000"
                style={{ width: `${Math.max(mentionRate, 2)}%` }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums text-foreground">%{mentionRate}</span>
          </div>
          <div className="text-muted-foreground">
            {totalResultCount > 0
              ? `${totalResultCount} denemede ${totalMentionCount}'${totalMentionCount > 1 ? "i" : ""}nde öneriyor`
              : "Henüz tarama yapılmadı"}
          </div>
          {lastScanTimeAgo && (
            <div className="text-xs text-muted-foreground/60">Son tarama: {lastScanTimeAgo}</div>
          )}
        </CardFooter>
      </Card>

      {/* Kart 2: Senin Yerine Kim */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            Senin Yerine Kim?
          </CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {topCompetitorName || "—"}
          </CardTitle>
          <CardAction>
            {topCompetitorName && (
              <Badge
                variant="outline"
                className={
                  topCompetitorGap > 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : topCompetitorGap < 0
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-muted-foreground"
                }
              >
                {topCompetitorGap > 0
                  ? `${topCompetitorGap} puan önde`
                  : topCompetitorGap < 0
                    ? `${Math.abs(topCompetitorGap)} puan geride`
                    : "Eşit"}
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-foreground font-medium">
            {topCompetitorName
              ? `${topCompetitorName} en sık önerilen`
              : "Tarama sonrası rakipler görünecek"}
          </div>
          <div className="text-muted-foreground">
            Yapay zekaların seni yerine kimi öneriyor
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
