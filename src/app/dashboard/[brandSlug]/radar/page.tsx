/**
 * /dashboard/[brandSlug]/radar — Aşama 4'te doldurulacak.
 */

import { Placeholder } from "../_components/placeholder";

export const dynamic = "force-dynamic";

export default async function RadarPage({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}) {
  await params;
  return (
    <Placeholder
      label="GH7 Radar"
      title="Rakip Takip ve Karşılaştırma"
      description="Rakip karşılaştırma matrisi + DataForSEO site analizi. Aşama 4'te aktif edilecek."
    />
  );
}
