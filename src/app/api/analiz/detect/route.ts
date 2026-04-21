/**
 * POST /api/analiz/detect
 *
 * Aşama 1-2: Site tanımlama — ürünler, sektör, lokasyon.
 * RAKIPLER BURADA DÖNMÜYOR — /api/analiz/competitors ayrı endpoint'i kullan.
 *
 * Bu ayrım bilinçli: rakipler ürün-bazlı (her ürün için ayrı Sonar çağrısı),
 * detect ise tek Sonar çağrısı ile ürün listesini hızlı çıkarıyor.
 *
 * Input:
 *   { domain: string, door: "firma"|"kisi"|"eticaret"|"yurtdisi", ... }
 *
 * Output:
 *   {
 *     domain, sector, description, location,
 *     products: [{id, name, subcatCount}],
 *     competitorsByProductId: {} // her zaman boş; frontend /competitors çağırsın
 *   }
 */

import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/ai/website-analyzer";
import type { CompanyType } from "@/lib/ai/discovery-types";
import { isValidDomain, normalizeDomain } from "@/lib/analiz/domain";

export const runtime = "nodejs";
export const maxDuration = 45;

type Body = {
  domain?: string;
  door?: string;
  brandName?: string;
  fullName?: string;
  expertise?: string;
  socialMedia?: string;
  ecommerceMode?: "website" | "marketplace" | "brand";
  marketplaceUrl?: string;
  brandOrProductName?: string;
  category?: string;
  targetMarkets?: string;
  siteLanguage?: string;
  location?: string;
  competitor?: string;
};

function doorToCompanyType(door: string): CompanyType {
  if (door === "kisi") return "kisi";
  if (door === "eticaret") return "eticaret";
  if (door === "export" || door === "yurtdisi") return "yurtdisi";
  return "firma";
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { domain, door } = body;

  if (!door) {
    return NextResponse.json({ error: "door gerekli" }, { status: 400 });
  }

  const companyType = doorToCompanyType(door);

  // kisi dışında domain zorunlu
  if (companyType !== "kisi") {
    if (!domain || !isValidDomain(domain)) {
      return NextResponse.json({ error: "Geçersiz domain" }, { status: 400 });
    }
  }

  const normalizedDomain = domain ? normalizeDomain(domain) : "";

  // runDiscovery'e geçecek input'u kapıya göre hazırla
  const discoveryResult = await runDiscovery({
    companyType,
    url: normalizedDomain || undefined,
    brandName: body.brandName,
    fullName: body.fullName,
    expertise: body.expertise,
    socialMedia: body.socialMedia,
    ecommerceMode: body.ecommerceMode,
    marketplaceUrl: body.marketplaceUrl,
    brandOrProductName: body.brandOrProductName,
    category: body.category,
    targetMarkets: body.targetMarkets,
    siteLanguage: body.siteLanguage,
    location: body.location,
    competitor: body.competitor,
  });

  // Products + Services birleşip tek liste oluyor (kullanıcı etiket seçecek, MVP'de etiket gösterilmeyecek)
  // Max 5'e kırp (free tier)
  const combinedItems: string[] = [
    ...discoveryResult.products,
    ...discoveryResult.services,
  ].slice(0, 5);

  const products = combinedItems.map((name, i) => ({
    id: `p${i + 1}`,
    name,
    subcatCount: 0,
  }));

  return NextResponse.json({
    domain: normalizedDomain,
    sector: discoveryResult.sector,
    description: discoveryResult.description,
    location: discoveryResult.location,
    products,
    // KRİTİK: rakipler artık burada dönmüyor. Frontend /api/analiz/competitors çağırmalı.
    competitorsByProductId: {},

    // Yurtdışı için ek bilgi (frontend competitors çağrısında lazım olur)
    targetCountries: discoveryResult.targetCountries,
    siteLanguages: discoveryResult.siteLanguages,

    // E-ticaret için ek bilgi
    priceSegment: discoveryResult.priceSegment,
  });
}
