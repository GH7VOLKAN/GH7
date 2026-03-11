"use client";

import {
  auditCategories,
  siteReadinessScore,
  siteReadinessTarget,
  type AuditCategory,
  type AuditCheck,
} from "@/lib/mock-data/site-audit";
import { ExpandCard } from "@/components/ui/expand-card";

// ── Helpers ────────────────────────────────────────────────────────────────

const statusSymbol: Record<AuditCheck["status"], string> = {
  pass: "✓",
  fail: "✗",
  partial: "~",
};

const statusSymbolClass: Record<AuditCheck["status"], string> = {
  pass: "text-foreground",
  fail: "text-muted-foreground",
  partial: "text-muted-foreground",
};

const statusLabel: Record<AuditCheck["status"], string> = {
  pass: "Geçti",
  fail: "Başarısız",
  partial: "Kısmî",
};

// ── Check ExpandCard ──────────────────────────────────────────────────────

function CheckExpandCard({ check }: { check: AuditCheck }) {
  const summary = (
    <div className="flex items-center justify-between gap-3">
      {/* Left: symbol + title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`shrink-0 text-sm font-bold leading-none ${statusSymbolClass[check.status]}`}
        >
          {statusSymbol[check.status]}
        </span>
        <span className="text-sm font-medium leading-snug tracking-[-0.02em] text-foreground truncate">
          {check.title}
        </span>
      </div>

      {/* Right: score + status */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-black tracking-[-0.03em] text-foreground">
          {check.score}
          <span className="font-normal text-muted-foreground">/{check.maxScore}</span>
        </span>
        <span className="text-xs text-muted-foreground">{statusLabel[check.status]}</span>
      </div>
    </div>
  );

  const detail = (
    <div className="flex flex-col gap-3">
      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed">{check.detail}</p>

      {/* Fix suggestion */}
      {check.fix && (
        <div className="rounded-xl border border-border bg-muted/40 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">
            ÖNERİ
          </p>
          <p className="text-xs text-foreground leading-relaxed">{check.fix}</p>
        </div>
      )}

      {/* Action buttons */}
      {check.raasEligible && (
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors">
            Aksiyona Ekle
          </button>
          <button className="flex-1 rounded-xl border border-border bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity">
            Biz Uygulayalım
          </button>
        </div>
      )}
      {!check.raasEligible && check.fix && (
        <button className="w-full rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors">
          Aksiyona Ekle
        </button>
      )}
    </div>
  );

  return <ExpandCard summary={summary} detail={detail} />;
}

// ── Category Section ───────────────────────────────────────────────────────

function CategorySection({ category }: { category: AuditCategory }) {
  const pct =
    category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;

  return (
    <div className="reveal">
      {/* Section label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {category.name}
        </p>
        <span className="text-[11px] font-black tracking-[-0.03em] text-foreground">
          {category.score}
          <span className="font-normal text-muted-foreground">/{category.maxScore}</span>
        </span>
      </div>

      {/* Category progress bar */}
      <div className="relative mb-4 h-[3px] w-full rounded-full bg-border">
        <div
          className="h-full rounded-full bg-foreground transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Check cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {category.checks.map((check) => (
          <CheckExpandCard key={check.id} check={check} />
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

  return (
    <div className="space-y-10">
      {/* ── 1. Score Header Card ──────────────────────────────────────── */}
      <div className="reveal rounded-xl border border-border bg-card p-8">
        {/* Section label */}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          SİTE ANALİZİ
        </p>

        {/* Big score */}
        <div className="mt-3 flex items-end gap-3">
          <span className="text-5xl font-light tracking-[-0.04em] leading-none text-foreground">
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
            className="h-full rounded-full bg-foreground transition-all duration-700"
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
            <span className="font-bold text-foreground">{passCount}</span> Geçen
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            <span className="font-bold text-foreground">{partialCount}</span> Kısmî
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            <span className="font-bold text-foreground">{failCount}</span> Başarısız
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
