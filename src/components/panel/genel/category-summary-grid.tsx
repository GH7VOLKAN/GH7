/**
 * CategorySummaryGrid — 6 kategori özet kartı (Genel Bakış)
 *
 * Her kart: başlık + skor + progress bar + ✓/⚠/✗ sayıları + "Detay →"
 * Detay linki /panel/audit-detay?cat=<key>
 */

import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface CategoryCard {
  key: string;          // "content" | "schema" | ...
  label: string;        // "İçerik Otoritesi"
  score: number;        // 0-10 or 0-100 (normalized to 0-100)
  maxScore: number;     // total items * 10
  passCount: number;
  partialCount: number;
  failCount: number;
  summary?: string | null;
}

function pct(score: number, max: number): number {
  if (max === 0) return 0;
  return Math.round((score / max) * 100);
}

function barColor(p: number): string {
  if (p >= 60) return "bg-green-500";
  if (p >= 30) return "bg-yellow-500";
  return "bg-red-500";
}

export function CategorySummaryGrid({ categories }: { categories: CategoryCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const percentage = pct(c.score, c.maxScore);
        return (
          <div
            key={c.key}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{c.label}</h3>
              <span className="shrink-0 text-sm font-bold text-gray-700">
                {c.score}/{c.maxScore}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${barColor(percentage)}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-green-700">
                <CheckCircle2 className="size-3.5" />
                {c.passCount}
              </span>
              <span className="inline-flex items-center gap-1 text-yellow-700">
                <AlertTriangle className="size-3.5" />
                {c.partialCount}
              </span>
              <span className="inline-flex items-center gap-1 text-red-700">
                <XCircle className="size-3.5" />
                {c.failCount}
              </span>
            </div>

            {c.summary && (
              <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-gray-600">
                {c.summary}
              </p>
            )}

            <Link
              href={`/panel/audit-detay?cat=${c.key}`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gray-900 hover:text-gray-700"
            >
              Detay
              <ArrowRight className="size-3" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
