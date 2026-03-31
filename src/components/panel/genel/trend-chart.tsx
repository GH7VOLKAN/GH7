"use client";

import { useState } from "react";
import type { WeeklyTrendPoint } from "@/lib/dal/overview";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

type TrendTab = "mentionScore" | "platform";

interface TrendChartProps {
  data: WeeklyTrendPoint[];
  scoreHistory: { date: string; mentionScore: number }[];
}

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#18181B",
  claude: "#8B5CF6",
  gemini: "#3B82F6",
  perplexity: "#F59E0B",
  google_aio: "#22C55E",
};

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

export function TrendChart({ data, scoreHistory }: TrendChartProps) {
  const [activeTab, setActiveTab] = useState<TrendTab>("mentionScore");

  const tabs: { key: TrendTab; label: string }[] = [
    { key: "mentionScore", label: "GEO Skor" },
    { key: "platform", label: "Platform Bazlı" },
  ];

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Trend Grafiği
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === t.key
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "mentionScore" ? (
            <LineChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[0, 100]}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}`, "GEO Skor"]}
              />
              <Line
                type="monotone"
                dataKey="mentionScore"
                stroke="#18181B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[0, 100]}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
                formatter={(value: number, name: string) => [
                  `%${value}`,
                  PLATFORM_LABELS[name] ?? name,
                ]}
              />
              {Object.keys(PLATFORM_COLORS).map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={PLATFORM_COLORS[key]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend for platform tab */}
      {activeTab === "platform" && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <AIPlatformIcon platform={key as AIPlatform} size={14} colored />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
