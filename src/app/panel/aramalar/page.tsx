import { getActiveBrand } from "@/lib/dal/brand";
import { getPromptsData } from "@/lib/dal/prompts";
import { prisma } from "@/lib/db";
import { AramalarContentV3 } from "@/components/panel/aramalar-v3/aramalar-content-v3";

export default async function AramalarPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) return null;

  const brandId = activeBrand.brand.id;
  const brandName = activeBrand.brand.name;
  const plan = activeBrand.plan ?? "free";

  const [data, competitors, latestScan] = await Promise.all([
    getPromptsData(brandId),
    prisma.competitor.findMany({
      where: { brandId },
      select: { name: true },
      take: 20,
    }),
    prisma.scan.findFirst({
      where: { brandId, status: "completed" },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
  ]);

  const competitorNames = competitors
    .map((c) => c.name)
    .filter((n): n is string => !!n);

  return (
    <AramalarContentV3
      plan={plan}
      brandName={brandName}
      competitorNames={competitorNames}
      promptItems={data.promptItems}
      lastUpdate={latestScan?.completedAt?.toISOString() ?? null}
    />
  );
}
