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
import { promptItems, promptStats } from "@/lib/mock-data/prompts";
import { platformLabels, type PlatformKey } from "@/lib/types";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

function platformMentionCounts() {
  const counts: Record<PlatformKey, number> = {
    chatgpt: 0,
    claude: 0,
    gemini: 0,
    perplexity: 0,
  };
  for (const item of promptItems) {
    for (const r of item.modelResults) {
      if (r.mentioned) counts[r.platform]++;
    }
  }
  return counts;
}

export function PromptStatsCards() {
  const mentionCounts = platformMentionCounts();
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
            <CardDescription>Aktif Prompt</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {promptStats.active}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon />
                +5
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {promptStats.suggested} önerilen prompt
            </div>
            <div className="text-muted-foreground">
              Sektör promptları takip ediliyor
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
                <TrendingUpIcon />
                +4
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {promptItems.length} prompt üzerinden
            </div>
            <div className="text-muted-foreground">
              AI platformlarında ortalama görünürlük
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Platform mention badges */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <Badge key={platform} variant="outline" className="text-muted-foreground gap-1.5 px-3 py-1.5">
            {platformLabels[platform].name}
            <span className="font-semibold text-foreground">
              {mentionCounts[platform]}
            </span>
            atıf
          </Badge>
        ))}
      </div>
    </div>
  );
}
