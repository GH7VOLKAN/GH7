"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SaveIcon, GlobeIcon, BellIcon, ShieldIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  brandName: string;
  brandDomain: string;
  brandSector: string;
  profileEmail: string;
  profileFullName: string;
  plan: string;
}

export function AyarlarContent({
  brandName: initialBrandName,
  brandDomain: initialDomain,
  brandSector: initialSector,
  profileEmail,
  profileFullName,
  plan,
}: Props) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(initialBrandName);
  const [domain, setDomain] = useState(initialDomain);
  const [sector, setSector] = useState(initialSector);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/panel/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: brandName, domain, sector }),
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("Kaydetme sırasında bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Marka ve hesap ayarlarınızı yönetin</p>
      </div>

      {/* Brand Info */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <GlobeIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Marka Bilgileri</h3>
            <p className="text-xs text-gray-500">Temel marka ve domain bilgileriniz</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Marka Adı</label>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Domain</label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sektör</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
            <div className="flex items-center gap-2 h-[38px]">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                {plan === "pro" ? "Pro" : "Free"}
              </span>
              {plan !== "pro" && (
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Pro&apos;ya geçin &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <ShieldIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Hesap Bilgileri</h3>
            <p className="text-xs text-gray-500">Giriş yapılan hesap bilgileri</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
            <input
              value={profileEmail}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Soyad</label>
            <input
              value={profileFullName}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Bildirim Tercihleri</h3>
            <p className="text-xs text-gray-500">Hangi bildirimleri almak istediğinizi seçin</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label: "Haftalık rapor e-postası", desc: "Her Pazartesi özet e-posta", enabled: true },
            { label: "Skor değişikliği bildirimi", desc: "GEO skorunuz değiştiğinde", enabled: true },
            { label: "Yeni rakip tespiti", desc: "Yeni bir rakip tespit edildiğinde", enabled: false },
            { label: "Tarama tamamlandı", desc: "Planlanmış tarama bittiğinde", enabled: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  item.enabled ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    item.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <ShieldIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Güvenlik</h3>
            <p className="text-xs text-gray-500">Hesap güvenlik ayarları</p>
          </div>
        </div>
        <div className="space-y-3">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Şifre değiştir &rarr;
          </button>
        </div>
      </div>

      {/* Hesap Silme */}
      <div className="border border-red-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Trash2Icon className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-medium text-red-600">Hesabı Sil</h3>
            <p className="text-xs text-gray-500">Hesabınızı ve tüm verilerinizi kalıcı olarak silin</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Bu işlem geri alınamaz. Tüm markalarınız, tarama geçmişiniz, raporlarınız ve ödeme bilgileriniz kalıcı olarak silinecektir.
        </p>
        <button
          onClick={() => {
            setDeleteDialogOpen(true);
            setDeleteConfirmText("");
            setDeleteError("");
          }}
          className="flex items-center gap-2 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <Trash2Icon className="w-4 h-4" />
          Hesabı Sil
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Hesabı Kalıcı Olarak Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">Silinecek veriler:</p>
              <ul className="text-sm text-red-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>Tüm marka ve tarama verileri</li>
                <li>Aksiyon planları ve geçmiş raporlar</li>
                <li>Bildirim tercihleri ve ayarlar</li>
                <li>Aktif abonelik (varsa iptal edilir)</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Onaylamak için <span className="font-bold text-red-600">HESABIMI SİL</span> yazın
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="HESABIMI SİL"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                onClick={async () => {
                  if (deleteConfirmText !== "HESABIMI SİL") {
                    setDeleteError("Lütfen tam olarak 'HESABIMI SİL' yazın.");
                    return;
                  }
                  setDeleting(true);
                  setDeleteError("");
                  try {
                    const res = await fetch("/api/user/delete", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ confirmText: deleteConfirmText }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      setDeleteError(data.error || "Hesap silinemedi. Lütfen tekrar deneyin.");
                      return;
                    }
                    router.push("/");
                  } catch {
                    setDeleteError("Hesap silinemedi. Lütfen tekrar deneyin.");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting || deleteConfirmText !== "HESABIMI SİL"}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Siliniyor..." : "Hesabı Kalıcı Olarak Sil"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <SaveIcon className="w-4 h-4" />
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}
