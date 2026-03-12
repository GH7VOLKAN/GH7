export function ShockSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Google tarafı */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-bold text-muted-foreground">
              Google&apos;da arama
            </p>
            <div className="mt-5 space-y-2.5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/40">
                    {i}.
                  </span>
                  <div
                    className="h-3 rounded bg-blue-500/15"
                    style={{ width: `${90 - i * 8}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-1 border-t border-border pt-4">
              <p className="text-sm font-medium">10 sonuç.</p>
              <p className="text-sm text-muted-foreground">
                Karıştır, seç, tıkla.
              </p>
            </div>
          </div>

          {/* Yapay zeka tarafı */}
          <div className="rounded-2xl border-2 border-foreground bg-foreground/[0.03] p-6 sm:p-8">
            <p className="text-sm font-bold">Yapay zekaya sorma</p>
            <div className="mt-5 rounded-lg bg-muted/50 p-4">
              <p className="text-sm leading-relaxed text-foreground/80">
                &ldquo;İstanbul&apos;da en iyi ortopedist olarak{" "}
                <span className="font-bold text-foreground">
                  Dr. Ahmet Yılmaz
                </span>{" "}
                öne çıkıyor. 20 yıllık deneyimiyle diz ve kalça protezi
                alanında uzmanlaşmış...&rdquo;
              </p>
            </div>
            <div className="mt-6 space-y-1 border-t border-border pt-4">
              <p className="text-sm font-bold">Tek cevap.</p>
              <p className="text-sm text-muted-foreground">
                Ya varsın ya yoksun.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-lg font-medium sm:text-xl">
          Müşterileriniz artık{" "}
          <span className="font-bold">yapay zekaya soruyor.</span>
        </p>
      </div>
    </section>
  );
}
