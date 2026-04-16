/**
 * Estimated Loss Calculator
 *
 * Formül:
 *   Aylık kayıp = sektör arama hacmi × rakip AI önerilme oranı × ortalama müşteri değeri × dönüşüm oranı
 *
 * - Arama hacmi: DataForSEO'dan gerçek (veya fallback tahmin)
 * - Rakip AI önerilme: Mevcut scan verisinden (PromptResult'ta rakip bahsi)
 * - Ortalama müşteri değeri: Sektöre göre default değerler
 * - Dönüşüm oranı: %2 default (sektöre göre ayarlanabilir)
 */

import type { UserType } from "./user-type-weights";

// Sektöre göre ortalama müşteri değeri (TRY)
const AVG_CUSTOMER_VALUE_BY_SECTOR: Record<string, number> = {
  "Isıtma ve Tesisat": 15000,
  "İnşaat ve Mimarlık": 50000,
  "Sağlık ve Klinik": 3500,
  "Hukuk ve Danışmanlık": 8000,
  "Restoran ve Yiyecek": 500,
  "Otel ve Konaklama": 4000,
  "E-ticaret": 400,
  "Güzellik ve Bakım": 800,
  "Eğitim": 5000,
  "Otomotiv": 25000,
  "Teknoloji": 20000,
  "Gayrimenkul": 100000,
  "Finans ve Sigorta": 3000,
  "Lojistik ve Taşımacılık": 2500,
  "Tarım ve Hayvancılık": 5000,
  "Enerji": 30000,
  default: 5000,
};

// User type'a göre default dönüşüm oranı (%)
const CONVERSION_RATE_BY_TYPE: Record<UserType, number> = {
  firma: 0.02,      // %2 (lead → müşteri)
  kisi: 0.03,       // %3 (uzman → müşteri, daha yüksek güven)
  eticaret: 0.015,  // %1.5 (ziyaretçi → satış)
  yurtdisi: 0.01,   // %1 (düşük güven, yüksek değer)
};

export interface EstimatedLossInput {
  userType: UserType;
  sector?: string;
  totalSearchVolume: number; // 10 sorgunun toplam aylık arama hacmi
  competitorMentionRate: number; // 0-1 (rakibin AI'larda görünürlük oranı)
  yourMentionRate: number; // 0-1 (sizin AI'larda görünürlük oranı)
}

export interface EstimatedLoss {
  monthlyLoss: number;
  yearlyLoss: number;
  monthlyOpportunity: number; // Eğer 1'e çıkarsa ne kadar gelir olur
  assumptions: {
    avgCustomerValue: number;
    conversionRate: number;
    gapPercent: number; // Rakiple aradaki fark
  };
}

export function calculateEstimatedLoss(input: EstimatedLossInput): EstimatedLoss {
  const { userType, sector, totalSearchVolume, competitorMentionRate, yourMentionRate } = input;

  const avgCustomerValue = AVG_CUSTOMER_VALUE_BY_SECTOR[sector ?? "default"] ?? AVG_CUSTOMER_VALUE_BY_SECTOR.default;
  const conversionRate = CONVERSION_RATE_BY_TYPE[userType];

  // Gap: rakibin görünürlük oranından sizinkini çıkar
  const gap = Math.max(0, competitorMentionRate - yourMentionRate);

  // Aylık kayıp = gap * arama hacmi * dönüşüm * müşteri değeri
  const monthlyLoss = Math.round(gap * totalSearchVolume * conversionRate * avgCustomerValue);
  const yearlyLoss = monthlyLoss * 12;

  // Fırsat: %100 görünürlük durumunda aylık kazanç
  const monthlyOpportunity = Math.round(totalSearchVolume * conversionRate * avgCustomerValue);

  return {
    monthlyLoss,
    yearlyLoss,
    monthlyOpportunity,
    assumptions: {
      avgCustomerValue,
      conversionRate,
      gapPercent: Math.round(gap * 100),
    },
  };
}

/**
 * Formatla: "₺147.000" (tr-TR locale)
 */
export function formatLoss(amount: number): string {
  return `₺${amount.toLocaleString("tr-TR")}`;
}
