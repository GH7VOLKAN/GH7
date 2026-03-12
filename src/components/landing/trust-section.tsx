const badges = [
  "Princeton Üniversitesi Araştırması",
  "10.000 Sorgu Test Edildi",
  "KDD 2024 Yayını",
  "%40'a Kadar Görünürlük Artışı",
];

export function TrustSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg font-medium leading-relaxed sm:text-xl">
            &ldquo;ISITMAX olarak 20 yıldır sektörümüzün dijital öncüsüyüz.
            <br className="hidden sm:block" />
            Bu aracı sektörümüz için geliştirdik.&rdquo;
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
