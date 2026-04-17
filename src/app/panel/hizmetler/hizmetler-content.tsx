"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wrench,
  TrendingUp,
  Crown,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ServicePackageData,
  ServiceOrderData,
} from "@/lib/dal/service-orders";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

interface Props {
  packages: ServicePackageData[];
  orders: ServiceOrderData[];
  userType: string;
  currentScore: number;
  auditId?: string;
  plan?: string;
}

const TIER_CONFIG: Record<
  string,
  {
    icon: typeof Wrench;
    label: string;
    badge?: string;
    color: string;
    bgColor: string;
  }
> = {
  temel: {
    icon: Wrench,
    label: "Temel",
    color: "border-gray-200",
    bgColor: "bg-white",
  },
  buyume: {
    icon: TrendingUp,
    label: "Büyüme",
    badge: "EN POPÜLER",
    color: "border-blue-300 ring-2 ring-blue-100",
    bgColor: "bg-blue-50/20",
  },
  hakimiyet: {
    icon: Crown,
    label: "Hakimiyet",
    color: "border-amber-300",
    bgColor: "bg-amber-50/20",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: {
    label: "Ödeme Bekleniyor",
    color: "text-amber-700",
    bg: "bg-amber-50",
    icon: Clock,
  },
  paid_holding: {
    label: "Ödeme Alındı, İş Başladı",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: Loader2,
  },
  in_progress: {
    label: "Çalışılıyor",
    color: "text-blue-700",
    bg: "bg-blue-50",
    icon: Loader2,
  },
  delivered: {
    label: "Teslim Edildi — Onayınız Bekleniyor",
    color: "text-purple-700",
    bg: "bg-purple-50",
    icon: Clock,
  },
  approved_final: {
    label: "Onaylandı",
    color: "text-green-700",
    bg: "bg-green-50",
    icon: CheckCircle2,
  },
  refunded: {
    label: "İade Edildi",
    color: "text-gray-700",
    bg: "bg-gray-100",
    icon: XCircle,
  },
  cancelled: {
    label: "İptal",
    color: "text-gray-700",
    bg: "bg-gray-100",
    icon: XCircle,
  },
};

function formatTime(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRemainingHours(autoApproveAt: Date | null): number | null {
  if (!autoApproveAt) return null;
  const diff = new Date(autoApproveAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60));
}

export function HizmetlerContent({
  packages,
  orders,
  userType,
  currentScore,
  auditId,
  plan = "free",
}: Props) {
  const isProPlan = plan !== "free";
  const searchParams = useSearchParams();
  const preselectedTier = searchParams.get("tier");
  const [isPending, startTransition] = useTransition();
  const [orderingPackageId, setOrderingPackageId] = useState<string | null>(null);

  const handleOrder = async (packageId: string) => {
    setOrderingPackageId(packageId);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, auditId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Bilinmeyen hata" }));
        toast.error(err.error ?? "Sipariş oluşturulamadı");
        setOrderingPackageId(null);
        return;
      }

      const data = await res.json();
      if (data.checkoutFormContent) {
        // Open iyzico checkout in new window or inject
        const checkoutWindow = window.open("", "_blank", "width=600,height=800");
        if (checkoutWindow) {
          checkoutWindow.document.write(data.checkoutFormContent);
          checkoutWindow.document.close();
        }
        toast.success("Ödeme sayfasına yönlendiriliyorsunuz...");
        startTransition(() => {
          // Refresh orders list after a delay
          setTimeout(() => window.location.reload(), 3000);
        });
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.success("Sipariş oluşturuldu");
      }
    } catch (err) {
      console.error("[order] Error:", err);
      toast.error("Sipariş oluşturulurken hata oluştu");
    } finally {
      setOrderingPackageId(null);
    }
  };

  const handleApprove = async (orderId: string) => {
    if (!confirm("Bu siparişi onaylıyor musunuz? Ödeme kesin olarak geçecek.")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Sipariş onaylandı. Teşekkürler!");
      startTransition(() => window.location.reload());
    } catch {
      toast.error("Onay işlemi başarısız oldu");
    }
  };

  const handleRefund = async (orderId: string) => {
    const reason = prompt(
      "İade sebebinizi kısaca yazın (zorunlu değil ama yardımcı olur):"
    );
    if (reason === null) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      toast.success("İade talebiniz işleme alındı");
      startTransition(() => window.location.reload());
    } catch {
      toast.error("İade işlemi başarısız oldu");
    }
  };

  const activeOrders = orders.filter(
    (o) => !["refunded", "cancelled"].includes(o.status)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Aktif Siparişler */}
      {activeOrders.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Siparişleriniz
          </h2>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const remainingHours = getRemainingHours(order.autoApproveAt);
              const showActionButtons = order.status === "delivered";

              return (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-5 bg-white"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {order.packageName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig.color} ${statusConfig.bg}`}
                        >
                          <StatusIcon
                            className={`w-3.5 h-3.5 ${
                              order.status === "in_progress" ||
                              order.status === "paid_holding"
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span>₺{order.amount.toLocaleString("tr-TR")}</span>
                        <span>Oluşturulma: {formatTime(order.createdAt)}</span>
                        {order.deliveredAt && (
                          <span>Teslim: {formatTime(order.deliveredAt)}</span>
                        )}
                        {remainingHours !== null && remainingHours > 0 && (
                          <span className="text-purple-700 font-medium">
                            {remainingHours} saat itiraz süresi kaldı
                          </span>
                        )}
                      </div>
                      {order.preScore !== null && order.postScore !== null && (
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <span className="text-gray-500">Skor:</span>
                          <span className="text-gray-400">{order.preScore}</span>
                          <span className="text-gray-300">&rarr;</span>
                          <span className="font-bold text-green-600">
                            {order.postScore}{" "}
                            <span className="text-xs">
                              (+{order.postScore - order.preScore})
                            </span>
                          </span>
                        </div>
                      )}
                      {order.adminNotes && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Admin notu: {order.adminNotes}
                        </p>
                      )}
                    </div>

                    {showActionButtons && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(order.id)}
                          disabled={isPending}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Onayla ve Beğendim
                        </button>
                        <button
                          onClick={() => handleRefund(order.id)}
                          disabled={isPending}
                          className="px-4 py-2 border border-red-300 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          İade İste
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Paketler */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Mevcut Paketler
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Kırmızı işaretli audit maddelerini uzman ekibimiz sizin yerinize
          çözsün. Önce işi görün, memnun kalmazsanız 72 saat içinde iade
          alın.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const config = TIER_CONFIG[pkg.tier] ?? TIER_CONFIG.temel;
            const Icon = config.icon;
            const projectedScore = Math.min(
              100,
              currentScore + pkg.estimatedScoreBoost
            );
            const isHighlighted = preselectedTier === pkg.tier;
            const isOrdering = orderingPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative border ${config.color} ${config.bgColor} rounded-2xl p-6 ${
                  isHighlighted ? "ring-4 ring-blue-300" : ""
                }`}
              >
                {config.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {config.badge}
                  </span>
                )}
                <Icon className="w-7 h-7 text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    ₺{pkg.price.toLocaleString("tr-TR")}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {pkg.deliveryDays} gün teslim
                  </div>
                </div>

                {/* Score projection */}
                <div className="bg-white border border-gray-100 rounded-lg p-3 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Mevcut skor:</span>
                    <span className="font-semibold">{currentScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-green-700">
                    <span>Bu paketle:</span>
                    <span className="font-bold">
                      ↑ {projectedScore}/100 (+{pkg.estimatedScoreBoost})
                    </span>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Bu pakete dahil:
                  </p>
                  <ul className="space-y-1.5">
                    {pkg.deliverables.slice(0, 5).map((d, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-gray-600"
                      >
                        <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                    {pkg.deliverables.length > 5 && (
                      <li className="text-xs text-gray-400">
                        + {pkg.deliverables.length - 5} madde daha
                      </li>
                    )}
                  </ul>
                </div>

                {isProPlan ? (
                  <button
                    onClick={() => handleOrder(pkg.id)}
                    disabled={isOrdering || isPending}
                    className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isOrdering ? "Sipariş oluşturuluyor..." : "Sipariş Ver"}
                  </button>
                ) : (
                  <a
                    href="/panel/abonelik"
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Hizmet paketleri Pro üyelere açıktır"
                  >
                    <Crown className="size-3.5" />
                    Pro&apos;ya Geç → Satın Al
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          💳 Önce iş yapılır, sonuç görüldükten sonra onaylanır. 72 saat içinde
          itiraz hakkı.
        </p>
      </section>

      <PageBottomCTA />
    </div>
  );
}
