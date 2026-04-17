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

  if (order.status !== "in_progress") {
    return NextResponse.json(
      { error: `Geçersiz durum: ${order.status}` },
      { status: 400 }
    );
  }

  const now = new Date();
  const autoApproveAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  await prisma.serviceOrder.update({
    where: { id },
    data: {
      status: "delivered",
      deliveredAt: now,
      autoApproveAt,
    },
  });

  // Kullanıcıya bildirim
  const brand = await prisma.brand.findFirst({
    where: { profileId: order.userId },
    select: { id: true },
  });

  if (brand) {
    await prisma.notification.create({
      data: {
        brandId: brand.id,
        type: "order_delivered",
        title: "Siparişiniz teslim edildi",
        message: `Siparişiniz tamamlandı. 72 saat içinde onaylayın veya itiraz edin.`,
        data: { orderId: id, autoApproveAt: autoApproveAt.toISOString() },
      },
    });
  }

  return NextResponse.json({ success: true, autoApproveAt });
}
