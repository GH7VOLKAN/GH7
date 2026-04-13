"use client";

import { PLATFORM_LABELS } from "@/lib/roi/benchmarks";
import type { RoiEstimate } from "@/lib/dal/roi";

interface Props {
  roi: RoiEstimate;
}

export function RoiEstimateCard({ roi }: Props) {
  if (roi.totalMentions === 0) return null;

  const trendColor =
    roi.trendPercent > 0
      ? "text-green-600"
      : roi.trendPercent < 0
      ? "text-red-600"
      : "text-gray-400";

  const trendArrow = roi.trendPercent > 0 ? "↑" : roi.trendPercent < 0 ? "↓" : "";

  const platforms = Object.entries(roi.perPlatform)
    .sort((a, b) => b[1].visits - a[1].visits);

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Tahmini AI Kaynaklı Trafik
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Bahsedilme sayılarınıza göre tahmini aylık ziyaret
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <span className="text-4xl font-bold text-gray-900">
          ~{roi.estimatedMonthlyVisits.toLocaleString("tr-TR")}
        </span>
        <span className="text-sm text-gray-500 mb-1">ziyaret/ay</span>
        {roi.trendPercent !== 0 && (
          <span className={`text-sm font-semibold mb-1 ${trendColor}`}>
            {trendArrow} {Math.abs(roi.trendPercent)}%
          </span>
        )}
      </div>

      {/* Platform breakdown */}
      <div className="space-y-2">
        {platforms.map(([platform, data]) => {
          const label = PLATFORM_LABELS[platform] ?? platform;
          const maxVisits = platforms[0]?.[1]?.visits ?? 1;
          const widthPercent = Math.max(5, (data.visits / maxVisits) * 100);

          return (
            <div key={platform} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-20 text-right shrink-0">
                ~{data.visits} ({data.mentions} bahsedilme)
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        * Sektör ortalamasına dayalı tahmin. Gerçek trafik verisi için yakında Google Analytics entegrasyonu.
      </p>
    </div>
  );
}
