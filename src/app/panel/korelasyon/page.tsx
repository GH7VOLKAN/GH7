"use client";

import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

const TIMELINE_EVENTS = [
  {
    id: "1",
    actionDate: "15 Mart",
    actionLabel: "FAQ sayfası eklendi",
    actionDetail: "/yerden-isitma-nedir sayfasına 8 soruluk FAQ bölümü eklendi",
    resultDate: "19 Mart",
    resultLabel: "Gemini referansı başladı (+%15)",
    resultDetail:
      "\"Yerden ısıtma nedir\" sorgusunda Gemini sizi referans göstermeye başladı. Önceki haftaya göre %15 artış.",
    confirmed: true,
  },
  {
    id: "2",
    actionDate: "22 Mart",
    actionLabel: "Schema markup güncellendi",
    actionDetail: "Ana sayfaya FAQPage ve Product schema eklendi",
    resultDate: "26 Mart",
    resultLabel: "AI Overview'da cite edildi",
    resultDetail:
      "Google AI Overview \"yerden ısıtma fiyatları\" sorgusunda sitenizi kaynak olarak gösterdi.",
    confirmed: true,
  },
  {
    id: "3",
    actionDate: "10 Mart",
    actionLabel: "Blog yazısı yayınlandı",
    actionDetail: "\"Yerden ısıtma maliyeti hesaplama\" rehberi yayınlandı (2.400 kelime)",
    resultDate: "18 Mart",
    resultLabel: "Perplexity referansı başladı",
    resultDetail:
      "Perplexity \"yerden ısıtma maliyeti\" sorgusunda blogunuzu kaynak göstermeye başladı.",
    confirmed: true,
  },
];

const VERIFIED_EFFECTS = [
  {
    id: "v1",
    title: "FAQ Ekleme → AI Referansı",
    description: "Ortalama 4-7 gün içinde AI motorları FAQ içeriklerini referans göstermeye başlıyor.",
    confidence: "Yüksek",
    occurrences: 3,
  },
  {
    id: "v2",
    title: "Schema Güncelleme → AI Overview",
    description: "Schema markup güncellemesi sonrası AI Overview'da görünme oranı %25 arttı.",
    confidence: "Orta",
    occurrences: 2,
  },
  {
    id: "v3",
    title: "Uzun İçerik → Perplexity Referansı",
    description: "2000+ kelimelik rehber içerikler Perplexity tarafından daha sık referans gösteriliyor.",
    confidence: "Yüksek",
    occurrences: 4,
  },
];

export default function KorelasyonPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          📈 Aksiyon → Sonuç Bağlantısı
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Yaptığınız değişikliklerin AI görünürlüğünüze etkisi
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6 mb-12">
        {TIMELINE_EVENTS.map((event) => (
          <div
            key={event.id}
            className="border border-gray-200 rounded-xl p-6 bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Action */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Aksiyon
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {event.actionDate}: {event.actionLabel}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {event.actionDetail}
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ display: "none" }}>
                <span className="text-gray-300 text-lg">→</span>
              </div>

              {/* Result */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-green-600 uppercase">
                    Sonuç
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {event.resultDate}: {event.resultLabel}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {event.resultDetail}
                </p>
              </div>
            </div>

            {/* Connection arrow for mobile */}
            <div className="flex items-center justify-center my-1 md:hidden">
              <span className="text-gray-300 text-lg">↓</span>
            </div>

            {event.confirmed && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700">
                <span>✅</span>
                <span className="font-medium">Doğrulanmış etki</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="border border-gray-200 rounded-xl p-8 bg-white mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Korelasyon Grafiği
        </h2>
        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              📊 Aksiyon-sonuç korelasyon grafiği
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Veriler toplandıkça grafik otomatik oluşturulacak
            </p>
          </div>
        </div>
      </div>

      {/* Verified Effects */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Doğrulanmış Etkiler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VERIFIED_EFFECTS.map((effect) => (
            <div
              key={effect.id}
              className="border border-gray-200 rounded-xl p-5 bg-white"
            >
              <h3 className="text-sm font-bold text-gray-900">
                {effect.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {effect.description}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>
                  Güven:{" "}
                  <span className="font-semibold text-gray-600">
                    {effect.confidence}
                  </span>
                </span>
                <span>
                  Gözlem:{" "}
                  <span className="font-semibold text-gray-600">
                    {effect.occurrences}x
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PageBottomCTA />
    </div>
  );
}
