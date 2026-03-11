"use client";

import {
  auditCategories,
  siteReadinessScore,
  siteReadinessTarget,
  type AuditCategory,
  type AuditCheck,
} from "@/lib/mock-data/site-audit";
import { getScoreColor } from "@/lib/utils";

const statusSymbol: Record<AuditCheck["status"], string> = {
  pass: "✓",
  fail: "✗",
  partial: "◐",
};

const statusClass: Record<AuditCheck["status"], string> = {
  pass: "text-score-high",
  fail: "text-score-low",
  partial: "text-score-mid",
};

function CheckRow({ check }: { check: AuditCheck }) {
  const pct = check.maxScore > 0 ? (check.score / check.maxScore) * 100 : 0;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      {/* Top row: status + title + score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`shrink-0 text-base font-bold leading-none mt-0.5 ${statusClass[check.status]}`}
          >
            {statusSymbol[check.status]}
          </span>
          <span className="text-sm font-medium tracking-[-0.02em] leading-snug">
            {check.title}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {check.raasEligible && (
            <span className="text-xs px-2 py-0.5 rounded-full border border-border font-bold text-muted-foreground whitespace-nowrap">
              Biz Uygulayalım
            </span>
          )}
          <span
            className={`text-sm font-black tracking-[-0.04em] whitespace-nowrap ${getScoreColor(pct)}`}
          >
            {check.score}
            <span className="font-normal text-muted-foreground">
              /{check.maxScore}
            </span>
          </span>
        </div>
      </div>

      {/* Detail */}
      <p className="mt-1.5 ml-6 text-sm text-muted-foreground leading-relaxed">
        {check.detail}
      </p>

      {/* Fix suggestion */}
      {check.fix && (
        <p className="mt-1 ml-6 text-sm text-muted-foreground italic">
          Öneri: {check.fix}
        </p>
      )}
    </div>
  );
}

function CategoryCard({ category }: { category: AuditCategory }) {
  const pct =
    category.maxScore > 0
      ? (category.score / category.maxScore) * 100
      : 0;

  return (
    <div className="rounded-[14px] border border-border bg-card p-5">
      {/* Category header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          {category.name}
        </h3>
        <span
          className={`text-sm font-black tracking-[-0.04em] ${getScoreColor(pct)}`}
        >
          {category.score}
          <span className="font-normal text-muted-foreground">
            /{category.maxScore}
          </span>
        </span>
      </div>

      {/* Category progress bar */}
      <div className="mt-3 h-[3px] w-full rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 60
              ? "bg-score-high"
              : pct >= 35
              ? "bg-score-mid"
              : "bg-score-low"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Checks */}
      <div className="mt-4 divide-y divide-border">
        {category.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

export default function SitePage() {
  const scorePct = siteReadinessScore;
  const targetPct = siteReadinessTarget;

  return (
    <div className="space-y-6">
      {/* ── 1. Header Card ──────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          SİTE ANALİZİ
        </p>
        <div className="mt-3 flex items-end gap-3">
          <span
            className={`text-5xl font-black tracking-[-0.05em] leading-none ${getScoreColor(scorePct)}`}
          >
            {siteReadinessScore}
          </span>
          <span className="mb-1 text-xl font-medium text-muted-foreground leading-none">
            / 100
          </span>
          <span className="mb-1 text-sm text-muted-foreground leading-none">
            Hedef:{" "}
            <span className="font-bold text-foreground">{siteReadinessTarget}</span>
          </span>
        </div>

        {/* Progress bar with target marker */}
        <div className="relative mt-5 h-[3px] w-full rounded-full bg-border overflow-visible">
          {/* Filled portion */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(scorePct)
              .replace("text-score-high", "bg-score-high")
              .replace("text-score-mid", "bg-score-mid")
              .replace("text-score-low", "bg-score-low")}`}
            style={{ width: `${scorePct}%` }}
          />
          {/* Target marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${targetPct}%` }}
          >
            <div className="h-[9px] w-[2px] rounded-full bg-foreground opacity-40" />
            <span className="mt-1 text-[10px] font-bold text-muted-foreground whitespace-nowrap">
              Hedef
            </span>
          </div>
        </div>

        {/* Score legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-bold text-score-high">
              {auditCategories.reduce(
                (acc, cat) =>
                  acc + cat.checks.filter((c) => c.status === "pass").length,
                0
              )}
            </span>{" "}
            Geçen
          </span>
          <span>
            <span className="font-bold text-score-mid">
              {auditCategories.reduce(
                (acc, cat) =>
                  acc +
                  cat.checks.filter((c) => c.status === "partial").length,
                0
              )}
            </span>{" "}
            Kısmî
          </span>
          <span>
            <span className="font-bold text-score-low">
              {auditCategories.reduce(
                (acc, cat) =>
                  acc + cat.checks.filter((c) => c.status === "fail").length,
                0
              )}
            </span>{" "}
            Başarısız
          </span>
        </div>
      </div>

      {/* ── 2. Audit Categories ─────────────────────────────────────── */}
      <div className="space-y-4">
        {auditCategories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </div>
  );
}
