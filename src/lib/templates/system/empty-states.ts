/**
 * Dashboard boş durum mesajları (Brief H Aşama 4).
 *
 * Statik metinler — hiç AI çağrısı yok. UI'da empty state kartları /
 * modal'lar / liste placeholder'ları için. Bazılarında değişken var
 * (ör. ilk rapor tarihi).
 */

import { renderTemplate } from "../engine";
import { formatDate } from "../common/formatters";

export type EmptyState = {
  title: string;
  description: string;
  cta: string | null; // buton metni; null ise buton gösterilmez
};

// Parametresiz olanlar — doğrudan nesne
export const emptyStates = {
  auditEmpty: {
    title: "Henüz denetim yapılmadı",
    description:
      "İlk AI görünürlük denetimini başlatın. 43 madde ile sitenizin AI ekosistemindeki durumu değerlendirilir. Yaklaşık 2-3 dakika sürer.",
    cta: "Denetim Başlat",
  } as EmptyState,

  radarEmpty: {
    title: "Rakip eklenmedi",
    description:
      "En çok 3 rakip ekleyebilirsiniz. GH7 bu rakipleri haftalık izler ve pozisyonlarındaki değişimleri raporlar.",
    cta: "Rakip Ekle",
  } as EmptyState,

  noBrand: {
    title: "Marka ekleyin",
    description:
      "GH7 ile izlemek istediğiniz markayı ekleyin. Pro üyelikte 1 marka, Pro+ üyelikte 5 marka izleyebilirsiniz.",
    cta: "Marka Ekle",
  } as EmptyState,

  noResults: {
    title: "Sonuç bulunamadı",
    description: "Arama terimlerinizi değiştirmeyi deneyin.",
    cta: null,
  } as EmptyState,
} as const;

// Parametreli olanlar — fonksiyon
export function getTrackerEmpty(ilkRaporTarihi: Date): EmptyState {
  return {
    title: "Takip başladı, ilk veri için 1 hafta",
    description: renderTemplate(
      "Tracker her Pazartesi sabahı çalışır. İlk haftalık raporunuz {ilkRaporTarihi} tarihinde hazır olacak.",
      { ilkRaporTarihi: formatDate(ilkRaporTarihi) },
    ),
    cta: null,
  };
}

export function getAdvisorEmpty(ilkRaporTarihi: Date): EmptyState {
  return {
    title: "İlk aylık rapor hazırlanıyor",
    description: renderTemplate(
      "Advisor ayda bir kez, ayın ilk pazartesi günü kişiye özel strateji raporu hazırlar. İlk raporunuz {ilkRaporTarihi} tarihinde hazır olacak.",
      { ilkRaporTarihi: formatDate(ilkRaporTarihi) },
    ),
    cta: null,
  };
}
