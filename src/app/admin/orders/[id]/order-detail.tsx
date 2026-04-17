"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Play, Package } from "lucide-react";
import { toast } from "sonner";
import type { AdminOrderDetail } from "@/lib/dal/admin-orders";

interface Props {
  order: AdminOrderDetail;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Ödeme Bekleniyor",
  paid_holding: "Ödeme Alındı — İş Bekliyor",
  in_progress: "Çalışılıyor",
  delivered: "Teslim Edildi",
  approved_final: "Onaylandı (Kesin)",
  refunded: "İade Edildi",
  cancelled: "İptal",
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderDetail({ order }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adminNote, setAdminNote] = useState(order.adminNotes ?? "");

  const callAction = async (path: string, successMsg: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/${path}`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Hata" }));
        toast.error(err.error ?? "İşlem başarısız");
        return;
      }
      toast.success(successMsg);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Ağ hatası");
    }
  };

  const saveNote = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: adminNote }),
      });
      if (!res.ok) {
        toast.error("Not kaydedilemedi");
        return;
      }
      toast.success("Not kaydedildi");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Ağ hatası");
    }
  };

  const canStartWork = order.status === "paid_holding";
  const canDeliver = order.status === "in_progress";
  const canRunPostAudit = order.status === "delivered" || order.status === "approved_final";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Siparişlere dön
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sipariş #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {order.userFullName || order.userEmail} — {order.brandName ?? order.brandDomain ?? ""}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Durum</div>
          <div className="text-lg font-bold text-gray-900">
            {STATUS_LABELS[order.status] ?? order.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol sütun: bilgiler */}
        <div className="lg:col-span-2 space-y-4">
          {/* Paket */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Paket: {order.packageName}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{order.packageDescription}</p>

            <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <div className="text-xs text-gray-500">Tutar</div>
                <div className="text-lg font-bold">
                  ₺{order.amount.toLocaleString("tr-TR")}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Teslim Süresi</div>
                <div className="text-lg font-bold">{order.packageDeliveryDays} gün</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Skor Artışı</div>
                <div className="text-lg font-bold text-green-700">
                  +{order.packageEstimatedScoreBoost}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Deliverable'lar:</p>
              <ul className="space-y-1">
                {order.packageDeliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skor */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Skor Takibi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Pre-Audit Skoru</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {order.preAuditScore ?? order.preScore ?? "—"}
                  <span className="text-sm text-gray-400">/100</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Post-Audit Skoru</div>
                <div className="text-3xl font-bold text-green-700 mt-1">
                  {order.postAuditScore ?? order.postScore ?? "—"}
                  <span className="text-sm text-gray-400">/100</span>
                </div>
                {order.postScore && order.preScore && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    +{order.postScore - order.preScore} puan artış
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Notlar */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Admin Notları</h2>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Müşteriye gönderilmeyen, iç notlar..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={saveNote}
              disabled={isPending}
              className="mt-2 px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              Not Kaydet
            </button>
          </div>
        </div>

        {/* Sağ sütun: aksiyonlar + timeline */}
        <div className="space-y-4">
          {/* Aksiyonlar */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Aksiyonlar</h2>
            <div className="space-y-2">
              <button
                disabled={!canStartWork || isPending}
                onClick={() => callAction("start-work", "İş başladı olarak işaretlendi")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" /> İşe Başla
              </button>
              <button
                disabled={!canDeliver || isPending}
                onClick={() => callAction("deliver", "Sipariş teslim edildi, 72 saat itiraz süresi başladı")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" /> Teslim Et
              </button>
              <button
                disabled={!canRunPostAudit || isPending}
                onClick={() =>
                  callAction(
                    "run-post-audit",
                    "Post-audit başlatıldı (birkaç dakika sürebilir)"
                  )
                }
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4" /> Post-Audit Çalıştır
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-gray-200 rounded-xl bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h2>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between">
                <span className="text-gray-600">Oluşturuldu</span>
                <span className="text-gray-900">{formatDate(order.createdAt)}</span>
              </li>
              {order.iyzicoPaymentRef && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Ödendi</span>
                  <span className="text-gray-900 font-mono">
                    {order.iyzicoPaymentRef.slice(0, 12)}...
                  </span>
                </li>
              )}
              {order.deliveredAt && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Teslim</span>
                  <span className="text-gray-900">{formatDate(order.deliveredAt)}</span>
                </li>
              )}
              {order.autoApproveAt && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Auto-approve</span>
                  <span className="text-gray-900">{formatDate(order.autoApproveAt)}</span>
                </li>
              )}
              {order.approvedAt && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Onaylandı</span>
                  <span className="text-gray-900">{formatDate(order.approvedAt)}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
