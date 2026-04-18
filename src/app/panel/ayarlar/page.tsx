import { getActiveBrand } from "@/lib/dal/brand";
import { AyarlarContentV3 } from "@/components/panel/ayarlar-v3/ayarlar-content-v3";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) return null;

  const brand = activeBrand.brand;
  const profile = activeBrand.profile;
  const plan = activeBrand.plan ?? "free";

  return (
    <AyarlarContentV3
      profileEmail={profile.email}
      profileFullName={profile.fullName ?? ""}
      profilePhone={profile.phone ?? null}
      brandName={brand.name}
      brandDomain={brand.domain ?? ""}
      brandSector={brand.sector ?? ""}
      plan={plan}
    />
  );
}
