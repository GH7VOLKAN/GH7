"use client";

import { Alert } from "@/lib/mock-data";

const typeMap: Record<string, { prefix: string; className: string }> = {
  warning: { prefix: "!!", className: "text-score-mid" },
  success: { prefix: "OK", className: "text-score-high" },
  info: { prefix: "--", className: "text-muted" },
};

export function AlertItem({ alert }: { alert: Alert }) {
  const config = typeMap[alert.type];
  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`text-xs font-bold ${config.className}`}>{config.prefix}</span>
      <span className="text-sm text-foreground">{alert.text}</span>
    </div>
  );
}
