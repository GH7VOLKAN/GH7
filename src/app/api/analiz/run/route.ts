import { NextResponse } from "next/server";
import { MOCK_ANALYSIS } from "@/lib/analiz/mock-data";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/analiz/cache";
import { isValidDomain, normalizeDomain, brandNameFromDomain } from "@/lib/analiz/domain";
import type { AnalysisResult } from "@/lib/analiz/types";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  yourDomain?: string;
  productId?: string;
  productName?: string;
  competitorDomain?: string;
  forceRefresh?: boolean; // Pro kullanıcı cache bypass edebilir
};

/**
 * POST /api/analiz/run
 *
 * Gerçek sürümde:
 *  1) 7-günlük cache'e bak → varsa dön
 *  2) Opus ile 5 jenerik sorgu üret (marka adı geçmesin)
 *  3) Paralel olarak ChatGPT / Claude / Gemini / Perplexity / Google AIO'ya sor
 *  4) Cevapları parse et (Turkish normalization + Levenshtein), marka mention'larını bul
 *  5) 43-madde audit'i kendi siten + rakip siten için çalıştır
 *  6) Cache'e yaz (7 gün)
 *  7) Sonucu dön
 *
 * Şimdilik mock. Yapı gerçekçi.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const { yourDomain, productId, competitorDomain, forceRefresh } = body;

  if (!yourDomain || !competitorDomain || !productId) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }
  if (!isValidDomain(yourDomain) || !isValidDomain(competitorDomain)) {
    return NextResponse.json({ error: "Geçersiz domain" }, { status: 400 });
  }

  // 1) Cache kontrolü
  if (!forceRefresh) {
    const cached = await getCachedAnalysis(yourDomain, productId, competitorDomain);
    if (cached) return NextResponse.json(cached);
  }

  // 2-6) Gerçek analiz (şimdilik mock)
  await new Promise((r) => setTimeout(r, 3000));

  const normalizedYou = normalizeDomain(yourDomain);
  const normalizedThem = normalizeDomain(competitorDomain);

  const result: AnalysisResult = {
    ...MOCK_ANALYSIS,
    yourDomain: normalizedYou,
    yourBrandName: brandNameFromDomain(normalizedYou),
    competitorDomain: normalizedThem,
    competitorBrandName: brandNameFromDomain(normalizedThem),
    productName: body.productName ?? MOCK_ANALYSIS.productName,
    cached: false,
    generatedAt: new Date().toISOString(),
  };

  // 7) Cache'e yaz
  await setCachedAnalysis(yourDomain, productId, competitorDomain, result);

  return NextResponse.json(result);
}
