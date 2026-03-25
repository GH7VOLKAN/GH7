"use client";

import type { CityPromptResult, CityPlatformBreakdown } from "./page";

interface Props {
  platformBreakdown: CityPlatformBreakdown[];
  promptResults: CityPromptResult[];
  citedUrls: { url: string; count: number }[];
}

const PLATFORM_COLORS: Record<string, string> = {
  chatgpt: "#10A37F",
  claude: "#D97706",
  gemini: "#8B5CF6",
  perplexity: "#22D3EE",
  google_aio: "#4285F4",
};

export function CityDetailContent({
  platformBreakdown,
  promptResults,
  citedUrls,
}: Props) {
  // Deduplicate prompt results by prompt text for the table
  const uniquePrompts = new Map<
    string,
    { text: string; platforms: Record<string, boolean>; mentionCount: number; totalPlatforms: number }
  >();
  for (const pr of promptResults) {
    if (!uniquePrompts.has(pr.promptText)) {
      uniquePrompts.set(pr.promptText, {
        text: pr.promptText,
        platforms: {},
        mentionCount: 0,
        totalPlatforms: 0,
      });
    }
    const entry = uniquePrompts.get(pr.promptText)!;
    entry.platforms[pr.platform] = pr.mentioned;
    entry.totalPlatforms++;
    if (pr.mentioned) entry.mentionCount++;
  }
  const promptSummaries = Array.from(uniquePrompts.values()).sort(
    (a, b) => b.mentionCount - a.mentionCount
  );

  return (
    <>
      {/* Platform breakdown */}
      {platformBreakdown.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Dagilimi</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {platformBreakdown.map((pb) => (
              <div key={pb.platform} className="border border-gray-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: PLATFORM_COLORS[pb.platform] ?? "#6B7280" }}
                  >
                    {pb.platformLabel.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{pb.platformLabel}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">%{pb.rate}</p>
                <p className="text-xs text-gray-500">{pb.mentioned}/{pb.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt results table */}
      {promptSummaries.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aramalar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Arama</th>
                  <th className="px-4 py-3">Mention</th>
                  <th className="px-4 py-3">Platformlar</th>
                </tr>
              </thead>
              <tbody>
                {promptSummaries.map((ps) => (
                  <tr key={ps.text} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                      {ps.text}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ps.mentionCount}/{ps.totalPlatforms}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {Object.entries(ps.platforms).map(([plat, mentioned]) => (
                          <span
                            key={plat}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{
                              backgroundColor: mentioned
                                ? PLATFORM_COLORS[plat] ?? "#6B7280"
                                : "#D1D5DB",
                            }}
                            title={plat}
                          >
                            {plat.charAt(0).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cited URLs */}
      {citedUrls.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Referans Sayfalar
          </h2>
          <ul className="space-y-2">
            {citedUrls.map((cu) => (
              <li
                key={cu.url}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
              >
                <span className="font-mono text-gray-700 truncate max-w-md">{cu.url}</span>
                <span className="text-gray-500 shrink-0 ml-4">{cu.count} referans</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {promptResults.length === 0 && (
        <div className="border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">Bu il icin henuz tarama sonucu yok.</p>
        </div>
      )}
    </>
  );
}
