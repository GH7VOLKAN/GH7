import { getActiveBrand } from "@/lib/dal/brand";
import { redirect } from "next/navigation";
import { AyarlarContent } from "./ayarlar-content";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");

  const brand = activeBrand.brand;
  const profile = activeBrand.profile;
  const plan = activeBrand.plan ?? "free";

  return (
    <AyarlarContent
      brandName={brand.name}
      brandDomain={brand.domain ?? ""}
      brandSector={brand.sector ?? ""}
      profileEmail={profile.email}
      profileFullName={profile.fullName ?? ""}
      plan={plan}
    />
  );
}
