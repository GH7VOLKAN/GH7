import { AlertTriangleIcon, BarChart3Icon, SearchIcon } from "lucide-react";

const insightIcons = [
  <SearchIcon key="search" className="size-4 shrink-0" />,
  <AlertTriangleIcon key="alert" className="size-4 shrink-0" />,
  <BarChart3Icon key="chart" className="size-4 shrink-0" />,
];

export function FreeInsights({ insights }: { insights: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Ücretsiz Analiz Sonuçları
      </p>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="mt-0.5 text-muted-foreground">
              {insightIcons[i % insightIcons.length]}
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
