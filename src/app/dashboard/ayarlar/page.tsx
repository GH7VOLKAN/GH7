import { getActiveBrand } from "@/lib/dal/brand";
import { getCurrentPlanInfo, getPaymentHistory, getUserBrands } from "@/lib/dal/payments";
import { getPlanLimits } from "@/lib/plans";
import { AyarlarClient } from "./ayarlar-client";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();
  const profileId = activeBrand?.profile?.id;
  const plan = activeBrand?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const [planInfo, paymentHistory, userBrands] = await Promise.all([
    profileId ? getCurrentPlanInfo(profileId) : null,
    profileId ? getPaymentHistory(profileId) : Promise.resolve([]),
    profileId ? getUserBrands(profileId) : Promise.resolve([]),
  ]);

  // Count total prompts & competitors across all brands
  const totalPrompts = userBrands.reduce((sum, b) => sum + b.promptCount, 0);
  const totalCompetitors = userBrands.reduce((sum, b) => sum + b.competitorCount, 0);

  return (
    <AyarlarClient
      brandId={activeBrand?.brand?.id ?? ""}
      brandName={activeBrand?.brand?.name ?? ""}
      brandDomain={activeBrand?.brand?.domain ?? ""}
      brandSector={activeBrand?.brand?.sector ?? ""}
      brandType={(activeBrand?.brand?.type as "firma" | "kisisel") ?? "firma"}
      autoScan={activeBrand?.brand?.autoScan ?? true}
      scanInterval={activeBrand?.brand?.scanInterval ?? "daily"}
      phone={activeBrand?.profile?.phone ?? ""}
      smsEnabled={activeBrand?.profile?.smsEnabled ?? false}
      emailScanComplete={activeBrand?.profile?.emailScanComplete ?? true}
      emailScoreChange={activeBrand?.profile?.emailScoreChange ?? true}
      emailWeeklyReport={activeBrand?.profile?.emailWeeklyReport ?? true}
      userName={activeBrand?.profile?.fullName ?? ""}
      userEmail={activeBrand?.profile?.email ?? ""}
      avatarUrl={activeBrand?.profile?.avatarUrl ?? null}
      plan={planInfo?.plan ?? "free"}
      planLabel={planInfo?.planLabel ?? "Ücretsiz"}
      planEndDate={planInfo?.planEndDate?.toISOString() ?? null}
      planStartDate={planInfo?.planStartDate?.toISOString() ?? null}
      daysRemaining={planInfo?.daysRemaining ?? null}
      isInGracePeriod={planInfo?.isInGracePeriod ?? false}
      isExpired={planInfo?.isExpired ?? false}
      brands={userBrands}
      paymentHistory={paymentHistory.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      }))}
      limits={{
        maxPrompts: limits.maxPrompts,
        maxBrands: limits.maxBrands,
        maxCompetitors: limits.maxCompetitors,
        scanFrequency: limits.scanFrequency,
        smsEnabled: limits.smsEnabled,
      }}
      usage={{
        totalPrompts,
        totalBrands: userBrands.length,
        totalCompetitors,
      }}
      apiKey={activeBrand?.brand?.apiKey ?? null}
      webhookUrl={activeBrand?.brand?.webhookUrl ?? null}
    />
  );
}
