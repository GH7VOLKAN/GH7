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
  const plan = searchParams.get("plan"); // free, pro, business, agency
  const search = searchParams.get("search")?.trim();

  const where: Record<string, unknown> = {};

  if (plan) {
    where.plan = plan;
  }

  if (search) {
    // Türkçe aware: orijinal + ASCII sürümüyle ara
    const { turkishToAscii } = await import("@/lib/utils/turkish");
    const asciiSearch = turkishToAscii(search);
    const terms = asciiSearch === search ? [search] : [search, asciiSearch];
    where.OR = terms.flatMap((term) => [
      { email: { contains: term, mode: "insensitive" } },
      { fullName: { contains: term, mode: "insensitive" } },
    ]);
  }

  const [users, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        _count: { select: { brands: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.profile.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      plan: u.plan,
      brandCount: u._count.brands,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
