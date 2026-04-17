import { NextRequest, NextResponse } from "next/server";
import {
  generateQueriesFromProducts,
  getQueriesForAnalysis,
} from "@/lib/ai/query-generator-fast";
import type { DiscoveryResult } from "@/lib/ai/discovery-types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const products = Array.isArray(body.products)
      ? body.products.filter(Boolean)
      : [];
    const services = Array.isArray(body.services)
      ? body.services.filter(Boolean)
      : [];
    const cities = Array.isArray(body.cities) ? body.cities.filter(Boolean) : [];

    // Discovery varsa, targetQueries öncelikli
    const discovery = body.discovery as DiscoveryResult | null;
    if (discovery) {
      const queries = await getQueriesForAnalysis(discovery, {
        products,
        services,
        cities,
      });
      return NextResponse.json({ queries });
    }

    const queries = await generateQueriesFromProducts({
      products,
      services,
      cities,
    });
    return NextResponse.json({ queries });
  } catch (err) {
    console.error("[api/generate-queries] Error:", err);
    return NextResponse.json({ queries: [] }, { status: 500 });
  }
}
