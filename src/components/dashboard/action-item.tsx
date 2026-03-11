"use client";

import { useState } from "react";
import { ActionTask } from "@/lib/mock-data";

const priorityLabels: Record<string, { text: string; className: string }> = {
  high: { text: "YÜKSEK", className: "text-score-low" },
  medium: { text: "ORTA", className: "text-score-mid" },
  low: { text: "DÜŞÜK", className: "text-muted-foreground" },
};

export function ActionItem({ task }: { task: ActionTask }) {
  const [completed, setCompleted] = useState(task.completed);
  const priority = priorityLabels[task.priority];

  return (
    <div
      className={`rounded-[14px] border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg ${
        completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => setCompleted(!completed)}
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border text-xs font-bold transition-colors hover:bg-foreground hover:text-background"
        >
          {completed ? "\u2713" : ""}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${priority.className}`}>
              {priority.text}
            </span>
          </div>
          <h3
            className={`mt-1 text-sm font-medium tracking-[-0.02em] ${
              completed ? "line-through" : ""
            }`}
          >
            {task.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kaynak: {task.source.tab === "site" ? "Site Analizi" : "Soru Haritası"}
            {task.source.check && ` → ${task.source.check}`}
            {task.source.category && ` → ${task.source.category}`}
          </p>
          {completed && (
            <p className="mt-2 text-xs font-bold text-score-high">Tamamlandı</p>
          )}
        </div>
      </div>
    </div>
  );
}
