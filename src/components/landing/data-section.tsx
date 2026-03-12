const stats = [
  {
    value: "%115",
    color: "text-green-500",
    desc: "Google'da 5. sıradaki firmalar yapay zekada bu kadar daha görünür olabiliyor.",
  },
  {
    value: "%40",
    color: "text-foreground",
    desc: "Doğru yöntemlerle yapay zekadaki görünürlük artışı.",
  },
  {
    value: "%10",
    color: "text-red-500",
    desc: "Yanlış yöntemler (eski usul) görünürlüğü bu kadar azaltıyor.",
    negative: true,
  },
];

export function DataSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-2xl text-center text-2xl font-bold tracking-[-0.03em] sm:text-3xl lg:text-4xl">
          Google&apos;da geride olmanız, yapay zekada geride olacağınız
          anlamına gelmiyor.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.value}
              className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8"
            >
              <p
                className={`text-5xl font-bold tracking-[-0.04em] sm:text-6xl ${s.color}`}
              >
                {s.negative && "−"}
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Kaynak: Princeton Üniversitesi, 10.000 sorgu üzerinde test edildi.
          KDD 2024
        </p>
      </div>
    </section>
  );
}
