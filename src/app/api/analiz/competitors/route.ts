/**
 * POST /api/analiz/competitors
 *
 * Ürün bazlı rakip bulma. Detect endpoint'i ürünleri tespit ettikten
 * sonra frontend bu endpoint'i çağırır, kullanıcının onayladığı ürünler
 * için paralel olarak rakip listesi döner.
 *
 * Input:
 *   {
 *     domain: string,
 *     door: "firma" | "kisi" | "eticaret" | "yurtdisi",
 *     products: Array<{ id, name }>,
 *     sector?: string,
 *     cities?: string[],
 *     city?: string,
 *     fullName?: string,
 *     expertise?: string,
 *     priceSegment?: "ekonomik"|"orta"|"premium"|"luks",
 *     targetMarket?: string,
 *     forceRefresh?: boolean
 *   }
 *
 * Output:
 *   {
 *     competitorsByProductId: Record<productId, ProductCompetitor[]>,
 *     errors: Record<productId, string>  // ürün başına hata (varsa)
 *   }
 *
 * Cache: her ürün ayrı key (competitors:v1:<domain>::<productId>), 7 gün TTL.
 */

import { NextResponse } from "next/server";
import { findCompetitorsForProduct } from "@/lib/ai/product-competitors";
import type { ProductCompetitorDoor } from "@/lib/ai/product-competitor-prompts";
import {
  getCachedProductCompetitors,
  setCachedProductCompetitors,
} from "@/lib/analiz/cache";
import { isValidDomain, normalizeDomain } from "@/lib/analiz/domain";

export const runtime = "nodejs";
export const maxDuration = 60;

type ProductInput = { id: string; name: string };

type Body = {
  domain?: string;
  door?: string;
  products?: ProductInput[];
  sector?: string;
  cities?: string[];
  city?: string;
  fullName?: string;
  expertise?: string;
  priceSegment?: "ekonomik" | "orta" | "premium" | "luks";
  targetMarket?: string;
  forceRefresh?: boolean;
};

const VALID_DOORS: ProductCompetitorDoor[] = [
  "firma",
  "kisi",
  "eticaret",
  "yurtdisi",
];

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const { domain, door, products, forceRefresh } = body;

  // Input doğrulama
  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json(
      { error: "Geçersiz domain" },
      { status: 400 },
    );
  }
  if (!door || !VALID_DOORS.includes(door as ProductCompetitorDoor)) {
    return NextResponse.json(
      { error: "Geçersiz door" },
      { status: 400 },
    );
  }
  if (!Array.isArray(products) || products.length === 0) {
    return NextResponse.json(
      { error: "En az bir ürün gerekli" },
      { status: 400 },
    );
  }
  if (products.length > 5) {
    return NextResponse.json(
      { error: "En fazla 5 ürün işlenebilir (free tier)" },
      { status: 400 },
    );
  }

  const normalizedDomain = normalizeDomain(domain);
  const typedDoor = door as ProductCompetitorDoor;

  // Her ürün için paralel işleme
  const results = await Promise.allSettled(
    products.map(async (p) => {
      if (!p?.id || !p?.name) {
        throw new Error("Ürün id/name eksik");
      }

      // Cache kontrol
      if (!forceRefresh) {
        const cached = await getCachedProductCompetitors(normalizedDomain, p.id);
        if (cached && cached.competitors.length > 0) {
          return { productId: p.id, result: cached, cached: true };
        }
      }

      // Canlı Sonar çağrısı
      const result = await findCompetitorsForProduct({
        door: typedDoor,
        domain: normalizedDomain,
        productName: p.name,
        sector: body.sector,
        cities: body.cities,
        city: body.city,
        fullName: body.fullName,
        expertise: body.expertise,
        priceSegment: body.priceSegment,
        targetMarket: body.targetMarket,
      });

      // Cache yaz — boş sonuç da yazma (sonraki retry için alan aç)
      if (result.competitors.length > 0) {
        await setCachedProductCompetitors(normalizedDomain, p.id, result);
      }

      return { productId: p.id, result, cached: false };
    }),
  );

  // Derle
  const competitorsByProductId: Record<string, unknown[]> = {};
  const errors: Record<string, string> = {};
  const cacheStatus: Record<string, boolean> = {};

  results.forEach((r, i) => {
    const productId = products[i].id;
    if (r.status === "fulfilled") {
      competitorsByProductId[productId] = r.value.result.competitors;
      cacheStatus[productId] = r.value.cached;
    } else {
      competitorsByProductId[productId] = [];
      errors[productId] =
        r.reason instanceof Error ? r.reason.message : String(r.reason);
      console.error(
        `[competitors] Product "${products[i].name}" failed:`,
        r.reason,
      );
    }
  });

  return NextResponse.json({
    competitorsByProductId,
    cacheStatus,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
