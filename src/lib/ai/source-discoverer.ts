import { prisma } from "@/lib/db";

export async function discoverSourceDomains(
  scanId: string,
  brandId: string,
): Promise<void> {
  const results = await prisma.promptResult.findMany({
    where: { scanId },
    select: { citations: true },
  });

  // Collect all citation URLs
  const allUrls: string[] = [];
  for (const r of results) {
    const citations = r.citations as string[] | null;
    if (citations?.length) {
      allUrls.push(...citations);
    }
  }

  if (allUrls.length === 0) return;

  // Group by domain
  const domainMap = new Map<string, Set<string>>();
  for (const url of allUrls) {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      if (!domainMap.has(hostname)) domainMap.set(hostname, new Set());
      domainMap.get(hostname)!.add(url);
    } catch {
      // skip invalid URLs
    }
  }

  // Get existing source domains for this brand
  const existing = await prisma.sourceDomain.findMany({
    where: { brandId },
    select: { id: true, domain: true, urls: true },
  });
  const existingMap = new Map(existing.map((s) => [s.domain, s]));

  const totalCitations = allUrls.length;
  let created = 0;
  let updated = 0;

  for (const [domain, urls] of domainMap) {
    const urlArray = [...urls];
    const usagePercent = Math.round((urlArray.length / totalCitations) * 100);

    const existingSource = existingMap.get(domain);
    if (existingSource) {
      const existingUrls = (existingSource.urls as string[]) ?? [];
      const mergedUrls = [...new Set([...existingUrls, ...urlArray])];
      await prisma.sourceDomain.update({
        where: { id: existingSource.id },
        data: {
          urls: mergedUrls,
          usagePercent,
          avgCitations: urlArray.length,
        },
      });
      updated++;
    } else {
      const type = classifyDomain(domain);
      await prisma.sourceDomain.create({
        data: {
          brandId,
          domain,
          type,
          usagePercent,
          avgCitations: urlArray.length,
          urls: urlArray,
        },
      });
      created++;
    }
  }

  console.log(
    `[source-discoverer] Scan ${scanId}: ${created} new, ${updated} updated domains`,
  );
}

function classifyDomain(domain: string): string {
  if (
    domain.includes("reddit") ||
    domain.includes("quora") ||
    domain.includes("forum") ||
    domain.includes("eksi")
  ) {
    return "ugc";
  }
  if (
    domain.includes("news") ||
    domain.includes("hurriyet") ||
    domain.includes("haberturk") ||
    domain.includes("milliyet")
  ) {
    return "medya";
  }
  if (
    domain.includes("google") ||
    domain.includes("yelp") ||
    domain.includes("wikipedia")
  ) {
    return "referans";
  }
  if (
    domain.includes("sikayetvar") ||
    domain.includes("sahibinden") ||
    domain.includes("hepsiburada")
  ) {
    return "dizin";
  }
  return "kurumsal";
}
