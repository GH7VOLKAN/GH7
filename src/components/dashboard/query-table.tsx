"use client";

import { BrandQuery, PlatformKey, platformLabels } from "@/lib/mock-data";

interface QueryTableProps {
  queries: BrandQuery[];
}

const platforms: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

function ResultCell({ mentioned, position }: { mentioned: boolean; position?: number | null }) {
  if (!mentioned) {
    return <span className="text-muted-foreground">--</span>;
  }
  if (position) {
    return <span className="font-bold text-score-high">{position}. sıra</span>;
  }
  return <span className="text-muted">bahsediliyor</span>;
}

export function QueryTable({ queries }: QueryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Soru
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
          {queries.map((query, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 text-foreground">{query.text}</td>
              {platforms.map((p) => (
                <td key={p} className="px-3 py-3 text-center text-xs">
                  <ResultCell
                    mentioned={query.results[p].mentioned}
                    position={query.results[p].position}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
