import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Leads are stored as Notification records with type = "call_request"
// The `data` JSON field stores: { phone, timeSlot, brandName, status }

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { type: "call_request" },
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { id: true, name: true, domain: true } },
    },
  });

  const leads = notifications.map((n) => {
    const data = (n.data ?? {}) as Record<string, unknown>;
    return {
      id: n.id,
      brandId: n.brandId,
      brandName: data.brandName ?? n.brand.name,
      brandDomain: n.brand.domain,
      phone: data.phone ?? "",
      timeSlot: data.timeSlot ?? "",
      status: data.status ?? "new",
      createdAt: n.createdAt,
    };
  });

  // Pipeline counts
  const pipeline = { new: 0, contacted: 0, agreed: 0, completed: 0 };
  for (const lead of leads) {
    const s = lead.status as keyof typeof pipeline;
    if (s in pipeline) pipeline[s]++;
  }

  return NextResponse.json({ leads, pipeline });
}

export async function PUT(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body as { id: string; status: string };

  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const validStatuses = ["new", "contacted", "agreed", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Fetch existing notification to merge data
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.type !== "call_request") {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const existingData = (existing.data ?? {}) as Record<string, unknown>;
  const updatedData = { ...existingData, status };

  await prisma.notification.update({
    where: { id },
    data: { data: updatedData },
  });

  return NextResponse.json({ ok: true });
}
