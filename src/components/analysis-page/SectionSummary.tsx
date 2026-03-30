interface SectionSummaryProps {
  originalQuery: string;
  queryType: string;
  totalPlatforms: number;
  totalFirms: number;
  totalSources: number;
  timesQueried: number;
  lastQueriedAt: Date;
  summaryText: string | null;
}

const QUERY_TYPE_LABELS: Record<string, string> = {
  siralama: "Siralama Sorgusu",
  karsilastirma: "Karsilastirma Sorgusu",
  bilgi: "Bilgi Sorgusu",
  fiyat: "Fiyat Sorgusu",
  tavsiye: "Tavsiye Sorgusu",
};

export function SectionSummary({
  originalQuery,
  queryType,
  totalPlatforms,
  totalFirms,
  totalSources,
  timesQueried,
  lastQueriedAt,
  summaryText,
}: SectionSummaryProps) {
  const dateStr = new Date(lastQueriedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {QUERY_TYPE_LABELS[queryType] ?? queryType}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {originalQuery}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Platform" value={String(totalPlatforms)} />
        <StatBox label="Firma" value={String(totalFirms)} />
        <StatBox label="Kaynak" value={String(totalSources)} />
        <StatBox label="Sorgulanma" value={String(timesQueried)} />
      </div>

      <p className="text-sm text-muted-foreground">
        Son guncelleme: {dateStr}
      </p>

      {summaryText && (
        <p className="text-base leading-relaxed text-foreground/90">
          {summaryText}
        </p>
      )}
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
