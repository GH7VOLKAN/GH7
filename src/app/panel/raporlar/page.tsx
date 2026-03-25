"use client";

import { useState } from "react";
import {
  FileTextIcon,
  DownloadIcon,
  MailIcon,
  MessageCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
} from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";

const REPORT_HISTORY = [
  { id: 1, title: "Haftalık GEO Raporu", date: "17 Mar 2025", type: "weekly", status: "ready" },
  { id: 2, title: "Aylık Performans Raporu", date: "01 Mar 2025", type: "monthly", status: "ready" },
  { id: 3, title: "Haftalık GEO Raporu", date: "10 Mar 2025", type: "weekly", status: "ready" },
  { id: 4, title: "Rakip Analiz Raporu", date: "25 Şub 2025", type: "competitor", status: "ready" },
  { id: 5, title: "Aylık Performans Raporu", date: "01 Şub 2025", type: "monthly", status: "ready" },
];

export default function RaporlarPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  return (
    <div className="space-y-8">
      {/* Empty state - aktif data yokken gösterilir */}
      {/* {REPORT_HISTORY.length === 0 && (
        <EmptyState
          icon={FileTextIcon}
          title="Henüz rapor oluşturulmadı"
          description="İlk raporunuz tarama sonrasında otomatik oluşturulacak."
        />
      )} */}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
        <p className="text-sm text-gray-500 mt-1">
          GEO performansınızı PDF olarak indirin veya otomatik olarak alın
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF Download */}
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileTextIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">PDF Rapor İndir</h3>
              <p className="text-xs text-gray-500">Türkçe, markalı rapor</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            GEO skoru, ısı haritası, rakip analizi ve aksiyon önerilerini içeren detaylı rapor
          </p>
          <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors">
            <DownloadIcon className="w-4 h-4" />
            PDF İndir
          </button>
        </div>

        {/* Weekly Email */}
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <MailIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Haftalık E-posta Özeti</h3>
              <p className="text-xs text-gray-500">Her Pazartesi 09:00</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Durum</span>
            <button
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                emailEnabled ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  emailEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <input
            type="email"
            defaultValue="info@isitmax.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
            placeholder="E-posta adresiniz"
          />
        </div>

        {/* WhatsApp */}
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <MessageCircleIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">WhatsApp Özet</h3>
              <p className="text-xs text-gray-500">Yakında</p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Durum</span>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                whatsappEnabled ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  whatsappEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <input
            type="tel"
            defaultValue="+90 532 xxx xx xx"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400"
            placeholder="Telefon numaranız"
            disabled
          />
        </div>
      </div>

      {/* Report History */}
      <div className="border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Rapor Geçmişi</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {REPORT_HISTORY.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileTextIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CalendarIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{report.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircleIcon className="w-3 h-3" />
                  Hazır
                </span>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <DownloadIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
