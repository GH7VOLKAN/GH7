"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { platformLabels, type PlatformKey, type Sentiment } from "@/lib/types";
import { ExternalLinkIcon, QuoteIcon } from "lucide-react";
import type { RecentMention } from "@/lib/dal/overview";

interface RecentMentionsTableProps {
  recentMentions: RecentMention[];
  lastScanTimeAgo: string | null;
  totalMentionCount: number;
  totalResultCount: number;
}

const sentimentColors: Record<Sentiment, string> = {
  "pozitif": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "nötr": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  "negatif": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const positionColors: Record<string, string> = {
  "1. sıra": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "2. sıra": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "3. sıra": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bahsediliyor": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

export function RecentMentionsTable({
  recentMentions,
  lastScanTimeAgo,
  totalMentionCount,
  totalResultCount,
}: RecentMentionsTableProps) {
  const [selected, setSelected] = useState<RecentMention | null>(null);

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yapay Zeka Sizi Taniyor mu?</CardTitle>
              <CardDescription>
                {totalResultCount > 0
                  ? `${totalResultCount} sorunun ${totalMentionCount} tanesinde sizi oneriyor`
                  : "Yapay zekalarin size verdigi son yanitlar"}
              </CardDescription>
            </div>
            {lastScanTimeAgo && (
              <Badge variant="outline" className="text-muted-foreground text-xs shrink-0">
                Son tarama: {lastScanTimeAgo}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Yapay Zeka</TableHead>
                  <TableHead>Soru</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Pozisyon
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Duygu</TableHead>
                  <TableHead className="text-right">Zaman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentMentions.map((mention) => (
                  <TableRow
                    key={mention.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelected(mention)}
                  >
                    <TableCell>
                      <Badge variant="outline" className="text-muted-foreground">
                        {platformLabels[mention.platform].name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {mention.prompt}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={positionColors[mention.position] ?? "text-muted-foreground"}
                      >
                        {mention.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={sentimentColors[mention.sentiment] ?? "text-muted-foreground"}
                      >
                        {mention.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {mention.timeAgo}
                    </TableCell>
                  </TableRow>
                ))}
                {recentMentions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Henuz bahsedilme verisi yok. Tarama baslatmak icin header&apos;daki butona tiklayin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QuoteIcon className="size-4 text-muted-foreground" />
              Bahsedilme Detayi
            </DialogTitle>
            <DialogDescription>
              {selected && platformLabels[selected.platform].name} yaniti
              {selected?.scanDate && ` — ${selected.scanDate}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-4">
              {/* Prompt */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Sorulan Soru</p>
                <p className="text-sm bg-muted/50 rounded-lg px-3 py-2 italic">
                  &ldquo;{selected.prompt}&rdquo;
                </p>
              </div>

              {/* Platform + Position + Sentiment */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {platformLabels[selected.platform].name}
                </Badge>
                <Badge
                  variant="outline"
                  className={positionColors[selected.position] ?? ""}
                >
                  {selected.position}
                </Badge>
                <Badge
                  variant="outline"
                  className={sentimentColors[selected.sentiment] ?? ""}
                >
                  {selected.sentiment}
                </Badge>
              </div>

              {/* Excerpt */}
              {selected.excerpt && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Bahsedilme (AI Yanitindan)
                  </p>
                  <p className="text-sm bg-primary/5 rounded-lg px-3 py-2 leading-relaxed border border-primary/10">
                    {selected.excerpt}
                  </p>
                </div>
              )}

              {/* Citations */}
              {selected.citations.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Kaynak URL&apos;ler ({selected.citations.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {selected.citations.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                      >
                        <ExternalLinkIcon className="size-3 shrink-0" />
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
