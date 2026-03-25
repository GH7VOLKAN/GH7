"use client";

import type { AiResponseExcerpt, RecentMention } from "@/lib/dal/overview";
import { platformLabels } from "@/lib/types";

interface AiResponsesProps {
  responses: AiResponseExcerpt[];
  mentions: RecentMention[];
}

export function AiResponses({ responses, mentions }: AiResponsesProps) {
  // Build combined cards: use responses as primary, enrich with mention data
  const cards = responses.map((resp) => {
    // Find matching mention for extra data
    const mention = mentions.find(
      (m) => m.platform === resp.platform && m.prompt === resp.promptText
    );
    return {
      platform: platformLabels[resp.platform]?.name ?? resp.platform,
      keyword: resp.promptText,
      excerpt: resp.excerpt,
      position: mention?.position ?? null,
      sentiment: mention?.sentiment ?? null,
      citations: mention?.citations ?? [],
    };
  });

  if (cards.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          AI Sizi Nas&#305;l Anlat&#305;yor
        </h2>
        <p className="text-sm text-gray-400">
          Henüz AI yanıt verisi bulunmuyor.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        AI Sizi Nas&#305;l Anlat&#305;yor
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
        {cards.map((resp, idx) => (
          <div
            key={idx}
            className="snap-start flex-shrink-0 w-[340px] border border-gray-200 rounded-xl p-5 flex flex-col gap-3"
          >
            {/* Header: provider + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {resp.platform}
              </span>
              {resp.excerpt && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
                  Marka Geçti
                </span>
              )}
              {resp.position && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  #{resp.position}
                </span>
              )}
            </div>

            {/* Keyword */}
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {resp.keyword}
            </p>

            {/* Response text (truncated) */}
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
              {resp.excerpt}
            </p>

            {/* Citations */}
            {resp.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100">
                {resp.citations.map((src, si) => (
                  <span
                    key={si}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                  >
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
