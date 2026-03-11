"use client";

import {
  auditCategories,
  siteReadinessScore,
  siteReadinessTarget,
  type AuditCategory,
  type AuditCheck,
} from "@/lib/mock-data/site-audit";
import { getScoreColor } from "@/lib/utils";
import { FlipCard } from "@/components/ui/flip-card";

// ── Helpers ────────────────────────────────────────────────────────────────

const statusSymbol: Record<AuditCheck["status"], string> = {
  pass: "✓",
  fail: "✗",
  partial: "⚠",
};

const statusClass: Record<AuditCheck["status"], string> = {
  pass: "text-score-high",
  fail: "text-score-low",
  partial: "text-score-mid",
};

const statusLabel: Record<AuditCheck["status"], string> = {
  pass: "Geçti",
  fail: "Başarısız",
  partial: "Kısmî",
};

function scoreBarBg(pct: number): string {
  if (pct >= 60) return "bg-score-high";
  if (pct >= 35) return "bg-score-mid";
  return "bg-score-low";
}

// ── Check FlipCard ─────────────────────────────────────────────────────────

function CheckFlipCard({ check }: { check: AuditCheck }) {
  const pct = check.maxScore > 0 ? (check.score / check.maxScore) * 100 : 0;
  const scoreColor = getScoreColor(pct);
  const sym = statusSymbol[check.status];
  const symClass = statusClass[check.status];

  const front = (
    <div className="flex flex-col gap-3 h-full">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-snug tracking-[-0.02em]">
          {check.title}
        </span>
        <span className={`shrink-0 text-base font-bold leading-none mt-0.5 ${symClass}`}>
          {sym}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-black tracking-[-0.05em] leading-none ${scoreColor}`}>
          {check.score}
        </span>
        <span className="text-sm text-muted-foreground leading-none mb-0.5">
          /{check.maxScore}
        </span>
      </div>

      {/* Brief status + badge row */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs text-muted-foreground">
          {statusLabel[check.status]}
          {check.fix ? " · Düzeltilebilir" : ""}
        </span>
        {check.raasEligible && (
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border border-border text-muted-foreground whitespace-nowrap">
            Biz Uygulayalım
          </span>
        )}
      </div>
    </div>
  );

  const back = (
    <div className="flex flex-col gap-3 h-full">
      {/* Back title */}
      <p className="text-sm font-medium leading-snug tracking-[-0.02em]">
        {check.title}
      </p>

      {/* Detail */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {check.detail}
      </p>

      {/* Fix suggestion */}
      {check.fix && (
        <div className="rounded-[10px] border border-border bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">
            Öneri
          </p>
          <p className="text-xs text-foreground leading-relaxed">{check.fix}</p>
        </div>
      )}

      {/* Impact */}
      <div className="flex items-center gap-2 mt-auto">
        <span className={`text-xs font-bold ${statusClass[check.status]}`}>
          {sym} {statusLabel[check.status]}
        </span>
        <span className="text-xs text-muted-foreground">
          · {check.score}/{check.maxScore} puan
        </span>
      </div>

      {/* Action buttons */}
      {check.raasEligible && (
        <div className="flex gap-2">
          <button className="flex-1 rounded-[10px] border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            Aksiyona Ekle
          </button>
          <button className="flex-1 rounded-[10px] border border-border bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity">
            Biz Uygulayalım
          </button>
        </div>
      )}
      {!check.raasEligible && check.fix && (
        <button className="w-full rounded-[10px] border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
          Aksiyona Ekle
        </button>
      )}
    </div>
  );

  return <FlipCard front={front} back={back} />;
}

// ── Category Section ───────────────────────────────────────────────────────

function CategorySection({ category }: { category: AuditCategory }) {
  const pct =
    category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;
  const scoreColor = getScoreColor(pct);

  return (
    <div className="reveal">
      {/* Section label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {category.name}
        </p>
        <span className={`text-[11px] font-black tracking-[-0.03em] ${scoreColor}`}>
          {category.score}
          <span className="font-normal text-muted-foreground">/{category.maxScore}</span>
        </span>
      </div>

      {/* Check cards — 2 cols on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {category.checks.map((check) => (
          <CheckFlipCard key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function SitePage() {
  const scorePct = siteReadinessScore;
  const targetPct = siteReadinessTarget;

  const passCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "pass").length,
    0
  );
  const partialCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "partial").length,
    0
  );
  const failCount = auditCategories.reduce(
    (acc, cat) => acc + cat.checks.filter((c) => c.status === "fail").length,
    0
  );

  const scoreColor = getScoreColor(scorePct);
  const barBg = scoreBarBg(scorePct);

  return (
    <div className="space-y-10">
      {/* ── 1. Score Header Card ──────────────────────────────────────── */}
      <div className="reveal rounded-[16px] border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lg hover:border-muted-foreground/30">
        {/* Section label */}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          SİTE ANALİZİ
        </p>

        {/* Big score */}
        <div className="mt-3 flex items-end gap-3">
          <span
            className={`text-5xl font-light tracking-[-0.04em] leading-none ${scoreColor}`}
          >
            {siteReadinessScore}
          </span>
          <span className="mb-1 text-xl text-muted-foreground leading-none">
            / 100
          </span>
          <span className="mb-1 text-sm text-muted-foreground leading-none">
            Hedef:{" "}
            <span className="font-bold text-foreground">{siteReadinessTarget}</span>
          </span>
        </div>

        {/* Progress bar with target marker */}
        <div className="relative mt-6 h-[4px] w-full rounded-full bg-border overflow-visible">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barBg}`}
            style={{ width: `${scorePct}%` }}
          />
          {/* Target marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${targetPct}%` }}
          >
            <div className="h-[10px] w-[2px] rounded-full bg-foreground/40" />
            <span className="mt-1 text-[10px] font-bold text-muted-foreground whitespace-nowrap">
              Hedef
            </span>
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-score-high">{passCount}</span> Geçen
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            <span className="font-bold text-score-mid">{partialCount}</span> Kısmî
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            <span className="font-bold text-score-low">{failCount}</span> Başarısız
          </span>
        </div>
      </div>

      {/* ── 2. Audit Categories ───────────────────────────────────────── */}
      <div className="space-y-10">
        {auditCategories.map((category) => (
          <CategorySection key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
