import { getActiveBrand } from "@/lib/dal/brand";
import { PaketlerContent } from "@/components/kinde/paketler-content";

export default async function PaketlerPage() {
  const activeBrand = await getActiveBrand();
  const plan = activeBrand?.plan ?? "free";

  return <PaketlerContent plan={plan} />;
}
