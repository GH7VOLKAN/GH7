"use client";

import { mockHistory, mockBrand, PlatformKey, platformLabels } from "@/lib/mock-data";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { AlertItem } from "@/components/dashboard/alert-item";
import { getScoreColor, formatTrend } from "@/lib/utils";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

export default function TakipPage() {
  const currentWeek = mockHistory.weeks[mockHistory.weeks.length - 1];
  const prevWeek = mockHistory.weeks[mockHistory.weeks.length - 2];

  return (
    <div className="space-y-8">
      {/* Baslik */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          HAFTALIK TAKİP
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Son {mockHistory.weeks.length} hafta
        </p>
      </div>

      {/* Chart */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-5 bg-foreground" /> Genel
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-5 bg-foreground opacity-60" style={{ borderTop: "2px dashed" }} /> ChatGPT
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-5 bg-foreground opacity-40" style={{ borderTop: "2px dotted" }} /> Claude
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-5 bg-foreground opacity-50" /> Gemini
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-[2px] w-5 bg-foreground opacity-35" /> Perplexity
          </span>
        </div>
        <TrendChart data={mockHistory.weeks} />
      </div>

      {/* Degisim Ozeti */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Değişim Özeti (Bu Hafta)
        </h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm font-bold">Genel Skor</span>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black tracking-[-0.05em] ${getScoreColor(currentWeek.overall)}`}>
                {currentWeek.overall}
              </span>
              <span className={`text-sm font-bold ${
                currentWeek.overall - prevWeek.overall > 0 ? "text-score-high" : "text-score-low"
              }`}>
                {currentWeek.overall - prevWeek.overall > 0 ? "\u2191" : "\u2193"}{" "}
                {formatTrend(currentWeek.overall - prevWeek.overall)}
              </span>
            </div>
          </div>
          {platforms.map((p) => {
            const diff = currentWeek[p] - prevWeek[p];
            return (
              <div key={p} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm">{platformLabels[p].name}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black tracking-[-0.05em] ${getScoreColor(currentWeek[p])}`}>
                    {currentWeek[p]}
                  </span>
                  <span className={`text-xs font-bold ${diff > 0 ? "text-score-high" : diff < 0 ? "text-score-low" : ""}`}>
                    {diff > 0 ? "\u2191" : diff < 0 ? "\u2193" : ""} {formatTrend(diff)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bildirimler */}
      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Bildirimler
        </h3>
        <div className="mt-3 divide-y divide-border">
          {mockHistory.alerts.map((alert, i) => (
            <AlertItem key={i} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );
}
