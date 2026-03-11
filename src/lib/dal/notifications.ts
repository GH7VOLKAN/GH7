import { prisma } from "@/lib/db";
import { cache } from "react";

export const getNotifications = cache(async (brandId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { brandId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount };
});
