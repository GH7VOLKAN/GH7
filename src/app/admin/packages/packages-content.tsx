"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  slug: string;
  userType: string;
  tier: string;
  price: number;
  description: string;
  deliverables: string[];
  auditItemsFixed: string[];
  estimatedScoreBoost: number;
  deliveryDays: number;
  isActive: boolean;
}

interface Props {
  packages: Package[];
}

const USER_TYPE_LABELS: Record<string, string> = {
  firma: "Firma",
  kisi: "Kişisel",
  eticaret: "E-Ticaret",
  yurtdisi: "Yurtdışı",
};

const TIER_ORDER: Record<string, number> = { temel: 1, buyume: 2, hakimiyet: 3 };

export function PackagesContent({ packages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ price: number; isActive: boolean }>({
    price: 0,
    isActive: true,
  });

  const startEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setEditValues({ price: pkg.price, isActive: pkg.isActive });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Kaydedilemedi" }));
        toast.error(err.error ?? "Kaydedilemedi");
        return;
      }
      toast.success("Paket güncellendi");
      setEditingId(null);
      startTransition(() => router.refresh());
    } catch {
      toast.error("Ağ hatası");
    }
  };

  // Grup by userType
  const grouped = packages.reduce(
    (acc, pkg) => {
      if (!acc[pkg.userType]) acc[pkg.userType] = [];
      acc[pkg.userType].push(pkg);
      return acc;
    },
    {} as Record<string, Package[]>
  );

  for (const type in grouped) {
    grouped[type].sort(
      (a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hizmet Paketleri</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fiyat, aktiflik ve içerik yönetimi. 4 kullanıcı tipi × 3 tier = 12 paket.
        </p>
      </div>

      {Object.entries(grouped).map(([userType, pkgs]) => (
        <div key={userType} className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
            {USER_TYPE_LABELS[userType] ?? userType}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pkgs.map((pkg) => {
              const isEditing = editingId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className="border border-gray-200 rounded-xl bg-white p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{pkg.tier}</p>
                    </div>
                    {!isEditing && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pkg.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pkg.isActive ? "Aktif" : "Pasif"}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Fiyat (₺)
                        </label>
                        <input
                          type="number"
                          value={editValues.price}
                          onChange={(e) =>
                            setEditValues((v) => ({
                              ...v,
                              price: parseInt(e.target.value || "0", 10),
                            }))
                          }
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={editValues.isActive}
                          onChange={(e) =>
                            setEditValues((v) => ({ ...v, isActive: e.target.checked }))
                          }
                        />
                        Aktif
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(pkg.id)}
                          disabled={isPending}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 mb-3">{pkg.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <div className="text-gray-500">Fiyat</div>
                          <div className="font-bold text-gray-900">
                            ₺{pkg.price.toLocaleString("tr-TR")}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Skor artışı</div>
                          <div className="font-bold text-green-700">
                            +{pkg.estimatedScoreBoost}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Teslim</div>
                          <div className="font-bold text-gray-900">
                            {pkg.deliveryDays} gün
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Deliverable</div>
                          <div className="font-bold text-gray-900">
                            {pkg.deliverables.length} madde
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => startEdit(pkg)}
                        className="w-full px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Düzenle
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
