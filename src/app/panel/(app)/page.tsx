import { getPanelData } from "@/lib/operator-data";
import type { Marketplace } from "@/lib/panel-meta";
import { StatCards } from "@/components/panel/StatCards";
import { OrdersView } from "@/components/panel/OrdersView";

export const dynamic = "force-dynamic";
// Server action "Çalıştır" runs the engine; give it the max Hobby duration.
// NOTE: a full run still exceeds this — production needs a background job.
export const maxDuration = 60;

const MARKETPLACES = ["bionluk", "fiverr", "upwork", "own"];

export default async function PanelHome({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const marketplace = (m && MARKETPLACES.includes(m) ? m : undefined) as Marketplace | undefined;
  const { orders, stats } = await getPanelData(marketplace);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 3, color: "#bbb" }}>
          AI GÖRÜNÜRLÜK
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-1.5px", color: "#111" }}>
          Siparişler
        </h1>
      </div>
      <StatCards stats={stats} />
      <OrdersView orders={orders} />
    </div>
  );
}
