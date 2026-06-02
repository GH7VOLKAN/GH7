import { createClient } from "@/lib/supabase/server";
import type { OrderRow, OrderStatus, Marketplace, PanelData } from "@/lib/panel-meta";

const IN_PRODUCTION: OrderStatus[] = ["intake", "running", "analyzing", "report"];

interface RawOrder {
  id: string;
  marketplace: Marketplace;
  status: OrderStatus;
  report_lang: string;
  report_token: string | null;
  white_label: boolean;
  intake: Record<string, unknown> | null;
  created_at: string;
  clients: { name: string; domain: string | null; geography: string | null; audience: string | null } | null;
  product_tiers: { name: string; prompt_count: number } | null;
}

/** Stats are computed across ALL orders; the list is filtered by marketplace. */
export async function getPanelData(marketplace?: Marketplace): Promise<PanelData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, marketplace, status, report_lang, report_token, white_label, intake, created_at, clients(name, domain, geography, audience), product_tiers(name, prompt_count)",
    )
    .order("created_at", { ascending: false })
    .overrideTypes<RawOrder[]>();

  if (error) throw error;

  const all: OrderRow[] = (data ?? []).map((o) => ({
    id: o.id,
    clientName: o.clients?.name ?? "—",
    domain: o.clients?.domain ?? null,
    geography: o.clients?.geography ?? null,
    audience: o.clients?.audience ?? null,
    tierName: o.product_tiers?.name ?? "—",
    promptCount: o.product_tiers?.prompt_count ?? 0,
    marketplace: o.marketplace,
    status: o.status,
    reportLang: o.report_lang,
    reportToken: o.report_token,
    whiteLabel: o.white_label,
    intake: o.intake,
    createdAt: o.created_at,
  }));

  const stats = {
    total: all.length,
    inProduction: all.filter((o) => IN_PRODUCTION.includes(o.status)).length,
    delivered: all.filter((o) => o.status === "delivered").length,
    new: all.filter((o) => o.status === "new").length,
  };

  const orders = marketplace ? all.filter((o) => o.marketplace === marketplace) : all;
  return { orders, stats };
}
