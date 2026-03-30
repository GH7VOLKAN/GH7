/**
 * GH7.ai Query-Based Analysis Pages — Scan Feed
 *
 * Bridges the scan engine output to the query pages pipeline.
 * Groups PromptResults by prompt text and creates/updates query pages.
 */

import { prisma } from "@/lib/db";
import { createOrUpdateQueryPage } from "./pipeline";
import type { ScanResultForQueryPage } from "./index";

/**
 * After a scan completes, read its PromptResults grouped by prompt text
 * and feed each unique query into the query pages pipeline.
 */
export async function feedScanToQueryPages(
  scanId: string,
  brandId: string,
): Promise<void> {
  // Get the brand's profile for profileId
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { profileId: true },
  });

  // Fetch all results for this scan with prompt text
  const results = await prisma.promptResult.findMany({
    where: { scanId },
    include: {
      prompt: { select: { text: true } },
    },
  });

  if (results.length === 0) return;

  // Group results by prompt text
  const grouped = new Map<string, ScanResultForQueryPage[]>();

  for (const result of results) {
    const query = result.prompt.text;
    if (!query) continue;

    const mapped: ScanResultForQueryPage = {
      platform: result.platform,
      mentioned: result.mentioned,
      position: result.position,
      sentiment: result.sentiment,
      fullResponse: result.fullResponse,
      citations: result.citations,
      competitors: result.competitors,
      citationSources: result.citationSources,
      mentionContext: result.mentionContext,
    };

    const existing = grouped.get(query);
    if (existing) {
      existing.push(mapped);
    } else {
      grouped.set(query, [mapped]);
    }
  }

  // Process each unique query (sequentially to avoid overwhelming DB)
  for (const [query, scanResults] of grouped) {
    try {
      await createOrUpdateQueryPage({
        query,
        scanResults,
        profileId: brand?.profileId,
      });
    } catch (error) {
      console.error(
        `[query-pages] Failed to process query "${query.slice(0, 50)}":`,
        error,
      );
    }
  }

  console.log(
    `[query-pages] Processed ${grouped.size} unique queries from scan ${scanId}`,
  );
}
