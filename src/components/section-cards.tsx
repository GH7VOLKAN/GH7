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
      <Badge variant="outline" className="border-transparent bg-muted/60 text-muted-foreground">
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
          ? "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-transparent bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
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
      {/* Kart 1: Yapay Zeka Görünürlüğü */}
      <Card className="@container/card border border-border/50 shadow-sm rounded-2xl transition-shadow hover:shadow-md">
        <CardHeader className="p-6">
          <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
            <MessageSquareIcon className="size-3.5" />
            Yapay Zeka Görünürlüğü
          </CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums tracking-tight text-foreground @[250px]/card:text-4xl">
            {totalResultCount > 0
              ? `${totalMentionCount}/${totalResultCount}`
              : `${mentionScore}/100`}
          </CardTitle>
          <CardAction>
            <TrendBadge value={mentionTrend} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3 px-6 pb-6 text-sm">
          {/* Progress bar */}
          <div className="flex w-full items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-1000"
                style={{ width: `${Math.max(mentionRate, 2)}%` }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums text-foreground">%{mentionRate}</span>
          </div>
          <p className="text-muted-foreground">
            {totalResultCount > 0
              ? `Yapay zeka seni ${totalResultCount} denemede ${totalMentionCount} kez öneriyor`
              : "Henüz tarama yapılmadı"}
          </p>
          {lastScanTimeAgo && (
            <p className="text-xs text-muted-foreground/60">Son tarama: {lastScanTimeAgo}</p>
          )}
        </CardFooter>
      </Card>

      {/* Kart 2: Senin Yerine Kim */}
      <Card className="@container/card border border-border/50 shadow-sm rounded-2xl transition-shadow hover:shadow-md">
        <CardHeader className="p-6">
          <CardDescription className="flex items-center gap-1.5 text-muted-foreground">
            <UsersIcon className="size-3.5" />
            Senin Yerine Kim?
          </CardDescription>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground @[250px]/card:text-4xl">
            {topCompetitorName || "—"}
          </CardTitle>
          <CardAction>
            {topCompetitorName && (
              <Badge
                variant="outline"
                className={
                  topCompetitorGap > 0
                    ? "border-transparent bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : topCompetitorGap < 0
                      ? "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "border-transparent bg-muted/60 text-muted-foreground"
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
        <CardFooter className="flex-col items-start gap-2 px-6 pb-6 text-sm">
          <p className="font-medium text-foreground">
            {topCompetitorName
              ? `${topCompetitorName} en sık önerilen rakip`
              : "Tarama sonrası rakipler görünecek"}
          </p>
          <p className="text-muted-foreground">
            Yapay zekalar seni yerine kimi öneriyor?
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
