"use client";

import { useState } from "react";
import { sourceDomains } from "@/lib/mock-data/sources";
import { sourceTypeLabels } from "@/lib/types";

export default function KaynaklarPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const topSource = [...sourceDomains].sort(
    (a, b) => b.usagePercent - a.usagePercent
  )[0];

  function toggleExpand(domain: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          KAYNAKLAR
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Kaynak Analizi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI modellerinin yanıtlarında referans gösterdiği kaynaklar
        </p>
      </div>

      {/* Kaynak Listesi */}
      <div className="space-y-3">
        {sourceDomains.map((source) => {
          const isExpanded = expanded.has(source.domain);
          const hasUrls = source.urls && source.urls.length > 0;

          return (
            <div
              key={source.domain}
              className="rounded-[14px] border border-border bg-card p-5"
            >
              {/* Üst satır: domain + badge + toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-bold tracking-[-0.02em] truncate">
                    {source.domain}
                  </span>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {sourceTypeLabels[source.type]}
                  </span>
                </div>

                {hasUrls && (
                  <button
                    onClick={() => toggleExpand(source.domain)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isExpanded ? "Gizle" : `${source.urls!.length} URL`}
                  </button>
                )}
              </div>

              {/* Kullanım barı */}
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Kullanım oranı</span>
                  <span className="font-medium text-foreground">
                    %{source.usagePercent}
                  </span>
                </div>
                <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-700"
                    style={{ width: `${source.usagePercent}%` }}
                  />
                </div>
              </div>

              {/* Ortalama atıf */}
              <div className="mt-3 text-xs text-muted-foreground">
                Ort. atıf sayısı:{" "}
                <span className="font-medium text-foreground">
                  {source.avgCitations.toFixed(1)}
                </span>
              </div>

              {/* Aksiyon notu */}
              {source.actionNote && (
                <p className="mt-3 text-xs text-score-low">
                  {source.actionNote}
                </p>
              )}

              {/* Alt URL'ler */}
              {hasUrls && isExpanded && (
                <div className="mt-4 border-t border-border pt-4 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    URL Detayları
                  </p>
                  {source.urls!.map((url) => (
                    <div key={url.path} className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground truncate font-mono">
                          {url.path}
                        </span>
                        <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            %{url.usagePercent}
                          </span>
                          <span>{url.promptCount} prompt</span>
                        </div>
                      </div>
                      <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground/50 transition-all duration-700"
                          style={{ width: `${url.usagePercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Özet İçgörü */}
      {topSource && (
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            ÖZET
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {topSource.domain}
            </span>{" "}
            <span className="font-semibold text-foreground">
              %{topSource.usagePercent}
            </span>{" "}
            kullanımla en çok referans gösterilen kaynak.
          </p>
        </div>
      )}
    </div>
  );
}
