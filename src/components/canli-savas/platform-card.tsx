"use client";

import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import { normalizeTurkish } from "@/lib/utils/turkish";
import React from "react";

interface Props {
  platform: AIPlatform;
  label: string;
  text: string;
  status: "waiting" | "streaming" | "done";
  mentioned: boolean | null;
  brandName: string;
}

function highlightBrand(text: string, brandName: string): React.ReactNode[] {
  if (!brandName || !text) return [text];

  const escaped = brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (normalizeTurkish(part) === normalizeTurkish(brandName)) {
      return (
        <mark key={i} className="bg-green-200 text-green-900 font-semibold px-0.5 rounded">
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function PlatformCard({ platform, label, text, status, mentioned, brandName }: Props) {
  const borderClass =
    status === "streaming"
      ? "border-blue-300 ring-2 ring-blue-200"
      : status === "done" && mentioned
      ? "border-green-300"
      : status === "done" && mentioned === false
      ? "border-gray-200"
      : "border-gray-200";

  return (
    <div className={`border rounded-xl bg-white overflow-hidden transition-all ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <AIPlatformIcon platform={platform} size={22} colored />
          <span className="text-sm font-semibold text-gray-900">{label}</span>
        </div>

        {status === "streaming" && (
          <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            Canlı
          </span>
        )}

        {status === "done" && mentioned !== null && (
          mentioned ? (
            <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
              Bahsediliyor ✓
            </span>
          ) : (
            <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              Bahsedilmiyor ✗
            </span>
          )
        )}

        {status === "waiting" && (
          <span className="text-xs text-gray-400">Bekleniyor...</span>
        )}
      </div>

      {/* Response area */}
      <div className="px-4 py-3 min-h-[120px] max-h-[300px] overflow-y-auto">
        {status === "waiting" ? (
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {highlightBrand(text, brandName)}
            {status === "streaming" && (
              <span className="inline-block w-1.5 h-4 bg-gray-900 ml-0.5 animate-pulse" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}
