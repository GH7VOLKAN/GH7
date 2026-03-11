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
import { TrendingUpIcon } from "lucide-react";

interface SiteScoreCardsProps {
  totalScore: number;
  targetScore: number;
  passCount: number;
  failCount: number;
  partialCount: number;
  totalChecks: number;
  raasEligibleCount: number;
  categoryCount: number;
}

export function SiteScoreCards({
  totalScore,
  targetScore,
  passCount,
  failCount,
  partialCount,
  totalChecks,
  raasEligibleCount,
  categoryCount,
}: SiteScoreCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Site Hazırlık Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Analiz
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hedef: {targetScore} puan
          </div>
          <div className="text-muted-foreground">
            {categoryCount} kategoride analiz
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Geçen Kontroller</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {passCount}/{totalChecks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Durum
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {passCount} geçen · {partialCount} kısmî
          </div>
          <div className="text-muted-foreground">
            {failCount} başarısız kontrol
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Hedefe Uzaklık</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {targetScore - totalScore} puan
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              %{Math.round((totalScore / targetScore) * 100)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalScore} → {targetScore}
          </div>
          <div className="text-muted-foreground">
            Hedef skora ulaşmak için
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>RaaS Uygun</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {raasEligibleCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Hazır</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Otomatik uygulanabilir
          </div>
          <div className="text-muted-foreground">
            Biz Uygulayalım ile hızlı çözüm
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
