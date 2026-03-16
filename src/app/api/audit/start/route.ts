import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { runSiteAudit } from "@/lib/ai/site-auditor";
import { runPersonalAudit } from "@/lib/ai/personal-auditor";
import { persistAuditResults } from "@/lib/ai/audit-persister";
import { generateActionPlan } from "@/lib/ai/action-plan-generator";
import { isPro } from "@/lib/plans";

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
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  // Get user plan
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const plan = profile?.plan ?? "free";

  try {
    // Firma → site audit, Kisisel → personal audit (Sonar-based)
    const result = brand.type === "kisisel"
      ? await runPersonalAudit({
          name: brand.name,
          domain: brand.domain,
          profession: brand.profession,
          city: brand.city,
          sector: brand.sector,
          specialties: brand.specialties,
        })
      : await runSiteAudit(brand.domain);

    await persistAuditResults(brandId, result);

    // Create notification
    const totalChecks = result.categories.reduce(
      (sum, c) => sum + c.checks.length,
      0,
    );
    const passCount = result.categories.reduce(
      (sum, c) => sum + c.checks.filter((ch) => ch.status === "pass").length,
      0,
    );

    const auditLabel = brand.type === "kisisel" ? "Dijital varlık analizi" : "Site analizi";

    await prisma.notification.create({
      data: {
        brandId,
        type: "scan_completed",
        title: `${auditLabel} tamamlandı`,
        message: `${passCount}/${totalChecks} kontrol başarılı.`,
      },
    });

    // Pro+ kullanicilar icin AI aksiyon plani uret (non-fatal)
    if (isPro(plan)) {
      try {
        const latestScore = await prisma.scoreHistory.findFirst({
          where: { brandId },
          orderBy: { date: "desc" },
        });
        const mentionScore = latestScore?.mentionScore ?? 0;

        await generateActionPlan(
          {
            id: brandId,
            name: brand.name,
            domain: brand.domain,
            type: brand.type as "firma" | "kisisel",
            sector: brand.sector,
            city: brand.city,
            profession: brand.profession,
            specialties: brand.specialties,
          },
          result,
          mentionScore,
        );
      } catch (actionErr) {
        console.error("[audit] Action plan generation failed (non-fatal):", actionErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[audit] Failed:", error);
    return NextResponse.json(
      { error: "Audit failed" },
      { status: 500 },
    );
  }
}
