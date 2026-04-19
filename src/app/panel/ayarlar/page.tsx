import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";
import { AyarlarContentV3 } from "@/components/panel/ayarlar-v3/ayarlar-content-v3";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) return null;

  const brand = activeBrand.brand;
  const profile = activeBrand.profile;
  const plan = activeBrand.plan ?? "free";
  const userType =
    (brand as { userType?: string }).userType ?? "firma";

  const serviceRegions =
    ((brand as { serviceRegions?: string[] }).serviceRegions ?? []) as string[];

  // Fresh profile data for notification toggles
  const freshProfile = await prisma.profile.findUnique({
    where: { id: profile.id },
    select: {
      emailWeeklyReport: true,
      emailScoreChange: true,
      emailScanComplete: true,
    },
  });

  const competitors = await prisma.competitor.findMany({
    where: { brandId: brand.id },
    select: { id: true, name: true, domain: true, isPrimary: true },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    take: 10,
  });

  return (
    <AyarlarContentV3
      profileEmail={profile.email}
      profileFullName={profile.fullName ?? ""}
      profilePhone={profile.phone ?? null}
      brandName={brand.name}
      brandDomain={brand.domain ?? ""}
      brandSector={brand.sector ?? ""}
      userType={userType}
      plan={plan}
      serviceRegions={serviceRegions}
      competitors={competitors.map((c) => ({
        id: c.id,
        name: c.name,
        domain: c.domain ?? null,
        isPrimary: c.isPrimary ?? false,
      }))}
      notifications={{
        weeklyReport: freshProfile?.emailWeeklyReport ?? true,
        scoreChange: freshProfile?.emailScoreChange ?? true,
        scanComplete: freshProfile?.emailScanComplete ?? true,
      }}
    />
  );
}
