import { Skeleton } from "@/components/ui/skeleton";

export default function GenelLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Chart */}
      <Skeleton className="h-80 rounded-xl" />
      {/* Table */}
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
