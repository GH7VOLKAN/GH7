"use client";

import { Competitor, PlatformKey, platformLabels } from "@/lib/mock-data";
import { getScoreColor } from "@/lib/utils";

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

export function CompetitorTable({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Firma
            </th>
            <th className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Skor
            </th>
            {platforms.map((p) => (
              <th
                key={p}
                className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {platformLabels[p].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {competitors.map((c) => (
            <tr
              key={c.domain}
              className={`border-b border-border last:border-0 ${c.isUser ? "bg-background-secondary" : ""}`}
            >
              <td className="py-3 pr-4">
                <span className="font-medium tracking-[-0.02em]">{c.name}</span>
                {c.isUser && (
                  <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    (siz)
                  </span>
                )}
              </td>
              <td className={`px-3 py-3 text-center font-black tracking-[-0.05em] ${getScoreColor(c.overallScore)}`}>
                {c.overallScore}
              </td>
              {platforms.map((p) => (
                <td key={p} className={`px-3 py-3 text-center font-bold ${getScoreColor(c.platforms[p])}`}>
                  {c.platforms[p]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
