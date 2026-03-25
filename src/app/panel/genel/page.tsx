"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEMO_METRICS,
  DEMO_COMPETITORS,
  DEMO_KEYWORDS,
  DEMO_CITED_DOMAINS,
  DEMO_CITED_PAGES,
  DEMO_AI_RESPONSES,
  DEMO_TREND_DATA,
  DEMO_CITY_DATA,
  getCityStats,
  getScoreColor,
} from "@/data/demo-data";
import { TurkeyMap } from "@/components/panel/turkey-map";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

/* ------------------------------------------------------------------ */
/*  Helper: Tooltip icon                                               */
/* ------------------------------------------------------------------ */
function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-400">
        ?
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: Change badge                                               */
/* ------------------------------------------------------------------ */
function ChangeBadge({
  value,
  suffix = "",
  prefix = "",
  invert = false,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  invert?: boolean;
}) {
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = value === 0;
  const arrow = isNeutral ? "→" : isPositive ? "↑" : "↓";
  const color = isNeutral
    ? "text-gray-500"
    : isPositive
      ? "text-green-600"
      : "text-red-500";
  const displayVal = Math.abs(value);
  return (
    <span className={`text-sm font-medium ${color}`}>
      {arrow}
      {prefix}
      {displayVal}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1: GEO Skor Kartı (Hero)                                   */
/* ------------------------------------------------------------------ */
function GeoScoreHero() {
  const score = DEMO_METRICS.geoScore;
  const change = DEMO_METRICS.changes.geoScore;
  const color = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        GEO Skor Kartı
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference - progress}`}
              strokeDashoffset={circumference * 0.25}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-gray-500 mb-1">
            Genel GEO Performansınız
          </p>
          <p className="text-base font-medium text-gray-900 mb-2">
            Geçen haftaya göre{" "}
            <span
              className={
                change > 0
                  ? "text-green-600"
                  : change < 0
                    ? "text-red-500"
                    : "text-gray-500"
              }
            >
              {change > 0 ? "+" : ""}
              {change} puan
            </span>
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            GEO Skoru, markanızın yapay zeka tabanlı arama motorlarındaki
            görünürlük, ses payı, kapsam ve algı performansını tek bir metrikte
            özetler.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: 4 Metric Cards                                         */
/* ------------------------------------------------------------------ */
const METRIC_CARDS = [
  {
    label: "Ses Payı",
    value: `%${DEMO_METRICS.shareOfVoice}`,
    change: DEMO_METRICS.changes.shareOfVoice,
    suffix: "%",
    prefix: "%",
    tooltip:
      "Markanızın, takip edilen tüm AI aramalarındaki görünme oranını gösterir.",
  },
  {
    label: "Kapsam",
    value: `%${DEMO_METRICS.coverage}`,
    change: DEMO_METRICS.changes.coverage,
    suffix: "%",
    prefix: "%",
    tooltip:
      "Takip edilen aramaların yüzde kaçında markanız en az bir kez görünüyor.",
  },
  {
    label: "Ortalama Sıra",
    value: DEMO_METRICS.avgPosition.toString(),
    change: DEMO_METRICS.changes.avgPosition,
    invert: true,
    tooltip:
      "AI yanıtlarında markanızın ortalama sıralama pozisyonudur. 1.0 en iyi değeridir.",
  },
  {
    label: "Algı Skoru",
    value: DEMO_METRICS.sentiment.toString(),
    change: DEMO_METRICS.changes.sentiment,
    tooltip:
      "AI'nin markanızı nasıl tanımladığı ve önerdiği ile ilgili genel duygu skorudur.",
  },
];

function MetricCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {METRIC_CARDS.map((m) => (
        <div
          key={m.label}
          className="border border-gray-200 rounded-xl p-6 flex flex-col gap-1 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center text-sm text-gray-500">
            {m.label}
            <InfoTip text={m.tooltip} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{m.value}</div>
          <ChangeBadge
            value={m.change}
            suffix={m.suffix}
            prefix={m.prefix}
            invert={m.invert}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Türkiye Isı Haritası                                    */
/* ------------------------------------------------------------------ */
function TurkeyHeatmapSection() {
  const stats = getCityStats();
  const trackedCities = Object.entries(DEMO_CITY_DATA).filter(
    ([, d]) => d.status !== "not-tracked"
  );

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Türkiye Isı Haritası
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            İl bazında AI görünürlük performansınız
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
            Güçlü
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" />
            Orta
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-red-400" />
            Zayıf
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-gray-200" />
            Takip Edilmiyor
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="w-full overflow-hidden">
        <TurkeyMap cityData={DEMO_CITY_DATA} />
      </div>

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-green-600">{stats.strong}</div>
          <div className="text-xs text-gray-400">Güçlü il</div>
        </div>
        <div>
          <div className="text-xl font-bold text-yellow-500">
            {stats.moderate}
          </div>
          <div className="text-xs text-gray-400">Orta il</div>
        </div>
        <div>
          <div className="text-xl font-bold text-red-500">{stats.weak}</div>
          <div className="text-xs text-gray-400">Zayıf il</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-400">
            {stats.notTracked}
          </div>
          <div className="text-xs text-gray-400">Takip Edilmiyor</div>
        </div>
      </div>

      {/* Tracked cities list */}
      <div className="mt-4 flex flex-wrap gap-2">
        {trackedCities.map(([city, data]) => (
          <span
            key={city}
            className={`text-xs px-2 py-1 rounded-full ${
              data.status === "strong"
                ? "bg-green-50 text-green-700"
                : data.status === "moderate"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            {city} ({data.score})
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <button className="border border-gray-200 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          + Yeni il ekle
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: Yapılacaklar / Önerilen Aksiyonlar                      */
/* ------------------------------------------------------------------ */
function ActionItems() {
  const items = [
    {
      color: "green" as const,
      text: "Kapsam %100 — Tüm aramalarınızda görünüyorsunuz",
    },
    {
      color: "yellow" as const,
      text: "İstanbul'da görünürlüğünüz zayıf — İyileştir \u2192",
    },
    {
      color: "red" as const,
      text: "2 aramada hiç görünmüyorsunuz — Detay \u2192",
    },
  ];

  const colorMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      dot: "bg-green-500",
      text: "text-green-800",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      text: "text-yellow-800",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      dot: "bg-red-500",
      text: "text-red-800",
    },
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Yapılacaklar / Önerilen Aksiyonlar
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const c = colorMap[item.color];
          return (
            <div
              key={item.text}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${c.bg} ${c.border}`}
            >
              <span
                className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${c.dot}`}
              />
              <span className={`text-sm font-medium ${c.text}`}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <button className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          Ajansınıza rapor gönderin
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Marka Ses Payı (Donut Chart)                            */
/* ------------------------------------------------------------------ */
function BrandShareDonut() {
  const total = DEMO_COMPETITORS.reduce((s, c) => s + c.share, 0);

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Marka Ses Payı
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut */}
        <div className="flex-shrink-0 w-[220px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DEMO_COMPETITORS}
                dataKey="share"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {DEMO_COMPETITORS.map((entry) => (
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
          {DEMO_COMPETITORS.map((comp) => (
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
                    comp.name === "ISITMAX"
                      ? "font-semibold text-gray-900"
                      : "text-gray-600"
                  }
                >
                  {comp.name}
                </span>
              </div>
              <span className="font-medium text-gray-900">
                %{comp.share}
              </span>
            </Link>
          ))}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">
              Toplam: %{total}
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

/* ------------------------------------------------------------------ */
/*  Section 6: Trend Grafiği (Line Chart)                              */
/* ------------------------------------------------------------------ */
type TrendKey = "shareOfVoice" | "coverage" | "avgPosition" | "sentiment";

const TREND_TABS: { key: TrendKey; label: string; color: string; suffix: string }[] = [
  { key: "shareOfVoice", label: "Ses Payı", color: "#18181B", suffix: "%" },
  { key: "coverage", label: "Kapsam", color: "#3B82F6", suffix: "%" },
  { key: "avgPosition", label: "Ortalama Sıra", color: "#F59E0B", suffix: "" },
  { key: "sentiment", label: "Algı Skoru", color: "#22C55E", suffix: "" },
];

const TIME_OPTIONS = [
  { label: "7 gün", days: 7 },
  { label: "30 gün", days: 30 },
  { label: "3 ay", days: 90 },
  { label: "Tümu", days: 0 },
];

function TrendChart() {
  const [activeTab, setActiveTab] = useState<TrendKey>("shareOfVoice");
  const [timeDays, setTimeDays] = useState(30);

  const tab = TREND_TABS.find((t) => t.key === activeTab)!;
  const filteredData =
    timeDays === 0
      ? DEMO_TREND_DATA
      : DEMO_TREND_DATA.slice(-timeDays);

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Trend Grafiği
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TREND_TABS.map((t) => (
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

      {/* Time selector */}
      <div className="flex gap-2 mb-6">
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setTimeDays(opt.days)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timeDays === opt.days
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
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
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
              formatter={(value: number) => [
                `${value}${tab.suffix}`,
                tab.label,
              ]}
            />
            <Line
              type="monotone"
              dataKey={activeTab}
              stroke={tab.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 7: Arama Bazlı Kırılım (Table)                             */
/* ------------------------------------------------------------------ */
function KeywordBreakdownTable() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Arama Bazlı Kırılım
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 pr-4 text-gray-500 font-medium">
                Arama
              </th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium whitespace-nowrap">
                Ses Payı
              </th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">
                Kapsam
              </th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">
                Sıra
              </th>
              <th className="text-left py-3 pl-4 text-gray-500 font-medium">
                Algı
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_KEYWORDS.map((kw) => (
              <tr
                key={kw.keyword}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 pr-4 text-gray-900 max-w-[280px]">
                  <span className="line-clamp-1">{kw.keyword}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Progress value={kw.shareOfVoice} className="w-16 [&_[data-slot=progress-track]]:h-1.5" />
                    <span className="text-gray-700 whitespace-nowrap">
                      %{kw.shareOfVoice}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={kw.coverage}
                      className={`w-16 [&_[data-slot=progress-track]]:h-1.5 ${
                        kw.coverage === 100
                          ? "[&_[data-slot=progress-indicator]]:bg-green-500"
                          : kw.coverage >= 50
                            ? "[&_[data-slot=progress-indicator]]:bg-yellow-500"
                            : "[&_[data-slot=progress-indicator]]:bg-red-500"
                      }`}
                    />
                    <span className="text-gray-700 whitespace-nowrap">
                      %{kw.coverage}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-medium ${
                      kw.avgPosition <= 1.5
                        ? "text-green-600"
                        : kw.avgPosition <= 2.0
                          ? "text-yellow-600"
                          : "text-red-500"
                    }`}
                  >
                    {kw.avgPosition}
                  </span>
                </td>
                <td className="py-3 pl-4">
                  <span
                    className={`font-medium ${
                      kw.sentiment >= 0.65
                        ? "text-green-600"
                        : kw.sentiment >= 0.5
                          ? "text-yellow-600"
                          : "text-red-500"
                    }`}
                  >
                    {kw.sentiment.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 8: En Çok Referans Alınan Siteler                          */
/* ------------------------------------------------------------------ */
function CitedSources() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        En Çok Referans Alınan Siteler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Domain list */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Domain Bazında
          </h3>
          <div className="space-y-2">
            {DEMO_CITED_DOMAINS.map((d, i) => (
              <div
                key={d.domain}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-5 text-right">
                    {i + 1}.
                  </span>
                  <span
                    className={
                      d.domain === "isitmax.com"
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }
                  >
                    {d.domain}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">
                    {d.cites} referans
                  </span>
                  <span className="font-medium text-gray-900 w-8 text-right">
                    %{d.share}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page list */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Sayfa Bazında (isitmax.com)
          </h3>
          <div className="space-y-2">
            {DEMO_CITED_PAGES.map((p, i) => (
              <div
                key={p.path}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-5 text-right">
                    {i + 1}.
                  </span>
                  <span className="text-gray-700 truncate max-w-[200px]">
                    {p.path}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">
                    {p.cites} referans
                  </span>
                  <span className="text-gray-400 text-xs">
                    {p.providers} platform
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <button className="border border-gray-200 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Ajansınıza Gönderin
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 9: AI Sizi Nasıl Anlatıyor                                 */
/* ------------------------------------------------------------------ */
function AiResponseCards() {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        AI Sizi Nasıl Anlatıyor
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
        {DEMO_AI_RESPONSES.map((resp, idx) => (
          <div
            key={idx}
            className="snap-start flex-shrink-0 w-[340px] border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
          >
            {/* Header: provider + keyword */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {resp.provider}
              </span>
              {resp.brandMentioned && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
                  Marka Geçti
                </span>
              )}
              {resp.position && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  #{resp.position}
                </span>
              )}
            </div>

            {/* Keyword */}
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {resp.keyword}
            </p>

            {/* Response text (truncated) */}
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
              {resp.response}
            </p>

            {/* Sources */}
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100">
              {resp.sources.map((src, si) => (
                <span
                  key={si}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    src === "isitmax.com"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function GenelBakisPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
            <p className="text-sm text-gray-400 mt-1">
              Markanızın AI arama performansına genel bakış
            </p>
          </div>
          <button className="self-start bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Ajansınıza Gönderin
          </button>
        </div>

        {/* 1. GEO Score Hero */}
        <GeoScoreHero />

        {/* 2. Metric Cards */}
        <MetricCards />

        {/* 3. Turkey Heatmap */}
        <TurkeyHeatmapSection />

        {/* 4. Action Items */}
        <ActionItems />

        {/* 5. Brand Share Donut */}
        <BrandShareDonut />

        {/* 6. Trend Chart */}
        <TrendChart />

        {/* 7. Keyword Breakdown Table */}
        <KeywordBreakdownTable />

        {/* 8. Cited Sources */}
        <CitedSources />

        {/* 9. AI Responses */}
        <AiResponseCards />
      </div>
    </div>
  );
}
