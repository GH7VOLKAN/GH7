import { getActiveBrand } from "@/lib/dal/brand";
import { AyarlarClient } from "./ayarlar-client";

export default async function AyarlarPage() {
  const activeBrand = await getActiveBrand();

  return (
    <AyarlarClient
      brandId={activeBrand?.brand?.id ?? ""}
      brandName={activeBrand?.brand?.name ?? ""}
      brandDomain={activeBrand?.brand?.domain ?? ""}
      brandSector={activeBrand?.brand?.sector ?? ""}
      brandType={(activeBrand?.brand?.type as "firma" | "kisisel") ?? "firma"}
      autoScan={activeBrand?.brand?.autoScan ?? true}
      scanInterval={activeBrand?.brand?.scanInterval ?? "daily"}
    />
  );
}
