/**
 * /dashboard/[brandSlug]/advisor — Aşama 5'te Qwen ile rapor üretimi.
 */

import { Placeholder } from "../_components/placeholder";

export const dynamic = "force-dynamic";

export default async function AdvisorPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  await params;
  return (
    <Placeholder
      label="GH7 Advisor"
      title="İlk Kişisel Rapor"
      description="Marka-özel 30 günlük yol haritası + aylık takip raporları. Aşama 5'te Qwen ile aktif edilecek."
    />
  );
}
