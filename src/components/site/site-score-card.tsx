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
import {
  auditCategories,
  siteReadinessScore,
  siteReadinessTarget,
} from "@/lib/mock-data/site-audit";

export function SiteScoreCards() {
  const passCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "pass").length,
    0
  );
  const partialCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "partial").length,
    0
  );
  const failCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "fail").length,
    0
  );
  const totalChecks = passCount + partialCount + failCount;
  const raasCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.raasEligible).length,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Site Hazırlık Skoru</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {siteReadinessScore}/100
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +6
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Hedef: {siteReadinessTarget} puan
          </div>
          <div className="text-muted-foreground">
            {auditCategories.length} kategoride analiz
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
              +2
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
            {siteReadinessTarget - siteReadinessScore} puan
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              %{Math.round((siteReadinessScore / siteReadinessTarget) * 100)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {siteReadinessScore} → {siteReadinessTarget}
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
            {raasCount}
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
