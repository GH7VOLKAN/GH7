import { getActiveBrand } from "@/lib/dal/brand";
import { getOverviewData } from "@/lib/dal/overview";
import { getLatestAudit } from "@/lib/dal/personal-analysis";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/panel/empty-state";
import { GenelContentV2 } from "@/components/panel/genel/genel-content-v2";
import { PageHero } from "@/components/panel/page-hero";
import type { HeroStat } from "@/components/panel/page-hero";
import type { CategoryCard } from "@/components/panel/genel/category-summary-grid";
import type { AuditItemResult } from "@/lib/ai/audit-43";

const CATEGORY_LABELS: Record<string, string> = {
  content: "İçerik Otoritesi",
  schema: "Yapılandırılmış Veri",
  entity: "Entity & Kimlik",
  tech: "Teknik Erişilebilirlik",
  external: "Dış Referanslar",
  ai: "AI Platform Görünürlüğü",
};

const CATEGORY_ORDER: string[] = ["content", "schema", "entity", "tech", "external", "ai"];

export default async function GenelBakisPage() {
  const activeBrand = await getActiveBrand();

  // Kullanıcı giriş yapmış ama brand yok — /onboard'a gönder.
  // (Eskiden "/panel"'e redirect ediyordu, /panel de /panel/genel'e redirect
  // ediyordu — sonsuz loop. Kullanıcıların "Bu sayfada bir hata oluştu"
  // görmesinin nedeni buydu.)
  if (!activeBrand) {
    redirect("/giris");
  }
  if (!activeBrand.brand) {
    redirect("/onboard");
  }

  const brandId = activeBrand.brand.id;
  const userId = activeBrand.profile?.id;
  const domain = activeBrand.brand.domain ?? "";
  const brandName = activeBrand.brand.name;
  const plan = activeBrand.plan ?? "free";

  const [overviewData, latestAudit] = await Promise.all([
    getOverviewData(brandId).catch((e) => {
      console.error("[panel/genel] getOverviewData error:", e);
      return null;
    }),
    userId
      ? getLatestAudit(userId, domain, brandName).catch((e) => {
          console.error("[panel/genel] getLatestAudit error:", e);
          return null;
        })
      : Promise.resolve(null),
  ]);

  const mentionScore = overviewData?.mentionScore ?? latestAudit?.overallScore ?? 0;
  const totalMentionCount = overviewData?.totalMentionCount ?? 0;
  const totalResultCount = overviewData?.totalResultCount ?? 0;
  const weeklyTrendRaw = overviewData?.weeklyTrend ?? [];

  // Hero 3 kart verileri
  const userScore = latestAudit?.overallScore ?? mentionScore;
  const competitorScore = latestAudit?.competitorScore ?? null;
  const competitorName = latestAudit?.competitorName ?? null;
  const estimatedMonthlyLoss = latestAudit?.estimatedMonthlyLoss ?? null;
  const estimatedYearlyLoss = latestAudit?.estimatedYearlyLoss ?? null;

  // Opus kişisel analiz + rakip isimleri
  const personalAnalysis = latestAudit?.personalAnalysis ?? null;
  const competitorNames: string[] = [];
  if (competitorName) competitorNames.push(competitorName);
  if (overviewData?.competitorRanking) {
    for (const c of overviewData.competitorRanking) {
      if (c.name && !competitorNames.includes(c.name)) competitorNames.push(c.name);
    }
  }

  // 6 kategori özet kartı
  const categoryScores = latestAudit?.categoryScores ?? {};
  const auditItems = (latestAudit?.auditItems as AuditItemResult[]) ?? [];
  const categorySummaries = latestAudit?.categorySummaries ?? [];

  const categories: CategoryCard[] = CATEGORY_ORDER.map((key) => {
    const itemsInCat = auditItems.filter((it) => it.category === key);
    const passCount = itemsInCat.filter((it) => it.status === "pass").length;
    const partialCount = itemsInCat.filter((it) => it.status === "partial").length;
    const failCount = itemsInCat.filter((it) => it.status === "fail").length;
    const score = Math.round(categoryScores[key] ?? 0);
    // categoryScores ideally is 0-100; if it's not, fallback to pass-count * 10
    const effectiveScore = score > 0 ? score : passCount * 10 + partialCount * 5;
    const maxScore = 100;
    const summary =
      categorySummaries.find((s) => s.category === key)?.summary ?? null;

    return {
      key,
      label: CATEGORY_LABELS[key] ?? key,
      score: effectiveScore,
      maxScore,
      passCount,
      partialCount,
      failCount,
      summary,
    };
  }).filter((c) => c.passCount + c.partialCount + c.failCount > 0 || c.score > 0);

  const hasAnyData =
    (overviewData && totalResultCount > 0) || latestAudit != null;

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="Henüz veri yok"
        description="İlk analizinizi tamamladıktan sonra genel bakış burada görünecek. Ana sayfadan ücretsiz analiz başlatabilirsiniz."
      />
    );
  }

  const heroStats: HeroStat[] = [
    { label: "GEO Skoru", value: `${userScore}` },
    { label: "Bahsedilme", value: `${totalMentionCount}/${totalResultCount}` },
    { label: "Kategori", value: `${categories.length}` },
  ];

  // Trend data for chart — platform scores avg
  const weeklyTrend = weeklyTrendRaw.map((w, i) => {
    const platforms = [w.chatgpt, w.claude, w.gemini, w.perplexity].filter(
      (n): n is number => typeof n === "number",
    );
    const avg =
      platforms.length > 0
        ? Math.round(platforms.reduce((a, b) => a + b, 0) / platforms.length)
        : 0;
    return {
      week: typeof w.week === "string" ? w.week : `H${i + 1}`,
      userScore: avg,
    };
  });

  return (
    <>
      <PageHero
        title="Genel Bakış"
        description="AI platformlarında markanızın görünürlük özeti"
        stats={heroStats}
      />
      <GenelContentV2
        plan={plan}
        userScore={userScore}
        competitorScore={competitorScore}
        competitorName={competitorName}
        estimatedMonthlyLoss={estimatedMonthlyLoss}
        estimatedYearlyLoss={estimatedYearlyLoss}
        personalAnalysis={personalAnalysis}
        competitorNames={competitorNames}
        categories={categories}
        weeklyTrend={weeklyTrend}
      />
    </>
  );
}
