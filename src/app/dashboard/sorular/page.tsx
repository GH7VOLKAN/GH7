"use client";

import { mockQuestions } from "@/lib/mock-data";
import { QuestionCategory } from "@/components/dashboard/question-category";

export default function SorularPage() {
  const pct = Math.round(
    (mockQuestions.coveredQuestions / mockQuestions.totalQuestions) * 100
  );

  return (
    <div className="space-y-8">
      {/* Ozet */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          SEKTÖREL SORU HARİTASI
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          {mockQuestions.sector}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mockQuestions.totalQuestions} soru tespit edildi
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span>
              Bahsediliyorsunuz:{" "}
              <span className="font-bold">
                {mockQuestions.coveredQuestions}/{mockQuestions.totalQuestions}
              </span>{" "}
              <span className="text-muted-foreground">(%{pct})</span>
            </span>
          </div>
          <div className="mt-2 h-[3px] w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Kategoriler */}
      <div className="space-y-4">
        {mockQuestions.categories.map((cat) => (
          <QuestionCategory key={cat.name} category={cat} />
        ))}
      </div>
    </div>
  );
}
