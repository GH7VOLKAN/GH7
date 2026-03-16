/**
 * GH7.ai — Plan Aktivasyonu / Deaktivasyonu
 *
 * İyzico ödeme onayından sonra kullanıcının planını günceller.
 */

import { prisma } from "@/lib/db";
import type { PlanType } from "@/lib/plans";
import type { PlanPeriod } from "./plans";

const GRACE_PERIOD_DAYS = 3;

/**
 * Plan aktif et — ödeme başarılı olduktan sonra çağrılır.
 */
export async function activatePlan(
  profileId: string,
  plan: Exclude<PlanType, "free">,
  period: PlanPeriod,
): Promise<void> {
  const now = new Date();
  const endDate = new Date(now);

  if (period === "monthly") {
    endDate.setDate(endDate.getDate() + 30);
  } else {
    endDate.setDate(endDate.getDate() + 365);
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: {
      plan,
      planStartDate: now,
      planEndDate: endDate,
      gracePeriodEnd: null, // Yeni ödeme — grace period sıfırla
    },
  });

  console.log(`[activatePlan] ${profileId} → ${plan} (${period}), bitiş: ${endDate.toISOString()}`);
}

/**
 * Planı free'ye düşür — grace period bittiğinde çağrılır.
 */
export async function deactivatePlan(profileId: string): Promise<void> {
  await prisma.profile.update({
    where: { id: profileId },
    data: {
      plan: "free",
      planStartDate: null,
      planEndDate: null,
      gracePeriodEnd: null,
    },
  });

  console.log(`[deactivatePlan] ${profileId} → free`);
}

/**
 * Süresi dolmuş planları kontrol et.
 * - planEndDate geçmiş + gracePeriodEnd yok → grace period başlat
 * - gracePeriodEnd geçmiş → planı deaktive et
 *
 * Cron job tarafından günlük çağrılır.
 * Dönen: { checked, graceStarted, deactivated }
 */
export async function processExpiredPlans(): Promise<{
  checked: number;
  graceStarted: number;
  deactivated: number;
}> {
  const now = new Date();
  let graceStarted = 0;
  let deactivated = 0;

  // 1. Plan süresi dolmuş ama grace period başlamamış olanlar
  const expiredNoGrace = await prisma.profile.findMany({
    where: {
      plan: { not: "free" },
      planEndDate: { lt: now },
      gracePeriodEnd: null,
    },
  });

  for (const profile of expiredNoGrace) {
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

    await prisma.profile.update({
      where: { id: profile.id },
      data: { gracePeriodEnd },
    });

    graceStarted++;
    console.log(`[processExpiredPlans] Grace period başlatıldı: ${profile.id} → ${gracePeriodEnd.toISOString()}`);
  }

  // 2. Grace period de dolmuş olanlar → free'ye düşür
  const expiredGrace = await prisma.profile.findMany({
    where: {
      plan: { not: "free" },
      gracePeriodEnd: { lt: now },
    },
  });

  for (const profile of expiredGrace) {
    await deactivatePlan(profile.id);
    deactivated++;
  }

  return {
    checked: expiredNoGrace.length + expiredGrace.length,
    graceStarted,
    deactivated,
  };
}
