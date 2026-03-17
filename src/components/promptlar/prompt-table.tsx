"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2Icon,
  PlusIcon,
  SparklesIcon,
  SearchIcon,
  UserIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TagIcon,
  ChevronDownIcon,
} from "lucide-react";
import { platformLabels, type PlatformKey, type Sentiment } from "@/lib/types";
import { PlatformIcon, PLATFORM_COLORS as PCOLORS } from "@/components/platform-icon";
import { addCustomPrompt, deletePrompt } from "@/lib/actions";
import type { PlatformResult } from "@/lib/dal/prompts";

// ── Strip markdown from text
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\[(\d+)\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/---+/g, "")
    .replace(/^\s*[-*+]\s+/gm, "\u2022 ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

const PLATFORM_COLORS: Record<PlatformKey, { bg: string; text: string; label: string }> = {
  chatgpt: { bg: PCOLORS.chatgpt.bg, text: PCOLORS.chatgpt.text, label: "GPT" },
  claude: { bg: PCOLORS.claude.bg, text: PCOLORS.claude.text, label: "C" },
  gemini: { bg: PCOLORS.gemini.bg, text: PCOLORS.gemini.text, label: "G" },
  perplexity: { bg: PCOLORS.perplexity.bg, text: PCOLORS.perplexity.text, label: "P" },
};

const INTENT_LABELS: Record<string, { label: string; color: string }> = {
  recommendation: { label: "Öneri", color: "border-border/60 bg-muted/30 text-foreground/70" },
  comparison: { label: "Karşılaştırma", color: "border-border/60 bg-muted/30 text-foreground/70" },
  indirect: { label: "Dolaylı", color: "border-border/60 bg-muted/30 text-foreground/70" },
};

const sentimentColors: Record<Sentiment, string> = {
  pozitif: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "nötr": "bg-muted text-muted-foreground",
  negatif: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const positionColors: Record<string, string> = {
  "1. sıra": "bg-foreground text-background",
  "2. sıra": "bg-foreground/80 text-background",
  "3. sıra": "bg-foreground/60 text-background",
  "bahsediliyor": "bg-muted text-muted-foreground",
};

interface PromptItem {
  id: string;
  text: string;
  tags: string[];
  source: string;
  category: string | null;
  businessArea: string | null;
  searchIntent: string | null;
  salesPotential: string | null;
  visibility: number;
  position: string;
  sentiment: Sentiment;
  topCompetitor: string;
  modelResults: Record<PlatformKey, boolean>;
  platformResults: PlatformResult[];
  createdAt: string;
}

interface PromptTableProps {
  promptItems: PromptItem[];
  brandId: string;
}

export function PromptTable({ promptItems, brandId }: PromptTableProps) {
  const [newText, setNewText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (!newText.trim()) return;
    startTransition(async () => {
      await addCustomPrompt(brandId, newText);
      setNewText("");
    });
  }

  function handleDelete(promptId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(promptId);
    startTransition(async () => {
      await deletePrompt(brandId, promptId);
      setDeletingId(null);
    });
  }

  return (
    <Card className="border border-border/50 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Aktif Sorular</CardTitle>
        <CardDescription>
          Takip edilen {promptItems.length} soru — karta tıklayarak detayları görün
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add prompt input */}
        <div className="mb-5 flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Yeni soru yazın..."
            className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm transition-colors focus:border-foreground focus:outline-none"
          />
          <Button
            onClick={handleAdd}
            disabled={isPending || !newText.trim()}
            size="sm"
            className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
          >
            <PlusIcon className="mr-1 size-4" />
            Ekle
          </Button>
        </div>

        {/* Prompt cards */}
        <div className="space-y-3">
          {promptItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const mentionedCount = PLATFORMS.filter((p) => item.modelResults[p]).length;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  deletingId === item.id ? "opacity-30" : ""
                } ${isExpanded ? "border-foreground/15 shadow-sm" : "border-border/50 hover:border-border"}`}
              >
                {/* Card header — clickable */}
                <div
                  className="cursor-pointer p-4"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  {/* Prompt text */}
                  <p className="text-sm font-medium leading-relaxed pr-8">
                    &ldquo;{item.text}&rdquo;
                  </p>

                  {/* Tags row: businessArea + searchIntent */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {item.businessArea && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-border/60 bg-muted/20">
                        {item.businessArea}
                      </Badge>
                    )}
                    {item.searchIntent && INTENT_LABELS[item.searchIntent] && (
                      <Badge variant="outline" className={`text-[10px] ${INTENT_LABELS[item.searchIntent].color}`}>
                        {INTENT_LABELS[item.searchIntent].label}
                      </Badge>
                    )}
                    {item.salesPotential && (
                      <Badge variant="outline" className={`text-[10px] border-border/60 ${
                        item.salesPotential === "HIGH"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : item.salesPotential === "MEDIUM"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-muted/20 text-muted-foreground"
                      }`}>
                        {item.salesPotential === "HIGH" ? "Yüksek Potansiyel" : item.salesPotential === "MEDIUM" ? "Orta Potansiyel" : "Düşük"}
                      </Badge>
                    )}
                  </div>

                  {/* Platform icons — logo + check/cross */}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {PLATFORMS.map((p) => {
                        const mentioned = item.modelResults[p];
                        return (
                          <span
                            key={p}
                            title={`${platformLabels[p].name}: ${mentioned ? "Bahsetti" : "Bahsetmedi"}`}
                            className={`inline-flex items-center justify-center size-7 rounded-lg transition-colors ${
                              mentioned
                                ? "bg-foreground/5 border border-foreground/10"
                                : "bg-muted/40 opacity-40"
                            }`}
                          >
                            <PlatformIcon platform={p} size={14} />
                          </span>
                        );
                      })}
                    </div>

                    {/* Mention rate */}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {mentionedCount}/4 platformda
                    </span>
                  </div>

                  {/* Senin yerine: satır */}
                  {item.topCompetitor !== "—" && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">Senin yerine:</span>
                      <span>{item.topCompetitor}</span>
                    </div>
                  )}

                  {/* Expand arrow + delete */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                      <ChevronDownIcon className={`size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      {isExpanded ? "Kapat" : "Detay"}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={isPending}
                    >
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Expanded: AI yanıtları */}
                {isExpanded && (
                  <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Yapay Zeka Yanıtları
                    </p>
                    {PLATFORMS.map((platform) => {
                      const result = item.platformResults.find((r) => r.platform === platform);
                      return (
                        <PlatformResponseCard
                          key={platform}
                          platform={platform}
                          result={result ?? null}
                        />
                      );
                    })}

                    {/* Citations */}
                    {(() => {
                      const allCitations = item.platformResults
                        .flatMap((r) => r.citations)
                        .filter((url, i, arr) => arr.indexOf(url) === i);
                      if (allCitations.length === 0) return null;
                      return (
                        <div className="mt-2">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Kaynaklar ({allCitations.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {allCitations.slice(0, 6).map((url, i) => {
                              let domain = url;
                              try { domain = new URL(url).hostname.replace("www.", ""); } catch {}
                              return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-border transition-colors">
                                  <ExternalLinkIcon className="size-2.5" />
                                  {domain}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}

          {promptItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <TagIcon className="size-8 mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium">Henüz soru yok</p>
              <p className="text-xs mt-1">Yukarıdan soru ekleyin veya tarama başlatın</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PlatformResponseCard({
  platform,
  result,
}: {
  platform: PlatformKey;
  result: PlatformResult | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const mentioned = result?.mentioned ?? false;
  const colors = PCOLORS[platform];
  const hasFullResponse = !!(result?.fullResponse && result.fullResponse.length > 0);

  return (
    <div className={`rounded-xl border px-3 py-2.5 transition-all ${
      mentioned
        ? `${colors.border} ${colors.bg}`
        : "border-transparent bg-muted/30"
    }`}>
      <div className="flex items-center gap-2">
        <PlatformIcon platform={platform} size={16} />
        <span className="text-xs font-semibold">{platformLabels[platform].name}</span>

        {mentioned && result ? (
          <div className="ml-auto flex items-center gap-1.5">
            {result.position && (
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${positionColors[result.position] ?? "bg-muted text-muted-foreground"}`}>
                {result.position}
              </span>
            )}
            {result.sentiment && (
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${sentimentColors[result.sentiment] ?? ""}`}>
                {result.sentiment}
              </span>
            )}
          </div>
        ) : (
          <span className="ml-auto text-[10px] text-muted-foreground/50">Bahsetmedi</span>
        )}
      </div>

      {mentioned && (result?.excerpt || result?.fullResponse) && (
        <div className="mt-1.5">
          <p className={`text-[11px] leading-relaxed text-foreground/60 ${expanded ? "" : "line-clamp-2"}`}>
            {expanded
              ? stripMarkdown(result.fullResponse || result.excerpt || "")
              : stripMarkdown(result.excerpt || "").slice(0, 150) +
                ((result.excerpt?.length ?? 0) > 150 ? "..." : "")}
          </p>
          {hasFullResponse && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "Kısalt" : "Tam yanıt"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
