export const PLANS = {
  FREE: "free",
  PRO: "pro",
  PRO_PLUS: "pro_plus",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const PLAN_LIMITS = {
  [PLANS.FREE]: { brands: 1, scansPerMonth: 1 },
  [PLANS.PRO]: { brands: 1, scansPerMonth: 999 },
  [PLANS.PRO_PLUS]: { brands: 5, scansPerMonth: 999 },
} as const;

export function getPlanLabel(plan: string): string {
  if (plan === PLANS.PRO_PLUS) return "Pro+";
  if (plan === PLANS.PRO) return "Pro";
  return "Free";
}

export function isPaidPlan(plan: string): boolean {
  return plan === PLANS.PRO || plan === PLANS.PRO_PLUS;
}

export function canAddBrand(plan: string, currentBrandCount: number): boolean {
  const limit = PLAN_LIMITS[plan as Plan]?.brands ?? 1;
  return currentBrandCount < limit;
}
