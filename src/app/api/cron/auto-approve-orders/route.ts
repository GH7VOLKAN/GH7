/**
 * Auto-Approve Orders Cron
 *
 * 72 saat içinde itiraz edilmemiş delivered siparişleri otomatik onaylar.
 * Saatlik çalışır (vercel.json: 0 * * * *).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 72 saat geçmiş delivered siparişler
  const expiredOrders = await prisma.serviceOrder.findMany({
    where: {
      status: "delivered",
      autoApproveAt: { lte: now },
    },
    take: 100,
  });

  let approved = 0;
  let failed = 0;

  for (const order of expiredOrders) {
    try {
      await prisma.serviceOrder.update({
        where: { id: order.id },
        data: {
          status: "approved_final",
          approvedAt: now,
          adminNotes:
            (order.adminNotes ? order.adminNotes + "\n\n" : "") +
            "Otomatik onaylandı (72 saat itiraz süresi doldu).",
        },
      });

      // Admin bildirim
      const brand = await prisma.brand.findFirst({
        where: { profileId: order.userId },
        select: { id: true },
      });

      if (brand) {
        await prisma.notification.create({
          data: {
            brandId: brand.id,
            type: "order_auto_approved",
            title: "Sipariş otomatik onaylandı",
            message: `Sipariş #${order.id.slice(0, 8)} 72 saat itiraz süresi dolduğu için otomatik onaylandı.`,
            data: { orderId: order.id },
          },
        });
      }

      approved++;
    } catch (err) {
      console.error(`[auto-approve] Failed for ${order.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    success: true,
    checked: expiredOrders.length,
    approved,
    failed,
  });
}
