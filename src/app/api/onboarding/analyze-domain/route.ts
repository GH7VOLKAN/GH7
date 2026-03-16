import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { researchOnboardingDomain } from "@/lib/ai/sonar-research";

export const maxDuration = 60;

/**
 * POST /api/onboarding/analyze-domain
 * Input:  { domain: "isitmax.com" }
 * Output: { companyName, sector, categories[], regions[],
 *           competitors[], strengths[], weaknesses[] }
 */
export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rawDomain = body.domain?.trim();

  if (!rawDomain) {
    return NextResponse.json({ error: "Domain gerekli" }, { status: 400 });
  }

  // Clean domain
  const domain = rawDomain
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .toLowerCase();

  try {
    const result = await researchOnboardingDomain(domain);

    return NextResponse.json({
      companyName: result.companyName,
      sector: result.sector,
      categories: result.businessCategories,
      regions: result.serviceRegions,
      competitors: result.competitors,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      rawAnalysis: result.rawAnalysis,
    });
  } catch (err) {
    console.error("[analyze-domain] Sonar analysis failed:", err);
    return NextResponse.json(
      { error: "Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
