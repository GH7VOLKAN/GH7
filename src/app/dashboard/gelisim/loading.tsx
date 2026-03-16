export default function GelisimLoading() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded bg-muted animate-pulse" />
      </div>

      {/* Progress bar skeleton */}
      <div className="rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-3 w-full rounded-full bg-muted animate-pulse" />
      </div>

      {/* Layer cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-12 rounded bg-muted animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="size-5 rounded-full bg-muted animate-pulse" />
                <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
