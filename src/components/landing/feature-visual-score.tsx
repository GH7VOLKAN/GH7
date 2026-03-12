const platformBars = [
  { label: "ChatGPT", color: "bg-green-500", width: "w-[85%]", score: 85 },
  { label: "Claude", color: "bg-orange-500", width: "w-[72%]", score: 72 },
  { label: "Gemini", color: "bg-blue-500", width: "w-[55%]", score: 55 },
  { label: "Perplexity", color: "bg-purple-500", width: "w-[90%]", score: 90 },
];

export function FeatureVisualScore() {
  const score = 78;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      {/* Score Ring */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/40"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-green-500"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Platform bars */}
      <div className="mt-6 space-y-3">
        {platformBars.map((p) => (
          <div key={p.label} className="flex items-center gap-3">
            <span className="w-20 text-xs font-medium text-muted-foreground">
              {p.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/40">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${p.color}`}
                style={{ width: `${p.score}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs font-bold tabular-nums">
              {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
