"use client";

import type { PromptSummaryItem } from "@/lib/dal/overview";
import type { PlatformKey } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "AIO",
};

interface KeywordTableProps {
  prompts: PromptSummaryItem[];
}

export function KeywordTable({ prompts }: KeywordTableProps) {
  if (prompts.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Arama Bazl&#305; K&#305;r&#305;l&#305;m
        </h2>
        <p className="text-sm text-gray-400">Henüz arama verisi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Arama Bazl&#305; K&#305;r&#305;l&#305;m
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 pr-4 text-gray-500 font-medium">
                Arama
              </th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium whitespace-nowrap">
                Kapsam
              </th>
              {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((p) => (
                <th
                  key={p}
                  className="text-center py-3 px-2 text-gray-500 font-medium text-xs"
                >
                  <div className="flex items-center justify-center gap-1">
                    <AIPlatformIcon platform={p as AIPlatform} size={14} colored />
                    <span>{PLATFORM_LABELS[p]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prompts.map((kw) => {
              const coverage =
                kw.totalPlatforms > 0
                  ? Math.round(
                      (kw.mentionedPlatforms / kw.totalPlatforms) * 100
                    )
                  : 0;

              return (
                <tr
                  key={kw.promptText}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 pr-4 text-gray-900 max-w-[280px]">
                    <span className="line-clamp-1">{kw.promptText}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={coverage}
                        className={`w-16 [&_[data-slot=progress-track]]:h-1.5 ${
                          coverage === 100
                            ? "[&_[data-slot=progress-indicator]]:bg-green-500"
                            : coverage >= 50
                              ? "[&_[data-slot=progress-indicator]]:bg-yellow-500"
                              : "[&_[data-slot=progress-indicator]]:bg-red-500"
                        }`}
                      />
                      <span className="text-gray-700 whitespace-nowrap">
                        %{coverage}
                      </span>
                    </div>
                  </td>
                  {(Object.keys(PLATFORM_LABELS) as PlatformKey[]).map((p) => (
                    <td key={p} className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center justify-center ${!kw.platformResults[p] ? "opacity-20" : ""}`}>
                        <AIPlatformIcon platform={p as AIPlatform} size={16} colored />
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
