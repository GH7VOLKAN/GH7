import { createClient } from "@/lib/supabase/server";

export type OrderStatus = "new" | "intake" | "running" | "analyzing" | "report" | "delivered";
export type Marketplace = "bionluk" | "fiverr" | "upwork" | "own";

export interface OrderRow {
  id: string;
  clientName: string;
  domain: string | null;
  geography: string | null;
  audience: string | null;
  tierName: string;
  promptCount: number;
  marketplace: Marketplace;
  status: OrderStatus;
  reportLang: string;
  reportToken: string | null;
  whiteLabel: boolean;
  intake: Record<string, unknown> | null;
  createdAt: string;
}

export interface PanelData {
  orders: OrderRow[];
  stats: { total: number; inProduction: number; delivered: number; new: number };
}

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

export const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: "Yeni", color: "#6b7280", bg: "#f3f4f6" },
  intake: { label: "Intake", color: "#f59e0b", bg: "#fef3c7" },
  running: { label: "Çalışıyor", color: "#f59e0b", bg: "#fef3c7" },
  analyzing: { label: "Gap analizi", color: "#f59e0b", bg: "#fef3c7" },
  report: { label: "Rapor hazır", color: "#3b82f6", bg: "#dbeafe" },
  delivered: { label: "Teslim", color: "#22c55e", bg: "#f0fdf4" },
};

export const MARKETPLACE_META: Record<Marketplace, string> = {
  bionluk: "Bionluk",
  fiverr: "Fiverr",
  upwork: "Upwork",
  own: "Kendi Kanalım",
};
