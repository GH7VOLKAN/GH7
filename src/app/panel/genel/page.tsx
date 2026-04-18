import { LayoutDashboard } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import { getGenelPageData } from "@/lib/dal/genel-page";
import { EmptyState } from "@/components/panel/empty-state";
import { GenelContentV3 } from "@/components/panel/genel-v3/genel-content-v3";

export default async function GenelBakisPage() {
  // Guard: panel/layout.tsx getAuthState() ile hallediyor.
  // Buraya gelindiyse session + brand garanti var.
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) return null; // safety net — layout zaten redirect etti

  const brandId = activeBrand.brand.id;
  const userId = activeBrand.profile?.id ?? null;
  const domain = activeBrand.brand.domain ?? "";
  const brandName = activeBrand.brand.name;
  const plan = activeBrand.plan ?? "free";

  const data = await getGenelPageData(brandId, userId, plan, domain, brandName).catch(
    (e) => {
      console.error("[panel/genel] getGenelPageData error:", e);
      return null;
    },
  );

  if (!data) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Henüz veri yok"
        description="İlk analizinizi tamamladıktan sonra genel bakış burada görünecek. Ana sayfadan ücretsiz analiz başlatabilirsiniz."
      />
    );
  }

  return <GenelContentV3 data={data} />;
}
