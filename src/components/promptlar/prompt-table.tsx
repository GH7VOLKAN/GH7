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
import {
  Trash2Icon,
  PlusIcon,
  SparklesIcon,
  DatabaseIcon,
  SearchIcon,
  UserIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TagIcon,
  ChevronDownIcon,
} from "lucide-react";
import { platformLabels, type PlatformKey, type Sentiment } from "@/lib/types";
import { addCustomPrompt, deletePrompt } from "@/lib/actions";
import type { PlatformResult } from "@/lib/dal/prompts";

// ── Strip markdown from text ────────────────────────
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\[(\d+)\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/---+/g, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

const sourceLabels: Record<string, { label: string; color: string; icon: typeof SparklesIcon }> = {
  ai_generated: {
    label: "Otomatik",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    icon: SparklesIcon,
  },
  dataforseo: {
    label: "DataForSEO",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: DatabaseIcon,
  },
  sonar: {
    label: "Perplexity Sonar",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    icon: SearchIcon,
  },
  manual: {
    label: "Manuel",
    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    icon: UserIcon,
  },
  user_added: {
    label: "Manuel",
    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
    icon: UserIcon,
  },
};

const categoryLabels: Record<string, string> = {
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

const sentimentColors: Record<Sentiment, string> = {
  pozitif: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "nötr": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  negatif: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const positionColors: Record<string, string> = {
  "1. sıra": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "2. sıra": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "3. sıra": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bahsediliyor": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

interface PromptItem {
  id: string;
  text: string;
  tags: string[];
  source: string;
  category: string | null;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<PromptItem | null>(null);

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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aktif Sorular</CardTitle>
          <CardDescription>
            Takip edilen {promptItems.length} soru — satira tiklayarak detaylari ve yapay zekalardaki sonuclari gorun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Yeni soru yazin..."
              className="flex-1 rounded-xl border-[1.5px] border-border bg-background px-4 py-2 text-sm focus:border-foreground focus:outline-none transition-colors"
            />
            <Button
              onClick={handleAdd}
              disabled={isPending || !newText.trim()}
              size="sm"
            >
              <PlusIcon className="mr-1 size-4" />
              Ekle
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Soru</TableHead>
                  <TableHead className="hidden sm:table-cell">Kaynak</TableHead>
                  <TableHead>Gorunurluk</TableHead>
                  <TableHead className="hidden md:table-cell">Yapay Zekalar</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {promptItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${deletingId === item.id ? "opacity-30" : ""}`}
                    onClick={() => setSelected(item)}
                  >
                    <TableCell className="max-w-[350px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm line-clamp-2">
                          {item.text}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                              {categoryLabels[item.category] ?? item.category}
                            </Badge>
                          )}
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <SourceBadge source={item.source} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <span className="font-semibold tabular-nums">
                          %{item.visibility}
                        </span>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.visibility >= 75
                                ? "bg-emerald-500"
                                : item.visibility >= 50
                                  ? "bg-primary"
                                  : item.visibility >= 25
                                    ? "bg-amber-500"
                                    : "bg-red-400"
                            }`}
                            style={{ width: `${item.visibility}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1.5">
                        {PLATFORMS.map((p) => (
                          <span
                            key={p}
                            title={`${platformLabels[p].name}: ${item.modelResults[p] ? "Bahsedildi" : "Bahsedilmedi"}`}
                            className={`inline-flex items-center justify-center size-6 rounded-md text-xs font-medium ${
                              item.modelResults[p]
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {platformLabels[p].name[0]}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={isPending}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {promptItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Henuz soru yok. Yukaridan soru ekleyin veya tarama baslatin.
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
              <TagIcon className="size-4 text-muted-foreground" />
              Soru Detayi
            </DialogTitle>
            <DialogDescription>
              Bu soru hakkinda detayli bilgi ve yapay zeka platformlarindaki sonuclar
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-5">
              {/* Soru text */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Soru
                </p>
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    &ldquo;{selected.text}&rdquo;
                  </p>
                </div>
              </div>

              {/* Metadata badges */}
              <div className="flex flex-wrap gap-1.5">
                <SourceBadge source={selected.source} />
                {selected.category && (
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[selected.category] ?? selected.category}
                  </Badge>
                )}
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Visibility summary */}
              <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">Görünürlük:</span>
                <span className="text-xl font-bold tabular-nums">%{selected.visibility}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      selected.visibility >= 75
                        ? "bg-emerald-500"
                        : selected.visibility >= 50
                          ? "bg-primary"
                          : selected.visibility >= 25
                            ? "bg-amber-500"
                            : "bg-red-400"
                    }`}
                    style={{ width: `${selected.visibility}%` }}
                  />
                </div>
              </div>

              {/* Per-platform results */}
              <div>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Yapay Zeka Sonuclari
                </p>
                <div className="flex flex-col gap-2">
                  {PLATFORMS.map((platform) => {
                    const result = selected.platformResults.find(
                      (r) => r.platform === platform,
                    );
                    return (
                      <PlatformResultRow
                        key={platform}
                        platform={platform}
                        result={result ?? null}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Citations from all platforms */}
              {(() => {
                const allCitations = selected.platformResults
                  .flatMap((r) => r.citations)
                  .filter((url, i, arr) => arr.indexOf(url) === i);
                if (allCitations.length === 0) return null;

                // Extract domain for cleaner display
                const citationsWithDomain = allCitations.map((url) => {
                  try {
                    return { url, domain: new URL(url).hostname.replace("www.", "") };
                  } catch {
                    return { url, domain: url };
                  }
                });

                return (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Kaynaklar ({allCitations.length})
                    </p>
                    <div className="flex flex-col gap-1">
                      {citationsWithDomain.map((c, i) => (
                        <a
                          key={i}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-muted/50"
                        >
                          <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <span className="truncate text-muted-foreground group-hover:text-primary">
                            {c.domain}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SourceBadge({ source }: { source: string }) {
  const config = sourceLabels[source] ?? sourceLabels.ai_generated;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`gap-1 ${config.color}`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function PlatformResultRow({
  platform,
  result,
}: {
  platform: PlatformKey;
  result: PlatformResult | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const mentioned = result?.mentioned ?? false;
  const hasFullResponse = !!(result?.fullResponse && result.fullResponse.length > 0);

  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-all ${
        mentioned
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10"
          : "border-border bg-muted/20"
      }`}
    >
      {/* Header: icon + platform name + status */}
      <div className="flex items-center gap-2.5">
        {mentioned ? (
          <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircleIcon className="size-4 shrink-0 text-muted-foreground/50" />
        )}
        <span className="text-sm font-semibold">{platformLabels[platform].name}</span>

        {mentioned && result ? (
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {result.position && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${positionColors[result.position] ?? ""}`}
              >
                {result.position}
              </span>
            )}
            {result.sentiment && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sentimentColors[result.sentiment] ?? ""}`}
              >
                {result.sentiment}
              </span>
            )}
          </div>
        ) : (
          <span className="ml-auto text-[11px] text-muted-foreground/60">
            Bahsedilmedi
          </span>
        )}
      </div>

      {/* AI Response */}
      {mentioned && (result?.excerpt || result?.fullResponse) && (
        <div className="mt-2">
          <p className={`text-xs leading-relaxed text-foreground/60 ${expanded ? "" : "line-clamp-3"}`}>
            &ldquo;
            {expanded
              ? stripMarkdown(result.fullResponse || result.excerpt || "")
              : stripMarkdown(result.excerpt || "").slice(0, 200) +
                ((result.excerpt?.length ?? 0) > 200 ? "..." : "")}
            &rdquo;
          </p>

          {/* Expand/Collapse toggle */}
          {hasFullResponse && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDownIcon
                className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
              {expanded ? "Kisalt" : "Tam yaniti gor"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
