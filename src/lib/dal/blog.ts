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
