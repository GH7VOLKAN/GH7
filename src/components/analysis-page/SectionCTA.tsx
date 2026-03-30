import Link from "next/link";

export function SectionCTA() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* CTA 1: Free Analysis */}
        <div className="rounded-md border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">
            Ucretsiz AI Gorunurluk Analizi
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Firmanizin yapay zeka platformlarindaki gorunurlugunu analiz edin.
            ChatGPT, Claude, Gemini, Perplexity ve Google AI sonuclarini gorun.
          </p>
          <Link
            href="/analiz"
            className="mt-4 inline-block rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Ucretsiz Analiz Baslat
          </Link>
        </div>

        {/* CTA 2: Pro Plans */}
        <div className="rounded-md border border-border bg-card p-6">
          <h3 className="text-lg font-bold text-foreground">
            Gorunurlugunuzu Takip Edin
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Haftalik otomatik tarama, rakip analizi, kaynak takibi ve
            aksiyon planlari ile AI gorunurlugunuzu artirin.
          </p>
          <Link
            href="/#fiyatlandirma"
            className="mt-4 inline-block rounded-md border border-foreground px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-80"
          >
            Planlari Incele
          </Link>
        </div>
      </div>
    </section>
  );
}
