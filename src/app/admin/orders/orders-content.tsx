"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminOrderRow } from "@/lib/dal/admin-orders";

interface Stats {
  total: number;
  paidHolding: number;
  inProgress: number;
  delivered: number;
  approved: number;
  refunded: number;
  totalRevenue: number;
}

interface Props {
  orders: AdminOrderRow[];
  stats: Stats;
  currentFilter: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ödeme Bekleniyor",
  paid_holding: "Ödendi — İş Bekliyor",
  in_progress: "Çalışılıyor",
  delivered: "Teslim Edildi",
  approved_final: "Onaylandı",
  refunded: "İade Edildi",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  paid_holding: "bg-amber-50 text-amber-800",
  in_progress: "bg-blue-50 text-blue-800",
  delivered: "bg-purple-50 text-purple-800",
  approved_final: "bg-green-50 text-green-800",
  refunded: "bg-red-50 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "paid_holding", label: "İş Bekliyor" },
  { key: "in_progress", label: "Çalışılıyor" },
  { key: "delivered", label: "Teslim Edildi" },
  { key: "approved_final", label: "Onaylanmış" },
  { key: "refunded", label: "İade" },
];

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrdersContent({ orders, stats, currentFilter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") params.delete("status");
    else params.set("status", key);
    router.push(`/admin/orders?${params.toString()}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hizmet Paketi Siparişleri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Müşteri siparişleri, teslim akışı ve iade yönetimi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <StatCard label="Toplam" value={String(stats.total)} />
        <StatCard label="İş Bekliyor" value={String(stats.paidHolding)} color="amber" />
        <StatCard label="Çalışılıyor" value={String(stats.inProgress)} color="blue" />
        <StatCard label="Teslim Edildi" value={String(stats.delivered)} color="purple" />
        <StatCard label="Onaylandı" value={String(stats.approved)} color="green" />
        <StatCard
          label="Gelir (Onaylı)"
          value={`₺${stats.totalRevenue.toLocaleString("tr-TR")}`}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentFilter === f.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Müşteri</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Paket</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Tutar</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Durum</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Tarih</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Bu filtrede sipariş yok
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-gray-900">{o.userFullName || o.userEmail}</div>
                  <div className="text-xs text-gray-500">{o.brandName ?? o.brandDomain ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-900">{o.packageName}</div>
                  <div className="text-xs text-gray-500">{o.packageTier}</div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  ₺{o.amount.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[o.status] ?? STATUS_COLORS.pending
                    }`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Detay →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "amber" | "blue" | "purple" | "green";
}) {
  const colorClass: Record<string, string> = {
    amber: "text-amber-700",
    blue: "text-blue-700",
    purple: "text-purple-700",
    green: "text-green-700",
  };
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color ? colorClass[color] : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
