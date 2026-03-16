"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExternalLinkIcon,
  SparklesIcon,
  UserIcon,
  PackageIcon,
  GlobeIcon,
  ZapIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  LightbulbIcon,
  Loader2Icon,
  TrendingUpIcon,
} from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { getCompetitorAnalysis } from "@/lib/actions";
import type { CompetitorAnalysis } from "@/lib/ai/competitor-analyzer";

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
  brandId?: string;
  onClose: () => void;
}

export function CompetitorDetailDialog({
  competitor,
  userRow,
  brandId,
  onClose,
}: CompetitorDetailDialogProps) {
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!competitor) return null;

  const isCompetitorAhead =
    userRow && competitor.mentionScore > userRow.mentionScore;

  async function handleAnalyze() {
    if (!brandId || !competitor) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const result = await getCompetitorAnalysis(brandId, competitor.id);
      setAnalysis(result);
    } catch (err) {
      console.error("[competitor-detail] Analysis failed:", err);
      setAnalysisError("Analiz yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  function handleClose() {
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
    onClose();
  }

  return (
    <Dialog open={!!competitor} onOpenChange={(open) => !open && handleClose()}>
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

          {/* ─── "Neden Önde?" Section ─────────────────── */}
          {isCompetitorAhead && brandId && (
            <div className="flex flex-col gap-3">
              {!analysis && !analysisLoading && !analysisError && (
                <Button
                  onClick={handleAnalyze}
                  variant="outline"
                  className="w-full gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                >
                  <ZapIcon className="size-4" />
                  Neden Önde? — Yapay Zeka Analizi
                </Button>
              )}

              {analysisLoading && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                  <Loader2Icon className="size-4 animate-spin text-amber-600" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    Rakip analiz ediliyor...
                  </span>
                </div>
              )}

              {analysisError && (
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-800 dark:bg-red-950/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {analysisError}
                  </p>
                  <Button
                    onClick={handleAnalyze}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-red-600 hover:text-red-700"
                  >
                    Tekrar Dene
                  </Button>
                </div>
              )}

              {analysis && (
                <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800 dark:bg-amber-950/10">
                  <div className="flex items-center gap-2 mb-1">
                    <ZapIcon className="size-4 text-amber-600" />
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      Neden Önde?
                    </h4>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {analysis.summary}
                  </p>

                  {/* Strengths */}
                  {analysis.strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <ShieldCheckIcon className="size-3 text-emerald-500" />
                        Güçlü Yanları
                      </p>
                      <ul className="flex flex-col gap-1">
                        {analysis.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="text-sm bg-emerald-50 dark:bg-emerald-950/20 rounded-md px-3 py-1.5 border border-emerald-100 dark:border-emerald-900/30"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {analysis.weaknesses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <ShieldAlertIcon className="size-3 text-orange-500" />
                        Zayıf Noktaları
                      </p>
                      <ul className="flex flex-col gap-1">
                        {analysis.weaknesses.map((w, i) => (
                          <li
                            key={i}
                            className="text-sm bg-orange-50 dark:bg-orange-950/20 rounded-md px-3 py-1.5 border border-orange-100 dark:border-orange-900/30"
                          >
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <LightbulbIcon className="size-3 text-blue-500" />
                        Size Öneriler
                      </p>
                      <ul className="flex flex-col gap-1">
                        {analysis.recommendations.map((r, i) => (
                          <li
                            key={i}
                            className="text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md px-3 py-1.5 border border-blue-100 dark:border-blue-900/30 flex items-start gap-2"
                          >
                            <TrendingUpIcon className="size-3 shrink-0 mt-1 text-blue-500" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
