"use client";

import Link from "next/link";
import type { ChecklistProgress } from "@/lib/dal/overview";
import { Progress } from "@/components/ui/progress";

interface ActionItemsProps {
  actions: { title: string; impact: string }[];
  checklistProgress: ChecklistProgress;
}

const IMPACT_COLOR_MAP: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    text: "text-red-800",
  },
  medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-500",
    text: "text-yellow-800",
  },
  low: {
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    text: "text-green-800",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-gray-50",
  border: "border-gray-200",
  dot: "bg-gray-500",
  text: "text-gray-800",
};

export function ActionItems({ actions, checklistProgress }: ActionItemsProps) {
  const progressPercent =
    checklistProgress.total > 0
      ? Math.round(
          (checklistProgress.completed / checklistProgress.total) * 100
        )
      : 0;

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Yap&#305;lacaklar / Önerilen Aksiyonlar
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {checklistProgress.completed}/{checklistProgress.total} tamamland&#305;
          </span>
          <Progress value={progressPercent} className="w-24 [&_[data-slot=progress-track]]:h-1.5" />
        </div>
      </div>

      {actions.length === 0 ? (
        <p className="text-sm text-gray-400">
          Şu an önerilen aksiyon bulunmuyor.
        </p>
      ) : (
        <div className="space-y-3">
          {actions.map((item, idx) => {
            const c =
              IMPACT_COLOR_MAP[item.impact.toLowerCase()] ?? DEFAULT_COLOR;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${c.bg} ${c.border}`}
              >
                <span
                  className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${c.dot}`}
                />
                <span className={`text-sm font-medium ${c.text} flex-1`}>
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Link
          href="/panel/gelisim-plani"
          className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Gelişim Plan&#305;na Git
        </Link>
      </div>
    </div>
  );
}
