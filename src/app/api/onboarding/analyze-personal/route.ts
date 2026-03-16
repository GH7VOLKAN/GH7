import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { researchOnboardingPersonal } from "@/lib/ai/sonar-research";

export const maxDuration = 60;

/**
 * POST /api/onboarding/analyze-personal
 * Input:  { linkedinUrl?: string, name?: string, profession?: string, city?: string }
 * Output: { name, profession, city, specialties[], competitors[], strengths[], weaknesses[] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { linkedinUrl, name, profession, city } = body;

  if (!linkedinUrl && !name) {
    return NextResponse.json(
      { error: "LinkedIn URL veya isim gerekli" },
      { status: 400 },
    );
  }

  try {
    const result = await researchOnboardingPersonal({
      linkedinUrl: linkedinUrl?.trim() || undefined,
      name: name?.trim() || undefined,
      profession: profession?.trim() || undefined,
      city: city?.trim() || undefined,
    });

    return NextResponse.json({
      name: result.name,
      profession: result.profession,
      city: result.city,
      specialties: result.specialties,
      competitors: result.competitors,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      rawAnalysis: result.rawAnalysis,
    });
  } catch (err) {
    console.error("[analyze-personal] Sonar analysis failed:", err);
    return NextResponse.json(
      { error: "Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
