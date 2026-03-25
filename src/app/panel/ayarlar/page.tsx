"use client";

import { useState } from "react";
import { SaveIcon, GlobeIcon, BellIcon, ShieldIcon } from "lucide-react";

export default function AyarlarPage() {
  const [brandName, setBrandName] = useState("ISITMAX");
  const [domain, setDomain] = useState("isitmax.com");
  const [sector, setSector] = useState("Isıtma Sistemleri");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Marka ve hesap ayarlarınızı yönetin</p>
      </div>

      {/* Brand Info */}
      <div className="border border-gray-200 rounded-xl p-6">
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
                Free
              </span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Pro&apos;ya geçin →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border border-gray-200 rounded-xl p-6">
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
      <div className="border border-gray-200 rounded-xl p-6">
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
            Şifre değiştir →
          </button>
          <br />
          <button className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Hesabı sil
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors">
          <SaveIcon className="w-4 h-4" />
          Kaydet
        </button>
      </div>
    </div>
  );
}
