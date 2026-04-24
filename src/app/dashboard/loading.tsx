/**
 * Dashboard route loading state — Kinde editorial skeleton
 * (Brief H-polish Aşama 5).
 */

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-20">
      <div className="mb-20 space-y-6">
        <div className="h-3 w-24 animate-pulse rounded bg-border" />
        <div className="h-16 w-2/3 animate-pulse rounded bg-border" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
