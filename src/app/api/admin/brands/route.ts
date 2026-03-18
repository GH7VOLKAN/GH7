import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
  const plan = searchParams.get("plan");
  const search = searchParams.get("search")?.trim();

  // Build the where clause — plan lives on Profile, not Brand
  const where: Record<string, unknown> = {};

  if (plan) {
    where.profile = { plan };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { domain: { contains: search, mode: "insensitive" } },
    ];
  }

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      include: {
        profile: { select: { email: true, plan: true } },
        _count: { select: { prompts: true, scans: true } },
        scans: {
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { status: true, startedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.brand.count({ where }),
  ]);

  return NextResponse.json({
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      domain: b.domain,
      ownerEmail: b.profile.email,
      plan: b.profile.plan,
      promptCount: b._count.prompts,
      scanCount: b._count.scans,
      lastScanDate: b.scans[0]?.startedAt?.toISOString() ?? null,
      lastScanStatus: b.scans[0]?.status ?? null,
      createdAt: b.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
