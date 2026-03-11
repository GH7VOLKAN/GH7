import { SourceStatsCards } from "@/components/kaynaklar/source-stats-cards";
import { SourceTable } from "@/components/kaynaklar/source-table";

export default function KaynaklarPage() {
  return (
    <>
      <SourceStatsCards />
      <div className="px-4 lg:px-6">
        <SourceTable />
      </div>
    </>
  );
}
