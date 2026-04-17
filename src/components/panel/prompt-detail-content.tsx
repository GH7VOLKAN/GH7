"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import type {
  PromptDetailData,
  PromptDetailPlatformResult,
} from "@/lib/dal/prompts";
import { highlightBrandAndCompetitors } from "@/lib/utils/highlight";

const PLATFORM_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

function QualityBadge({ quality }: { quality: string | null }) {
  if (!quality) return null;

  const config: Record<
    string,
    { label: string; className: string; icon: typeof CheckCircle2 }
  > = {
    direct_list: {
      label: "Somut İsim Verdi",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    general_info: {
      label: "Genel Bilgi",
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: HelpCircle,
    },
    refused: {
      label: "Cevap Vermedi",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
    clarification_asked: {
      label: "Spesifik Sor Dedi",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    },
    error: {
      label: "Hata",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  const c = config[quality] ?? config.general_info;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.className}`}
    >
      <Icon className="size-3" />
      {c.label}
    </span>
  );
}

function PlatformCard({
  result,
  brandName,
}: {
  result: PromptDetailPlatformResult;
  brandName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const platform = result.platform as AIPlatform;
  const label = PLATFORM_LABELS[result.platform] ?? result.platform;
  const fullResponse = result.fullResponse ?? "";
  const isError = fullResponse.startsWith("[ERROR]");
  const preview = fullResponse.slice(0, 300);
  const hasMore = fullResponse.length > 300;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <AIPlatformIcon platform={platform} size={24} colored />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <QualityBadge quality={result.responseQuality} />
              {result.retryAttempt > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  <RefreshCw className="size-3" />
                  Retry sonrası
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
              <span>
                Görünürlük:{" "}
                <span
                  className={
                    result.mentioned
                      ? "font-semibold text-green-600"
                      : "text-gray-500"
                  }
                >
                  {result.mentioned ? "✓ Bahsedildi" : "Bahsedilmedi"}
                </span>
              </span>
              {result.position && (
                <span>
                  Pozisyon:{" "}
                  <span className="font-semibold">{result.position}</span>
                </span>
              )}
              {result.sentiment && (
                <span>
                  Tutum:{" "}
                  <span className="font-semibold capitalize">
                    {result.sentiment}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full response */}
      <div className="mt-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          AI Cevabı
        </h4>
        {isError ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {fullResponse}
          </div>
        ) : fullResponse ? (
          <div className="rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
            {expanded || !hasMore ? (
              <div className="whitespace-pre-wrap">
                {highlightBrandAndCompetitors(
                  fullResponse,
                  brandName,
                  result.competitors,
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {highlightBrandAndCompetitors(
                  preview + "...",
                  brandName,
                  result.competitors,
                )}
              </div>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="size-3" />
                    Daha az göster
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3" />
                    Tamamını göster
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3 text-sm italic text-gray-500">
            Yanıt yok.
          </div>
        )}
      </div>

      {/* Competitors */}
      {result.competitors.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Bahsedilen Rakipler ({result.competitors.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.competitors.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Citations */}
      {result.citations.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Kaynaklar ({result.citations.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.citations.slice(0, 8).map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] text-blue-700 hover:bg-blue-100"
              >
                {new URL(url).hostname.replace("www.", "")}
                <ExternalLink className="size-2.5" />
              </a>
            ))}
            {result.citations.length > 8 && (
              <span className="text-xs text-gray-400">
                +{result.citations.length - 8} daha
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptDetailContent({
  detail,
  brandName,
}: {
  detail: PromptDetailData;
  brandName: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Back link */}
      <Link
        href="/panel/aramalar"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="size-4" />
        Aramalara dön
      </Link>

      {/* Metadata */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {detail.category && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Kategori
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {detail.category}
              </div>
            </div>
          )}
          {detail.businessArea && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                İş Alanı
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {detail.businessArea}
              </div>
            </div>
          )}
          {detail.searchIntent && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Arama Niyeti
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {detail.searchIntent}
              </div>
            </div>
          )}
          {detail.salesPotential && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Satış Potansiyeli
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-900">
                {detail.salesPotential}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform cards */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Platform Cevapları
      </h2>
      {detail.platformResults.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Bu sorgu henüz taranmamış.
        </div>
      ) : (
        <div className="space-y-4">
          {detail.platformResults.map((r) => (
            <PlatformCard
              key={r.platform}
              result={r}
              brandName={brandName}
            />
          ))}
        </div>
      )}

      {/* History */}
      {detail.history.length > 1 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Geçmiş Taramalar
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-700">
                    Tarih
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-700">
                    Görünürlük
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-700">
                    Pozisyon
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.history.map((h) => (
                  <tr
                    key={h.scanId}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2.5 text-gray-900">
                      {h.completedAt
                        ? new Date(h.completedAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          h.mentionCount > 0
                            ? "font-semibold text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {h.mentionCount}/5 platform
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {h.position ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
