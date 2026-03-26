"use client";

import { useState } from "react";
import {
  PLAN_PRICES,
  PLAN_FEATURES,
  getMonthlyEquivalent,
  getYearlySavings,
  type PlanPeriod,
} from "@/lib/iyzico/plans";
import { PLAN_LABELS, type PlanType } from "@/lib/plans";

interface PlanSelectorProps {
  currentPlan: string;
  onSelect: (plan: string, period: string) => void;
}

const PLANS: Array<Exclude<PlanType, "free">> = ["pro", "business", "agency"];

export function PlanSelector({ currentPlan, onSelect }: PlanSelectorProps) {
  const [period, setPeriod] = useState<PlanPeriod>("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(plan: Exclude<PlanType, "free">) {
    setLoading(plan);
    try {
      await onSelect(plan, period);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-[-0.04em]">Plan Seçin</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Yapay zeka görünürlük takibinizi güçlendirin
        </p>
      </div>

      {/* Period Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPeriod("monthly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            period === "monthly"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Aylık
        </button>
        <button
          onClick={() => setPeriod("yearly")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            period === "yearly"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Yıllık
          <span className="ml-1.5 text-xs opacity-70">%20 indirim</span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan;
          const monthlyEq = getMonthlyEquivalent(plan, period);
          const price = PLAN_PRICES[plan][period];
          const savings = period === "yearly" ? getYearlySavings(plan) : 0;
          const features = PLAN_FEATURES[plan];
          const isPopular = plan === "pro";

          return (
            <div
              key={plan}
              className={`relative rounded-2xl border-[1.5px] p-5 transition-all ${
                isPopular
                  ? "border-foreground shadow-lg"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-0.5 text-xs font-bold text-background">
                  Popüler
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{PLAN_LABELS[plan]}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      {monthlyEq.toLocaleString("tr-TR")}₺
                    </span>
                    <span className="text-sm text-muted-foreground">/ay</span>
                  </div>
                  {period === "yearly" && (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Yıllık toplam: {price.toLocaleString("tr-TR")}₺
                      </p>
                      {savings > 0 && (
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">
                          {savings.toLocaleString("tr-TR")}₺ tasarruf
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <svg
                        className="mt-0.5 size-4 shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent || loading !== null}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                    isCurrent
                      ? "cursor-default bg-muted text-muted-foreground"
                      : isPopular
                        ? "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98]"
                        : "border border-border text-foreground hover:bg-muted"
                  } disabled:opacity-50`}
                >
                  {loading === plan
                    ? "Yükleniyor..."
                    : isCurrent
                      ? "Mevcut Plan"
                      : "Satın Al"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
