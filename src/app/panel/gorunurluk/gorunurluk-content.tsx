"use client";

import { useState } from "react";
import type {
  PlatformStat,
  WeeklyTrendPoint,
  PromptSummaryItem,
  RecentMention,
  CompetitorRankEntry,
} from "@/lib/dal/overview";
import type { PlatformKey } from "@/lib/types";
import { platformLabels } from "@/lib/types";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
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
  Legend,
} from "recharts";

// --- Props ---
interface Props {
  mentionScore: number;
  mentionTrend: number;
  activePromptCount: number;
  totalMentionCount: number;
  totalResultCount: number;
  platformStats: PlatformStat[];
  weeklyTrend: WeeklyTrendPoint[];
  bestPrompts: PromptSummaryItem[];
  worstPrompts: PromptSummaryItem[];
  recentMentions: RecentMention[];
  competitorRanking: CompetitorRankEntry[];
  scoreHistory: { date: string; mentionScore: number; readinessScore: number }[];
}

const PLATFORM_COLORS: Record<PlatformKey, string> = {
  chatgpt: "#10A37F",
  claude: "#D97706",
  gemini: "#8B5CF6",
  perplexity: "#22D3EE",
  google_aio: "#4285F4",
};

export function GorunurlukContent({
  mentionScore,
  mentionTrend,
  activePromptCount,
  totalMentionCount,
  totalResultCount,
  platformStats,
  weeklyTrend,
  bestPrompts,
  worstPrompts,
  recentMentions,
  competitorRanking,
  scoreHistory,
}: Props) {
  const [activeTab, setActiveTab] = useState<"platform" | "keyword" | "trend">("platform");

  // Build platform distribution for bar chart
  const platformDistribution = platformStats.map((ps) => {
    const rate = ps.total > 0 ? Math.round((ps.mentioned / ps.total) * 100) : 0;
    return {
      name: platformLabels[ps.platform]?.name ?? ps.platform,
      share: rate,
      color: PLATFORM_COLORS[ps.platform] ?? "#6B7280",
    };
  });

  // Calculate active platforms (those with at least one mention)
  const activePlatforms = platformStats.filter((ps) => ps.mentioned > 0).length;

  // Mention rate
  const mentionRate = totalResultCount > 0 ? Math.round((totalMentionCount / totalResultCount) * 100) : 0;

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
          <p className="text-xs text-gray-500 font-medium">Görünürlük Skoru</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{mentionScore}</p>
          <p className={`text-xs mt-1 ${mentionTrend >= 0 ? "text-green-600" : "text-red-500"}`}>
            {mentionTrend >= 0 ? "+" : ""}{mentionTrend} son tarama
          </p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Aktif Platform</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{activePlatforms}</p>
          <p className="text-xs text-gray-400 mt-1">{platformStats.length} platformdan</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Takip Edilen Arama</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{activePromptCount}</p>
          <p className="text-xs text-gray-400 mt-1">Aktif prompt</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 font-medium">Mention Oranı</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">%{mentionRate}</p>
          <p className="text-xs text-gray-400 mt-1">{totalMentionCount}/{totalResultCount} sonuç</p>
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
            <h3 className="text-sm font-medium text-gray-900 mb-6">Platform Mention Oranı (%)</h3>
            {platformDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`%${value}`, "Mention Oranı"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="share" radius={[0, 4, 4, 0]}>
                      {platformDistribution.map((entry, i) => (
                        <rect key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Platform verisi yok.</p>
            )}
          </div>

          {/* Platform Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {platformStats.map((ps) => {
              const rate = ps.total > 0 ? Math.round((ps.mentioned / ps.total) * 100) : 0;
              const label = platformLabels[ps.platform];
              return (
                <div
                  key={ps.platform}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AIPlatformIcon platform={ps.platform as AIPlatform} size={20} colored />
                    <span className="text-sm font-medium text-gray-900">
                      {label?.name ?? ps.platform}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">
                    %{rate}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{ps.mentioned}/{ps.total} mention</p>
                </div>
              );
            })}
          </div>

          {/* Competitor Ranking */}
          {competitorRanking.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Rakip Sıralama</h3>
              <div className="space-y-2">
                {competitorRanking.map((entry, i) => {
                  const rate = entry.totalResults > 0 ? Math.round((entry.mentionCount / entry.totalResults) * 100) : 0;
                  return (
                    <div
                      key={entry.name}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        entry.isUser ? "bg-gray-900 text-white" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${entry.isUser ? "text-white" : "text-gray-400"}`}>
                          #{i + 1}
                        </span>
                        <span className={`text-sm font-medium ${entry.isUser ? "text-white" : "text-gray-900"}`}>
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm ${entry.isUser ? "text-gray-300" : "text-gray-500"}`}>
                          {entry.mentionCount}/{entry.totalResults}
                        </span>
                        <span className={`text-sm font-semibold ${entry.isUser ? "text-white" : "text-gray-900"}`}>
                          %{rate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyword Breakdown */}
      {activeTab === "keyword" && (
        <div className="space-y-6">
          {/* Best Prompts */}
          {bestPrompts.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 bg-green-50/50">
                <h3 className="text-sm font-medium text-green-800">En İyi Performans Gösteren Aramalar</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {bestPrompts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900 max-w-md truncate">{p.promptText}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        {p.mentionedPlatforms}/{p.totalPlatforms} platform
                      </span>
                      <div className="flex gap-1">
                        {Object.entries(p.platformResults).map(([plat, mentioned]) => (
                          <span
                            key={plat}
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${!mentioned ? "opacity-30" : ""}`}
                            title={platformLabels[plat as PlatformKey]?.name ?? plat}
                          >
                            <AIPlatformIcon platform={plat as AIPlatform} size={16} colored />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Worst Prompts */}
          {worstPrompts.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 bg-red-50/50">
                <h3 className="text-sm font-medium text-red-800">İyileştirilmesi Gereken Aramalar</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {worstPrompts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900 max-w-md truncate">{p.promptText}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        {p.mentionedPlatforms}/{p.totalPlatforms} platform
                      </span>
                      <div className="flex gap-1">
                        {Object.entries(p.platformResults).map(([plat, mentioned]) => (
                          <span
                            key={plat}
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${!mentioned ? "opacity-30" : ""}`}
                            title={platformLabels[plat as PlatformKey]?.name ?? plat}
                          >
                            <AIPlatformIcon platform={plat as AIPlatform} size={16} colored />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Mentions */}
          {recentMentions.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Son Mentionlar</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentMentions.slice(0, 10).map((m) => (
                  <div key={m.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <AIPlatformIcon platform={m.platform as AIPlatform} size={16} colored />
                      <span className="text-xs font-medium text-gray-900">
                        {platformLabels[m.platform]?.name ?? m.platform}
                      </span>
                      <span className="text-xs text-gray-400">{m.timeAgo}</span>
                      {m.sentiment && (
                        <span className={`text-xs ${m.sentiment === "pozitif" ? "text-green-600" : m.sentiment === "negatif" ? "text-red-500" : "text-gray-400"}`}>
                          {m.sentiment}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">{m.prompt}</p>
                    {m.excerpt && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.excerpt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend */}
      {activeTab === "trend" && (
        <div className="space-y-6">
          {/* Weekly Trend per Platform */}
          {weeklyTrend.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-6">
                Haftalık Platform Mention Trendi (%)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="chatgpt" stroke={PLATFORM_COLORS.chatgpt} strokeWidth={2} dot={false} name="ChatGPT" />
                    <Line type="monotone" dataKey="claude" stroke={PLATFORM_COLORS.claude} strokeWidth={2} dot={false} name="Claude" />
                    <Line type="monotone" dataKey="gemini" stroke={PLATFORM_COLORS.gemini} strokeWidth={2} dot={false} name="Gemini" />
                    <Line type="monotone" dataKey="perplexity" stroke={PLATFORM_COLORS.perplexity} strokeWidth={2} dot={false} name="Perplexity" />
                    <Line type="monotone" dataKey="google_aio" stroke={PLATFORM_COLORS.google_aio} strokeWidth={2} dot={false} name="Google AIO" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Score History */}
          {scoreHistory.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-6">
                Skor Geçmişi
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="mentionScore" stroke="#18181B" strokeWidth={2} dot={false} name="Mention Skoru" />
                    <Line type="monotone" dataKey="readinessScore" stroke="#3B82F6" strokeWidth={2} dot={false} name="Hazırlık Skoru" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {weeklyTrend.length === 0 && scoreHistory.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Henüz trend verisi yok.</p>
          )}
        </div>
      )}
    </div>
  );
}
