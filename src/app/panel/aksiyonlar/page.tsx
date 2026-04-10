import { checkPageAccess } from "@/lib/check-access";
import { getActiveBrand } from "@/lib/dal/brand";
import { getActionsData, getSituationAnalysis } from "@/lib/dal/actions";
import { PageHero } from "@/components/panel/page-hero";
import { EmptyState } from "@/components/panel/empty-state";
import AksiyonlarContent from "./aksiyonlar-content";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";

export default async function AksiyonlarPage() {
  await checkPageAccess("pro", "/panel/aksiyonlar");

  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const [actionsData, situationData] = await Promise.all([
    getActionsData(brandId),
    getSituationAnalysis(brandId),
  ]);

  const { actionTasks, completedCount, totalCount } = actionsData;
  const highPriorityCount = actionTasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  if (totalCount === 0) {
    return (
      <>
        <PageHero
          title="Haftalık Aksiyonlar"
          description="AI destekli optimizasyon görevleri"
          stats={[
            { label: "Aksiyon", value: "0" },
            { label: "Tamamlanan", value: "0/0" },
          ]}
        />
        <EmptyState
          icon={ClipboardList}
          title="Henüz aksiyon oluşturulmadı"
          description="İlk taramanızdan sonra AI destekli haftalık aksiyonlar burada görünecek."
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Haftalık Aksiyonlar"
        description="Bu hafta yapmanız gereken optimizasyonlar"
        stats={[
          { label: "Toplam", value: `${totalCount} aksiyon` },
          { label: "Tamamlanan", value: `${completedCount}/${totalCount}` },
          {
            label: "Yüksek Öncelik",
            value: String(highPriorityCount),
            deltaType: highPriorityCount > 0 ? "negative" : "positive",
          },
          {
            label: "GEO Skoru",
            value: `${situationData.mentionScore}/100`,
          },
        ]}
      />
      <AksiyonlarContent
        actionTasks={actionTasks}
        situationAnalysis={situationData}
        brandId={brandId}
      />
    </>
  );
}
