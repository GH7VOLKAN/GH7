"use client";

import { Suspense } from "react";
import { HeroMetrics } from "./hero-metrics";
import { PersonalAnalysisCard } from "./personal-analysis-card";
import {
  CategorySummaryGrid,
  type CategoryCard,
} from "./category-summary-grid";
import { WelcomeOverlay } from "./welcome-overlay";
import { ProGate } from "@/components/pro-gate";
import { ProUpgradeBanner } from "@/components/panel/pro-upgrade-banner";
import { TrendingUp } from "lucide-react";

interface WeeklyPoint {
  week: string;
  userScore: number;
  competitorScore?: number;
}

interface Props {
  plan: string;
  userScore: number;
  competitorScore: number | null;
  competitorName: string | null;
  estimatedMonthlyLoss: number | null;
  estimatedYearlyLoss: number | null;
  personalAnalysis: string | null;
  competitorNames: string[];
  categories: CategoryCard[];
  weeklyTrend: WeeklyPoint[];
}

export function GenelContentV2({
  plan,
  userScore,
  competitorScore,
  competitorName,
  estimatedMonthlyLoss,
  estimatedYearlyLoss,
  personalAnalysis,
  competitorNames,
  categories,
  weeklyTrend,
}: Props) {
  return (
    <>
      <Suspense fallback={null}>
        <WelcomeOverlay />
      </Suspense>

      <div className="space-y-8">
        {/* Section 1 — Hero Metrics (3 card) */}
        <section>
          <HeroMetrics
            userScore={userScore}
            competitorScore={competitorScore}
            competitorName={competitorName}
            estimatedMonthlyLoss={estimatedMonthlyLoss}
            estimatedYearlyLoss={estimatedYearlyLoss}
          />
        </section>

        {/* Section 2 — Opus Personal Analysis */}
        {personalAnalysis && (
          <section>
            <PersonalAnalysisCard
              analysis={personalAnalysis}
              competitorNames={competitorNames}
            />
          </section>
        )}

        {/* Section 3 — 6 Category Summary Cards */}
        {categories.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Kategori Performansı
              </h2>
              <span className="text-sm text-gray-500">
                {categories.length} kategori · 43 madde
              </span>
            </div>
            <CategorySummaryGrid categories={categories} />
          </section>
        )}

        {/* Section 4 — Weekly Trend (ProGate) */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Haftalık Trend
            </h2>
          </div>
          <ProGate
            plan={plan}
            feature="weekly_trend"
            description="Haftalık trend takibi Pro ile aktif olur. Skorunuzun nasıl değiştiğini her hafta izleyin."
            minHeight="280px"
          >
            <WeeklyTrendChart data={weeklyTrend} />
          </ProGate>
        </section>

        {/* Pro upgrade banner (free only, page bottom) */}
        <ProUpgradeBanner plan={plan} variant="page" />
      </div>
    </>
  );
}

// Inline simple SVG trend chart — no external chart lib needed
function WeeklyTrendChart({ data }: { data: WeeklyPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Henüz haftalık trend verisi yok. Birkaç hafta sonra burada grafik görünecek.
      </div>
    );
  }

  const W = 600;
  const H = 240;
  const P = 40;
  const maxScore = 100;

  const xFor = (i: number) =>
    P + (i * (W - 2 * P)) / Math.max(1, data.length - 1);
  const yFor = (v: number) =>
    H - P - (v / maxScore) * (H - 2 * P);

  const userPath = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.userScore)}`)
    .join(" ");

  const hasCompetitor = data.some((p) => p.competitorScore != null);
  const competitorPath = hasCompetitor
    ? data
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.competitorScore ?? 0)}`,
        )
        .join(" ")
    : "";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* Y-axis grid */}
        {[0, 25, 50, 75, 100].map((y) => (
          <g key={y}>
            <line
              x1={P}
              x2={W - P}
              y1={yFor(y)}
              y2={yFor(y)}
              stroke="#E5E7EB"
              strokeDasharray="2 3"
            />
            <text
              x={P - 8}
              y={yFor(y) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#9CA3AF"
            >
              {y}
            </text>
          </g>
        ))}

        {/* Competitor line */}
        {hasCompetitor && (
          <path
            d={competitorPath}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            opacity="0.7"
          />
        )}

        {/* User line */}
        <path d={userPath} fill="none" stroke="#111827" strokeWidth="2.5" />

        {/* User points */}
        {data.map((p, i) => (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor(p.userScore)}
            r="3"
            fill="#111827"
          />
        ))}

        {/* X-axis labels */}
        {data.map((p, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={H - P + 18}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7280"
          >
            {p.week}
          </text>
        ))}
      </svg>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-gray-900" />
          <span className="text-gray-700">Siz</span>
        </div>
        {hasCompetitor && (
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-red-500 opacity-70" />
            <span className="text-gray-700">Rakip</span>
          </div>
        )}
      </div>
    </div>
  );
}
