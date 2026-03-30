import Link from "next/link";

interface RelatedPage {
  slug: string;
  originalQuery: string;
  totalFirmsMentioned: number;
  totalPlatformsResponded: number;
}

interface SectionRelatedPagesProps {
  pages: RelatedPage[];
}

export function SectionRelatedPages({ pages }: SectionRelatedPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">
        Ilgili Analizler
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/analiz/${page.slug}`}
            className="group rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <p className="font-medium text-foreground group-hover:underline">
              {page.originalQuery}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {page.totalFirmsMentioned} firma, {page.totalPlatformsResponded} platform
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
