/**
 * /dashboard/[brandSlug]/tracker — Aşama 3'te Firma dashboard ile doldurulacak.
 * Geçici placeholder (Brief H-ext Aşama 1).
 */

import { Placeholder } from "../_components/placeholder";

export const dynamic = "force-dynamic";

export default async function TrackerPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  await params;
  return (
    <Placeholder
      label="GH7 Tracker"
      title="Haftalık Otomatik Takip"
      description="Her Pazartesi sabah skorunu yeniden ölçer. Tracker içeriği Aşama 3'te aktif edilecek."
    />
  );
}
