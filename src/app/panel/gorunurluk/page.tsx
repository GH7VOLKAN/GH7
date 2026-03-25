"use client";

import { useState } from "react";
import {
  DEMO_METRICS,
  DEMO_KEYWORDS,
  DEMO_PLATFORM_DISTRIBUTION,
  DEMO_TREND_DATA,
} from "@/data/demo-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const PLATFORMS = [
  { name: "AI Overview", color: "#4285F4", icon: "G" },
  { name: "ChatGPT", color: "#10A37F", icon: "C" },
  { name: "Gemini", color: "#8B5CF6", icon: "G" },
  { name: "Perplexity", color: "#22D3EE", icon: "P" },
  { name: "Claude", color: "#D97706", icon: "A" },
  { name: "Copilot", color: "#00BCF2", icon: "B" },
];

export default function GorunurlukPage() {
  const [activeTab, setActiveTab] = useState<"platform" | "keyword" | "trend">("platform");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Görünürlük</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI platformlarında marka görünürlüğünüzün detaylı analizi
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Toplam Görünürlük</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{DEMO_METRICS.coverage}%</p>
          <p className="text-xs text-green-600 mt-1">Tüm platformlarda</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Aktif Platform</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">5</p>
          <p className="text-xs text-gray-400 mt-1">6 platformdan</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Takip Edilen Arama</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{DEMO_KEYWORDS.length}</p>
          <p className="text-xs text-gray-400 mt-1">Aktif keyword</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Ortalama Pozisyon</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{DEMO_METRICS.avgPosition}</p>
          <p className="text-xs text-green-600 mt-1">↑ 0.1 iyileşme</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "platform" as const, label: "Platform Dağılımı" },
          { key: "keyword" as const, label: "Arama Bazlı" },
          { key: "trend" as const, label: "Trend" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Platform Distribution */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-6">Platform Trafik Dağılımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_PLATFORM_DISTRIBUTION} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" domain={[0, 70]} tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip
                    formatter={(value: number) => [`%${value}`, "Pay"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                    {DEMO_PLATFORM_DISTRIBUTION.map((entry, i) => (
                      <rect key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PLATFORMS.map((platform) => {
              const dist = DEMO_PLATFORM_DISTRIBUTION.find(
                (d) => d.name === platform.name || d.name.includes(platform.name)
              );
              return (
                <div
                  key={platform.name}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: platform.color }}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {platform.name}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">
                    %{dist?.share ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Trafik payı</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyword Breakdown */}
      {activeTab === "keyword" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Arama
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Ses Payı
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Kapsam
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Sıra
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                  Algı
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DEMO_KEYWORDS.map((kw, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 max-w-xs truncate">
                      {kw.keyword}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${kw.shareOfVoice}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700">%{kw.shareOfVoice}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm font-medium ${
                        kw.coverage === 100 ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      %{kw.coverage}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{kw.avgPosition}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{kw.sentiment}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trend */}
      {activeTab === "trend" && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-6">
            Ses Payı Trendi (Son 30 Gün)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DEMO_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="shareOfVoice"
                  stroke="#18181B"
                  strokeWidth={2}
                  dot={false}
                  name="Ses Payı %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
