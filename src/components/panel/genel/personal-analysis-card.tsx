"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  analysis: string | null;
  competitorNames?: string[];
}

const PREVIEW_LENGTH = 400;

/**
 * Opus/Sonnet tarafından üretilen kişisel analiz narrative'ını gösterir.
 * Uzunsa "Devamını oku" toggle.
 * Rakip adları bold olarak işaretlenir.
 */
export function PersonalAnalysisCard({ analysis, competitorNames = [] }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!analysis || analysis.trim().length === 0) return null;

  const hasMore = analysis.length > PREVIEW_LENGTH;
  const text = expanded || !hasMore ? analysis : `${analysis.slice(0, PREVIEW_LENGTH).trimEnd()}…`;

  // Rakip isimlerini bold yap
  const content = renderWithBold(text, competitorNames);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
          <Sparkles className="size-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          Size Özel Analiz
        </h2>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line">
        {content}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5" /> Daha az göster
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" /> Devamını oku
            </>
          )}
        </button>
      )}
    </div>
  );
}

function renderWithBold(text: string, names: string[]): React.ReactNode {
  if (names.length === 0) return text;
  const uniqueNames = [...new Set(names.filter((n) => n && n.length > 1))].sort(
    (a, b) => b.length - a.length,
  );
  if (uniqueNames.length === 0) return text;

  const pattern = new RegExp(
    `(${uniqueNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const match = uniqueNames.find((n) => n.toLowerCase() === part.toLowerCase());
    if (match) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part}
        </strong>
      );
    }
    return part;
  });
}
