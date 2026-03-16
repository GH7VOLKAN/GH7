"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLinkIcon,
  CheckCircle2Icon,
  XCircleIcon,
  SparklesIcon,
  UserIcon,
  PackageIcon,
  GlobeIcon,
} from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  isUser: boolean;
  mentionScore: number;
  readinessScore: number;
  platforms: Record<PlatformKey, number>;
  reason: string | null;
  products: string[];
  relevance: string;
  source: string;
}

interface CompetitorDetailDialogProps {
  competitor: CompetitorRow | null;
  userRow: CompetitorRow | null;
  onClose: () => void;
}

export function CompetitorDetailDialog({
  competitor,
  userRow,
  onClose,
}: CompetitorDetailDialogProps) {
  if (!competitor) return null;

  return (
    <Dialog open={!!competitor} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {competitor.name}
            {competitor.domain && (
              <a
                href={`https://${competitor.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLinkIcon className="size-4" />
              </a>
            )}
          </DialogTitle>
          <DialogDescription>
            Rakip detayları ve yapay zekalardaki karşılaştırma
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Source & Relevance badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={
                competitor.source === "ai_discovered"
                  ? "gap-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  : "gap-1"
              }
            >
              {competitor.source === "ai_discovered" ? (
                <SparklesIcon className="size-3" />
              ) : (
                <UserIcon className="size-3" />
              )}
              {competitor.source === "ai_discovered" ? "Otomatik Kesfedildi" : "Manuel Eklendi"}
            </Badge>
            <Badge
              variant="outline"
              className={
                competitor.relevance === "direct"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }
            >
              {competitor.relevance === "direct" ? "Doğrudan Rakip" : "Dolaylı Rakip"}
            </Badge>
          </div>

          {/* Why this is a competitor */}
          {competitor.reason && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Neden Rakip?</p>
              <p className="text-sm bg-muted/50 rounded-lg px-3 py-2">
                {competitor.reason}
              </p>
            </div>
          )}

          {/* Products */}
          {competitor.products.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <PackageIcon className="size-3" />
                Ürünler / Hizmetler
              </p>
              <div className="flex flex-wrap gap-1.5">
                {competitor.products.map((product, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Platform comparison: competitor vs user */}
          {userRow && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Yapay Zeka Karsilastirma
              </p>
              <div className="flex flex-col gap-2">
                {PLATFORMS.map((platform) => {
                  const compScore = competitor.platforms[platform];
                  const userScore = userRow.platforms[platform];
                  const diff = userScore - compScore;

                  return (
                    <div
                      key={platform}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2"
                    >
                      <span className="text-xs font-medium w-20 shrink-0">
                        {platformLabels[platform].name}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        {/* User bar */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-muted-foreground">Siz</span>
                            <span className="text-[10px] font-medium">%{userScore}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${userScore}%` }}
                            />
                          </div>
                        </div>
                        {/* Competitor bar */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-muted-foreground">{competitor.name.split(" ")[0]}</span>
                            <span className="text-[10px] font-medium">%{compScore}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${compScore > userScore ? "bg-red-400" : "bg-zinc-300"}`}
                              style={{ width: `${compScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Diff badge */}
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 shrink-0 ${
                          diff > 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : diff < 0
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Overall score comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border bg-primary/5 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {userRow?.name ?? "Siz"}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {userRow?.mentionScore ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Bahsedilme Skoru</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {competitor.name}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {competitor.mentionScore}
              </p>
              <p className="text-[10px] text-muted-foreground">Bahsedilme Skoru</p>
            </div>
          </div>

          {/* Domain link */}
          {competitor.domain && (
            <a
              href={`https://${competitor.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <GlobeIcon className="size-4" />
              {competitor.domain}
              <ExternalLinkIcon className="size-3" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
