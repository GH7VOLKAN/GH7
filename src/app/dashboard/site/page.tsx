import { SiteScoreCard } from "@/components/site/site-score-card";
import { AuditCategories } from "@/components/site/audit-categories";

export default function SitePage() {
  return (
    <>
      <div className="px-4 lg:px-6">
        <SiteScoreCard />
      </div>
      <div className="px-4 lg:px-6">
        <AuditCategories />
      </div>
    </>
  );
}
