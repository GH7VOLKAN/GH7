const stats = [
  { value: "4", label: "Yapay Zeka" },
  { value: "30sn", label: "Sonuç Süresi" },
  { value: "1,247+", label: "Pro Kullanıcı" },
  { value: "99.2%", label: "Doğruluk" },
];

const platforms = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {platforms.map((name) => (
            <span
              key={name}
              className="text-sm font-medium text-muted-foreground/50"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
