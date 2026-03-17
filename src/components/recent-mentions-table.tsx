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
import { PlatformBadge } from "@/components/platform-icon";
import { ExternalLinkIcon, QuoteIcon } from "lucide-react";
import type { RecentMention } from "@/lib/dal/overview";

interface RecentMentionsTableProps {
  recentMentions: RecentMention[];
  lastScanTimeAgo: string | null;
  totalMentionCount: number;
  totalResultCount: number;
}

const sentimentColors: Record<Sentiment, string> = {
  "pozitif": "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
  "nötr": "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
  "negatif": "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
};

const positionColors: Record<string, string> = {
  "1. sıra": "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400",
  "2. sıra": "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400",
  "3. sıra": "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400",
  "bahsediliyor": "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
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
      <Card className="border border-border/50 shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Yapay Zeka Sizi Tanıyor mu?</CardTitle>
              <CardDescription>
                {totalResultCount > 0
                  ? `${totalResultCount} sorunun ${totalMentionCount} tanesinde sizi öneriyor`
                  : "Yapay zekaların size verdiği son yanıtlar"}
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
          <div className="overflow-hidden rounded-xl border border-border/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50">
                  <TableHead>Yapay Zeka</TableHead>
                  <TableHead>Soru</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Pozisyon
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Duygu</TableHead>
                  <TableHead className="text-right">Zaman</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50">
                {recentMentions.map((mention) => (
                  <TableRow
                    key={mention.id}
                    className="cursor-pointer border-border/50 transition-colors hover:bg-muted/30 h-14"
                    onClick={() => setSelected(mention)}
                  >
                    <TableCell>
                      <PlatformBadge platform={mention.platform} size="sm" />
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium text-foreground">
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      Henüz veri yok. İlk taramanızı başlattıktan sonra yapay zekaların yanıtları burada görünecek.
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
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <QuoteIcon className="size-4 text-muted-foreground" />
              Bahsedilme Detayı
            </DialogTitle>
            <DialogDescription>
              {selected && platformLabels[selected.platform].name} yanıtı
              {selected?.scanDate && ` — ${selected.scanDate}`}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-4">
              {/* Prompt */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Sorulan Soru</p>
                <p className="text-sm bg-muted/30 rounded-xl px-3 py-2.5 italic text-foreground/80">
                  &ldquo;{selected.prompt}&rdquo;
                </p>
              </div>

              {/* Platform + Position + Sentiment */}
              <div className="flex flex-wrap gap-2">
                <PlatformBadge platform={selected.platform} size="sm" />
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
                    Bahsedilme (Yapay Zeka Yanıtından)
                  </p>
                  <p className="text-sm bg-muted/20 rounded-xl px-3 py-2.5 leading-relaxed border border-border/50 text-foreground/90">
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
                        className="flex items-center gap-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors truncate"
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
