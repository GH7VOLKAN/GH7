"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeekData } from "@/lib/mock-data";

interface TrendChartProps {
  data: WeekData[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tickFormatter={(v) => `H${v}`}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(v) => `Hafta ${v}`}
          />
          <Line
            type="monotone"
            dataKey="overall"
            name="Genel"
            stroke="var(--foreground)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="chatgpt"
            name="ChatGPT"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeDasharray="8 4"
            dot={false}
            opacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="claude"
            name="Claude"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            opacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="gemini"
            name="Gemini"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeDasharray="2 3"
            dot={false}
            opacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="perplexity"
            name="Perplexity"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeDasharray="8 2 2 2"
            dot={false}
            opacity={0.35}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
