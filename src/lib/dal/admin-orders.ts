/**
 * Admin Orders DAL
 *
 * Admin panelinde sipariş yönetimi için veri erişim katmanı.
 * `getAdminUser()` ile auth kontrolü yapıldıktan sonra kullanılmalı.
 */

import { prisma } from "@/lib/db";

export interface AdminOrderRow {
  id: string;
  userId: string;
  userEmail: string;
  userFullName: string | null;
  brandName: string | null;
  brandDomain: string | null;
  packageName: string;
  packageTier: string;
  status: string;
  amount: number;
  preScore: number | null;
  postScore: number | null;
  deliveredAt: Date | null;
  approvedAt: Date | null;
  paidAt: Date | null;
  autoApproveAt: Date | null;
  iyzicoPaymentRef: string | null;
  adminNotes: string | null;
  createdAt: Date;
}

export interface AdminOrderDetail extends AdminOrderRow {
  packageId: string;
  packageDescription: string;
  packageDeliverables: string[];
  packageAuditItemsFixed: string[];
  packageEstimatedScoreBoost: number;
  packageDeliveryDays: number;
  auditId: string | null;
  postAuditId: string | null;
  preAuditScore: number | null;
  postAuditScore: number | null;
}

export async function getAllServiceOrders(
  filter?: string
): Promise<AdminOrderRow[]> {
  const where = filter && filter !== "all" ? { status: filter } : {};

  const orders = await prisma.serviceOrder.findMany({
    where,
    include: {
      package: { select: { name: true, tier: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Tüm userId'leri topla
  const userIds = Array.from(new Set(orders.map((o) => o.userId)));
  const profiles = await prisma.profile.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, fullName: true },
  });
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Brand map (her userId için ilk brand)
  const brands = await prisma.brand.findMany({
    where: { profileId: { in: userIds } },
    select: { profileId: true, name: true, domain: true },
  });
  const brandMap = new Map<string, { name: string; domain: string }>();
  for (const b of brands) {
    if (!brandMap.has(b.profileId)) brandMap.set(b.profileId, { name: b.name, domain: b.domain });
  }

  return orders.map((o) => {
    const profile = profileMap.get(o.userId);
    const brand = brandMap.get(o.userId);
    return {
      id: o.id,
      userId: o.userId,
      userEmail: profile?.email ?? "",
      userFullName: profile?.fullName ?? null,
      brandName: brand?.name ?? null,
      brandDomain: brand?.domain ?? null,
      packageName: o.package.name,
      packageTier: o.package.tier,
      status: o.status,
      amount: o.amount,
      preScore: o.preScore,
      postScore: o.postScore,
      deliveredAt: o.deliveredAt,
      approvedAt: o.approvedAt,
      paidAt: o.paidAt,
      autoApproveAt: o.autoApproveAt,
      iyzicoPaymentRef: o.iyzicoPaymentRef,
      adminNotes: o.adminNotes,
      createdAt: o.createdAt,
    };
  });
}

export async function getServiceOrderDetail(
  id: string
): Promise<AdminOrderDetail | null> {
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { package: true },
  });
  if (!order) return null;

  const [profile, brand, preAudit, postAudit] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: order.userId },
      select: { email: true, fullName: true },
    }),
    prisma.brand.findFirst({
      where: { profileId: order.userId },
      select: { name: true, domain: true },
    }),
    order.auditId
      ? prisma.geoAudit.findUnique({
          where: { id: order.auditId },
          select: { overallScore: true },
        })
      : Promise.resolve(null),
    order.postAuditId
      ? prisma.geoAudit.findUnique({
          where: { id: order.postAuditId },
          select: { overallScore: true },
        })
      : Promise.resolve(null),
  ]);

  return {
    id: order.id,
    userId: order.userId,
    userEmail: profile?.email ?? "",
    userFullName: profile?.fullName ?? null,
    brandName: brand?.name ?? null,
    brandDomain: brand?.domain ?? null,
    packageId: order.packageId,
    packageName: order.package.name,
    packageTier: order.package.tier,
    packageDescription: order.package.description,
    packageDeliverables: Array.isArray(order.package.deliverables)
      ? (order.package.deliverables as string[])
      : [],
    packageAuditItemsFixed: Array.isArray(order.package.auditItemsFixed)
      ? (order.package.auditItemsFixed as string[])
      : [],
    packageEstimatedScoreBoost: order.package.estimatedScoreBoost,
    packageDeliveryDays: order.package.deliveryDays,
    status: order.status,
    amount: order.amount,
    preScore: order.preScore,
    postScore: order.postScore,
    deliveredAt: order.deliveredAt,
    approvedAt: order.approvedAt,
    paidAt: order.paidAt,
    autoApproveAt: order.autoApproveAt,
    iyzicoPaymentRef: order.iyzicoPaymentRef,
    adminNotes: order.adminNotes,
    createdAt: order.createdAt,
    auditId: order.auditId,
    postAuditId: order.postAuditId,
    preAuditScore: preAudit?.overallScore ?? null,
    postAuditScore: postAudit?.overallScore ?? null,
  };
}

export async function getOrderStats() {
  const [total, paidHolding, inProgress, delivered, approved, refunded] =
    await Promise.all([
      prisma.serviceOrder.count(),
      prisma.serviceOrder.count({ where: { status: "paid_holding" } }),
      prisma.serviceOrder.count({ where: { status: "in_progress" } }),
      prisma.serviceOrder.count({ where: { status: "delivered" } }),
      prisma.serviceOrder.count({ where: { status: "approved_final" } }),
      prisma.serviceOrder.count({ where: { status: "refunded" } }),
    ]);

  const revenue = await prisma.serviceOrder.aggregate({
    where: { status: "approved_final" },
    _sum: { amount: true },
  });

  return {
    total,
    paidHolding,
    inProgress,
    delivered,
    approved,
    refunded,
    totalRevenue: revenue._sum.amount ?? 0,
  };
}

export async function getAllPackages() {
  return prisma.servicePackage.findMany({
    orderBy: [{ userType: "asc" }, { price: "asc" }],
  });
}
