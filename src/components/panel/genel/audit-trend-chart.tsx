"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendPoint {
  weekStart: string;
  overallScore: number;
  competitorScore: number | null;
}

interface Props {
  data: TrendPoint[];
}

export function AuditTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
        Henüz haftalık snapshot yok. İlk Pazartesi gününde otomatik kaydedilecek.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    week: new Date(d.weekStart).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
    Siz: d.overallScore,
    Rakip: d.competitorScore,
  }));

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        43 Madde GEO Skor Trendi
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Son 12 haftalık snapshot verisi
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" fontSize={11} stroke="#9ca3af" />
            <YAxis domain={[0, 100]} fontSize={11} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend fontSize={11} />
            <Line
              type="monotone"
              dataKey="Siz"
              stroke="#09090b"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Rakip"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
