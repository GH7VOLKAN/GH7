import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_TYPES = [
  "scan_completed",
  "scan_failed",
  "score_up",
  "score_down",
  "call_request",
  "weekly_report",
  "monthly_report",
] as const;

// GET: List all notifications with pagination and optional type filter
export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (type && VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  const mapped = notifications.map((n) => ({
    id: n.id,
    brandName: n.brand.name,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    data: n.data,
    createdAt: n.createdAt,
  }));

  return NextResponse.json({ notifications: mapped, total, page });
}

// POST: Send notification to specific brands or broadcast
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { brandIds, broadcastTo, title, message, type } = body as {
    brandIds?: string[];
    broadcastTo?: "all" | "pro" | "business" | "agency";
    title?: string;
    message?: string;
    type?: string;
  };

  if (!title || !message) {
    return NextResponse.json(
      { error: "title and message are required" },
      { status: 400 }
    );
  }

  const notificationType = type || "monthly_report";

  let targetBrandIds: string[] = [];

  if (brandIds && brandIds.length > 0) {
    // Specific brands
    targetBrandIds = brandIds;
  } else if (broadcastTo) {
    // Broadcast to plan-based groups
    const planFilter: Record<string, unknown> = {};
    if (broadcastTo === "all") {
      planFilter.plan = { in: ["pro", "business", "agency"] };
    } else {
      planFilter.plan = broadcastTo;
    }

    const brands = await prisma.brand.findMany({
      where: {
        profile: planFilter,
      },
      select: { id: true },
    });

    targetBrandIds = brands.map((b) => b.id);
  } else {
    return NextResponse.json(
      { error: "Provide brandIds or broadcastTo" },
      { status: 400 }
    );
  }

  if (targetBrandIds.length === 0) {
    return NextResponse.json(
      { error: "No target brands found" },
      { status: 404 }
    );
  }

  const created = await prisma.notification.createMany({
    data: targetBrandIds.map((brandId) => ({
      brandId,
      type: notificationType,
      title,
      message,
      read: false,
    })),
  });

  return NextResponse.json({
    success: true,
    count: created.count,
  });
}
