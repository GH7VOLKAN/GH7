/**
 * Service Orders DAL
 *
 * Hizmet paketleri ve sipariş yönetimi için veri erişim katmanı.
 */

import { prisma } from "@/lib/db";
import { cache } from "react";

export interface ServicePackageData {
  id: string;
  name: string;
  slug: string;
  userType: string;
  tier: string;
  price: number;
  description: string;
  deliverables: string[];
  auditItemsFixed: string[];
  estimatedScoreBoost: number;
  deliveryDays: number;
}

export interface ServiceOrderData {
  id: string;
  userId: string;
  packageId: string;
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
  itemsFixed: string[] | null;
  adminNotes: string | null;
  createdAt: Date;
}

/**
 * Kullanıcının tüm siparişlerini getir (en yeniden başlayarak).
 */
export const getUserServiceOrders = cache(
  async (userId: string): Promise<ServiceOrderData[]> => {
    const orders = await prisma.serviceOrder.findMany({
      where: { userId },
      include: {
        package: {
          select: { name: true, tier: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      packageId: o.packageId,
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
      itemsFixed: Array.isArray(o.itemsFixed) ? (o.itemsFixed as string[]) : null,
      adminNotes: o.adminNotes,
      createdAt: o.createdAt,
    }));
  }
);

/**
 * Kullanıcı tipine göre aktif paketleri getir.
 */
export const getAvailablePackages = cache(
  async (userType: string): Promise<ServicePackageData[]> => {
    const packages = await prisma.servicePackage.findMany({
      where: { userType, isActive: true },
      orderBy: { price: "asc" },
    });

    return packages.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      userType: p.userType,
      tier: p.tier,
      price: p.price,
      description: p.description,
      deliverables: Array.isArray(p.deliverables) ? (p.deliverables as string[]) : [],
      auditItemsFixed: Array.isArray(p.auditItemsFixed)
        ? (p.auditItemsFixed as string[])
        : [],
      estimatedScoreBoost: p.estimatedScoreBoost,
      deliveryDays: p.deliveryDays,
    }));
  }
);

/**
 * Kullanıcının en son audit skorunu getir (GeoAudit tablosundan).
 */
export const getLatestAuditScore = cache(
  async (userId: string): Promise<{ score: number; auditId: string } | null> => {
    const audit = await prisma.geoAudit.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, overallScore: true },
    });
    if (!audit) return null;
    return { score: audit.overallScore, auditId: audit.id };
  }
);

/**
 * Son 12 haftanın WeeklyAuditSnapshot verisi (trend grafiği için).
 */
export const getWeeklyTrendData = cache(
  async (
    userId: string,
    domain: string
  ): Promise<Array<{ weekStart: string; overallScore: number; competitorScore: number | null }>> => {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    const snapshots = await prisma.weeklyAuditSnapshot.findMany({
      where: {
        userId,
        url: domain,
        weekStart: { gte: twelveWeeksAgo },
      },
      orderBy: { weekStart: "asc" },
      select: {
        weekStart: true,
        overallScore: true,
        competitorScore: true,
      },
    });

    return snapshots.map((s) => ({
      weekStart: s.weekStart.toISOString().split("T")[0],
      overallScore: s.overallScore,
      competitorScore: s.competitorScore,
    }));
  }
);
