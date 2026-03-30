import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "AI Gorunurluk Analizleri — GH7.ai",
  description:
    "Yapay zeka platformlarinda en cok sorgulanan konularin analiz sonuclari. Firma siralamalari, platform yanitlari ve kaynak analizleri.",
  openGraph: {
    title: "AI Gorunurluk Analizleri — GH7.ai",
    description:
      "Yapay zeka platformlarinda en cok sorgulanan konularin analiz sonuclari.",
    url: "https://app.gh7.ai/analizler",
    type: "website",
    locale: "tr_TR",
    siteName: "GH7.ai",
  },
  alternates: {
    canonical: "https://app.gh7.ai/analizler",
  },
};

const ITEMS_PER_PAGE = 24;

const SECTOR_LABELS: Record<string, string> = {
  teknoloji: "Teknoloji",
  saglik: "Saglik",
  egitim: "Egitim",
  hukuk: "Hukuk",
  insaat: "Insaat",
  finans: "Finans",
  gida: "Gida",
  turizm: "Turizm",
  eticaret: "E-Ticaret",
  pazarlama: "Pazarlama",
  otomat: "Otomotiv",
  moda: "Moda",
  gayrimenkul: "Gayrimenkul",
  danismanlik: "Danismanlik",
};

export default async function AnalizlerPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const sectorFilter = resolvedParams.sector || null;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const where = {
    published: true,
    ...(sectorFilter ? { sector: sectorFilter } : {}),
  };

  const [pages, totalCount, sectors] = await Promise.all([
    prisma.queryPage.findMany({
      where,
      select: {
        slug: true,
        originalQuery: true,
        queryType: true,
        sector: true,
        totalFirmsMentioned: true,
        totalPlatformsResponded: true,
        timesQueried: true,
        lastQueriedAt: true,
      },
      orderBy: { timesQueried: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.queryPage.count({ where }),
    prisma.queryPage.groupBy({
      by: ["sector"],
      where: { published: true, sector: { not: null } },
      _count: { sector: true },
      orderBy: { _count: { sector: "desc" } },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <main className="mx-auto max-w-[960px] px-4 py-10 font-[family-name:var(--font-plus-jakarta)] sm:px-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            AI Gorunurluk Analizleri
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {totalCount} sorgu analiz edildi
          </p>
        </div>

        {/* Sector Filter */}
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/analizler"
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !sectorFilter
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted/30"
              }`}
            >
              Tumu
            </Link>
            {sectors.map((s) => {
              const sectorVal = s.sector as string;
              return (
                <Link
                  key={sectorVal}
                  href={`/analizler?sector=${sectorVal}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    sectorFilter === sectorVal
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {SECTOR_LABELS[sectorVal] ?? sectorVal} ({s._count.sector})
                </Link>
              );
            })}
          </div>
        )}

        {/* Page Grid */}
        {pages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Henuz analiz bulunmuyor.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.slug}
                href={`/analiz/${page.slug}`}
                className="group rounded-md border border-border bg-card p-5 transition-colors hover:bg-muted/30"
              >
                <p className="font-medium text-foreground group-hover:underline line-clamp-2">
                  {page.originalQuery}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{page.totalFirmsMentioned} firma</span>
                  <span>{page.totalPlatformsResponded} platform</span>
                  {page.sector && (
                    <span>
                      {SECTOR_LABELS[page.sector] ?? page.sector}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(page.lastQueriedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={`/analizler?${sectorFilter ? `sector=${sectorFilter}&` : ""}page=${currentPage - 1}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
              >
                Onceki
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/analizler?${sectorFilter ? `sector=${sectorFilter}&` : ""}page=${currentPage + 1}`}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30"
              >
                Sonraki
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
