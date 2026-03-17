"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SiteScoreCardsProps {
  totalScore: number;
  targetScore: number;
  passCount: number;
  failCount: number;
  partialCount: number;
  totalChecks: number;
  raasEligibleCount: number;
  categoryCount: number;
}

export function SiteScoreCards({
  passCount,
  failCount,
  partialCount,
  totalChecks,
}: SiteScoreCardsProps) {
  const passRatio = totalChecks > 0 ? Math.round((passCount / totalChecks) * 100) : 0;
  const improvementCount = failCount + partialCount;

  return (
    <div className="px-4 lg:px-6">
      <Card className="border border-border/50 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Site Durumu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Status summary row */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold dark:bg-green-900/40 dark:text-green-400">
                ✓
              </span>
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {passCount} geçti
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-bold dark:bg-amber-900/40 dark:text-amber-400">
                ⚠
              </span>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {partialCount} dikkat
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-sm font-bold dark:bg-red-900/40 dark:text-red-400">
                ✗
              </span>
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {failCount} başarısız
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-700"
                style={{ width: `${passRatio}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {passCount}/{totalChecks} kontrol geçti
            </span>
          </div>

          {/* Improvement hint */}
          {improvementCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Yapay zekaların sitenizi daha iyi anlaması için{" "}
              <span className="font-medium text-foreground">{improvementCount} iyileştirme</span>{" "}
              yapılabilir.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
