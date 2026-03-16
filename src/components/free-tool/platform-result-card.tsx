"use client";

import { useState } from "react";
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react";
import type { PlatformResult } from "@/lib/free-tool/types";
import { PlatformIcon, PLATFORM_COLORS } from "@/components/platform-icon";
import type { PlatformKey } from "@/lib/types";

const sentimentLabels: Record<string, { label: string; className: string }> = {
  pozitif: {
    label: "Pozitif",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  nötr: {
    label: "Nötr",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  negatif: {
    label: "Negatif",
    className:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

export function PlatformResultCard({ result }: { result: PlatformResult }) {
  const [expanded, setExpanded] = useState(false);

  const colors = PLATFORM_COLORS[result.platform as PlatformKey] ?? PLATFORM_COLORS.chatgpt;
  const sentimentStyle = sentimentLabels[result.sentiment];

  // Extract domain from citations for clean display
  const domains = result.citations
    .map((url) => {
      try {
        return new URL(url).hostname.replace("www.", "");
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .slice(0, 3);

  const hasFullResponse = result.fullResponse && result.fullResponse.length > 0;

  return (
    <div
      className={`rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${colors.bg}`}
          >
            <PlatformIcon platform={result.platform as PlatformKey} size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold">{result.label}</p>
            <p className="text-[11px] text-muted-foreground">
              {result.position}
            </p>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            result.found
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "border border-muted bg-muted/50 text-muted-foreground"
          }`}
        >
          {result.found ? (
            <svg
              className="size-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              className="size-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          {result.found ? "Tanıyor" : "Tanımıyor"}
        </span>
      </div>

      {/* AI Response excerpt */}
      <div className="mt-3 rounded-lg border border-border/50 bg-background/60 px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {result.label}&apos;nin Yanıtı
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
          &ldquo;
          {expanded
            ? result.fullResponse || result.excerpt
            : result.excerpt.slice(0, 200) +
              (result.excerpt.length > 200 ? "..." : "")}
          &rdquo;
        </p>

        {/* Expand/Collapse button */}
        {hasFullResponse && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDownIcon
              className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Kısalt" : "Tam yanıtı gör"}
          </button>
        )}
      </div>

      {/* Citations */}
      {domains.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground/60">
            Kaynaklar:
          </span>
          {domains.map((domain, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              <ExternalLinkIcon className="size-2.5" />
              {domain}
            </span>
          ))}
        </div>
      )}

      {/* Footer: sentiment + score bar */}
      <div className="mt-3 flex items-center gap-2.5">
        {result.found && sentimentStyle && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sentimentStyle.className}`}
          >
            {sentimentStyle.label}
          </span>
        )}
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colors.dot}`}
              style={{ width: `${result.visibilityScore}%` }}
            />
          </div>
          <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
            {result.visibilityScore}
          </span>
        </div>
      </div>
    </div>
  );
}
