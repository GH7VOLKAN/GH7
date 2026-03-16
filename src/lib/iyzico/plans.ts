/**
 * GH7.ai — Plan Fiyatları (İyzico)
 *
 * Tüm fiyatlar TRY cinsinden, KDV dahil.
 */

import type { PlanType } from "@/lib/plans";

export type PlanPeriod = "monthly" | "yearly";

export interface PlanPrice {
  monthly: number;
  yearly: number;
}

export const PLAN_PRICES: Record<Exclude<PlanType, "free">, PlanPrice> = {
  pro: { monthly: 499, yearly: 4790 },
  business: { monthly: 1499, yearly: 14390 },
  agency: { monthly: 4999, yearly: 47990 },
};

export const PLAN_FEATURES: Record<Exclude<PlanType, "free">, string[]> = {
  pro: [
    "50 AI prompt",
    "4 platform tarama",
    "Rakip analizi",
    "Site / dijital varlık auditi",
    "AI aksiyon planı",
    "Trend grafikleri",
    "SMS bildirimleri",
    "3 marka",
  ],
  business: [
    "200 AI prompt",
    "Tüm Pro özellikleri",
    "10 marka",
    "25 rakip",
    "Öncelikli destek",
  ],
  agency: [
    "500 AI prompt",
    "Tüm Business özellikleri",
    "50 marka",
    "50 rakip",
    "Günlük tarama",
    "API erişimi",
  ],
};

export function getPlanPrice(
  plan: Exclude<PlanType, "free">,
  period: PlanPeriod,
): number {
  return PLAN_PRICES[plan][period];
}

export function getMonthlyEquivalent(
  plan: Exclude<PlanType, "free">,
  period: PlanPeriod,
): number {
  if (period === "monthly") return PLAN_PRICES[plan].monthly;
  return Math.round(PLAN_PRICES[plan].yearly / 12);
}

export function getYearlySavings(plan: Exclude<PlanType, "free">): number {
  return PLAN_PRICES[plan].monthly * 12 - PLAN_PRICES[plan].yearly;
}
