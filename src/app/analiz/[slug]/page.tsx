import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import type { PlatformKey } from "@/lib/types";
import { SectionSummary } from "@/components/analysis-page/SectionSummary";
import { SectionFirmRanking } from "@/components/analysis-page/SectionFirmRanking";
import { SectionPlatformResponses } from "@/components/analysis-page/SectionPlatformResponses";
import { SectionSourceAnalysis } from "@/components/analysis-page/SectionSourceAnalysis";
import { SectionCrossPlatform } from "@/components/analysis-page/SectionCrossPlatform";
import { SectionVisibilityTips } from "@/components/analysis-page/SectionVisibilityTips";
import { SectionCTA } from "@/components/analysis-page/SectionCTA";
import { SectionRelatedPages } from "@/components/analysis-page/SectionRelatedPages";

// ─── Types for JSON fields ──────────────────────────

interface FirmRankingJson {
  firmName: string;
  firmNormalized: string;
  firmWebsite: string | null;
  platforms: PlatformKey[];
  platformCount: number;
  positions: Record<string, string | null>;
  sentiments: Record<string, string | null>;
  mentionContexts: Record<string, string | null>;
  sourceUrls: string[];
  sourceCount: number;
  rankPosition: number;
}

interface PlatformResponseJson {
  platform: PlatformKey;
  mentioned: boolean;
  position: string | null;
  sentiment: string | null;
  response: string;
  firmsMentioned: string[];
  sourceCount: number;
}

interface SourceAnalysisJson {
  domain: string;
  url: string;
  platforms: PlatformKey[];
  count: number;
}

// ─── ISR ────────────────────────────────────────────

export const revalidate = 3600;

// ─── Static Params ──────────────────────────────────

export async function generateStaticParams() {
  try {
    const pages = await prisma.queryPage.findMany({
      where: { published: true },
      select: { slug: true },
      orderBy: { timesQueried: "desc" },
      take: 100,
    });
    return pages.map((p) => ({ slug: p.slug }));
  } catch {
    // DB not available during build (CI)
    return [];
  }
}

// ─── Metadata ───────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.queryPage.findUnique({
    where: { slug },
    select: {
      pageTitle: true,
      metaDescription: true,
      originalQuery: true,
      slug: true,
    },
  });

  if (!page) return { title: "Analiz Bulunamadi" };

  return {
    title: page.pageTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.pageTitle,
      description: page.metaDescription ?? undefined,
      url: `https://app.gh7.ai/analiz/${page.slug}`,
      type: "article",
      locale: "tr_TR",
      siteName: "GH7.ai",
    },
    twitter: {
      card: "summary_large_image",
      title: page.pageTitle,
      description: page.metaDescription ?? undefined,
    },
    alternates: {
      canonical: `https://app.gh7.ai/analiz/${page.slug}`,
    },
  };
}

// ─── Page Component ─────────────────────────────────

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await prisma.queryPage.findUnique({
    where: { slug, published: true },
    include: {
      mentions: {
        orderBy: { rankPosition: "asc" },
      },
    },
  });

  if (!page) notFound();

  const firmRanking = (page.firmRanking as FirmRankingJson[] | null) ?? [];
  const platformResponses =
    (page.platformResponses as PlatformResponseJson[] | null) ?? [];
  const sourceAnalysis =
    (page.sourceAnalysis as SourceAnalysisJson[] | null) ?? [];

  // Get related pages (same sector or similar query type)
  const relatedPages = await prisma.queryPage.findMany({
    where: {
      published: true,
      id: { not: page.id },
      OR: [
        ...(page.sector ? [{ sector: page.sector }] : []),
        { queryType: page.queryType },
      ],
    },
    select: {
      slug: true,
      originalQuery: true,
      totalFirmsMentioned: true,
      totalPlatformsResponded: true,
    },
    orderBy: { timesQueried: "desc" },
    take: 4,
  });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.pageTitle,
    description: page.metaDescription,
    url: `https://app.gh7.ai/analiz/${page.slug}`,
    datePublished: page.createdAt.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "GH7.ai",
      url: "https://gh7.ai",
    },
    about: {
      "@type": "Thing",
      name: page.originalQuery,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-[800px] px-4 py-10 font-[family-name:var(--font-plus-jakarta)] sm:px-6">
        <div className="space-y-12">
          {/* 1. Summary */}
          <SectionSummary
            originalQuery={page.originalQuery}
            queryType={page.queryType}
            totalPlatforms={page.totalPlatformsResponded}
            totalFirms={page.totalFirmsMentioned}
            totalSources={page.totalSourcesCited}
            timesQueried={page.timesQueried}
            lastQueriedAt={page.lastQueriedAt}
            summaryText={page.summaryText}
          />

          <hr className="border-border" />

          {/* 2. Firm Ranking */}
          <SectionFirmRanking
            ranking={firmRanking}
            mentions={page.mentions.map((m) => ({
              firmName: m.firmName,
              firmWebsite: m.firmWebsite,
              mentionedOnPlatforms: (m.mentionedOnPlatforms as PlatformKey[]) ?? [],
              platformCount: m.platformCount,
              rankPosition: m.rankPosition,
              isVerified: m.isVerified,
            }))}
          />

          <hr className="border-border" />

          {/* 3. Platform Responses */}
          <SectionPlatformResponses responses={platformResponses} />

          <hr className="border-border" />

          {/* 4. Source Analysis */}
          <SectionSourceAnalysis sources={sourceAnalysis} />

          {/* 5. Cross-Platform Notes */}
          {page.crossPlatformNotes && (
            <>
              <hr className="border-border" />
              <SectionCrossPlatform notes={page.crossPlatformNotes} />
            </>
          )}

          {/* 6. Visibility Tips */}
          {page.visibilityTips && (
            <>
              <hr className="border-border" />
              <SectionVisibilityTips tips={page.visibilityTips} />
            </>
          )}

          <hr className="border-border" />

          {/* 7. CTA */}
          <SectionCTA />

          {/* Related Pages */}
          {relatedPages.length > 0 && (
            <>
              <hr className="border-border" />
              <SectionRelatedPages pages={relatedPages} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
