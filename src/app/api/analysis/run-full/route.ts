import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { executeScan } from "@/lib/ai/scan-engine";
import { getAvailablePlatforms } from "@/lib/ai/provider-registry";
import { runSiteAudit } from "@/lib/ai/site-auditor";
import { runPersonalAudit } from "@/lib/ai/personal-auditor";
import { persistAuditResults } from "@/lib/ai/audit-persister";
import { generateActionPlan } from "@/lib/ai/action-plan-generator";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandId } = (await request.json()) as { brandId: string };

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
    include: { profile: { select: { plan: true } } },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Cleanup stuck scans
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  await prisma.scan.updateMany({
    where: { brandId, status: "running", startedAt: { lt: tenMinutesAgo } },
    data: { status: "failed", completedAt: new Date() },
  });

  // Check for already-running scan
  const runningScan = await prisma.scan.findFirst({
    where: { brandId, status: "running" },
  });

  if (runningScan) {
    return NextResponse.json(
      { scanId: runningScan.id, message: "Analysis already running" },
      { status: 409 },
    );
  }

  const platforms = getAvailablePlatforms();
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "No AI API keys configured" },
      { status: 400 },
    );
  }

  const scan = await prisma.scan.create({
    data: { brandId, status: "pending", type: "full_analysis" },
  });

  // Run everything in background
  after(async () => {
    console.log(`[run-full] Starting full analysis for brand ${brandId}, scan ${scan.id}`);
    const fullStart = Date.now();

    try {
      // PHASE 1: AI Scan (prompts × 4 platforms + analysis + scoring)
      console.log("[run-full] Phase 1: Running AI scan...");
      await executeScan(scan.id, brandId);
      console.log(`[run-full] Phase 1 complete in ${Date.now() - fullStart}ms`);

      // PHASE 2: Site/Personal Audit
      console.log("[run-full] Phase 2: Running audit...");
      try {
        const brandType = brand.type as "firma" | "kisisel";
        const auditResult = brandType === "kisisel"
          ? await runPersonalAudit({
              name: brand.name,
              domain: brand.domain,
              profession: brand.profession,
              city: brand.city,
              sector: brand.sector,
              specialties: brand.specialties,
            })
          : await runSiteAudit(brand.domain);

        await persistAuditResults(brand.id, auditResult);
        console.log(`[run-full] Phase 2 complete in ${Date.now() - fullStart}ms`);

        // PHASE 3: Action Plan
        console.log("[run-full] Phase 3: Generating action plan...");
        // Get the mention score from the scan we just ran
        const latestScore = await prisma.scoreHistory.findFirst({
          where: { brandId },
          orderBy: { date: "desc" },
          select: { mentionScore: true },
        });

        await generateActionPlan(
          {
            id: brand.id,
            name: brand.name,
            domain: brand.domain,
            type: brandType,
            sector: brand.sector,
            city: brand.city,
            profession: brand.profession,
            specialties: brand.specialties,
          },
          auditResult,
          latestScore?.mentionScore ?? 0,
        );
        console.log(`[run-full] Phase 3 complete in ${Date.now() - fullStart}ms`);
      } catch (auditErr) {
        console.error("[run-full] Audit/action plan failed (non-fatal):", auditErr);
      }

      console.log(`[run-full] Full analysis complete in ${Math.round((Date.now() - fullStart) / 1000)}s`);
    } catch (err) {
      console.error("[run-full] Fatal error:", err);
    }
  });

  return NextResponse.json({ scanId: scan.id, platforms });
}
