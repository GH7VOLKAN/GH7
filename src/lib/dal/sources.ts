import { prisma } from "@/lib/db";
import { cache } from "react";
import type { SourceType } from "@/lib/types";

export interface SourceDomainData {
  id: string;
  domain: string;
  type: SourceType;
  usagePercent: number;
  avgCitations: number;
  urls: string[];
  actionNote: string | null;
}

export const getSourcesData = cache(async (brandId: string) => {
  const sources = await prisma.sourceDomain.findMany({
    where: { brandId },
    orderBy: { usagePercent: "desc" },
  });

  const sourceDomains: SourceDomainData[] = sources.map((s) => ({
    id: s.id,
    domain: s.domain,
    type: s.type as SourceType,
    usagePercent: s.usagePercent,
    avgCitations: s.avgCitations,
    urls: s.urls,
    actionNote: s.actionNote,
  }));

  const totalSources = sourceDomains.length;
  const actionableSources = sourceDomains.filter((s) => s.actionNote).length;
  const avgCitations =
    totalSources > 0
      ? sourceDomains.reduce((sum, s) => sum + s.avgCitations, 0) / totalSources
      : 0;
  const topSource = sourceDomains[0] ?? null;

  return { sourceDomains, totalSources, actionableSources, avgCitations, topSource };
});
