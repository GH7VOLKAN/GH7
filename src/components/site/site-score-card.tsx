"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  auditCategories,
  siteReadinessScore,
  siteReadinessTarget,
} from "@/lib/mock-data/site-audit";

export function SiteScoreCard() {
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

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Site Hazırlık Skoru</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {siteReadinessScore}/100
        </CardTitle>
        <CardAction>
          <Badge variant="outline">Hedef: {siteReadinessTarget}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Progress value={siteReadinessScore} />
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{passCount}</span>{" "}
            Geçen
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {partialCount}
            </span>{" "}
            Kısmî
          </span>
          <span>
            <span className="font-semibold text-foreground">{failCount}</span>{" "}
            Başarısız
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
