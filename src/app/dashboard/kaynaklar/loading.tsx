import { Skeleton } from "@/components/ui/skeleton";

export default function KaynaklarLoading() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
