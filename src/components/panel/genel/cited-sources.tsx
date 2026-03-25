"use client";

import type { SourceMapEntry } from "@/lib/dal/overview";

interface CitedSourcesProps {
  sources: SourceMapEntry[];
  brandDomain: string;
}

export function CitedSources({ sources, brandDomain }: CitedSourcesProps) {
  if (sources.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          En Çok Referans Al&#305;nan Siteler
        </h2>
        <p className="text-sm text-gray-400">
          Henüz kaynak verisi bulunmuyor.
        </p>
      </div>
    );
  }

  // Group sources: brand domain sources vs others
  const brandSources = sources.filter((s) => s.domain === brandDomain);
  const otherSources = sources.filter((s) => s.domain !== brandDomain);

  // Count sources per domain
  const domainCounts = new Map<string, { count: number; exists: boolean }>();
  for (const s of sources) {
    const existing = domainCounts.get(s.domain);
    if (existing) {
      existing.count += 1;
    } else {
      domainCounts.set(s.domain, { count: 1, exists: s.exists });
    }
  }

  const sortedDomains = [...domainCounts.entries()].sort(
    (a, b) => b[1].count - a[1].count
  );
  const totalRefs = sources.length;

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        En Çok Referans Al&#305;nan Siteler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Domain list */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Domain Bazl&#305;
          </h3>
          <div className="space-y-2">
            {sortedDomains.map(([domain, data], i) => {
              const share =
                totalRefs > 0 ? Math.round((data.count / totalRefs) * 100) : 0;
              return (
                <div
                  key={domain}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-5 text-right">
                      {i + 1}.
                    </span>
                    <span
                      className={
                        domain === brandDomain
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }
                    >
                      {domain}
                    </span>
                    {!data.exists && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                        yok
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs">
                      {data.count} referans
                    </span>
                    <span className="font-medium text-gray-900 w-8 text-right">
                      %{share}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand pages */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Sayfa Bazl&#305; ({brandDomain})
          </h3>
          {brandSources.length === 0 ? (
            <p className="text-sm text-gray-400">
              Bu domain için sayfa verisi yok.
            </p>
          ) : (
            <div className="space-y-2">
              {brandSources.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-5 text-right">
                      {i + 1}.
                    </span>
                    <span className="text-gray-700 truncate max-w-[200px]">
                      {s.type}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      s.exists
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {s.exists ? "mevcut" : "yok"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
