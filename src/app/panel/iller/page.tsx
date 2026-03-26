import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { IllerContent } from "./iller-content";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";

export interface CityData {
  name: string;
  slug: string;
  score: number;
  status: "strong" | "moderate" | "weak" | "not-tracked";
  mentionCount: number;
  totalResults: number;
  mentionRate: number;
}

function toSlug(name: string): string {
  const TURKISH_CHAR_MAP: Record<string, string> = {
    "\u00E7": "c", "\u011F": "g", "ı": "i", "İ": "i", "\u00F6": "o",
    "\u015F": "s", "\u00FC": "u", "\u00C7": "c", "\u011E": "g", "\u00D6": "o",
    "\u015E": "s", "\u00DC": "u",
  };
  return name
    .split("")
    .map((c) => TURKISH_CHAR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getStatus(rate: number): CityData["status"] {
  if (rate >= 50) return "strong";
  if (rate >= 20) return "moderate";
  return "weak";
}

export default async function IllerPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;
  const brand = activeBrand.brand as Record<string, unknown>;
  const serviceRegions = (brand.serviceRegions as string[]) ?? [];

  if (serviceRegions.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-4 py-4 md:gap-8 md:px-6 md:py-6">
        <EmptyState
          icon={MapPin}
          title="Henüz il takip etmiyorsunuz"
          description="Marka ayarlarınızdan hizmet bölgenizi ekleyin, ardından il bazlı görünürlük analizi burada görünecek."
        />
      </div>
    );
  }

  // Get last completed scan
  const lastScan = await prisma.scan.findFirst({
    where: { brandId, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const cityDataMap: Record<string, CityData> = {};

  if (lastScan) {
    // Get all prompt results for the scan
    const results = await prisma.promptResult.findMany({
      where: { scanId: lastScan.id },
      select: {
        mentioned: true,
        platform: true,
        prompt: { select: { text: true } },
      },
    });

    // For each city, count mentions where prompt text contains city name
    for (const city of serviceRegions) {
      const cityLower = city.toLowerCase();
      const cityResults = results.filter((r) =>
        r.prompt.text.toLowerCase().includes(cityLower)
      );
      const mentionCount = cityResults.filter((r) => r.mentioned).length;
      const totalResults = cityResults.length;
      const mentionRate = totalResults > 0 ? Math.round((mentionCount / totalResults) * 100) : 0;

      cityDataMap[city] = {
        name: city,
        slug: toSlug(city),
        score: mentionRate,
        status: totalResults > 0 ? getStatus(mentionRate) : "not-tracked",
        mentionCount,
        totalResults,
        mentionRate,
      };
    }
  } else {
    // No scan data - still show cities as not-tracked
    for (const city of serviceRegions) {
      cityDataMap[city] = {
        name: city,
        slug: toSlug(city),
        score: 0,
        status: "not-tracked",
        mentionCount: 0,
        totalResults: 0,
        mentionRate: 0,
      };
    }
  }

  // Get competitor ranking from overview
  const overviewData = await getOverviewData(brandId);

  // Build TurkeyMap-compatible data
  const mapCityData: Record<string, { score: number; status: string }> = {};
  for (const [name, data] of Object.entries(cityDataMap)) {
    mapCityData[name] = { score: data.score, status: data.status };
  }

  const cities = Object.values(cityDataMap);
  const strongCount = cities.filter((c) => c.status === "strong").length;
  const moderateCount = cities.filter((c) => c.status === "moderate").length;
  const weakCount = cities.filter((c) => c.status === "weak").length;

  return (
    <>
      <IllerContent
        cities={cities}
        mapCityData={mapCityData}
        strongCount={strongCount}
        moderateCount={moderateCount}
        weakCount={weakCount}
        topCompetitorName={overviewData.topCompetitorName}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageBottomCTA />
      </div>
    </>
  );
}
