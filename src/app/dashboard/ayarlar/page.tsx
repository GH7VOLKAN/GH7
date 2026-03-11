import { getActiveBrand } from "@/lib/dal/brand";
import { AyarlarClient } from "./ayarlar-client";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();

  return (
    <AyarlarClient
      brandName={activeBrand?.brand?.name ?? ""}
      brandDomain={activeBrand?.brand?.domain ?? ""}
      brandSector={activeBrand?.brand?.sector ?? ""}
    />
  );
}
