"use client";

import { useState } from "react";
import {
  FileTextIcon,
  DownloadIcon,
  MailIcon,
  MessageCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  LoaderIcon,
  ClockIcon,
} from "lucide-react";
import type { ScanReport } from "./page";
import {
  generateWhatsAppShareLink,
  generateWeeklyReportMessage,
  generatePdfShareMessage,
} from "@/lib/whatsapp";

interface Props {
  reports: ScanReport[];
  plan: string;
  profileEmail: string;
  emailWeeklyReport: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getReportTitle(report: ScanReport): string {
  if (report.status === "completed") {
    return `GEO Tarama Raporu (${report.promptCount} sonuç)`;
  }
  if (report.status === "running") {
    return "Tarama devam ediyor...";
  }
  return "Tarama";
}

export function RaporlarContent({
  reports,
  plan,
  profileEmail,
  emailWeeklyReport: initialEmailWeeklyReport,
}: Props) {
  const [emailEnabled, setEmailEnabled] = useState(initialEmailWeeklyReport);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    try {
      const res = await fetch("/api/export/pdf");
      if (res.status === 403) {
        alert("PDF indirme Pro plan ile kullanılabilir.");
        return;
      }
      if (!res.ok) throw new Error("PDF oluşturulamadı");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gh7-geo-rapor.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("PDF indirirken bir hata oluştu.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleWhatsAppWeeklyReport = () => {
    const message = generateWeeklyReportMessage({
      brandName: "Marka",
      geoScore: 72,
      delta: 5,
      topInsight: "Bu hafta 3 yeni sorguda bahsedilmeye başlandı.",
      dashboardUrl: `${window.location.origin}/panel`,
    });
    const url = generateWhatsAppShareLink({ text: message });
    window.open(url, "_blank", "noopener");
  };

  const handleWhatsAppPdfShare = () => {
    const message = generatePdfShareMessage(
      "Marka",
      `${window.location.origin}/api/export/pdf`,
    );
    const url = generateWhatsAppShareLink({ text: message });
    window.open(url, "_blank", "noopener");
  };

  const handleEmailToggle = async () => {
    const newValue = !emailEnabled;
    setEmailEnabled(newValue);
    try {
      await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailWeeklyReport: newValue }),
      });
    } catch (err) {
      console.error("Email toggle error:", err);
      setEmailEnabled(!newValue);
    }
  };

  return (
    <div className="space-y-8">
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
          <div className="flex gap-2">
            <button
              onClick={handlePdfDownload}
              disabled={pdfLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {pdfLoading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <DownloadIcon className="w-4 h-4" />
              )}
              {pdfLoading ? "İndiriliyor..." : "PDF İndir"}
            </button>
            <button
              onClick={handleWhatsAppPdfShare}
              className="flex items-center justify-center gap-2 border border-green-600 text-green-600 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-green-50 transition-colors"
              title="Raporu WhatsApp'a gönder"
            >
              <MessageCircleIcon className="w-4 h-4" />
            </button>
          </div>
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
              onClick={handleEmailToggle}
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
            defaultValue={profileEmail}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
            placeholder="E-posta adresiniz"
          />
        </div>

        {/* WhatsApp */}
        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <MessageCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">WhatsApp Özet</h3>
              <p className="text-xs text-gray-500">Haftalık raporu paylaşın</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            GEO skor özetinizi WhatsApp üzerinden ekibinize veya müşterinize gönderin
          </p>
          <button
            onClick={handleWhatsAppWeeklyReport}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircleIcon className="w-4 h-4" />
            WhatsApp&apos;a Gönder
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Rapor Geçmişi</h3>
          <p className="text-xs text-gray-500 mt-1">{reports.length} tarama kaydı</p>
        </div>
        <div className="divide-y divide-gray-100">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <FileTextIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getReportTitle(report)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <CalendarIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(report.completedAt ?? report.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {report.status === "completed" ? (
                  <>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircleIcon className="w-3 h-3" />
                      Hazır
                    </span>
                    <button
                      onClick={handlePdfDownload}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </>
                ) : report.status === "running" ? (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <LoaderIcon className="w-3 h-3 animate-spin" />
                    Devam ediyor
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ClockIcon className="w-3 h-3" />
                    {report.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
