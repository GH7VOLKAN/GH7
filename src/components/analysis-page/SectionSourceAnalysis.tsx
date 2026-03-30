/* eslint-disable @next/next/no-img-element */

import type { PlatformKey } from "@/lib/types";
import { platformLabels } from "@/lib/types";

interface SourceEntry {
  domain: string;
  url: string;
  platforms: PlatformKey[];
  count: number;
}

interface SectionSourceAnalysisProps {
  sources: SourceEntry[];
}

export function SectionSourceAnalysis({ sources }: SectionSourceAnalysisProps) {
  if (sources.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Kaynak Analizi
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full max-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">
                Kaynak
              </th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">
                Platformlar
              </th>
              <th className="py-2 pr-3 font-medium text-muted-foreground text-right">
                Referans
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.slice(0, 20).map((source) => (
              <tr
                key={source.domain}
                className="border-b border-border/50"
              >
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://www.google.com/s2/favicons?sz=16&domain=${source.domain}`}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded"
                      loading="lazy"
                    />
                    <span className="text-foreground">{source.domain}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-muted-foreground">
                  {source.platforms
                    .map((p) => platformLabels[p]?.name ?? p)
                    .join(", ")}
                </td>
                <td className="py-3 pr-3 text-right font-medium text-foreground">
                  {source.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
