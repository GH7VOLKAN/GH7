import { getActiveBrand } from "@/lib/dal/brand";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { platformLabels, type PlatformKey } from "@/lib/types";
import { CityDetailContent } from "./city-detail-content";

// --- Helpers ---
function toSlug(name: string): string {
  const TURKISH_CHAR_MAP: Record<string, string> = {
    "\u00E7": "c", "\u011F": "g", "ı": "i", "İ": "i", "\u00F6": "o",
    "\u015F": "s", "\u00FC": "u", "\u00C7": "c", "\u011E": "g", "\u00D6": "o",
    "\u015E": "s", "\u00DC": "u",
  };
  return name
    .split("")
    .map((c) => TURKISH_CHAR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getScoreColor(score: number): string {
  if (score >= 50) return "#22C55E";
  if (score >= 20) return "#F59E0B";
  return "#EF4444";
}

// --- Types ---
export interface CityPromptResult {
  promptText: string;
  platform: string;
  mentioned: boolean;
  position: string | null;
  citations: string[];
}

export interface CityMetric {
  label: string;
  value: number | string;
  suffix: string;
}

export interface CityPlatformBreakdown {
  platform: string;
  platformLabel: string;
  mentioned: number;
  total: number;
  rate: number;
}

export interface CityDetailProps {
  cityName: string;
  score: number;
  scoreColor: string;
  mentionCount: number;
  totalResults: number;
  mentionRate: number;
  metrics: CityMetric[];
  platformBreakdown: CityPlatformBreakdown[];
  promptResults: CityPromptResult[];
  citedUrls: { url: string; count: number }[];
}

export default async function CityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;
  const brand = activeBrand.brand as Record<string, unknown>;
  const serviceRegions = (brand.serviceRegions as string[]) ?? [];

  // Find city name from slug
  const cityName = serviceRegions.find((r) => toSlug(r) === slug);
  if (!cityName) {
    notFound();
  }

  // Get last completed scan
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  let mentionCount = 0;
  let totalResults = 0;
  const platformBreakdown: CityPlatformBreakdown[] = [];
  const promptResults: CityPromptResult[] = [];
  const citationCounts: Record<string, number> = {};

  if (lastScan) {
    const results = await prisma.promptResult.findMany({
      where: { scanId: lastScan.id },
      include: { prompt: { select: { text: true } } },
    });

    const cityLower = cityName.toLowerCase();
    const cityResults = results.filter((r) =>
      r.prompt.text.toLowerCase().includes(cityLower)
    );

    totalResults = cityResults.length;
    mentionCount = cityResults.filter((r) => r.mentioned).length;

    // Platform breakdown
    const platformStats: Record<string, { m: number; t: number }> = {};
    for (const r of cityResults) {
      if (!platformStats[r.platform]) platformStats[r.platform] = { m: 0, t: 0 };
      platformStats[r.platform].t++;
      if (r.mentioned) platformStats[r.platform].m++;

      // Collect prompt results
      const cites = (r.citations as string[]) ?? [];
      promptResults.push({
        promptText: r.prompt.text,
        platform: r.platform,
        mentioned: r.mentioned,
        position: r.position,
        citations: cites,
      });

      // Count citation URLs
      for (const url of cites) {
        citationCounts[url] = (citationCounts[url] ?? 0) + 1;
      }
    }

    for (const [plat, stats] of Object.entries(platformStats)) {
      platformBreakdown.push({
        platform: plat,
        platformLabel: platformLabels[plat as PlatformKey]?.name ?? plat,
        mentioned: stats.m,
        total: stats.t,
        rate: stats.t > 0 ? Math.round((stats.m / stats.t) * 100) : 0,
      });
    }
    platformBreakdown.sort((a, b) => b.rate - a.rate);
  }

  const mentionRate = totalResults > 0 ? Math.round((mentionCount / totalResults) * 100) : 0;

  const metrics: CityMetric[] = [
    { label: "GEO Skor", value: mentionRate, suffix: "/100" },
    { label: "Mention Orani", value: mentionRate, suffix: "%" },
    { label: "Mention Sayisi", value: mentionCount, suffix: "" },
    { label: "Toplam Sonuc", value: totalResults, suffix: "" },
  ];

  const citedUrls = Object.entries(citationCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const scoreColor = getScoreColor(mentionRate);

  return (
    <div className="flex flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6">
      {/* Back link */}
      <Link
        href="/panel/iller"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Iller
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {cityName}
        </h1>
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-bold"
          style={{ backgroundColor: scoreColor }}
        >
          {mentionRate}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="border border-gray-200 rounded-xl p-6 flex flex-col gap-1"
          >
            <span className="text-xs text-gray-500">{m.label}</span>
            <span className="text-2xl font-bold text-gray-900">
              {m.value}
              {m.suffix && (
                <span className="text-sm font-normal text-gray-400">
                  {m.suffix}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <CityDetailContent
        platformBreakdown={platformBreakdown}
        promptResults={promptResults}
        citedUrls={citedUrls}
      />
    </div>
  );
}
