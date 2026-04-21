import { NextResponse } from "next/server";
import { MOCK_DETECT } from "@/lib/analiz/mock-data";
import { isValidDomain, normalizeDomain } from "@/lib/analiz/domain";

export const runtime = "nodejs";

/**
 * POST /api/analiz/detect
 * Body: { domain: string, door: "firma" | "kisi" | "eticaret" | "export" }
 *
 * Gerçek sürümde:
 *  1) Perplexity'ye siteyi tarat
 *  2) Ana ürünleri + rakipleri çıkar
 *  3) Sonucu döndür
 *
 * Şimdilik mock veri dönüyor. Fake 2-3 saniye gecikme ile.
 */
export async function POST(req: Request) {
  const { domain } = (await req.json()) as { domain?: string; door?: string };

  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json(
      { error: "Geçersiz domain" },
      { status: 400 },
    );
  }

  // Fake latency — UX olarak "tarama yapılıyor" hissi
  await new Promise((r) => setTimeout(r, 2000));

  return NextResponse.json({
    ...MOCK_DETECT,
    domain: normalizeDomain(domain),
  });
}
