/**
 * GH7.ai — Plan Limitleri ve Yardimci Fonksiyonlar
 * V3 Spec Section I — DataForSEO kullanılmıyor
 */

export type PlanType = "free" | "pro" | "business" | "agency";

export interface PlanLimits {
  maxPrompts: number;
  manualPromptAdd: boolean;
  scanFrequency: "once" | "thrice_weekly" | "daily";
  competitorView: boolean;
  competitorAnalysis: boolean; // "Neden Önde?" Opus analizi
  auditView: boolean;
  actionPlanView: boolean;
  trendView: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  promptFreshness: boolean; // aylık soru güncellik kontrolü
  checklistAutoVerify: boolean; // haftalık gelişim planı doğrulama
  verificationCheck: boolean;
  newCompetitorAlert: boolean;
  smsEnabled: boolean;
  maxBrands: number;
  maxCompetitors: number;
  useSonarResearch: boolean;
  checklistLayer3: boolean;  // Gelişim Planı Katman 3
  mentionRate: boolean;       // Mention rate görünümü
  citationView: boolean;      // Citation kaynakları görünümü
  shareOfVoice: boolean;      // Share of voice görünümü
  exportPDF: boolean;         // PDF export
  brandComparison: boolean;   // Marka karşılaştırma (Business+)
  whiteLabel: boolean;        // White label (Agency)
  clientAccess: boolean;      // Müşteri erişimi (Agency)
  apiAccess: boolean;         // API erişimi (Agency)
  agencyPanel: boolean;       // Ajans paneli (Agency)
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxPrompts: 20,            // Free: 20 soru (Sonar + Sonnet)
    manualPromptAdd: false,    // Prompt ekleme Pro+
    scanFrequency: "once",     // TEK FARK: 1 kez tarama
    competitorView: true,      // Her şey açık
    competitorAnalysis: true,  // "Neden Önde?" açık
    auditView: true,           // Site kontrolü açık
    actionPlanView: true,      // Gelişim planı açık
    trendView: false,          // Trend yok — tek seferlik
    weeklyReport: false,       // Haftalık rapor yok
    monthlyReport: false,      // Aylık rapor yok
    promptFreshness: false,    // Aylık kontrol yok
    checklistAutoVerify: false, // "Tamamladım" doğrulama yok
    verificationCheck: false,  // Doğrulama kontrolü yok
    newCompetitorAlert: false, // Yeni rakip uyarısı yok
    smsEnabled: false,
    maxBrands: 1,
    maxCompetitors: 10,        // Spec: 10 rakip
    useSonarResearch: true,    // Sonar araştırma tüm planlarda
    checklistLayer3: true,     // Tüm katmanlar açık
    mentionRate: false,        // Mention rate yok
    citationView: true,        // Kaynaklar açık
    shareOfVoice: true,        // Görünürlük payı açık
    exportPDF: false,          // PDF export yok
    brandComparison: false,
    whiteLabel: false,
    clientAccess: false,
    apiAccess: false,
    agencyPanel: false,
  },
  pro: {
    maxPrompts: 50,
    manualPromptAdd: true,
    scanFrequency: "thrice_weekly",
    competitorView: true,
    competitorAnalysis: true,
    auditView: true,
    actionPlanView: true,
    trendView: true,
    weeklyReport: true,
    monthlyReport: true,
    promptFreshness: true,
    checklistAutoVerify: true,
    verificationCheck: true,
    newCompetitorAlert: true,
    smsEnabled: true,
    maxBrands: 1,              // Spec: PRO = 1 marka
    maxCompetitors: 10,        // Spec: 10 rakip
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
    brandComparison: false,    // Business+ özellik
    whiteLabel: false,
    clientAccess: false,
    apiAccess: false,
    agencyPanel: false,
  },
  business: {
    maxPrompts: 50,
    manualPromptAdd: true,
    scanFrequency: "thrice_weekly",
    competitorView: true,
    competitorAnalysis: true,
    auditView: true,
    actionPlanView: true,
    trendView: true,
    weeklyReport: true,
    monthlyReport: true,
    promptFreshness: true,
    checklistAutoVerify: true,
    verificationCheck: true,
    newCompetitorAlert: true,
    smsEnabled: true,
    maxBrands: 3,              // Spec: 3 marka
    maxCompetitors: 10,        // Spec: 10 rakip
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
    brandComparison: true,     // Business+ özellik
    whiteLabel: false,
    clientAccess: false,
    apiAccess: false,
    agencyPanel: false,
  },
  agency: {
    maxPrompts: 50,
    manualPromptAdd: true,
    scanFrequency: "thrice_weekly",
    competitorView: true,
    competitorAnalysis: true,
    auditView: true,
    actionPlanView: true,
    trendView: true,
    weeklyReport: true,
    monthlyReport: true,
    promptFreshness: true,
    checklistAutoVerify: true,
    verificationCheck: true,
    newCompetitorAlert: true,
    smsEnabled: true,
    maxBrands: 25,             // Spec: 25 marka
    maxCompetitors: 10,        // Spec: 10 rakip
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
    brandComparison: true,
    whiteLabel: true,          // Agency özellik
    clientAccess: true,        // Agency özellik
    apiAccess: true,           // Agency özellik
    agencyPanel: true,         // Agency özellik
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[(plan as PlanType) || "free"] ?? PLAN_LIMITS.free;
}

export function canAccess(plan: string, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  return !!limits[feature];
}

export function isPro(plan: string): boolean {
  return plan !== "free";
}

export const PLAN_LABELS: Record<PlanType, string> = {
  free: "Ucretsiz",
  pro: "Pro",
  business: "Business",
  agency: "Ajans",
};
