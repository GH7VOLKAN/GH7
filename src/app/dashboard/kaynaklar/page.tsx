"use client";

import { sourceDomains } from "@/lib/mock-data/sources";
import { sourceTypeLabels } from "@/lib/types";
import { ExpandCard } from "@/components/ui/expand-card";

export default function KaynaklarPage() {
  const totalSources = sourceDomains.length;
  const actionableSources = sourceDomains.filter((s) => s.actionNote).length;

  return (
    <div className="space-y-10 px-4 lg:px-6">
      {/* Header Card */}
      <div className="reveal rounded-xl border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          KAYNAKLAR
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em] text-foreground">
          Kaynak Analizi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI modellerinin yanıtlarında referans gösterdiği {totalSources} kaynak
          takip ediliyor
          {actionableSources > 0 && (
            <>, {actionableSources} tanesinde aksiyon gerekiyor</>
          )}
        </p>
      </div>

      {/* Source Domains Section */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Kaynak Domainler
        </p>
        <div className="flex flex-col gap-[10px]">
          {sourceDomains.map((source) => {
            const hasUrls = source.urls && source.urls.length > 0;

            const summary = (
              <div>
                {/* Top row: domain + type badge + usage % */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-bold tracking-[-0.02em] truncate text-foreground">
                      {source.domain}
                    </span>
                    <span className="shrink-0 border border-border rounded-md px-2 py-0.5 text-[10px] text-muted-foreground">
                      {sourceTypeLabels[source.type]}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    %{source.usagePercent}
                  </span>
                </div>

                {/* Usage bar */}
                <div className="mt-3 h-[3px] w-full rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground transition-all duration-700"
                    style={{ width: `${source.usagePercent}%` }}
                  />
                </div>

                {/* Bottom meta row */}
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">
                    Ort. atıf sayısı:{" "}
                    <span className="font-medium text-foreground">
                      {source.avgCitations.toFixed(1)}
                    </span>
                  </span>
                  {hasUrls && (
                    <span className="text-xs text-muted-foreground">
                      {source.urls!.length} URL — detay için tıkla
                    </span>
                  )}
                </div>

                {/* Action note inline in summary */}
                {source.actionNote && (
                  <div className="mt-3 rounded-xl border border-border p-2.5">
                    <p className="text-xs text-foreground">
                      {source.actionNote}
                    </p>
                  </div>
                )}
              </div>
            );

            const detail = (
              <div className="space-y-4">
                {/* URL list */}
                {hasUrls && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-3">
                      URL Detayları
                    </p>
                    <div className="flex flex-col gap-[10px]">
                      {source.urls!.map((url) => (
                        <div
                          key={url.path}
                          className="rounded-xl border border-border bg-card p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-mono text-muted-foreground truncate">
                              {url.path}
                            </span>
                            <div className="shrink-0 flex items-center gap-3 text-xs">
                              <span className="font-bold tabular-nums text-foreground">
                                %{url.usagePercent}
                              </span>
                              <span className="text-muted-foreground">
                                {url.promptCount} promptta referans
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 h-[3px] w-full rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-foreground/50 transition-all duration-700"
                              style={{ width: `${url.usagePercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prominent action note in detail */}
                {source.actionNote && (
                  <div className="rounded-xl border border-foreground/20 bg-card p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">
                      Aksiyon Gerekiyor
                    </p>
                    <p className="text-sm text-foreground">
                      {source.actionNote}
                    </p>
                  </div>
                )}

                {/* Fallback if no URLs and no actionNote */}
                {!hasUrls && !source.actionNote && (
                  <p className="text-xs text-muted-foreground">
                    Bu kaynak için URL düzeyinde veri bulunmuyor.
                  </p>
                )}
              </div>
            );

            return (
              <div key={source.domain} className="reveal">
                <ExpandCard summary={summary} detail={detail} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
