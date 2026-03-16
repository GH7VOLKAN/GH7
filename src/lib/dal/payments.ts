/**
 * GH7.ai — Payment Data Access Layer
 */

import { prisma } from "@/lib/db";
import { PLAN_LABELS, type PlanType } from "@/lib/plans";

export interface PaymentHistoryItem {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  period: string;
  createdAt: Date;
}

export interface CurrentPlanInfo {
  plan: PlanType;
  planLabel: string;
  planStartDate: Date | null;
  planEndDate: Date | null;
  gracePeriodEnd: Date | null;
  isExpired: boolean;
  isInGracePeriod: boolean;
  daysRemaining: number | null;
}

export async function getPaymentHistory(
  profileId: string,
): Promise<PaymentHistoryItem[]> {
  const payments = await prisma.payment.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return payments.map((p) => ({
    id: p.id,
    plan: p.plan,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    period: p.period,
    createdAt: p.createdAt,
  }));
}

export async function getCurrentPlanInfo(
  profileId: string,
): Promise<CurrentPlanInfo> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: {
      plan: true,
      planStartDate: true,
      planEndDate: true,
      gracePeriodEnd: true,
    },
  });

  if (!profile) {
    return {
      plan: "free",
      planLabel: PLAN_LABELS.free,
      planStartDate: null,
      planEndDate: null,
      gracePeriodEnd: null,
      isExpired: false,
      isInGracePeriod: false,
      daysRemaining: null,
    };
  }

  const now = new Date();
  const plan = (profile.plan || "free") as PlanType;
  const isExpired = profile.planEndDate ? profile.planEndDate < now : false;
  const isInGracePeriod =
    isExpired && profile.gracePeriodEnd ? profile.gracePeriodEnd > now : false;

  let daysRemaining: number | null = null;
  if (profile.planEndDate && !isExpired) {
    daysRemaining = Math.ceil(
      (profile.planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  } else if (isInGracePeriod && profile.gracePeriodEnd) {
    daysRemaining = Math.ceil(
      (profile.gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  return {
    plan,
    planLabel: PLAN_LABELS[plan] || "Ücretsiz",
    planStartDate: profile.planStartDate,
    planEndDate: profile.planEndDate,
    gracePeriodEnd: profile.gracePeriodEnd,
    isExpired,
    isInGracePeriod,
    daysRemaining,
  };
}

export interface UserBrandItem {
  id: string;
  name: string;
  domain: string;
  sector: string | null;
  type: string;
  isDefault: boolean;
  promptCount: number;
  competitorCount: number;
  lastScanAt: string | null;
}

export async function getUserBrands(profileId: string): Promise<UserBrandItem[]> {
  const brands = await prisma.brand.findMany({
    where: { profileId },
    include: {
      _count: { select: { prompts: true, competitors: true } },
      scans: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { completedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    domain: b.domain,
    sector: b.sector,
    type: b.type,
    isDefault: b.isDefault,
    promptCount: b._count.prompts,
    competitorCount: b._count.competitors,
    lastScanAt: b.scans[0]?.completedAt?.toISOString() ?? null,
  }));
}
