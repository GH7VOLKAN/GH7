import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status !== "paid_holding") {
    return NextResponse.json(
      { error: `Geçersiz durum: ${order.status}` },
      { status: 400 }
    );
  }

  await prisma.serviceOrder.update({
    where: { id },
    data: { status: "in_progress" },
  });

  return NextResponse.json({ success: true });
}
