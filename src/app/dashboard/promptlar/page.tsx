"use client";

import {
  promptItems,
  suggestedPrompts,
  promptStats,
  PromptItem,
  ModelResult,
} from "@/lib/mock-data/prompts";
import { platformLabels, PlatformKey } from "@/lib/types";
import { ExpandCard } from "@/components/ui/expand-card";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

// ─── helpers ────────────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: PromptItem["sentiment"] }) {
  if (!sentiment) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-foreground">
      {sentiment}
    </span>
  );
}

function VolumeDots({ volume }: { volume: number }) {
  return (
    <span className="flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-[7px] w-[7px] rounded-full ${
            i < volume ? "bg-foreground" : "bg-border"
          }`}
        />
      ))}
    </span>
  );
}

// Mini sparkline: 7 values rendered as proportional bars
function TrendBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-[20px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[5px] rounded-sm bg-foreground/25"
          style={{ height: `${Math.round((v / max) * 20)}px` }}
        />
      ))}
    </div>
  );
}

// Per-platform badge counts for the header card
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

// ─── ExpandCard content builders ────────────────────────────────────────────

function PromptSummary({ item }: { item: PromptItem }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: prompt text (left) + metrics (right) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Prompt text + tags */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug tracking-[-0.02em]">
            &ldquo;{item.text}&rdquo;
          </p>
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visibility + Position */}
        <div className="flex shrink-0 items-start gap-5">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Görünürlük
            </span>
            <span className="text-2xl font-light tracking-[-0.05em] text-foreground">
              %{item.visibility}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Pozisyon
            </span>
            <span className="text-2xl font-light tracking-[-0.05em] text-foreground">
              {item.position ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: sentiment badge + competitor + chevron hint */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">Duygu:</span>
          <SentimentBadge sentiment={item.sentiment} />
        </div>
        {item.topCompetitor && (
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Rakip:</span>
            <span>{item.topCompetitor}</span>
          </div>
        )}
        <span className="ml-auto text-[10px] uppercase tracking-[0.14em]">
          detay ↓
        </span>
      </div>
    </div>
  );
}

function PromptDetail({ item }: { item: PromptItem }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Model results */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Model Sonuçları
        </p>
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
          {PLATFORMS.map((platform) => {
            const result: ModelResult | undefined = item.modelResults.find(
              (r) => r.platform === platform
            );
            const mentioned = result?.mentioned ?? false;
            return (
              <div
                key={platform}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
              >
                {/* check / cross */}
                <span
                  className={`mt-[1px] text-sm font-bold ${
                    mentioned ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {mentioned ? "✓" : "✗"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">
                      {platformLabels[platform].name}
                    </span>
                    {result?.position && (
                      <span className="text-[10px] text-muted-foreground">
                        {result.position}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {result?.sentiment && (
                      <span className="text-[10px] text-muted-foreground">
                        {result.sentiment}
                      </span>
                    )}
                    {result?.source && (
                      <span className="truncate text-[10px] text-muted-foreground">
                        {result.source}
                      </span>
                    )}
                    {!mentioned && (
                      <span className="text-[10px] text-muted-foreground">
                        bahsedilmedi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor visibility */}
      {item.competitorVisibility.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Rakip Görünürlüğü
          </p>
          <div className="flex flex-col gap-2">
            {item.competitorVisibility.map((comp) => (
              <div key={comp.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{comp.name}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{comp.avgPosition}</span>
                    <span className="font-bold text-foreground">
                      %{comp.visibility}
                    </span>
                  </div>
                </div>
                <div className="h-[3px] w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-foreground/25 transition-all duration-700"
                    style={{ width: `${comp.visibility}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          7 Günlük Trend
        </p>
        <div className="flex items-end gap-3">
          <TrendBars data={item.trendData} />
          <span className="text-[10px] text-muted-foreground">
            {item.trendData[0]}% → {item.trendData[item.trendData.length - 1]}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PromptlarPage() {
  const mentionCounts = platformMentionCounts();

  return (
    <div className="space-y-10 px-4 lg:px-6">
      {/* ── Header Card ── */}
      <div className="reveal rounded-xl border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          PROMPTLAR
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Prompt Görünürlüğü
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {promptStats.active} aktif · {promptStats.suggested} önerilen
        </p>

        {/* Platform mention summary badges */}
        <div className="mt-6 flex flex-wrap gap-[10px]">
          {PLATFORMS.map((platform) => (
            <div
              key={platform}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-2"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {platformLabels[platform].name}
              </span>
              <span className="text-xs font-bold text-foreground">
                {mentionCounts[platform]}
              </span>
              <span className="text-[10px] text-muted-foreground">atıf</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Prompts ── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          AKTİF PROMPTLAR
        </p>
        <div className="flex flex-col gap-[10px]">
          {promptItems.map((item) => (
            <div key={item.id} className="reveal">
              <ExpandCard
                summary={<PromptSummary item={item} />}
                detail={<PromptDetail item={item} />}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Suggested Prompts ── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          ÖNERİLEN PROMPTLAR
        </p>
        <div className="flex flex-col gap-[10px]">
          {suggestedPrompts.map((prompt, i) => (
            <div
              key={i}
              className="reveal flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
            >
              <span className="text-sm font-medium">{prompt.text}</span>
              <div className="flex shrink-0 items-center gap-3">
                <VolumeDots volume={prompt.volume} />
                <button className="rounded-md border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
                  Ekle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
