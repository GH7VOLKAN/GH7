import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { runSiteAudit } from "@/lib/ai/site-auditor";
import { persistAuditResults } from "@/lib/ai/audit-persister";

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

  if (!brand.domain) {
    return NextResponse.json(
      { error: "Brand has no domain configured" },
      { status: 400 },
    );
  }

  try {
    const result = await runSiteAudit(brand.domain);
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

    await prisma.notification.create({
      data: {
        brandId,
        type: "scan_completed",
        title: "Site analizi tamamlandı",
        message: `${passCount}/${totalChecks} kontrol başarılı.`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[audit] Failed:", error);
    return NextResponse.json(
      { error: "Audit failed" },
      { status: 500 },
    );
  }
}
