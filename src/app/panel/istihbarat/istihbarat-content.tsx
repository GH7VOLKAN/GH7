"use client";

import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

const COMPETITOR_INTEL = [
  {
    id: "1",
    name: "Warmup",
    severity: "red" as const,
    emoji: "🔴",
    summary: "Yeni blog yazısı ekledi → ChatGPT referanslarına girdi",
    detail:
      "Warmup, \"yerden ısıtma termostat ayarı\" konusunda yeni bir blog yazısı yayınladı. Bu yazı ChatGPT tarafından referans gösterilmeye başlandı. SİZİN bu konuda içeriğiniz yok.",
    action: "💡 Opus bu konu için taslak hazırladı",
    actionLink: "/panel/icerik",
  },
  {
    id: "2",
    name: "Danfoss",
    severity: "yellow" as const,
    emoji: "🟡",
    summary: "YouTube'a 2 video ekledi → Toplam 24 video (sizin: 3)",
    detail:
      "Danfoss YouTube kanalına \"yerden ısıtma montaj\" ve \"akıllı termostat kullanımı\" videoları ekledi. Toplam video sayısı 24'e ulaştı. Sizin kanalınızda 3 video var.",
    action: null,
    actionLink: null,
  },
  {
    id: "3",
    name: "RezistansMarket",
    severity: "green" as const,
    emoji: "🟢",
    summary: "Bu hafta değişiklik yok. Siz hâlâ lidersiniz ✅",
    detail:
      "RezistansMarket bu hafta içerik veya teknik değişiklik yapmadı. AI motorlarındaki sıralamanız bu rakibe karşı korunuyor.",
    action: null,
    actionLink: null,
  },
];

const COMPARISON_TABLE = [
  {
    feature: "FAQ sayfası",
    you: true,
    warmup: true,
    danfoss: true,
    rezistans: false,
  },
  {
    feature: "YouTube kanalı (10+ video)",
    you: false,
    warmup: false,
    danfoss: true,
    rezistans: false,
  },
  {
    feature: "Schema markup (FAQPage)",
    you: false,
    warmup: true,
    danfoss: true,
    rezistans: false,
  },
  {
    feature: "Blog (haftalık güncelleme)",
    you: false,
    warmup: true,
    danfoss: true,
    rezistans: false,
  },
  {
    feature: "llms.txt dosyası",
    you: false,
    warmup: false,
    danfoss: false,
    rezistans: false,
  },
  {
    feature: "Çok dilli içerik",
    you: false,
    warmup: false,
    danfoss: true,
    rezistans: false,
  },
];

export default function IstihbaratContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          🔎 Rakip İstihbarat — Bu Hafta
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Rakiplerinizin AI görünürlüğündeki değişimleri
        </p>
      </div>

      {/* Competitor Cards */}
      <div className="space-y-4 mb-12">
        {COMPETITOR_INTEL.map((comp) => {
          const borderColor =
            comp.severity === "red"
              ? "border-red-200"
              : comp.severity === "yellow"
              ? "border-yellow-200"
              : "border-green-200";
          const bgColor =
            comp.severity === "red"
              ? "bg-red-50"
              : comp.severity === "yellow"
              ? "bg-yellow-50"
              : "bg-green-50";

          return (
            <div
              key={comp.id}
              className={`border ${borderColor} rounded-xl p-6 bg-white`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{comp.emoji}</span>
                <h3 className="text-sm font-bold text-gray-900">{comp.name}</h3>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {comp.summary}
              </p>
              <p className="text-sm text-gray-500 mt-2">{comp.detail}</p>
              {comp.action && (
                <div className={`${bgColor} rounded-lg px-4 py-3 mt-3`}>
                  <p className="text-sm font-medium text-gray-700">
                    {comp.action}
                  </p>
                  {comp.actionLink && (
                    <a
                      href={comp.actionLink}
                      className="text-sm font-semibold text-gray-900 underline underline-offset-2 mt-1 inline-block hover:text-gray-700"
                    >
                      Taslağı görüntüle →
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Onda Var Sende Yok
        </h2>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">
                    Özellik
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    Siz
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    Warmup
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    Danfoss
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    RezistansM.
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.you ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-red-400">❌</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.warmup ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.danfoss ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.rezistans ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PageBottomCTA />
    </div>
  );
}
