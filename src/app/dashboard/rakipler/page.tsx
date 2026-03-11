"use client";

import { competitorRows, competitorDetail } from "@/lib/mock-data/competitors";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { ExpandCard } from "@/components/ui/expand-card";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];
const userRow = competitorRows.find((r) => r.isUser);
const competitorCount = competitorRows.filter((r) => !r.isUser).length;

export default function Rakipler() {
  return (
    <div className="space-y-10 px-4 lg:px-6">

      {/* ── Header Card ─────────────────────────────────────────── */}
      <div className="reveal rounded-xl border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          RAKİP İSTİHBARATI
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Rakip Analizi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {competitorCount} rakip takip ediliyor
        </p>
      </div>

      {/* ── Competitors ─────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Rakipler
        </p>
        <div className="flex flex-col gap-[10px]">
          {competitorRows.map((row) => {
            const mentionDiff = row.isUser
              ? null
              : row.mentionScore - (userRow?.mentionScore ?? 0);
            const readinessDiff = row.isUser
              ? null
              : row.readinessScore - (userRow?.readinessScore ?? 0);

            const summary = (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Name + domain */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`tracking-[-0.02em] truncate ${
                      row.isUser ? "font-bold" : "font-medium"
                    }`}
                  >
                    {row.name}
                  </span>
                  {row.isUser && (
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      siz
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate">
                    {row.domain}
                  </span>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Bahsedilme
                    </span>
                    <span className="text-lg font-black tracking-[-0.05em] leading-none text-foreground">
                      {row.mentionScore}
                    </span>
                    {mentionDiff !== null && (
                      <span className="text-[10px] font-bold text-foreground">
                        Fark: {mentionDiff >= 0 ? "+" : ""}
                        {mentionDiff}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Hazırlık
                    </span>
                    <span className="text-lg font-black tracking-[-0.05em] leading-none text-foreground">
                      {row.readinessScore}
                    </span>
                    {readinessDiff !== null && (
                      <span className="text-[10px] font-bold text-foreground">
                        Fark: {readinessDiff >= 0 ? "+" : ""}
                        {readinessDiff}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            const detail = (
              <div className="space-y-5">
                {/* Platform breakdown */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    Platform Detayı
                  </p>
                  <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
                    {platforms.map((p) => (
                      <div
                        key={p}
                        className="rounded-xl border border-border bg-muted/20 p-3"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {platformLabels[p].name}
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-[-0.05em] leading-none text-foreground">
                          {row.platforms[p]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gap analysis for non-user competitors */}
                {!row.isUser && row.name === competitorDetail.name && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                      Neden Önde?
                    </p>
                    <ul className="space-y-2">
                      {competitorDetail.readinessGaps.map((gap, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-[3px] shrink-0 text-muted-foreground">
                            ·
                          </span>
                          <span className="text-foreground">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!row.isUser && row.name !== competitorDetail.name && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                      Pozisyon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mentionDiff !== null && mentionDiff > 0
                        ? `${row.name}, bahsedilme skorunda sizden ${mentionDiff} puan önde.`
                        : mentionDiff !== null && mentionDiff < 0
                        ? `${row.name}, bahsedilme skorunda sizden ${Math.abs(mentionDiff)} puan geride.`
                        : `${row.name}, bahsedilme skorunda sizinle eşit.`}
                    </p>
                  </div>
                )}
              </div>
            );

            return (
              <div key={row.domain} className="reveal">
                <ExpandCard
                  summary={summary}
                  detail={detail}
                  className={
                    row.isUser
                      ? "border-l-[3px] border-l-muted-foreground/40 bg-muted/10"
                      : ""
                  }
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gap Analysis Section ─────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Fark Analizi
        </p>
        <div className="reveal">
          <ExpandCard
            defaultOpen
            summary={
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    FARK ANALİZİ
                  </p>
                  <p className="mt-0.5 text-sm font-medium tracking-[-0.02em]">
                    {competitorDetail.name} Neden Önde?
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {competitorDetail.name}
                    </span>
                    <span className="text-lg font-black tracking-[-0.05em] leading-none text-foreground">
                      {competitorDetail.mentionScore}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {userRow?.name ?? "Siz"}
                    </span>
                    <span className="text-lg font-black tracking-[-0.05em] leading-none text-foreground">
                      {competitorDetail.userMentionScore}
                    </span>
                  </div>
                </div>
              </div>
            }
            detail={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Readiness gaps */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    Hazırlık Farkları
                  </p>
                  <ul className="space-y-2">
                    {competitorDetail.readinessGaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-[3px] shrink-0 text-muted-foreground">
                          ·
                        </span>
                        <span className="text-foreground">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Top source pages */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                    Kaynak Sayfalar
                  </p>
                  <div className="space-y-3">
                    {competitorDetail.topSourcePages.map((page, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-bold text-muted-foreground shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm text-foreground truncate">
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          <span className="text-sm font-bold text-foreground">
                            {page.promptCount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            prompt
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
