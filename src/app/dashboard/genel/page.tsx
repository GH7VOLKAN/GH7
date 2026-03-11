"use client";

import {
  dualScores,
  visibilityData,
  recentMentions,
  priorityActions,
  nextScanIn,
} from "@/lib/mock-data/overview";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { getScoreColor, formatTrend } from "@/lib/utils";
import { FlipCard } from "@/components/ui/flip-card";
import { ExpandCard } from "@/components/ui/expand-card";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

const sentimentClass: Record<string, string> = {
  pozitif: "text-score-high",
  nötr: "text-muted-foreground",
  negatif: "text-score-low",
};

function avg(vals: number[]): number {
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export default function GenelPage() {
  return (
    <div className="space-y-10">

      {/* ── 1. Dual Score Cards ──────────────────────────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          SKORLAR
        </p>

        {/* score-row handles mobile horizontal scroll */}
        <div className="score-row grid grid-cols-2 gap-[10px]">

          {/* AI Bahsedilme — flip card */}
          <div className="reveal">
            <FlipCard
              front={
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    AI BAHSEDİLME
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span
                      className={`text-4xl font-light leading-none ${getScoreColor(
                        dualScores.mention.score
                      )}`}
                    >
                      {dualScores.mention.score}
                    </span>
                    <span className="mb-0.5 text-base font-medium text-muted-foreground leading-none">
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    Platform dağılımı için çevirin →
                  </p>
                </div>
              }
              back={
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    PLATFORM DAĞILIMI
                  </p>
                  <div className="space-y-2.5">
                    {platforms.map((p) => {
                      const userRow = visibilityData.find((r) => r.isUser);
                      const score = userRow ? userRow.platforms[p] : 0;
                      return (
                        <div key={p} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {platformLabels[p].name}
                          </span>
                          <span
                            className={`text-sm font-bold ${getScoreColor(score)}`}
                          >
                            {score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              }
            />
          </div>

          {/* Site Hazırlık — flip card */}
          <div className="reveal">
            <FlipCard
              front={
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    SİTE HAZIRLIK
                  </p>
                  <div className="mt-4 flex items-end gap-2">
                    <span
                      className={`text-4xl font-light leading-none ${getScoreColor(
                        dualScores.readiness.score
                      )}`}
                    >
                      {dualScores.readiness.score}
                    </span>
                    <span className="mb-0.5 text-base font-medium text-muted-foreground leading-none">
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    Kategori kırılımı için çevirin →
                  </p>
                </div>
              }
              back={
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    KATEGORİ KIRILIMI
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Teknik Altyapı", score: 60 },
                      { label: "İçerik Kalitesi", score: 45 },
                      { label: "Şema & Yapı", score: 38 },
                      { label: "Otorite Sinyalleri", score: 52 },
                    ].map((cat) => (
                      <div key={cat.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {cat.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${getScoreColor(cat.score)}`}
                        >
                          {cat.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── 2. Visibility Comparison — expand card ───────────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          GÖRÜNÜRLÜK KARŞILAŞTIRMASI
        </p>

        <div className="reveal">
          <ExpandCard
            summary={
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                  GÖRÜNÜRLÜK KARŞILAŞTIRMASI
                </p>
                {/* Mini preview: brand + avg score */}
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {visibilityData.map((row) => {
                    const average = avg(platforms.map((p) => row.platforms[p]));
                    return (
                      <div key={row.name} className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            row.isUser
                              ? "font-bold text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {row.name}
                          {row.isUser && (
                            <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                              siz
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-sm font-bold ${getScoreColor(average)}`}
                        >
                          {average}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Platform detayları için genişletin ↓
                </p>
              </div>
            }
            detail={
              <div>
                {/* Header row */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Marka
                  </div>
                  {platforms.map((p) => (
                    <div
                      key={p}
                      className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground text-right"
                    >
                      {platformLabels[p].name}
                    </div>
                  ))}
                </div>

                {/* Brand rows */}
                <div className="space-y-[10px]">
                  {visibilityData.map((row) => (
                    <div
                      key={row.name}
                      className={`grid grid-cols-5 gap-2 rounded-[12px] px-3 py-2.5 ${
                        row.isUser
                          ? "bg-secondary border border-border"
                          : ""
                      }`}
                    >
                      <div
                        className={`text-sm ${
                          row.isUser
                            ? "font-bold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {row.name}
                        {row.isUser && (
                          <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                            siz
                          </span>
                        )}
                      </div>
                      {platforms.map((p) => (
                        <div
                          key={p}
                          className={`text-right text-sm font-bold ${getScoreColor(
                            row.platforms[p]
                          )}`}
                        >
                          {row.platforms[p]}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* ── 3. Recent Mentions — individual expand cards ─────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          SON AI BAHSEDİLMELERİ
        </p>

        <div className="flex flex-col gap-[10px]">
          {recentMentions.map((mention, i) => (
            <div key={i} className="reveal">
              <ExpandCard
                summary={
                  <div>
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-xs font-bold uppercase tracking-[0.1em]">
                        {platformLabels[mention.platform].name}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
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
                    {/* Truncated prompt */}
                    <p className="mt-2 text-sm font-medium tracking-[-0.02em] line-clamp-1">
                      &ldquo;{mention.prompt}&rdquo;
                    </p>
                  </div>
                }
                detail={
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      PROMPT
                    </p>
                    <p className="text-sm font-medium tracking-[-0.02em] mb-4">
                      &ldquo;{mention.prompt}&rdquo;
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">
                      ALINTI
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mention.excerpt}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        Kaynak:
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.1em]">
                        {platformLabels[mention.platform].name}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          sentimentClass[mention.sentiment] ??
                          "text-muted-foreground"
                        }`}
                      >
                        · {mention.sentiment}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Priority Actions — simple clickable cards ─────────────────── */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          ÖNCELİKLİ AKSİYONLAR
        </p>

        <div className="flex flex-col gap-[10px]">
          {priorityActions.map((action, i) => (
            <div
              key={i}
              className="reveal card rounded-[16px] border border-border bg-card p-5 cursor-pointer hover:-translate-y-[3px] hover:shadow-lg hover:border-muted-foreground/30 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.impact}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Aksiyona Git →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Next Scan Card ────────────────────────────────────────────── */}
      <section>
        <div className="reveal card rounded-[16px] border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                SONRAKİ TARAMA
              </p>
              <p className="mt-1 text-lg font-light tracking-[-0.03em]">
                {nextScanIn}
              </p>
            </div>
            <div className="h-2 w-2 rounded-full bg-score-high animate-pulse" />
          </div>
        </div>
      </section>

    </div>
  );
}
