"use client";

import {
  promptItems,
  suggestedPrompts,
  promptStats,
  PromptItem,
} from "@/lib/mock-data/prompts";
import { platformLabels, PlatformKey } from "@/lib/types";
import { getScoreColor } from "@/lib/utils";

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

function SentimentBadge({
  sentiment,
}: {
  sentiment: PromptItem["sentiment"];
}) {
  if (!sentiment) return <span className="text-sm text-muted-foreground">—</span>;

  const colorMap = {
    pozitif: "text-score-high",
    nötr: "text-muted-foreground",
    negatif: "text-score-low",
  };

  return (
    <span className={`text-xs font-medium ${colorMap[sentiment]}`}>
      {sentiment}
    </span>
  );
}

function VolumeDots({ volume }: { volume: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < volume ? "bg-foreground" : "bg-border"
          }`}
        />
      ))}
    </span>
  );
}

function ModelResultsRow({ item }: { item: PromptItem }) {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
      {PLATFORMS.map((platform) => {
        const result = item.modelResults.find((r) => r.platform === platform);
        const mentioned = result?.mentioned ?? false;
        return (
          <div key={platform} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {platformLabels[platform].name}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-bold ${
                  mentioned ? "text-score-high" : "text-score-low"
                }`}
              >
                {mentioned ? "✓" : "✗"}
              </span>
              {result?.position && (
                <span className="text-[11px] text-muted-foreground">
                  {result.position}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PromptCard({ item }: { item: PromptItem }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-5">
      {/* Top row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: text + tags */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold tracking-[-0.02em] leading-snug">
            {item.text}
          </p>
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: metrics */}
        <div className="flex shrink-0 items-start gap-6">
          {/* Visibility */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Görünürlük
            </span>
            <span
              className={`text-xl font-light tracking-[-0.04em] ${getScoreColor(
                item.visibility
              )}`}
            >
              %{item.visibility}
            </span>
          </div>

          {/* Position */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Pozisyon
            </span>
            <span className="text-xl font-light tracking-[-0.04em]">
              {item.position ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle row: sentiment + competitor */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">Duygu:</span>
          <SentimentBadge sentiment={item.sentiment} />
        </div>
        {item.topCompetitor && (
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Rakip:</span>
            <span className="text-xs">{item.topCompetitor}</span>
          </div>
        )}
      </div>

      {/* Per-model results */}
      <ModelResultsRow item={item} />
    </div>
  );
}

export default function PromptlarPage() {
  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          PROMPTLAR
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Prompt Görünürlüğü
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {promptStats.active} aktif · {promptStats.suggested} önerilen
        </p>

        {/* Platform legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          {PLATFORMS.map((platform) => (
            <div key={platform} className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {platformLabels[platform].name}
              </span>
              <span className="text-xs text-score-high font-bold">✓</span>
              <span className="text-[10px] text-muted-foreground">bahsedildi</span>
              <span className="text-xs text-score-low font-bold">✗</span>
              <span className="text-[10px] text-muted-foreground">bahsedilmedi</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt list */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium tracking-[-0.04em] uppercase text-muted-foreground px-1">
          Aktif Promptlar
        </h2>
        {promptItems.map((item) => (
          <PromptCard key={item.id} item={item} />
        ))}
      </div>

      {/* Suggested prompts */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Önerilen Promptlar
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu promptları içeriğinize ekleyerek görünürlüğünüzü artırabilirsiniz.
        </p>

        <div className="mt-4 space-y-3">
          {suggestedPrompts.map((prompt, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
            >
              <span className="text-sm">{prompt.text}</span>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Hacim
                </span>
                <VolumeDots volume={prompt.volume} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
