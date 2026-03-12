const competitors = [
  { rank: 1, name: "Rakip A (Sektör Lideri)", score: 92, highlighted: true },
  { rank: 2, name: "Rakip B", score: 78, highlighted: false },
  { rank: 3, name: "Senin Markan", score: 45, highlighted: false, isYou: true },
  { rank: 4, name: "Rakip C", score: 38, highlighted: false },
];

export function FeatureVisualCompetitors() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-950">
          <svg
            className="size-3.5 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
            />
          </svg>
        </div>
        <p className="text-sm font-bold">Senin Yerine Kim Öneriliyor?</p>
      </div>

      <div className="space-y-3">
        {competitors.map((c) => (
          <div
            key={c.rank}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
              c.isYou
                ? "border border-foreground/20 bg-foreground/[0.03]"
                : "bg-transparent"
            }`}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-xs font-bold text-muted-foreground">
              {c.rank}
            </span>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${c.isYou ? "text-foreground" : ""}`}
              >
                {c.name}
                {c.isYou && (
                  <span className="ml-2 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    Sen
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40">
                <div
                  className={`h-full rounded-full ${c.isYou ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-bold tabular-nums text-muted-foreground">
                {c.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
