import { CompetitorStatsCards } from "@/components/rakipler/competitor-stats-cards";
import { CompetitorTable } from "@/components/rakipler/competitor-table";
import { GapAnalysisCard } from "@/components/rakipler/gap-analysis-card";

export default function RakiplerPage() {
  return (
    <>
      <CompetitorStatsCards />
      <div className="px-4 lg:px-6">
        <CompetitorTable />
      </div>
      <div className="px-4 lg:px-6">
        <GapAnalysisCard />
      </div>
    </>
  );
}
