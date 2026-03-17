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
  promptFreshness: boolean; // aylık soru güncellik kontrolü
  checklistAutoVerify: boolean; // haftalık gelişim planı doğrulama
  smsEnabled: boolean;
  maxBrands: number;
  maxCompetitors: number;
  useSonarResearch: boolean;
  checklistLayer3: boolean;  // Gelişim Planı Katman 3
  mentionRate: boolean;       // Mention rate görünümü
  citationView: boolean;      // Citation kaynakları görünümü
  shareOfVoice: boolean;      // Share of voice görünümü
  exportPDF: boolean;         // PDF export
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxPrompts: 50,            // Spec: 50 soru — PRO ile aynı
    manualPromptAdd: false,    // Prompt ekleme Pro+
    scanFrequency: "once",     // TEK FARK: 1 kez tarama
    competitorView: true,      // Her şey açık
    competitorAnalysis: true,  // "Neden Önde?" açık
    auditView: true,           // Site kontrolü açık
    actionPlanView: true,      // Gelişim planı açık
    trendView: false,          // Trend yok — tek seferlik
    weeklyReport: false,       // Haftalık rapor yok
    promptFreshness: false,    // Aylık kontrol yok
    checklistAutoVerify: false, // "Tamamladım" doğrulama yok
    smsEnabled: false,
    maxBrands: 1,
    maxCompetitors: 10,        // Spec: 10 rakip — PRO ile aynı
    useSonarResearch: false,   // Sonar araştırma Pro+
    checklistLayer3: true,     // Tüm katmanlar açık
    mentionRate: false,        // Trend yok — tek seferlik
    citationView: true,        // Kaynaklar açık
    shareOfVoice: true,        // Görünürlük payı açık
    exportPDF: false,          // PDF export Pro+
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
    promptFreshness: true,
    checklistAutoVerify: true,
    smsEnabled: true,
    maxBrands: 3,
    maxCompetitors: 10,
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
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
    promptFreshness: true,
    checklistAutoVerify: true,
    smsEnabled: true,
    maxBrands: 3,
    maxCompetitors: 25,
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
  },
  agency: {
    maxPrompts: 50,
    manualPromptAdd: true,
    scanFrequency: "daily",
    competitorView: true,
    competitorAnalysis: true,
    auditView: true,
    actionPlanView: true,
    trendView: true,
    weeklyReport: true,
    promptFreshness: true,
    checklistAutoVerify: true,
    smsEnabled: true,
    maxBrands: 25,
    maxCompetitors: 50,
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
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
