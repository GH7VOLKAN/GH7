import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { getActiveBrand } from "@/lib/dal/brand";
import { getLatestAudit } from "@/lib/dal/personal-analysis";
import { EmptyState } from "@/components/panel/empty-state";
import { AuditDetayContentV3 } from "@/components/panel/audit-detay-v3/audit-detay-content-v3";
import type { AuditItemResult } from "@/lib/ai/audit-43";

const NO_AUDIT_CTA = (
  <Link
    href="/analiz"
    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
  >
    Ücretsiz Analize Başla →
  </Link>
);

export default async function AuditDetayPage() {
  const activeBrand = await getActiveBrand();
  if (!activeBrand?.brand) return null;

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
        action={NO_AUDIT_CTA}
      />
    );
  }

  const auditItems =
    (latestAudit.auditItems as unknown as AuditItemResult[] | null) ?? [];
  const categoryScores =
    (latestAudit.categoryScores as unknown as Record<string, number> | null) ??
    {};

  return (
    <AuditDetayContentV3
      plan={plan}
      brandName={brandName}
      overallScore={latestAudit.overallScore ?? 0}
      competitorScore={latestAudit.competitorScore ?? null}
      competitorName={latestAudit.competitorName ?? null}
      auditItems={auditItems}
      categoryScores={categoryScores}
      personalAnalysis={latestAudit.personalAnalysis ?? null}
      lastUpdate={latestAudit.createdAt?.toISOString() ?? null}
    />
  );
}
