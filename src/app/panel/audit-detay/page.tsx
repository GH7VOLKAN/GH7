import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import { getLatestAudit } from "@/lib/dal/personal-analysis";
import { EmptyState } from "@/components/panel/empty-state";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";
import { AuditDetayContent } from "@/components/panel/audit-detay/audit-detay-content";
import type { AuditItemResult } from "@/lib/ai/audit-43";

const CATEGORY_LABELS: Record<string, string> = {
  content: "İçerik Otoritesi",
  schema: "Yapılandırılmış Veri",
  entity: "Entity & Kimlik",
  tech: "Teknik Erişilebilirlik",
  external: "Dış Referanslar",
  ai: "AI Platform Görünürlüğü",
};

const CATEGORY_ORDER = ["content", "schema", "entity", "tech", "external", "ai"];

export default async function AuditDetayPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) redirect("/panel");

  const userId = activeBrand.profile?.id;
  const domain = activeBrand.brand.domain ?? "";
  const brandName = activeBrand.brand.name;
  const plan = activeBrand.plan ?? "free";

  const latestAudit = userId
    ? await getLatestAudit(userId, domain, brandName).catch(() => null)
    : null;

  if (!latestAudit) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Henüz audit verisi yok"
        description="43 madde kontrolünüz tamamlandığında burada görünecek. Ana sayfadan ücretsiz analiz başlatabilirsiniz."
      />
    );
  }

  const auditItems = (latestAudit.auditItems as AuditItemResult[]) ?? [];
  const categoryScores = latestAudit.categoryScores ?? {};
  const categorySummaries = latestAudit.categorySummaries ?? [];

  const categories = CATEGORY_ORDER.map((key) => {
    const items = auditItems.filter((it) => it.category === key);
    const summary = categorySummaries.find((s) => s.category === key);
    return {
      key,
      label: CATEGORY_LABELS[key] ?? key,
      score: Math.round(categoryScores[key] ?? 0),
      items,
      summary: summary?.summary ?? null,
      criticalAction: summary?.criticalAction ?? null,
    };
  });

  const heroStats: HeroStat[] = [
    { label: "Genel Skor", value: `${latestAudit.overallScore}/100` },
    {
      label: "Rakip Skoru",
      value: latestAudit.competitorScore
        ? `${latestAudit.competitorScore}/100`
        : "—",
    },
    { label: "Madde Sayısı", value: `${auditItems.length}` },
  ];

  return (
    <>
      <PageHero
        title="Audit Detay"
        description="43 madde · 6 kategori · her madde için durum ve rakip karşılaştırma"
        stats={heroStats}
      />
      <AuditDetayContent
        plan={plan}
        userScore={latestAudit.overallScore}
        competitorScore={latestAudit.competitorScore}
        competitorName={latestAudit.competitorName}
        categories={categories}
      />
    </>
  );
}
