"use client";

import Link from "next/link";
import type { CompetitorRankEntry } from "@/lib/dal/overview";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#18181B",
  "#3B82F6",
  "#F59E0B",
  "#22C55E",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
];

interface BrandShareDonutProps {
  competitors: CompetitorRankEntry[];
}

export function BrandShareDonut({ competitors }: BrandShareDonutProps) {
  // Calculate share for each competitor
  const totalMentions = competitors.reduce((s, c) => s + c.mentionCount, 0);
  const chartData = competitors.map((c, i) => ({
    name: c.name,
    share: totalMentions > 0 ? Math.round((c.mentionCount / totalMentions) * 100) : 0,
    isUser: c.isUser,
    color: COLORS[i % COLORS.length],
  }));
  const totalShare = chartData.reduce((s, c) => s + c.share, 0);

  if (competitors.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Marka Ses Pay&#305;
        </h2>
        <p className="text-sm text-gray-400">Henüz rakip verisi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Marka Ses Pay&#305;
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut */}
        <div className="flex-shrink-0 w-[220px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="share"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  `%${value}`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Brand list */}
        <div className="flex-1 w-full space-y-2">
          {chartData.map((comp) => (
            <Link
              key={comp.name}
              href="/panel/rakipler"
              className="flex items-center justify-between text-sm rounded-lg px-2 py-1 -mx-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: comp.color }}
                />
                <span
                  className={
                    comp.isUser
                      ? "font-semibold text-gray-900"
                      : "text-gray-600"
                  }
                >
                  {comp.name}
                </span>
              </div>
              <span className="font-medium text-gray-900">%{comp.share}</span>
            </Link>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">
              Toplam: %{totalShare}
            </span>
            <Link
              href="/panel/rakipler"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Tümünü gör &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
