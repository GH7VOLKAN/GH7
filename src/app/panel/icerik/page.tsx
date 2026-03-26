"use client";

import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

const DRAFTS = [
  {
    id: "1",
    title: "Yerden Isıtma Sistemleri: Kapsamlı Rehber 2026",
    targetPage: "/yerden-isitma-sistemleri",
    purpose: "Gemini ve ChatGPT referansı için kapsamlı rehber içerik",
    wordCount: 2400,
    status: "draft" as const,
  },
  {
    id: "2",
    title: "Elektrikli vs Sulu Yerden Isıtma Karşılaştırması",
    targetPage: "/elektrikli-vs-sulu-yerden-isitma",
    purpose: "Perplexity karşılaştırma sorgularında referans olmak",
    wordCount: 1800,
    status: "draft" as const,
  },
  {
    id: "3",
    title: "Banyo Yerden Isıtma FAQ Sayfası",
    targetPage: "/banyo-yerden-isitma",
    purpose: "FAQ formatında AI motorlarının soru-cevap eşleştirmesi",
    wordCount: 1200,
    status: "draft" as const,
  },
];

const PUBLISHED = [
  {
    id: "p1",
    title: "Yerden Isıtma Maliyeti Hesaplama Rehberi",
    targetPage: "/yerden-isitma-maliyeti",
    publishedDate: "18 Mart 2026",
    views: 342,
    aiReferences: 5,
  },
  {
    id: "p2",
    title: "Isıtma Kablosu Seçim Rehberi",
    targetPage: "/isitma-kablosu-secimi",
    publishedDate: "10 Mart 2026",
    views: 218,
    aiReferences: 2,
  },
];

export default function IcerikPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ✍️ İçerik Taslakları — Bu Hafta
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Opus tarafından hazırlanan içerik taslakları
        </p>
      </div>

      {/* Drafts */}
      <div className="space-y-4 mb-12">
        {DRAFTS.map((draft) => (
          <div
            key={draft.id}
            className="border border-gray-200 rounded-xl p-6 bg-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">
                  📝 {draft.title}
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Hedef sayfa: </span>
                    {draft.targetPage}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Amaç: </span>
                    {draft.purpose}
                  </p>
                  <p className="text-sm text-gray-400">
                    {draft.wordCount.toLocaleString("tr-TR")} kelime
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Taslağı Görüntüle
              </button>
              <button className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Düzenle
              </button>
              <button className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Onayla + Yayınla
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Published */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Yayınlanan İçerikler
        </h2>
        <div className="space-y-3">
          {PUBLISHED.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-5 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    ✅ {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.targetPage} · Yayın: {item.publishedDate}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
                  <span>👁 {item.views} görüntülenme</span>
                  <span>🤖 {item.aiReferences} AI referansı</span>
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
