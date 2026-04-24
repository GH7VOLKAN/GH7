/**
 * Radar haftalık rakip özeti (Brief H Aşama 4).
 *
 * Pro/Pro+ kullanıcılar için Radar sayfasında haftalık özet kartı.
 * 3 genel durum + spesifik rakip hareketi varyantları.
 *
 * NOT: Aylık detaylı "rakip neden önde" analizi AI ile üretilir — bu
 * template değildir. Burada sadece haftalık özet (tekrarlanan yapı).
 */

import { pickVariant, renderTemplate } from "../engine";

export type OverallDurum = "leading" | "stable" | "losing";

export type WeeklySummaryInput = {
  markaAdi?: string;
  durum: OverallDurum;
  rakipSayisi: number; // toplam izlenen rakip
  oneDusen?: number; // bu hafta geride kalan rakip sayısı (leading)
  gerideDusen?: number; // bu hafta öne geçen rakip sayısı (losing)
  yenilenRakip?: string; // leading için — yeni geride kalan
  enGuclnRakip?: string; // losing için — en güçlü rakip ismi
};

export const overallSummaryTemplates: Record<OverallDurum, string[]> = {
  leading: [
    "Bu hafta {rakipSayisi} rakipten {oneDusen}'i geride bıraktınız",
    "Rekabet tablosunda önde: {rakipSayisi} rakipten {oneDusen}'i sizin altınızda",
    "{yenilenRakip} geçen hafta öndeyken bu hafta geride kaldı",
  ],
  stable: [
    "Rekabet pozisyonu stabil — {rakipSayisi} rakiple denge korunuyor",
    "Bu hafta büyük hareket yok, rekabetçi dengeler korundu",
    "Rakiplerle pozisyon değişmedi. İyi baz, ilerlemek için hamle zamanı",
  ],
  losing: [
    "Bu hafta dikkat gerek: {gerideDusen} rakip öne geçti",
    "{enGuclnRakip} ciddi ilerleme kaydetti — analizi görün",
    "Rekabet baskı altında — detaylı rapor için Advisor'a bakın",
  ],
};

export function generateRadarWeeklySummary(input: WeeklySummaryInput): string {
  const seed = input.markaAdi ? `${input.markaAdi}-radar` : undefined;
  const variants = overallSummaryTemplates[input.durum];
  const picked = pickVariant(variants, seed);
  return renderTemplate(picked, {
    rakipSayisi: input.rakipSayisi,
    oneDusen: input.oneDusen ?? 0,
    gerideDusen: input.gerideDusen ?? 0,
    yenilenRakip: input.yenilenRakip ?? "Bir rakip",
    enGuclnRakip: input.enGuclnRakip ?? "En güçlü rakip",
  });
}
