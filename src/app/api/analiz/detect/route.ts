import { NextResponse } from "next/server";
import { isValidDomain, normalizeDomain, brandNameFromDomain } from "@/lib/analiz/domain";
import { runDiscovery } from "@/lib/ai/website-analyzer";
import { getCachedDetect, setCachedDetect } from "@/lib/analiz/cache";
import type {
  Competitor,
  CompetitorMentions,
  DetectResult,
  Door,
  Product,
} from "@/lib/analiz/types";
import type {
  CompanyType,
  DiscoveredCompetitor,
  DiscoveryInput,
  DiscoveryResult,
} from "@/lib/ai/discovery-types";

export const runtime = "nodejs";
// Perplexity bazen 20–30sn — Vercel default 10sn yetmez.
export const maxDuration = 60;

/**
 * POST /api/analiz/detect
 * Body: { domain: string, door: Door }
 *
 * Flow:
 *  1) Redis cache check (7 gün TTL, domain-bazlı) — HIT → geri dön
 *  2) runDiscovery() → Perplexity Sonar, site analiz, products + competitors
 *  3) DiscoveryResult → DetectResult adaptasyonu (shape farklı)
 *  4) Cache'e yaz + geri dön
 *
 * Not: runDiscovery hatada DEFAULT_DISCOVERY döner (boş array'ler). Bu durumda
 * 422 ile "siteyi analiz edemedik" dön — UI "tekrar dene" göstersin.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    domain?: string;
    door?: string;
  };

  const rawDomain = body.domain ?? "";
  const door = toDoor(body.door);

  if (!rawDomain || !isValidDomain(rawDomain)) {
    return NextResponse.json({ error: "Geçersiz domain" }, { status: 400 });
  }

  const domain = normalizeDomain(rawDomain);

  // 1) Cache
  const cached = await getCachedDetect(door, domain).catch(() => null);
  if (cached) return NextResponse.json(cached);

  // 2) Perplexity Sonar
  const input = buildDiscoveryInput(door, domain);
  const discovery = await runDiscovery(input);

  if (!discovery.products.length && !discovery.services.length) {
    return NextResponse.json(
      {
        error:
          "Bu siteyi analiz edemedik. URL doğru mu? Ana sayfada SEO metni ve ürün listesi görünüyor mu?",
      },
      { status: 422 },
    );
  }

  // 3) Adapter
  const result = adaptToDetectResult(domain, discovery);

  // 4) Cache yaz — fire & forget (hata olsa bile response dön)
  void setCachedDetect(door, domain, result).catch(() => {});

  return NextResponse.json(result);
}

// ─── Helpers ─────────────────────────────────────────────

function toDoor(value: unknown): Door {
  if (value === "kisi" || value === "eticaret" || value === "export") {
    return value;
  }
  return "firma";
}

function doorToCompanyType(door: Door): CompanyType {
  if (door === "export") return "yurtdisi";
  return door;
}

function buildDiscoveryInput(door: Door, domain: string): DiscoveryInput {
  const companyType = doorToCompanyType(door);
  const brandName = brandNameFromDomain(domain);

  switch (companyType) {
    case "firma":
    case "yurtdisi":
      return { companyType, url: domain, brandName };
    case "eticaret":
      return {
        companyType,
        ecommerceMode: "website",
        url: domain,
        brandOrProductName: brandName,
      };
    case "kisi":
      // Kisi için normalde fullName/expertise gerekli; landing domain gönderiyor.
      // En azından domain'i url olarak geçip brand adını fullName olarak veriyoruz.
      // Gerçek kisi flow'u için ayrı input formu lazım (sonraki iş).
      return {
        companyType,
        url: domain,
        fullName: brandName,
        expertise: "",
      };
  }
}

/**
 * DiscoveryResult → DetectResult.
 *
 * Bilinçli basitleştirmeler:
 *  - products: string[] → Product[] (id=p{n}, subcatCount=0)
 *    Perplexity subcategory sayısı vermiyor; UI'da 0 gösterilecek.
 *  - competitors: flat → per-product. Perplexity per-product ayrıştırma
 *    yapmıyor (firma prompt'u flat liste dönüyor). Tüm competitors her
 *    product'ın altına aynı kopyayla atanıyor. Kullanıcı hangi ürünü
 *    seçerse o ürün için aynı rakipleri görüyor. Per-product ayrıştırma
 *    ayrı iş (ikinci Perplexity çağrısı gerekir).
 *  - mentions: {} boş — /api/analiz/run yanıt ölçümü yapınca dolduruluyor.
 */
function adaptToDetectResult(
  domain: string,
  d: DiscoveryResult,
): DetectResult {
  // Ürün + hizmet havuzu. Hizmet firması (services var, products yok) için
  // services'i product gibi göster.
  const items = d.products.length > 0 ? d.products : d.services;

  const products: Product[] = items.slice(0, 8).map((name, i) => ({
    id: `p${i + 1}`,
    name,
    subcatCount: 0,
  }));

  const competitors: Competitor[] = d.competitors
    .slice(0, 10)
    .map((c, i) => ({
      id: `c${i + 1}`,
      domain: extractDomain(c),
      mentions: {} as CompetitorMentions,
    }))
    .filter((c) => c.domain.length > 0);

  const competitorsByProductId: Record<string, Competitor[]> = {};
  for (const p of products) {
    // Her product için aynı competitors'ı sığ kopyalayarak ekliyoruz.
    // Ayrı id'lerle ki UI state'i ürün değişiminde karışmasın.
    competitorsByProductId[p.id] = competitors.map((c, j) => ({
      ...c,
      id: `${p.id}-c${j + 1}`,
    }));
  }

  return {
    domain,
    sector: d.sector || "",
    products,
    competitorsByProductId,
  };
}

/**
 * Competitor URL'ini normalize edilmiş domain'e çevirir.
 * Perplexity bazen "https://www.danfoss.com/tr" tarzı full URL veriyor,
 * bazen sadece "danfoss.com.tr". İkisini de handle et.
 */
function extractDomain(c: DiscoveredCompetitor): string {
  const raw = c.url || c.name || "";
  const normalized = normalizeDomain(raw);
  if (normalized && isValidDomain(normalized)) return normalized;
  return "";
}
