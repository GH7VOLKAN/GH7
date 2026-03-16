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
import { TrendingUpIcon, LayersIcon, SparklesIcon, DatabaseIcon, SearchIcon, UserIcon } from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface PromptItem {
  visibility: number;
  modelResults: Record<PlatformKey, boolean>;
}

const sourceIcons: Record<string, typeof SparklesIcon> = {
  ai_generated: SparklesIcon,
  dataforseo: DatabaseIcon,
  sonar: SearchIcon,
  manual: UserIcon,
  user_added: UserIcon,
};

const sourceNames: Record<string, string> = {
  ai_generated: "AI",
  dataforseo: "DataForSEO",
  sonar: "Sonar",
  manual: "Manuel",
  user_added: "Manuel",
};

const categoryNames: Record<string, string> = {
  sektor: "Sektör",
  lokasyon: "Lokasyon",
  marka: "Marka",
  karsilastirma: "Karşılaştırma",
  oneri: "Öneri",
  teknik: "Teknik",
  genel: "Genel",
  urun: "Ürün",
  fiyat: "Fiyat",
  yorum: "Yorum",
  uzmanlik: "Uzmanlık",
  itibar: "İtibar",
};

interface PromptStatsCardsProps {
  promptItems: PromptItem[];
  activeCount: number;
  suggestedCount: number;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

export function PromptStatsCards({
  promptItems,
  activeCount,
  suggestedCount,
  categoryBreakdown,
  sourceBreakdown,
}: PromptStatsCardsProps) {
  const mentionCounts: Record<PlatformKey, number> = {
    chatgpt: 0,
    claude: 0,
    gemini: 0,
    perplexity: 0,
  };
  for (const item of promptItems) {
    for (const p of PLATFORMS) {
      if (item.modelResults[p]) mentionCounts[p]++;
    }
  }

  const avgVisibility =
    promptItems.length > 0
      ? Math.round(
          promptItems.reduce((sum, p) => sum + p.visibility, 0) /
            promptItems.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Aktif Soru</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {activeCount}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <LayersIcon className="size-3" />
                Takip
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(sourceBreakdown).map(([source, count]) => {
                const Icon = sourceIcons[source] ?? SparklesIcon;
                return (
                  <Badge key={source} variant="outline" className="text-muted-foreground gap-1">
                    <Icon className="size-3" />
                    {sourceNames[source] ?? source}: {count}
                  </Badge>
                );
              })}
            </div>
            <div className="text-muted-foreground">
              {suggestedCount > 0 ? `${suggestedCount} önerilen prompt bekliyor` : "Sektör promptları takip ediliyor"}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ortalama Görünürlük</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              %{avgVisibility}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3" />
                Analiz
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {promptItems.length} prompt üzerinden hesaplandı
            </div>
            <div className="text-muted-foreground">
              4 AI platformunda ortalama bahsedilme oranı
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Platform mention badges + Category breakdown */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Badge key={platform} variant="outline" className="text-muted-foreground gap-1.5 px-3 py-1.5">
              {platformLabels[platform].name}
              <span className="font-semibold text-foreground">
                {mentionCounts[platform]}/{promptItems.length}
              </span>
              bahsedildi
            </Badge>
          ))}
        </div>
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <Badge key={cat} variant="outline" className="text-muted-foreground text-xs">
                  {categoryNames[cat] ?? cat} ({count})
                </Badge>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
