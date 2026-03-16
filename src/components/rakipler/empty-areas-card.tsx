"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TargetIcon, LightbulbIcon } from "lucide-react";
import type { EmptyAreaOpportunity } from "@/lib/dal/competitors";

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

interface EmptyAreasCardProps {
  opportunities: EmptyAreaOpportunity[];
}

export function EmptyAreasCard({ opportunities }: EmptyAreasCardProps) {
  if (opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="size-5 text-amber-500" />
            Firsat Alanlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border bg-emerald-50 px-4 py-3 dark:bg-emerald-900/10">
            <LightbulbIcon className="size-4 text-emerald-500" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              Tum alanlarda aktif rekabet var.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="size-5 text-amber-500" />
          Firsat Alanlari
        </CardTitle>
        <CardDescription>
          Bu sorularda henuz guclu bir oyuncu yok — one gecme firsati!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {opportunities.map((opp, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-lg border px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <p className="text-sm font-medium leading-snug">
                {opp.promptText}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-6.5">
              {opp.platforms.map((p) => (
                <Badge key={p} variant="outline" className="text-[10px]">
                  {PLATFORM_LABELS[p] ?? p}
                </Badge>
              ))}
              {opp.topMention && (
                <span className="text-xs text-muted-foreground">
                  Tek bahsedilen: {opp.topMention}
                </span>
              )}
            </div>
          </div>
        ))}
        <p className="mt-1 text-xs text-muted-foreground px-1">
          Bu sorularda kimse guclu degil. Icerik ureterek bu alanlarda ilk akla gelen marka olabilirsiniz.
        </p>
      </CardContent>
    </Card>
  );
}
