import { prisma } from "@/lib/db";
import { cache } from "react";

export interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  sectorTag: string | null;
  analysisType: string;
  generatedAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export const getBlogPostsData = cache(async (brandId: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { sector: true },
  });

  // BlogPost is brand-agnostic (linked to QueryPage which has no brandId)
  // Filter by matching sector tag if brand has a sector
  const blogPosts = await prisma.blogPost.findMany({
    where: brand?.sector ? { sectorTag: brand.sector } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
      sectorTag: true,
      analysisType: true,
      generatedAt: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  const posts: BlogPostData[] = blogPosts;

  return {
    blogPosts: posts,
    draftCount: posts.filter((p) => p.status === "draft").length,
    publishedCount: posts.filter((p) => p.status === "published").length,
    queuedCount: posts.filter((p) => p.status === "queued").length,
    generatingCount: posts.filter((p) => p.status === "generating").length,
    totalCount: posts.length,
  };
});

// ── Content Impact Predictions ─────────────────────────────

function normalizeTurkish(text: string): string {
  return text
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .toLowerCase();
}

function tokenize(text: string): string[] {
  return normalizeTurkish(text)
    .split(/[\s,.;:!?()[\]{}'"—\-\/]+/)
    .filter((w) => w.length > 2);
}

export interface BlogImpactPrediction {
  blogId: string;
  blogTitle: string;
  slug: string;
  matchingWeakQueries: string[];
  impactEstimate: number;
}

export interface ContentSuggestion {
  promptText: string;
  platformsMissing: string[];
  totalPlatforms: number;
}

/**
 * Match draft/queued blog posts against queries where brand is NOT mentioned.
 * Returns blogs sorted by highest impact potential.
 */
export const getBlogImpactPredictions = cache(async (brandId: string): Promise<BlogImpactPrediction[]> => {
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });
  if (!lastScan) return [];

  // Find weak queries (brand not mentioned)
  const weakResults = await prisma.promptResult.findMany({
    where: { scanId: lastScan.id, mentioned: false },
    include: { prompt: { select: { text: true } } },
  });
  const weakPromptTexts = [...new Set(weakResults.map((r) => r.prompt.text))];
  if (weakPromptTexts.length === 0) return [];

  // Get draft/queued blog posts
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { sector: true },
  });
  const blogs = await prisma.blogPost.findMany({
    where: {
      status: { in: ["draft", "queued", "published"] },
      ...(brand?.sector ? { sectorTag: brand.sector } : {}),
    },
    select: { id: true, title: true, slug: true, content: true },
  });

  // Match blogs to weak queries via keyword overlap
  return blogs
    .map((blog) => {
      const blogTokens = new Set(tokenize(blog.title + " " + (blog.content ?? "").slice(0, 500)));
      const matchingWeakQueries = weakPromptTexts.filter((q) => {
        const queryTokens = tokenize(q);
        const overlap = queryTokens.filter((t) => blogTokens.has(t));
        return overlap.length >= 2; // At least 2 keyword overlap
      });
      return {
        blogId: blog.id,
        blogTitle: blog.title,
        slug: blog.slug,
        matchingWeakQueries,
        impactEstimate: matchingWeakQueries.length,
      };
    })
    .filter((b) => b.impactEstimate > 0)
    .sort((a, b) => b.impactEstimate - a.impactEstimate)
    .slice(0, 5);
});

/**
 * Get content suggestions: queries where brand has zero mentions across all platforms.
 * These are opportunities for new content.
 */
export const getContentSuggestions = cache(async (brandId: string): Promise<ContentSuggestion[]> => {
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });
  if (!lastScan) return [];

  const results = await prisma.promptResult.findMany({
    where: { scanId: lastScan.id },
    include: { prompt: { select: { text: true } } },
  });

  // Group by prompt text
  const promptGroups = new Map<string, { mentioned: string[]; missing: string[] }>();
  for (const r of results) {
    const key = r.prompt.text;
    if (!promptGroups.has(key)) promptGroups.set(key, { mentioned: [], missing: [] });
    const group = promptGroups.get(key)!;
    if (r.mentioned) {
      group.mentioned.push(r.platform);
    } else {
      group.missing.push(r.platform);
    }
  }

  // Return prompts where brand is mentioned on 0-1 platforms
  const suggestions: ContentSuggestion[] = [];
  for (const [text, group] of promptGroups) {
    if (group.mentioned.length <= 1) {
      suggestions.push({
        promptText: text,
        platformsMissing: group.missing,
        totalPlatforms: group.mentioned.length + group.missing.length,
      });
    }
  }

  return suggestions
    .sort((a, b) => b.platformsMissing.length - a.platformsMissing.length)
    .slice(0, 8);
});
