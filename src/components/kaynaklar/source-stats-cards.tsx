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
import { GlobeIcon, TrophyIcon, BookOpenIcon, AlertTriangleIcon } from "lucide-react";

interface SourceDomain {
  usagePercent: number;
  avgCitations: number;
  actionNote: string | null;
  domain: string;
}

interface SourceStatsCardsProps {
  sourceDomains: SourceDomain[];
}

export function SourceStatsCards({ sourceDomains }: SourceStatsCardsProps) {
  const totalSources = sourceDomains.length;
  const actionableSources = sourceDomains.filter((s) => s.actionNote).length;
  const avgCitations =
    totalSources > 0
      ? sourceDomains.reduce((sum, s) => sum + s.avgCitations, 0) / totalSources
      : 0;
  const topSource = [...sourceDomains].sort(
    (a, b) => b.usagePercent - a.usagePercent
  )[0];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Toplam Kaynak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalSources}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <GlobeIcon className="size-3" />
              Aktif
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Yapay zekanin referans gosterdigi siteler
          </div>
          <div className="text-muted-foreground">
            Yapay zeka yanitlarinda markanızla birlikte referans gösterilen domain sayısı
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>En Çok Referans</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            %{topSource?.usagePercent ?? 0}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrophyIcon className="size-3" />
              Lider
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {topSource?.domain ?? "—"}
          </div>
          <div className="text-muted-foreground">
            Yapay zeka yanitlarinda en sık kaynak gösterilen domain ve kullanım yüzdesi
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ort. Atıf Sayısı</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {avgCitations.toFixed(1)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpenIcon className="size-3" />
              Ortalama
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Kaynak başına ortalama atıf
          </div>
          <div className="text-muted-foreground">
            Her kaynak domainin yapay zeka yanitlarinda ortalama kaç kez atıf aldığı
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
            <Badge variant="outline">
              <AlertTriangleIcon className="size-3" />
              Dikkat
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {actionableSources > 0
              ? `${actionableSources} kaynakta eksiklik`
              : "Tüm kaynaklar güncel"}
          </div>
          <div className="text-muted-foreground">
            Dizin kaydı, profil güncellemesi veya içerik eklenmesi gereken kaynaklar
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
