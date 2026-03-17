"use client";

import Link from "next/link";
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
  ArrowRightIcon,
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
      <Badge
        variant="outline"
        className="border-transparent bg-muted/60 text-muted-foreground"
      >
        <MinusIcon className="size-3" />
        Değişim yok
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
      {value > 0 ? (
        <TrendingUpIcon className="size-3" />
      ) : (
        <TrendingDownIcon className="size-3" />
      )}
      {value > 0 ? "+" : ""}
      {value} soru
    </Badge>
  );
}

const PLATFORM_COUNT = 4;

function buildHeroStatement(
  mentionCount: number,
  resultCount: number
): string {
  if (resultCount === 0) return "Henüz tarama yapılmadı";
  if (mentionCount === 0) return "Hiç önerilmiyorsun";
  return `${mentionCount} kez önerildin`;
}

function buildHeroSubtitle(resultCount: number): string | null {
  if (resultCount === 0) return null;
  const uniquePrompts = Math.round(resultCount / PLATFORM_COUNT);
  return `${uniquePrompts} soruda ${PLATFORM_COUNT} yapay zekada tarandı`;
}

function buildCompetitorStatement(
  name: string | null,
  gap: number
): string {
  if (!name) return "Tarama tamamlanınca rakiplerin burada görünecek";
  if (gap > 0) {
    return `${name}, senden ${gap} soru daha fazla öneriliyor`;
  }
  if (gap < 0) {
    return `Seni ${name}'dan daha çok öneriyorlar!`;
  }
  return `${name} ile başabaş gidiyorsunuz`;
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
  const mentionRate =
    totalResultCount > 0
      ? Math.round((totalMentionCount / totalResultCount) * 100)
      : 0;

  const heroText = buildHeroStatement(totalMentionCount, totalResultCount);
  const heroSubtitle = buildHeroSubtitle(totalResultCount);
  const competitorText = buildCompetitorStatement(
    topCompetitorName,
    topCompetitorGap
  );

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
      {/* Kart 1: Yapay Zeka Seni Ne Kadar Taniyor? */}
      <Card className="@container/card border border-border/50 shadow-sm rounded-2xl transition-shadow hover:shadow-md">
        <CardHeader className="p-6 pb-2">
          <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Yapay Zeka Seni Ne Kadar Tanıyor?
          </CardDescription>
          <CardTitle className="text-xl font-semibold leading-snug text-foreground @[250px]/card:text-2xl">
            {heroText}
          </CardTitle>
          {heroSubtitle && (
            <p className="text-sm text-muted-foreground">{heroSubtitle}</p>
          )}
          <CardAction>
            <TrendBadge value={mentionTrend} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3 px-6 pb-6 pt-3 text-sm">
          {/* Progress bar */}
          {totalResultCount > 0 && (
            <div className="flex w-full items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-1000"
                  style={{ width: `${Math.max(mentionRate, 2)}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {totalMentionCount}/{totalResultCount} sonuç
              </span>
            </div>
          )}
          {lastScanTimeAgo && (
            <p className="text-xs text-muted-foreground/50">
              Son tarama: {lastScanTimeAgo}
            </p>
          )}
        </CardFooter>
      </Card>

      {/* Kart 2: Senin Yerine Kim Oneriliyor? */}
      <Card className="@container/card border border-border/50 shadow-sm rounded-2xl transition-shadow hover:shadow-md">
        <CardHeader className="p-6 pb-2">
          <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Senin Yerine Kim Öneriliyor?
          </CardDescription>
          <CardTitle className="text-xl font-semibold leading-snug text-foreground @[250px]/card:text-2xl">
            {topCompetitorName || "Henüz belli değil"}
          </CardTitle>
          {topCompetitorName && topCompetitorGap <= 0 && (
            <CardAction>
              <Badge
                variant="outline"
                className="border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <TrendingUpIcon className="size-3" />
                Önde gidiyorsun
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3 px-6 pb-6 pt-3 text-sm">
          <p className="text-muted-foreground">{competitorText}</p>
          {topCompetitorName && (
            <Link
              href="/dashboard/rakipler"
              className="group inline-flex items-center gap-1 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Tüm rakipleri gör
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
