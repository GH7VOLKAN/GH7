import { checkPageAccess } from "@/lib/check-access";
import { getActiveBrand } from "@/lib/dal/brand";
import { getBlogPostsData, getBlogImpactPredictions, getContentSuggestions } from "@/lib/dal/blog";
import { PageHero } from "@/components/panel/page-hero";
import { EmptyState } from "@/components/panel/empty-state";
import IcerikContent from "./icerik-content";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

export default async function IcerikPage() {
  await checkPageAccess("pro", "/panel/icerik");

  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");
  const brandId = activeBrand.brand.id;

  const [data, impactPredictions, contentSuggestions] = await Promise.all([
    getBlogPostsData(brandId),
    getBlogImpactPredictions(brandId),
    getContentSuggestions(brandId),
  ]);

  if (data.totalCount === 0) {
    return (
      <>
        <PageHero
          title="İçerik Üretimi"
          description="AI destekli blog ve içerik taslakları"
          stats={[
            { label: "Taslak", value: "0" },
            { label: "Yayınlanan", value: "0" },
          ]}
        />
        <EmptyState
          icon={FileText}
          title="Henüz içerik üretilmedi"
          description="AI içerik üretimi taramalardan sonra otomatik başlar. Her tarama sonrası sektörünüze özel blog taslakları oluşturulur."
        />
      </>
    );
  }

  return (
    <>
      <PageHero
        title="İçerik Üretimi"
        description="AI destekli blog ve içerik taslakları"
        stats={[
          { label: "Toplam", value: String(data.totalCount) },
          { label: "Taslak", value: String(data.draftCount) },
          {
            label: "Yayınlanan",
            value: String(data.publishedCount),
            deltaType: "positive",
          },
          { label: "Kuyrukta", value: String(data.queuedCount + data.generatingCount) },
        ]}
      />
      <IcerikContent
        blogPosts={data.blogPosts}
        impactPredictions={impactPredictions}
        contentSuggestions={contentSuggestions}
      />
    </>
  );
}
