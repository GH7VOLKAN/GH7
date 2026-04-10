"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import type { CompetitorRowData, EmptyAreaOpportunity } from "@/lib/dal/competitors";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

// Only platforms that have per-platform scores in CompetitorRowData.platforms
const PLATFORM_KEYS = ["chatgpt", "claude", "gemini", "perplexity"] as const;
type ScoredPlatform = (typeof PLATFORM_KEYS)[number];

interface Props {
  rows: CompetitorRowData[];
  shareOfVoice: { name: string; isUser: boolean; percentage: number; color: string }[];
  emptyAreaOpportunities: EmptyAreaOpportunity[];
  brandId: string;
}

export default function IstihbaratContent({ rows, shareOfVoice, emptyAreaOpportunities }: Props) {
  const [activeTab, setActiveTab] = useState<"ranking" | "sov" | "firsatlar">("ranking");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabs = [
    { id: "ranking" as const, label: "Sıralama", count: rows.length },
    { id: "sov" as const, label: "Ses Payı", count: null },
    { id: "firsatlar" as const, label: "Fırsat Alanları", count: emptyAreaOpportunities.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "ranking" && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_80px_repeat(4,48px)] gap-2 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Marka</span>
            <span className="text-center">Skor</span>
            {PLATFORM_KEYS.map((p) => (
              <span key={p} className="flex justify-center">
                <AIPlatformIcon platform={p as AIPlatform} size={14} colored />
              </span>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, idx) => {
            const isExpanded = expandedId === row.id;
            return (
              <div key={row.id}>
                <button
                  onClick={() => !row.isUser && setExpandedId(isExpanded ? null : row.id)}
                  className={`w-full grid grid-cols-[1fr_80px_repeat(4,48px)] gap-2 px-4 py-3 rounded-xl text-left transition-colors ${
                    row.isUser
                      ? "bg-green-50 border border-green-200"
                      : "bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-300 w-4">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold truncate ${row.isUser ? "text-green-800" : "text-gray-900"}`}>
                          {row.name}
                        </span>
                        {row.isUser && (
                          <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                            SİZ
                          </span>
                        )}
                        {!row.isUser && row.source === "ai_discovered" && (
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            AI
                          </span>
                        )}
                      </div>
                      {row.domain && (
                        <p className="text-[11px] text-gray-400 truncate">{row.domain}</p>
                      )}
                    </div>
                    {!row.isUser && (
                      <span className="ml-auto flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Score bar */}
                  <div className="flex items-center justify-center">
                    <div className="w-full">
                      <div className="text-xs font-bold text-center mb-0.5">
                        %{row.mentionScore}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.isUser ? "bg-green-500" : "bg-gray-800"}`}
                          style={{ width: `${Math.min(row.mentionScore, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Per-platform scores */}
                  {PLATFORM_KEYS.map((p) => {
                    const val = row.platforms[p as ScoredPlatform] ?? 0;
                    return (
                      <div key={p} className="flex items-center justify-center">
                        <span className={`text-xs font-semibold ${
                          val >= 50 ? "text-green-600" : val > 0 ? "text-amber-600" : "text-gray-300"
                        }`}>
                          {val > 0 ? `%${val}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </button>

                {/* Expanded detail */}
                {isExpanded && !row.isUser && (
                  <div className="ml-8 mt-1 mb-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                    {row.reason && (
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-gray-700">Neden rakip: </span>
                        {row.reason}
                      </p>
                    )}
                    {row.products.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {row.products.map((p, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>Kaynak: {row.source === "ai_discovered" ? "AI keşfi" : row.source === "scan_discovered" ? "Tarama keşfi" : "Manuel"}</span>
                      <span>Relevance: {row.relevance === "direct" ? "Doğrudan" : "Dolaylı"}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "sov" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Ses Payı Dağılımı</h3>

          {shareOfVoice.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Ses payı hesaplaması için tarama verisi gerekli.</p>
          ) : (
            <div className="space-y-6">
              {/* Donut-like bar chart */}
              <div className="flex h-8 rounded-full overflow-hidden">
                {shareOfVoice.map((s, i) => (
                  <div
                    key={i}
                    className="transition-all duration-500"
                    style={{
                      width: `${Math.max(s.percentage, 2)}%`,
                      backgroundColor: s.color,
                    }}
                    title={`${s.name}: %${s.percentage}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shareOfVoice.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className={`text-sm ${s.isUser ? "font-bold text-gray-900" : "text-gray-600"}`}>
                      {s.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 ml-auto">%{s.percentage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "firsatlar" && (
        <div className="space-y-3">
          {emptyAreaOpportunities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg font-semibold">Fırsat alanı bulunamadı</p>
              <p className="text-sm mt-1">Tüm sorgularda en az bir platformda görünüyorsunuz.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Bu sorgularda hiçbir platformda görünmüyorsunuz — potansiyel fırsat alanları:
              </p>
              {emptyAreaOpportunities.map((opp, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    &ldquo;{opp.promptText}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      {opp.platforms.map((p) => (
                        <AIPlatformIcon key={p} platform={p as AIPlatform} size={16} colored />
                      ))}
                    </div>
                    {opp.topMention && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        Rakip görünüyor: {opp.topMention}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div className="mt-12">
        <PageBottomCTA />
      </div>
    </div>
  );
}
