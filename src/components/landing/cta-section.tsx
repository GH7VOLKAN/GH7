export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground p-10 text-center sm:p-16">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-background sm:text-4xl">
            Yapay zeka seni tanıyor mu?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-background/60">
            30 saniyede öğren. Ücretsiz.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#hero"
              className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-3.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Hemen Dene →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
