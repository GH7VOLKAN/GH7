import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPageSpeedScore, calculateSiteHealthScore } from "@/lib/pagespeed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    if (!domain) return NextResponse.json({ error: "domain parametresi gerekli" }, { status: 400 });

    const pageSpeed = await getPageSpeedScore(domain);
    const healthScore = calculateSiteHealthScore(pageSpeed);

    return NextResponse.json({
      score: healthScore,
      ...pageSpeed,
    });
  } catch (error) {
    console.error("[site-health]", error);
    return NextResponse.json({ error: "Site sağlık skoru alınamadı" }, { status: 500 });
  }
}
