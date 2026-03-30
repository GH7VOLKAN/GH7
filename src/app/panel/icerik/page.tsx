import { checkPageAccess } from "@/lib/check-access";
import IcerikContent from "./icerik-content";
import { PageHero } from "@/components/panel/page-hero";

export default async function IcerikPage() {
  await checkPageAccess("business", "/panel/icerik");
  return (
    <>
      <PageHero
        title="İçerik Üretimi"
        description="Opus ile hazırlanmış blog ve içerik taslakları"
        stats={[
          { label: "Taslak", value: "3" },
          { label: "Yayınlanan", value: "2" },
          { label: "AI Referansı", value: "7", deltaType: "positive" },
        ]}
      />
      <IcerikContent />
    </>
  );
}
