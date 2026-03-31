/**
 * GH7.ai Query-Based Analysis Pages — Pipeline
 *
 * Creates or updates a QueryPage from scan results.
 * Called after each scan completes (non-blocking).
 */

import { prisma } from "@/lib/db";
import {
  generateQuerySlug,
  normalizeQuery,
  classifyQuery,
  extractLocation,
  extractSector,
  generatePageTitle,
  generateMetaDescription,
  generateSummary,
  buildFirmRanking,
  buildSourceAnalysis,
  cleanPlatformResponses,
  normalizeFirmName,
  type ScanResultForQueryPage,
  type FirmRankingEntry,
} from "./index";

interface CreateOrUpdateInput {
  query: string;
  scanResults: ScanResultForQueryPage[];
  profileId?: string;
}

export async function createOrUpdateQueryPage(
  data: CreateOrUpdateInput,
): Promise<string | null> {
  const { query, scanResults, profileId } = data;

  if (!query || scanResults.length === 0) return null;

  const normalizedQ = normalizeQuery(query);
  const slug = generateQuerySlug(query);

  if (!slug || !normalizedQ) return null;

  // Build aggregated data
  const firmRanking = buildFirmRanking(scanResults);
  const sourceAnalysis = buildSourceAnalysis(scanResults);
  const platformResponses = cleanPlatformResponses(scanResults);

  const platformCount = platformResponses.length;
  const firmCount = firmRanking.length;
  const sourceCount = sourceAnalysis.reduce((acc, s) => acc + s.count, 0);

  const queryType = classifyQuery(query);
  const location = extractLocation(query);
  const sector = extractSector(query);
  const pageTitle = generatePageTitle(query);
  const metaDescription = generateMetaDescription(query, platformCount, firmCount);
  const summaryText = generateSummary(query, firmRanking, platformCount);

  try {
    // Check if a page with similar normalized query exists
    const existing = await prisma.queryPage.findFirst({
      where: { normalizedQuery: normalizedQ },
    });

    if (existing) {
      await updateExistingPage(existing.id, {
        firmRanking,
        sourceAnalysis,
        platformResponses,
        platformCount,
        firmCount,
        sourceCount,
        summaryText,
        metaDescription,
        profileId,
      });
      return existing.id;
    } else {
      const pageId = await createNewPage({
        slug,
        query,
        normalizedQ,
        queryType,
        sector,
        location,
        pageTitle,
        metaDescription,
        summaryText,
        firmRanking,
        sourceAnalysis,
        platformResponses,
        platformCount,
        firmCount,
        sourceCount,
        profileId,
      });
      return pageId;
    }
  } catch (error) {
    // Log but never crash
    console.error("[query-pages] Pipeline error:", error);
    return null;
  }
}

// ─── Update Existing Page ───────────────────────────

async function updateExistingPage(
  pageId: string,
  data: {
    firmRanking: FirmRankingEntry[];
    sourceAnalysis: ReturnType<typeof buildSourceAnalysis>;
    platformResponses: ReturnType<typeof cleanPlatformResponses>;
    platformCount: number;
    firmCount: number;
    sourceCount: number;
    summaryText: string;
    metaDescription: string;
    profileId?: string;
  },
) {
  // Save history snapshot before updating
  const currentPage = await prisma.queryPage.findUnique({
    where: { id: pageId },
    select: { firmRanking: true, platformResponses: true },
  });

  if (currentPage) {
    await prisma.queryPageHistory.create({
      data: {
        queryPageId: pageId,
        firmRankingSnapshot: currentPage.firmRanking ?? undefined,
        platformResponsesSnapshot: currentPage.platformResponses ?? undefined,
        triggeredByProfileId: data.profileId ?? null,
      },
    });
  }

  // Update the page
  await prisma.queryPage.update({
    where: { id: pageId },
    data: {
      timesQueried: { increment: 1 },
      lastQueriedAt: new Date(),
      totalPlatformsResponded: data.platformCount,
      totalFirmsMentioned: data.firmCount,
      totalSourcesCited: data.sourceCount,
      summaryText: data.summaryText,
      metaDescription: data.metaDescription,
      firmRanking: JSON.parse(JSON.stringify(data.firmRanking)),
      sourceAnalysis: JSON.parse(JSON.stringify(data.sourceAnalysis)),
      platformResponses: JSON.parse(JSON.stringify(data.platformResponses)),
    },
  });

  // Upsert mentions
  await upsertMentions(pageId, data.firmRanking);
}

// ─── Create New Page ────────────────────────────────

async function createNewPage(data: {
  slug: string;
  query: string;
  normalizedQ: string;
  queryType: string;
  sector: string | null;
  location: string | null;
  pageTitle: string;
  metaDescription: string;
  summaryText: string;
  firmRanking: FirmRankingEntry[];
  sourceAnalysis: ReturnType<typeof buildSourceAnalysis>;
  platformResponses: ReturnType<typeof cleanPlatformResponses>;
  platformCount: number;
  firmCount: number;
  sourceCount: number;
  profileId?: string;
}) {
  // Ensure slug uniqueness — append random suffix if needed
  let finalSlug = data.slug;
  const slugExists = await prisma.queryPage.findUnique({
    where: { slug: finalSlug },
    select: { id: true },
  });
  if (slugExists) {
    finalSlug = `${data.slug}-${Date.now().toString(36)}`;
  }

  const page = await prisma.queryPage.create({
    data: {
      slug: finalSlug,
      originalQuery: data.query,
      normalizedQuery: data.normalizedQ,
      pageTitle: data.pageTitle,
      metaDescription: data.metaDescription,
      queryType: data.queryType,
      sector: data.sector,
      location: data.location,
      totalPlatformsResponded: data.platformCount,
      totalFirmsMentioned: data.firmCount,
      totalSourcesCited: data.sourceCount,
      summaryText: data.summaryText,
      platformResponses: JSON.parse(JSON.stringify(data.platformResponses)),
      firmRanking: JSON.parse(JSON.stringify(data.firmRanking)),
      sourceAnalysis: JSON.parse(JSON.stringify(data.sourceAnalysis)),
    },
  });

  // Create mentions
  await upsertMentions(page.id, data.firmRanking);

  return page.id;
}

// ─── Upsert Mentions ────────────────────────────────

async function upsertMentions(
  pageId: string,
  ranking: FirmRankingEntry[],
) {
  for (const firm of ranking) {
    const normalized = normalizeFirmName(firm.firmName);
    if (!normalized) continue;

    try {
      await prisma.queryPageMention.upsert({
        where: {
          queryPageId_firmNormalized: {
            queryPageId: pageId,
            firmNormalized: normalized,
          },
        },
        update: {
          firmName: firm.firmName,
          mentionedOnPlatforms: firm.platforms,
          platformCount: firm.platformCount,
          mentionContexts: firm.mentionContexts
            ? JSON.parse(JSON.stringify(firm.mentionContexts))
            : undefined,
          sourceUrls: firm.sourceUrls,
          sourceCount: firm.sourceCount,
          rankPosition: firm.rankPosition,
        },
        create: {
          queryPageId: pageId,
          firmName: firm.firmName,
          firmNormalized: normalized,
          firmWebsite: firm.firmWebsite,
          mentionedOnPlatforms: firm.platforms,
          platformCount: firm.platformCount,
          mentionContexts: firm.mentionContexts
            ? JSON.parse(JSON.stringify(firm.mentionContexts))
            : undefined,
          sourceUrls: firm.sourceUrls,
          sourceCount: firm.sourceCount,
          rankPosition: firm.rankPosition,
        },
      });
    } catch {
      // Skip individual mention errors
    }
  }
}
