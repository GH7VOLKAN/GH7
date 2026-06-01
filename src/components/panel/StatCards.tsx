"use client";

import { AnimatedNumber } from "@/components/kinde/animations";
import type { PanelData } from "@/lib/operator-data";

export function StatCards({ stats }: { stats: PanelData["stats"] }) {
  const cards: { label: string; value: number; color: string }[] = [
    { label: "Toplam", value: stats.total, color: "#111" },
    { label: "Üretimde", value: stats.inProduction, color: "#f59e0b" },
    { label: "Teslim", value: stats.delivered, color: "#22c55e" },
    { label: "Yeni", value: stats.new, color: "#6b7280" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#bbb" }}>{c.label}</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1.5px", color: c.color, lineHeight: 1.2 }}>
            <AnimatedNumber value={c.value} />
          </div>
        </div>
      ))}
    </div>
  );
}
