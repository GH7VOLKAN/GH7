// Client-safe panel types + display constants (NO server imports).
// Kept separate from operator-data.ts so client components can import these
// without dragging in next/headers via the server data layer.

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
