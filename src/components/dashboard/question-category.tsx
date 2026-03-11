"use client";

import { useState } from "react";
import { QuestionCategory as QCType } from "@/lib/mock-data";

export function QuestionCategory({ category }: { category: QCType }) {
  const [open, setOpen] = useState(false);
  const covered = category.questions.filter((q) => q.covered).length;
  const total = category.questions.length;
  const pct = Math.round((covered / total) * 100);

  return (
    <div className="rounded-[14px] border border-border bg-card transition-all duration-200 hover:-translate-y-[3px] hover:shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex-1">
          <h3 className="text-sm font-medium tracking-[-0.02em]">{category.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {covered}/{total} bahsediliyor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">%{pct}</span>
            <div className="h-[3px] w-20 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{open ? "Kapat" : "Aç"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-border px-5 pb-5">
          {category.questions.map((q, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border py-3 last:border-0"
            >
              <span className="text-sm text-foreground">{q.text}</span>
              <span className={`text-xs font-bold ${q.covered ? "text-score-high" : "text-muted-foreground"}`}>
                {q.covered ? `${q.platforms} platformda` : "bahsedilmiyor"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
