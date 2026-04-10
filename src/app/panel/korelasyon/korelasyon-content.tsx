"use client";

import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import type { CorrelationEvent, ChartPoint, ActionMarker } from "@/lib/dal/correlation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const CONFIDENCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  yuksek: { label: "Yüksek", color: "text-green-700", bg: "bg-green-50" },
  orta: { label: "Orta", color: "text-amber-700", bg: "bg-amber-50" },
  dusuk: { label: "Düşük", color: "text-gray-600", bg: "bg-gray-100" },
};

interface Props {
  correlations: CorrelationEvent[];
  chartData: ChartPoint[];
  actionMarkers: ActionMarker[];
  verifiedImpacts: number;
  avgResponseDays: number;
  overallConfidence: string;
}

export default function KorelasyonContent({
  correlations,
  chartData,
  actionMarkers,
  verifiedImpacts,
  avgResponseDays,
  overallConfidence,
}: Props) {
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-200 rounded-xl p-4 bg-white text-center">
          <p className="text-2xl font-bold text-gray-900">{verifiedImpacts}</p>
          <p className="text-xs text-gray-400 mt-1">Doğrulanmış Etki</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-white text-center">
          <p className="text-2xl font-bold text-gray-900">
            {avgResponseDays > 0 ? `${avgResponseDays} gün` : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ort. Etki Süresi</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-white text-center">
          <p className="text-2xl font-bold text-gray-900">{overallConfidence}</p>
          <p className="text-xs text-gray-400 mt-1">Güven Düzeyi</p>
        </div>
      </div>

      {/* Score Chart with Action Markers */}
      {chartData.length >= 2 && (
        <div className="border border-gray-200 rounded-xl p-6 bg-white mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            GEO Skoru + Aksiyon Zaman Çizelgesi
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(v) => formatDate(v as string)}
                  formatter={(value: number, name: string) => [
                    `${value}/100`,
                    name === "mentionScore" ? "GEO Skoru" : "Hazırlık Skoru",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="mentionScore"
                  stroke="#09090B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#09090B" }}
                  name="mentionScore"
                />
                <Line
                  type="monotone"
                  dataKey="readinessScore"
                  stroke="#D1D5DB"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 4"
                  name="readinessScore"
                />
                {/* Action markers as vertical reference lines */}
                {actionMarkers.map((m, i) => (
                  <ReferenceLine
                    key={i}
                    x={m.date}
                    stroke="#22C55E"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    label={{
                      value: "✓",
                      position: "top",
                      fill: "#22C55E",
                      fontSize: 12,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-gray-900 rounded" />
              <span>GEO Skoru</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-gray-300 rounded" style={{ borderTop: "1px dashed #D1D5DB" }} />
              <span>Hazırlık Skoru</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-green-500 rounded-full border-dashed" />
              <span>Tamamlanan aksiyon</span>
            </div>
          </div>
        </div>
      )}

      {/* Correlation Timeline */}
      {correlations.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            Aksiyon → Sonuç Bağlantıları
          </h2>
          <div className="space-y-4">
            {correlations.map((event) => {
              const conf = CONFIDENCE_CONFIG[event.confidence] ?? CONFIDENCE_CONFIG.dusuk;
              return (
                <div
                  key={event.actionId}
                  className="border border-gray-200 rounded-xl p-5 bg-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Action */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Aksiyon
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {event.actionTitle}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(event.actionDate)}
                      </p>
                    </div>

                    {/* Arrow + days */}
                    <div className="hidden md:flex flex-col items-center gap-1">
                      <span className="text-gray-300 text-lg">→</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {event.daysToEffect} gün
                      </span>
                    </div>

                    {/* Result */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold text-green-600 uppercase">
                          Sonuç
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        GEO Skoru: {event.scoreBefore} → {event.scoreAfter}
                        <span className="text-green-600 ml-1">(+{event.scoreDelta})</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.color} ${conf.bg}`}>
                      Güven: {conf.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-8 bg-white mb-8 text-center">
          <p className="text-sm text-gray-500">
            Tamamlanan aksiyonlar ile skor değişiklikleri arasında henüz korelasyon tespit edilemedi.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Aksiyonları tamamladıkça ve taramalar devam ettikçe burada etki analizi görünecek.
          </p>
        </div>
      )}

      <div className="mt-8">
        <PageBottomCTA />
      </div>
    </div>
  );
}
