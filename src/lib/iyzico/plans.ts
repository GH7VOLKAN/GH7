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
  pro: { monthly: 2495, yearly: 23950 },
  business: { monthly: 7495, yearly: 71950 },
  agency: { monthly: 19995, yearly: 191950 },
};

export const PLAN_FEATURES: Record<Exclude<PlanType, "free">, string[]> = {
  pro: [
    "50 takip edilen soru",
    "5 yapay zekada tarama",
    "Rakip analizi",
    "Site kontrolu",
    "Aksiyon plani",
    "Trend grafikleri",
    "Bildirimler",
    "3 marka",
  ],
  business: [
    "200 takip edilen soru",
    "Tum Pro ozellikleri",
    "10 marka",
    "25 rakip",
    "Oncelikli destek",
  ],
  agency: [
    "500 takip edilen soru",
    "Tum Business ozellikleri",
    "50 marka",
    "50 rakip",
    "Gunluk tarama",
    "Entegrasyon erisimi",
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
