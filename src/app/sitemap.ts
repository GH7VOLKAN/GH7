import { prisma } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://gh7.ai",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://gh7.ai/analiz",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://gh7.ai/analizler",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://gh7.ai/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://gh7.ai/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Query analysis pages (dynamic)
  let queryPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.queryPage.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { timesQueried: "desc" },
      take: 5000,
    });

    queryPages = pages.map((page) => ({
      url: `https://gh7.ai/analiz/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If table doesn't exist yet, skip
  }

  return [...staticPages, ...queryPages];
}
