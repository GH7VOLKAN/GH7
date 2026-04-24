/**
 * Radar — spesifik rakip hareket bildirimi (Brief H Aşama 4).
 *
 * Tracker'daki competitorPassed'dan farklı: burası Radar sayfasında
 * görünen detaylı rakip aktivitesi (hangi platformda hangi sorguda
 * ne yaptı). Push/email başlık olarak da kullanılabilir.
 */

import { pickVariant, renderTemplate } from "../engine";
import { formatPlatform } from "../common/formatters";

export type CompetitorMovementInput = {
  markaAdi?: string; // seed için
  rakipAdi: string;
  platformAdi: string;
  sorguAdi?: string;
  pozisyonDegisim?: string; // örn: "2. sıraya yükseldi"
  hareketOzet?: string; // serbest özet
  ozet?: string; // alternatif serbest özet
};

export const competitorMovementTemplates: string[] = [
  "{rakipAdi} bu hafta {platformAdi}'de {sorguAdi} sorgusunda {pozisyonDegisim}",
  "{rakipAdi}: {ozet}",
  "Rakip hareketi: {rakipAdi} {hareketOzet}",
];

export function generateCompetitorAlert(
  input: CompetitorMovementInput,
): string {
  const seed = `${input.markaAdi ?? ""}-${input.rakipAdi}`;

  // Hangi varyantlar eksiksiz render edilebiliyor onu seç
  const usableVariants: string[] = [];
  if (input.sorguAdi && input.pozisyonDegisim) {
    usableVariants.push(competitorMovementTemplates[0]!);
  }
  if (input.ozet) {
    usableVariants.push(competitorMovementTemplates[1]!);
  }
  if (input.hareketOzet) {
    usableVariants.push(competitorMovementTemplates[2]!);
  }

  // Hiçbir veri yoksa jenerik fallback
  if (usableVariants.length === 0) {
    return `Rakip hareketi: ${input.rakipAdi} · ${formatPlatform(input.platformAdi)}`;
  }

  const picked = pickVariant(usableVariants, seed);
  return renderTemplate(picked, {
    rakipAdi: input.rakipAdi,
    platformAdi: formatPlatform(input.platformAdi),
    sorguAdi: input.sorguAdi ?? "",
    pozisyonDegisim: input.pozisyonDegisim ?? "",
    hareketOzet: input.hareketOzet ?? "",
    ozet: input.ozet ?? "",
  });
}
