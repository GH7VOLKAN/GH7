"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export interface AuditItemResult {
  key: string;
  label: string;
  category: string;
  status: "pass" | "partial" | "fail";
  score: 0 | 5 | 10;
  value?: string | number;
  competitorValue?: string | number;
  recommendation?: string;
}

interface Props {
  items: AuditItemResult[];
  categoryScores: Record<string, number>;
  overallScore: number;
  competitorScore?: number;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  content: { label: "İçerik Otoritesi", emoji: "📝" },
  schema: { label: "Yapılandırılmış Veri", emoji: "🧩" },
  entity: { label: "Entity & Kimlik", emoji: "🏷️" },
  tech: { label: "Teknik Erişilebilirlik", emoji: "⚙️" },
  external: { label: "Dış Referanslar", emoji: "🔗" },
  ai: { label: "AI Platform Görünürlüğü", emoji: "🤖" },
};

const CATEGORY_ORDER = ["content", "schema", "entity", "tech", "external", "ai"];

function StatusIcon({ status }: { status: "pass" | "partial" | "fail" }) {
  if (status === "pass") return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
  if (status === "partial") return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
}

export function Audit43Report({
  items,
  categoryScores,
  overallScore,
  competitorScore,
}: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("content");

  const passCount = items.filter((i) => i.status === "pass").length;
  const partialCount = items.filter((i) => i.status === "partial").length;
  const failCount = items.filter((i) => i.status === "fail").length;

  return (
    <div>
      {/* Overall Score Comparison */}
      <div className="border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-6 items-center">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Sizin Skorunuz</p>
            <div className={`text-5xl font-bold ${overallScore >= 60 ? "text-green-600" : overallScore >= 30 ? "text-amber-600" : "text-red-600"}`}>
              {overallScore}
              <span className="text-2xl text-gray-400">/100</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {passCount} yeşil · {partialCount} sarı · {failCount} kırmızı
            </p>
          </div>
          {competitorScore !== undefined && (
            <div className="text-center border-l border-gray-200 pl-6">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Rakip Skoru</p>
              <div className="text-5xl font-bold text-gray-700">
                {competitorScore}
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              {competitorScore > overallScore && (
                <p className="text-sm text-red-600 mt-2 font-medium">
                  Rakibiniz {competitorScore - overallScore} puan önde
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Accordion */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map((catKey) => {
          const catItems = items.filter((i) => i.category === catKey);
          const catScore = categoryScores[catKey] ?? 0;
          const catConfig = CATEGORY_LABELS[catKey];
          const isExpanded = expandedCategory === catKey;
          const catPassCount = catItems.filter((i) => i.status === "pass").length;
          const catFailCount = catItems.filter((i) => i.status === "fail").length;

          return (
            <div
              key={catKey}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{catConfig.emoji}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {catConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">({catItems.length} madde)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">
                    <span className="text-green-600">{catPassCount}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-red-600">{catFailCount}</span>
                  </span>
                  <span className={`text-sm font-bold min-w-[48px] text-right ${
                    catScore >= 60 ? "text-green-600" : catScore >= 30 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {catScore}/100
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {catItems.map((item) => (
                    <div key={item.key} className="px-5 py-3 flex items-start gap-3">
                      <StatusIcon status={item.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                          <span className="text-sm font-medium text-gray-900">
                            {item.label}
                          </span>
                          {item.value && (
                            <span className="text-xs text-gray-500 font-medium shrink-0">
                              {item.value}
                            </span>
                          )}
                        </div>
                        {item.recommendation && (
                          <p className="text-xs text-gray-500 mt-1">{item.recommendation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
