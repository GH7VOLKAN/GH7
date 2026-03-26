"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Building, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import type {
  CompetitorRowData,
  CompetitorDetailData,
  CompetitorDeepDetail,
  CompetitorPromptAppearance,
  EmptyAreaOpportunity,
} from "@/lib/dal/competitors";
import type { PlatformKey } from "@/lib/types";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ShareOfVoiceEntry {
  name: string;
  isUser: boolean;
  percentage: number;
  color: string;
}

interface RakiplerContentProps {
  rows: CompetitorRowData[];
  detail: CompetitorDetailData | null;
  shareOfVoice: ShareOfVoiceEntry[];
  emptyAreaOpportunities: EmptyAreaOpportunity[];
  userName: string;
  brandId: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "AI Overview",
};

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10A37F",
  gemini: "#8B5CF6",
  perplexity: "#22D3EE",
  google_aio: "#4285F4",
  claude: "#D97706",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RakiplerContent({
  rows,
  detail,
  shareOfVoice,
  emptyAreaOpportunities,
  userName,
  brandId,
}: RakiplerContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Selected competitor for detail dialog
  const [selectedComp, setSelectedComp] = useState<CompetitorRowData | null>(
    null,
  );
  const [deepDetail, setDeepDetail] = useState<CompetitorDeepDetail | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add competitor dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDomain, setAddDomain] = useState("");
  const [adding, setAdding] = useState(false);

  const competitorRows = rows.filter((r) => !r.isUser);
  const userRow = rows.find((r) => r.isUser);

  // Fetch deep detail when selecting a competitor
  async function handleSelectCompetitor(comp: CompetitorRowData) {
    setSelectedComp(comp);
    setDeepDetail(null);
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `/api/panel/competitors/detail?brandId=${brandId}&name=${encodeURIComponent(comp.name)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setDeepDetail(data);
      }
    } catch {
      // Silently fail — user still sees basic info
    } finally {
      setLoadingDetail(false);
    }
  }

  // Add competitor
  async function handleAddCompetitor() {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/panel/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), domain: addDomain.trim() }),
      });
      if (res.ok) {
        setAddName("");
        setAddDomain("");
        setAddOpen(false);
        startTransition(() => router.refresh());
      }
    } catch {
      // handle error silently
    } finally {
      setAdding(false);
    }
  }

  if (competitorRows.length === 0 && !userRow) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Building}
          title="Rakip analizi için tarama başlatın"
          description="Rakiplerinizi ekleyin ve AI görünürlük karşılaştırması yapın."
          action={
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-1.5 size-4" />
              Rakip Ekle
            </Button>
          }
        />
        <AddCompetitorDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          name={addName}
          setName={setAddName}
          domain={addDomain}
          setDomain={setAddDomain}
          adding={adding}
          onAdd={handleAddCompetitor}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rakipler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI yanıtlarından otomatik tespit edilen rakipleriniz
          </p>
        </div>
        <Button
          className="bg-black text-white hover:bg-black/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="mr-1.5 size-4" />
          Rakip Ekle
        </Button>
      </div>

      {/* Share of Voice bar */}
      {shareOfVoice.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-700">Ses Payı</h2>
          <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
            {shareOfVoice.map((entry) => (
              <div
                key={entry.name}
                style={{
                  width: `${entry.percentage}%`,
                  background: entry.color,
                }}
                className="h-full transition-all"
                title={`${entry.name}: %${entry.percentage}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {shareOfVoice.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ background: entry.color }}
                />
                <span
                  className={
                    entry.isUser
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {entry.name} %{entry.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitorRows.map((comp) => (
          <button
            key={comp.id}
            type="button"
            onClick={() => handleSelectCompetitor(comp)}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 text-left transition hover:shadow-sm"
          >
            {/* Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
              {comp.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {comp.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {comp.domain || "domain yok"}
              </p>

              {/* Per-platform breakdown */}
              <div className="mt-2 flex items-center gap-1.5">
                {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map(
                  (platform) => {
                    const score = comp.platforms[platform] ?? 0;
                    return (
                      <span
                        key={platform}
                        className="inline-block size-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            score > 0
                              ? PLATFORM_COLORS[platform]
                              : "#e5e5e5",
                        }}
                        title={`${PLATFORM_LABELS[platform]}: %${score}`}
                      />
                    );
                  },
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Skor{" "}
                  <span className="font-medium text-foreground">
                    %{comp.mentionScore}
                  </span>
                </span>
                {comp.source === "ai_discovered" && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                    AI
                  </span>
                )}
              </div>

              {/* Mention score progress bar */}
              <Progress
                value={Math.min(comp.mentionScore, 100)}
                className="mt-2 w-full [&_[data-slot=progress-track]]:h-1.5"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Empty Area Opportunities */}
      {emptyAreaOpportunities.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-medium text-gray-700">
            Boş Alanlar
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Kimsenin domine edemediği sorular - fırsat alanınız
          </p>
          <div className="space-y-2">
            {emptyAreaOpportunities.map((opp, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-gray-100 p-3"
              >
                <div className="flex gap-1 shrink-0 pt-0.5">
                  {opp.platforms.slice(0, 4).map((p) => (
                    <span
                      key={p}
                      className="inline-block size-2 rounded-full"
                      style={{
                        backgroundColor: PLATFORM_COLORS[p] ?? "#999",
                      }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {opp.promptText}
                  </p>
                  {opp.topMention && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Tek bahsedilen: {opp.topMention}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Detail Dialog */}
      <Dialog
        open={!!selectedComp}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedComp(null);
            setDeepDetail(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {userName} vs {selectedComp?.name}
            </DialogTitle>
            <DialogDescription>
              Prompt bazlı karşılaştırma ve kaynak analizi
            </DialogDescription>
          </DialogHeader>

          {selectedComp && (
            <div className="space-y-6">
              {/* Summary badges */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {userName}: %{userRow?.mentionScore ?? 0}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {selectedComp.name}: %{selectedComp.mentionScore}
                </span>
              </div>

              {/* Platform comparison */}
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  Platform Bazlı Skor
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map(
                    (platform) => {
                      const userScore = userRow?.platforms[platform] ?? 0;
                      const compScore =
                        selectedComp.platforms[platform] ?? 0;
                      return (
                        <div
                          key={platform}
                          className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                        >
                          <span className="text-xs font-medium">
                            {PLATFORM_LABELS[platform]}
                          </span>
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className={
                                userScore >= compScore
                                  ? "font-semibold text-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              %{userScore}
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span
                              className={
                                compScore > userScore
                                  ? "font-semibold text-red-600"
                                  : "text-muted-foreground"
                              }
                            >
                              %{compScore}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Deep detail: prompt appearances */}
              {loadingDetail && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {deepDetail && deepDetail.promptAppearances.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-medium">
                    Prompt Bazlı Görünürlük
                  </h3>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
                    {deepDetail.promptAppearances.map((pa, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-foreground line-clamp-2">
                            {pa.promptText}
                          </p>
                          <span
                            className="shrink-0 inline-block size-2 rounded-full mt-1"
                            style={{
                              backgroundColor:
                                PLATFORM_COLORS[pa.platform] ?? "#999",
                            }}
                            title={PLATFORM_LABELS[pa.platform] ?? pa.platform}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                          {pa.excerpt}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          {pa.userMentionedToo ? (
                            <span className="text-[10px] font-medium text-green-600">
                              Siz de bahsedildiniz
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-red-500">
                              Siz bahsedilmediniz
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared and competitor-only sources */}
              {deepDetail &&
                (deepDetail.sharedSources.length > 0 ||
                  deepDetail.competitorOnlySources.length > 0) && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium">
                      Kaynak Karşılaştırması
                    </h3>
                    {deepDetail.sharedSources.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Ortak kaynaklar:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {deepDetail.sharedSources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {deepDetail.competitorOnlySources.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">
                          Sadece {selectedComp.name}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {deepDetail.competitorOnlySources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Competitor Dialog */}
      <AddCompetitorDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        name={addName}
        setName={setAddName}
        domain={addDomain}
        setDomain={setAddDomain}
        adding={adding}
        onAdd={handleAddCompetitor}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Competitor Dialog
// ---------------------------------------------------------------------------

function AddCompetitorDialog({
  open,
  onOpenChange,
  name,
  setName,
  domain,
  setDomain,
  adding,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  adding: boolean;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rakip Ekle</DialogTitle>
          <DialogDescription>
            Takip etmek istediginiz rakibin bilgilerini girin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Rakip Adı *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ornek: Rakip Marka"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Domain (opsiyonel)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="ornek.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-black/90"
            onClick={onAdd}
            disabled={adding || !name.trim()}
          >
            {adding ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 size-4" />
            )}
            {adding ? "Ekleniyor..." : "Rakip Ekle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
