import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_PLANS = ["free", "pro", "business", "agency"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      brands: {
        include: {
          _count: { select: { prompts: true } },
          scans: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { startedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get notifications across all user brands
  const brandIds = profile.brands.map((b) => b.id);
  const notifications = brandIds.length
    ? await prisma.notification.findMany({
        where: { brandId: { in: brandIds } },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  // Stats: total scans and total prompts across all brands
  const [scanCount, promptCount] = await Promise.all([
    prisma.scan.count({ where: { brandId: { in: brandIds } } }),
    prisma.prompt.count({ where: { brandId: { in: brandIds } } }),
  ]);

  return NextResponse.json({
    profile: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      plan: profile.plan,
      planStartDate: profile.planStartDate?.toISOString() ?? null,
      planEndDate: profile.planEndDate?.toISOString() ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
    brands: profile.brands.map((b) => ({
      id: b.id,
      name: b.name,
      domain: b.domain,
      promptCount: b._count.prompts,
      lastScanDate: b.scans[0]?.startedAt?.toISOString() ?? null,
    })),
    payments: profile.payments.map((p) => ({
      id: p.id,
      plan: p.plan,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      period: p.period,
      createdAt: p.createdAt.toISOString(),
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
    stats: {
      totalScans: scanCount,
      totalPrompts: promptCount,
      totalBrands: profile.brands.length,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Validate profile exists
  const existing = await prisma.profile.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Build update data
  const data: Record<string, unknown> = {};

  if (body.fullName !== undefined) data.fullName = body.fullName;
  if (body.phone !== undefined) data.phone = body.phone;

  if (body.plan !== undefined) {
    const plan = body.plan.toLowerCase();
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    data.plan = plan;
    // When plan changes, update dates
    if (plan !== existing.plan) {
      data.planStartDate = new Date();
      // 30-day period for monthly
      const end = new Date();
      end.setDate(end.getDate() + 30);
      data.planEndDate = end;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.profile.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    success: true,
    profile: {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      plan: updated.plan,
      planStartDate: updated.planStartDate?.toISOString() ?? null,
      planEndDate: updated.planEndDate?.toISOString() ?? null,
    },
  });
}
