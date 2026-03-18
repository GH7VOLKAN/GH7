import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      profile: { select: { email: true, fullName: true, plan: true } },
      prompts: {
        orderBy: { createdAt: "desc" },
        include: {
          results: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      scans: {
        orderBy: { startedAt: "desc" },
        take: 5,
        include: {
          results: {
            select: {
              id: true,
              platform: true,
              mentioned: true,
              position: true,
              sentiment: true,
              promptId: true,
            },
          },
        },
      },
      competitors: {
        orderBy: { mentionScore: "desc" },
      },
      auditCategories: {
        include: {
          checks: true,
        },
        orderBy: { name: "asc" },
      },
      sourceDomains: {
        orderBy: { usagePercent: "desc" },
      },
      checklistItems: {
        orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
      },
    },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Compute platform mention summary from the latest completed scan
  const latestCompletedScan = brand.scans.find((s) => s.status === "completed");
  const platformSummary: Record<string, { mentioned: number; total: number }> = {};
  if (latestCompletedScan) {
    for (const r of latestCompletedScan.results) {
      if (!platformSummary[r.platform]) {
        platformSummary[r.platform] = { mentioned: 0, total: 0 };
      }
      platformSummary[r.platform].total++;
      if (r.mentioned) platformSummary[r.platform].mentioned++;
    }
  }

  return NextResponse.json({
    brand: {
      id: brand.id,
      name: brand.name,
      domain: brand.domain,
      type: brand.type,
      sector: brand.sector,
      city: brand.city,
      businessCategories: brand.businessCategories,
      serviceRegions: brand.serviceRegions,
      strengths: brand.strengths,
      weaknesses: brand.weaknesses,
      competitorNames: brand.competitorNames,
      competitorDomains: brand.competitorDomains,
      autoScan: brand.autoScan,
      scanInterval: brand.scanInterval,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    },
    owner: brand.profile,
    prompts: brand.prompts.map((p) => ({
      id: p.id,
      text: p.text,
      category: p.category,
      isActive: p.isActive,
      lastScanAt: p.lastScanAt?.toISOString() ?? null,
      // Latest results per platform for this prompt
      platformResults: (() => {
        const byPlatform: Record<string, { mentioned: boolean; position: string | null; sentiment: string | null }> = {};
        // Get only results from the latest scan
        if (latestCompletedScan) {
          const scanResults = latestCompletedScan.results.filter((r) => r.promptId === p.id);
          for (const r of scanResults) {
            byPlatform[r.platform] = {
              mentioned: r.mentioned,
              position: r.position,
              sentiment: r.sentiment,
            };
          }
        }
        return byPlatform;
      })(),
    })),
    scans: brand.scans.map((s) => ({
      id: s.id,
      status: s.status,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
      resultCount: s.results.length,
    })),
    platformSummary,
    checklistItems: brand.checklistItems.map((c) => ({
      id: c.id,
      layer: c.layer,
      itemNumber: c.itemNumber,
      simpleTitle: c.simpleTitle,
      simpleDescription: c.simpleDescription,
      status: c.status,
      difficulty: c.difficulty,
      impact: c.impact,
      userMarkedDone: c.userMarkedDone,
    })),
    competitors: brand.competitors.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      mentionScore: c.mentionScore,
      readinessScore: c.readinessScore,
      platforms: c.platforms,
      relevance: c.relevance,
    })),
    auditCategories: brand.auditCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      score: cat.score,
      checks: cat.checks.map((ch) => ({
        id: ch.id,
        label: ch.label,
        status: ch.status,
        score: ch.score,
        detail: ch.detail,
        recommendation: ch.recommendation,
      })),
    })),
    sourceDomains: brand.sourceDomains.map((s) => ({
      id: s.id,
      domain: s.domain,
      type: s.type,
      usagePercent: s.usagePercent,
      avgCitations: s.avgCitations,
      urls: s.urls,
      actionNote: s.actionNote,
    })),
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

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.domain !== undefined) data.domain = body.domain;
  if (body.sector !== undefined) data.sector = body.sector;
  if (body.city !== undefined) data.city = body.city;
  if (body.competitorNames !== undefined) data.competitorNames = body.competitorNames;
  if (body.competitorDomains !== undefined) data.competitorDomains = body.competitorDomains;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.brand.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    success: true,
    brand: {
      id: updated.id,
      name: updated.name,
      domain: updated.domain,
      sector: updated.sector,
      city: updated.city,
      competitorNames: updated.competitorNames,
      competitorDomains: updated.competitorDomains,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.brand.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  await prisma.brand.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
