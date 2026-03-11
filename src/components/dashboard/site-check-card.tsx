"use client";

import { SiteCheck } from "@/lib/mock-data";

const statusDisplay: Record<string, { label: string; className: string }> = {
  pass: { label: "Mevcut", className: "text-score-high" },
  fail: { label: "Eksik", className: "text-score-low" },
  partial: { label: "Kısmî", className: "text-score-mid" },
};

const impactDisplay: Record<string, string> = {
  high: "YÜKSEK",
  medium: "ORTA",
  low: "DÜŞÜK",
};

export function SiteCheckCard({ check }: { check: SiteCheck }) {
  const status = statusDisplay[check.status];

  return (
    <div className="rounded-[14px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium tracking-[-0.02em]">{check.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{check.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-bold ${status.className}`}>{status.label}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Etki: {impactDisplay[check.impact]}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">{check.details}</p>
      {check.fix && (
        <div className="mt-3 rounded-lg bg-background-secondary p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Öneri
          </p>
          <p className="mt-1 text-xs text-foreground">{check.fix}</p>
        </div>
      )}
    </div>
  );
}
