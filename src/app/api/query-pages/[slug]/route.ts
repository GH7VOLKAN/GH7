import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const page = await prisma.queryPage.findUnique({
      where: { slug },
      select: {
        originalQuery: true,
        sector: true,
        totalFirmsMentioned: true,
        totalPlatformsResponded: true,
        pageTitle: true,
        metaDescription: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
