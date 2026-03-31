import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBlogFromAnalysis } from "@/lib/ai/blog-generator";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Auth check (same pattern as auto-scan cron)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch queued blog posts, oldest first, max 20
  const queued = await prisma.blogPost.findMany({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
    take: 20,
    include: {
      queryPage: {
        select: {
          id: true,
          originalQuery: true,
          sector: true,
          queryType: true,
          firmRanking: true,
          platformResponses: true,
          summaryText: true,
          timesQueried: true,
        },
      },
    },
  });

  let generated = 0;
  let failed = 0;

  for (const post of queued) {
    if (!post.queryPage) {
      // Legacy or orphaned — skip
      continue;
    }

    try {
      await generateBlogFromAnalysis({
        queryPageId: post.queryPage.id,
        query: post.queryPage.originalQuery,
        sector: post.queryPage.sector,
        queryType: post.queryPage.queryType,
        firmRanking:
          (post.queryPage.firmRanking as Array<{
            firmName: string;
            platformCount: number;
            rankPosition: number;
          }>) ?? [],
        platformResponses:
          (post.queryPage.platformResponses as Array<{
            platform: string;
            mentioned: boolean;
          }>) ?? [],
        summaryText: post.queryPage.summaryText,
        timesQueried: post.queryPage.timesQueried,
      });
      generated++;
    } catch (err) {
      failed++;
      console.error(`[blog-cron] Failed for ${post.slug}:`, err);
    }
  }

  return NextResponse.json({
    processed: queued.length,
    generated,
    failed,
    timestamp: new Date().toISOString(),
  });
}
