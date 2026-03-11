"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ActionStatsCardProps {
  completedCount: number;
  totalCount: number;
  pct: number;
}

export function ActionStatsCard({
  completedCount,
  totalCount,
  pct,
}: ActionStatsCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Aksiyon Planı</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {completedCount}/{totalCount} tamamlandı
        </CardTitle>
        <CardAction>
          <Badge variant="outline">%{pct}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Progress value={pct} />
      </CardContent>
    </Card>
  );
}
