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
import { sourceDomains } from "@/lib/mock-data/sources";

export function SourceStatsCards() {
  const totalSources = sourceDomains.length;
  const actionableSources = sourceDomains.filter((s) => s.actionNote).length;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Toplam Kaynak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSources}
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
            AI yanıtlarında referans gösterilen
          </div>
          <div className="text-muted-foreground">
            Kaynak domainler takip ediliyor
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Aksiyon Gereken</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {actionableSources}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">Kayıt / Güncelleme</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Eksik kayıtlar tespit edildi
          </div>
          <div className="text-muted-foreground">
            Dizin kaydı veya güncelleme gerekiyor
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
