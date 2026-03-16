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
  ShieldCheckIcon,
  FileTextIcon,
  GlobeIcon,
} from "lucide-react";

interface SectionCardsProps {
  mentionScore: number;
  mentionTrend: number;
  readinessScore: number;
  readinessTrend: number;
  activePromptCount: number;
  totalSourceCount: number;
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

function scoreLevel(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Güçlü", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 40) return { label: "Orta", color: "text-amber-600 dark:text-amber-400" };
  if (score > 0) return { label: "Zayıf", color: "text-red-500 dark:text-red-400" };
  return { label: "Veri Yok", color: "text-muted-foreground" };
}

export function SectionCards({
  mentionScore,
  mentionTrend,
  readinessScore,
  readinessTrend,
  activePromptCount,
  totalSourceCount,
  totalMentionCount,
  totalResultCount,
  lastScanTimeAgo,
  topCompetitorName,
  topCompetitorGap,
}: SectionCardsProps) {
  const mentionLevel = scoreLevel(mentionScore);
  const readinessLevel = scoreLevel(readinessScore);
  const mentionRate = totalResultCount > 0
    ? Math.round((totalMentionCount / totalResultCount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <MessageSquareIcon className="size-3.5" />
            Yapay Zeka Gorunurlugu
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {mentionScore}/100
          </CardTitle>
          <CardAction>
            <TrendBadge value={mentionTrend} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.min(mentionScore, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${mentionLevel.color}`}>
              {mentionLevel.label}
            </span>
          </div>
          <div className="text-muted-foreground">
            {totalResultCount > 0
              ? `${totalResultCount} sorunun ${totalMentionCount} tanesinde sizi oneriyor`
              : "4 yapay zeka sizi ne kadar taniyor"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5" />
            Site Hazirlik Durumu
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {readinessScore}/100
          </CardTitle>
          <CardAction>
            <TrendBadge value={readinessTrend} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.min(readinessScore, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${readinessLevel.color}`}>
              {readinessLevel.label}
            </span>
          </div>
          <div className="text-muted-foreground">
            Sitenizin yapay zeka icin ne kadar hazir oldugu
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <FileTextIcon className="size-3.5" />
            Aktif Soru
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activePromptCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              Takip
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activePromptCount > 30
              ? "Kapsamlı izleme"
              : activePromptCount > 10
                ? "İyi kapsam"
                : "Daha fazla soru ekleyin"}
          </div>
          <div className="text-muted-foreground">
            {lastScanTimeAgo
              ? `Son tarama: ${lastScanTimeAgo}`
              : "Her soruyu 4 yapay zekada test ediyoruz"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <GlobeIcon className="size-3.5" />
            Toplam Kaynak
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSourceCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-muted-foreground">
              Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {topCompetitorName
              ? topCompetitorGap > 0
                ? `${topCompetitorName} ${topCompetitorGap} puan önde`
                : topCompetitorGap < 0
                  ? `${topCompetitorName}'den ${Math.abs(topCompetitorGap)} puan öndesiniz`
                  : `${topCompetitorName} ile eşit`
              : "Yapay zekanin sizi ogrendigi kaynaklar"}
          </div>
          <div className="text-muted-foreground">
            Yapay zeka yanitlarinda bahsedilen kaynak sayisi
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
