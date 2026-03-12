const actions = [
  { text: "Google Business Profile'ı tamamla ve doğrula", done: true },
  { text: "Medium'da haftalık sektörel içerik yayınla", done: true },
  { text: "LinkedIn profilini Schema.org markup ile optimize et", done: false },
  { text: "Sektörel dizinlere kayıt ol (Clutch, G2)", done: false },
  { text: "Podcast veya webinar'lara konuk ol", done: false },
];

export function FeatureVisualActions() {
  const completed = actions.filter((a) => a.done).length;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-green-100 dark:bg-green-950">
            <svg
              className="size-3.5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-bold">Aksiyon Planı</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {completed}/{actions.length} tamamlandı
        </span>
      </div>

      {/* Actions list */}
      <div className="space-y-2.5">
        {actions.map((action, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
          >
            <div
              className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                action.done
                  ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-border"
              }`}
            >
              {action.done && (
                <svg
                  className="size-3 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </div>
            <p
              className={`text-sm ${
                action.done
                  ? "text-muted-foreground line-through"
                  : "text-foreground/80"
              }`}
            >
              {action.text}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-muted/40">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${(completed / actions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
