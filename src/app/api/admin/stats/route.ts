import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday

  const [
    totalUsers,
    planCounts,
    scansToday,
    scansThisWeek,
    totalPrompts,
    totalBrands,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
    prisma.scan.count({
      where: { startedAt: { gte: todayStart } },
    }),
    prisma.scan.count({
      where: { startedAt: { gte: weekStart } },
    }),
    prisma.prompt.count(),
    prisma.brand.count(),
  ]);

  // Build plan distribution
  const plans: Record<string, number> = { free: 0, pro: 0, business: 0, agency: 0 };
  for (const row of planCounts) {
    const key = row.plan.toLowerCase();
    if (key in plans) {
      plans[key] = row._count.plan;
    }
  }

  // Revenue estimate (monthly TRY kuruş amounts)
  const revenueEstimate =
    plans.pro * 2495 + plans.business * 7495 + plans.agency * 19995;

  return NextResponse.json({
    totalUsers,
    plans,
    scansToday,
    scansThisWeek,
    totalPrompts,
    totalBrands,
    revenueEstimate,
  });
}
