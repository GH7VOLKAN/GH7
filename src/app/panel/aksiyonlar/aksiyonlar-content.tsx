"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import {
  generateWhatsAppShareLink,
  generateActionShareMessage,
} from "@/lib/whatsapp";

interface ActionItem {
  id: string;
  title: string;
  time: string;
  reason: string;
  draft: string;
  completed: boolean;
  correlationNote?: string;
}

const THIS_WEEK_ACTIONS: ActionItem[] = [
  {
    id: "1",
    title: "/banyo-yerden-isitma sayfasına FAQ ekle",
    time: "~30 dk",
    reason:
      "ChatGPT ve Gemini bu konuda soru-cevap formatında içerik arıyor. Sayfanızda FAQ yok, rakiplerinizde var. FAQ eklemek referans olma şansınızı %40 artırır.",
    draft: "Opus hazır FAQ taslağı",
    completed: false,
  },
  {
    id: "2",
    title: "Schema markup güncelle (Product + FAQPage)",
    time: "~20 dk",
    reason:
      "Mevcut schema verileriniz eksik. FAQPage ve Product schema eklemek AI motorlarının sayfanızı daha iyi anlamasını sağlar.",
    draft: "Opus hazır schema kodu",
    completed: false,
  },
  {
    id: "3",
    title: "/elektrikli-yerden-isitma sayfasına karşılaştırma tablosu ekle",
    time: "~45 dk",
    reason:
      "Perplexity karşılaştırma soruları için tablo formatını tercih ediyor. Bu sayfada karşılaştırma tablosu yok.",
    draft: "Opus hazır karşılaştırma taslağı",
    completed: false,
  },
];

const PAST_ACTIONS: ActionItem[] = [
  {
    id: "p1",
    title: "/yerden-isitma-nedir sayfasına FAQ eklendi",
    time: "~30 dk",
    reason: "",
    draft: "",
    completed: true,
    correlationNote:
      "FAQ eklediniz → 2 hafta sonra Gemini referansı başladı (+3 sorgu)",
  },
  {
    id: "p2",
    title: "Ana sayfa schema markup güncellendi",
    time: "~15 dk",
    reason: "",
    draft: "",
    completed: true,
    correlationNote:
      "Schema güncellendi → 10 gün sonra AI Overview'da cite edildi",
  },
];

export default function AksiyonlarContent() {
  const [actions, setActions] = useState(THIS_WEEK_ACTIONS);

  const toggleComplete = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const handleWhatsAppShare = (action: ActionItem) => {
    const message = generateActionShareMessage({
      keyword: action.title,
      issue: action.reason,
      recommendation: action.draft,
    });
    const url = generateWhatsAppShareLink({ text: message });
    window.open(url, "_blank", "noopener");
  };

  const weekStart = "24 Mart";
  const weekEnd = "30 Mart 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          📋 Bu Hafta Yapılacaklar ({actions.filter((a) => !a.completed).length}{" "}
          aksiyon)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {weekStart} – {weekEnd}
        </p>
      </div>

      {/* This Week's Actions */}
      <div className="space-y-4 mb-12">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`border border-gray-200 rounded-xl p-6 transition-colors ${
              action.completed ? "bg-gray-50 opacity-60" : "bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleComplete(action.id)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  action.completed
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {action.completed && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3
                    className={`text-sm font-semibold ${
                      action.completed
                        ? "line-through text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {action.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    ⏱ {action.time}
                  </span>
                </div>

                {!action.completed && (
                  <>
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium text-gray-700">Neden: </span>
                      {action.reason}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                      <span>📄 {action.draft}</span>
                      <button className="text-gray-900 underline underline-offset-2 font-medium hover:text-gray-700">
                        Görüntüle
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => toggleComplete(action.id)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Tamamladım ✓
                      </button>
                      <Link
                        href="/panel/ajans-paketleri"
                        className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Ajans yapsın → Paketlere git
                      </Link>
                      <button
                        onClick={() => handleWhatsAppShare(action)}
                        className="px-4 py-2 border border-green-600 text-sm font-medium text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp&apos;a Gönder
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Past Actions */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Geçmiş Aksiyonlar
        </h2>
        <div className="space-y-3">
          {PAST_ACTIONS.map((action) => (
            <div
              key={action.id}
              className="border border-gray-200 rounded-xl p-5 bg-white"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {action.title}
                  </h3>
                  {action.correlationNote && (
                    <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2 inline-block">
                      📈 {action.correlationNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageBottomCTA />
    </div>
  );
}
