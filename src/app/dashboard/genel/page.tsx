"use client";

import {
  dualScores,
  visibilityData,
  recentMentions,
  priorityActions,
  nextScanIn,
} from "@/lib/mock-data/overview";
import { platformLabels } from "@/lib/types";
import { getScoreColor, formatTrend } from "@/lib/utils";

const platforms = ["chatgpt", "claude", "gemini", "perplexity"] as const;

const sentimentClass: Record<string, string> = {
  pozitif: "text-score-high",
  nötr: "text-muted-foreground",
  negatif: "text-score-low",
};

export default function GenelPage() {
  return (
    <div className="space-y-6">
      {/* ── 1. Header Card ────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          GENEL BAKIŞ
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sonraki tarama:{" "}
          <span className="font-semibold text-foreground">{nextScanIn}</span>
        </p>
      </div>

      {/* ── 2. Dual Score Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {/* AI Bahsedilme */}
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {dualScores.mention.label}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span
              className={`text-4xl font-black tracking-[-0.05em] leading-none ${getScoreColor(
                dualScores.mention.score
              )}`}
            >
              {dualScores.mention.score}
            </span>
            <span className="mb-0.5 text-lg font-medium text-muted-foreground leading-none">
              /100
            </span>
            <span
              className={`mb-0.5 text-sm font-bold leading-none ${
                dualScores.mention.trend >= 0
                  ? "text-score-high"
                  : "text-score-low"
              }`}
            >
              {dualScores.mention.trend >= 0 ? "↑" : "↓"}{" "}
              {formatTrend(dualScores.mention.trend)}
            </span>
          </div>
        </div>

        {/* Site Hazırlık */}
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {dualScores.readiness.label}
          </p>
          <div className="mt-3 flex items-end gap-3">
            <span
              className={`text-4xl font-black tracking-[-0.05em] leading-none ${getScoreColor(
                dualScores.readiness.score
              )}`}
            >
              {dualScores.readiness.score}
            </span>
            <span className="mb-0.5 text-lg font-medium text-muted-foreground leading-none">
              /100
            </span>
            <span
              className={`mb-0.5 text-sm font-bold leading-none ${
                dualScores.readiness.trend >= 0
                  ? "text-score-high"
                  : "text-score-low"
              }`}
            >
              {dualScores.readiness.trend >= 0 ? "↑" : "↓"}{" "}
              {formatTrend(dualScores.readiness.trend)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Visibility Table ────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Görünürlük Karşılaştırması
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Marka
                </th>
                {platforms.map((p) => (
                  <th
                    key={p}
                    className="pb-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {platformLabels[p].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibilityData.map((row) => (
                <tr key={row.name}>
                  <td
                    className={`py-3 pr-4 ${
                      row.isUser ? "font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {row.name}
                    {row.isUser && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        siz
                      </span>
                    )}
                  </td>
                  {platforms.map((p) => (
                    <td
                      key={p}
                      className={`py-3 text-right font-black tracking-[-0.04em] ${getScoreColor(
                        row.platforms[p]
                      )}`}
                    >
                      {row.platforms[p]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Recent Mentions ─────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Son AI Bahsedilmeleri
        </h3>
        <div className="mt-4 divide-y divide-border">
          {recentMentions.map((mention, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.1em]">
                  {platformLabels[mention.platform].name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mention.timeAgo}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {mention.position}
                </span>
                <span
                  className={`ml-auto text-xs font-bold ${
                    sentimentClass[mention.sentiment] ??
                    "text-muted-foreground"
                  }`}
                >
                  {mention.sentiment}
                </span>
              </div>
              {/* Prompt */}
              <p className="mt-1.5 text-sm font-medium tracking-[-0.02em]">
                "{mention.prompt}"
              </p>
              {/* Excerpt */}
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {mention.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Priority Actions ────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Öncelikli Aksiyonlar
        </h3>
        <div className="mt-4 divide-y divide-border">
          {priorityActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{action.title}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {action.impact}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
