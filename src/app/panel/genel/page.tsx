import { getActiveBrand } from "@/lib/dal/brand";
import { EmptyState } from "@/components/panel/empty-state";
import { LayoutDashboardIcon } from "lucide-react";
import DashboardHero from "@/components/panel/dashboard-hero";
import DashboardDetails from "@/components/panel/dashboard-details";

export default async function GenelBakisPage() {
  const activeBrand = await getActiveBrand();
  const brandId = activeBrand?.brand?.id;
  const brandName = activeBrand?.brand?.name ?? "Marka";
  const tier = activeBrand?.plan ?? "free";

  if (!brandId) {
    return (
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Marka bulunamad\u0131"
        description="L\u00fctfen \u00f6nce marka ekleyin."
      />
    );
  }

  return (
    <div>
      {/* Hero Zone - tier-based */}
      <DashboardHero tier={tier} brandName={brandName} />

      {/* Divider */}
      <div style={{ padding: "32px 40px 0" }}>
        <div
          style={{
            borderTop: "1px solid var(--d-g200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              background: "var(--d-g50)",
              padding: "6px 16px",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--d-g400)",
              textTransform: "uppercase",
              letterSpacing: ".8px",
              border: "1px solid var(--d-g200)",
              borderRadius: "20px",
            }}
          >
            Detaylar
          </span>
        </div>
      </div>

      {/* Detail Zone */}
      <DashboardDetails brandName={brandName} />
    </div>
  );
}
