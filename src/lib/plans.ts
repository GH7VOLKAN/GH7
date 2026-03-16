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
    maxPrompts: 10,
    manualPromptAdd: false,
    scanFrequency: "once",
    competitorView: false,
    competitorAnalysis: false,
    auditView: false,
    actionPlanView: false,
    trendView: false,
    weeklyReport: false,
    promptFreshness: false,
    checklistAutoVerify: false,
    smsEnabled: false,
    maxBrands: 1,
    maxCompetitors: 0,
    useSonarResearch: false,
    checklistLayer3: false,
    mentionRate: false,
    citationView: false,
    shareOfVoice: false,
    exportPDF: false,
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
    maxPrompts: 200,
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
    maxBrands: 10,
    maxCompetitors: 25,
    useSonarResearch: true,
    checklistLayer3: true,
    mentionRate: true,
    citationView: true,
    shareOfVoice: true,
    exportPDF: true,
  },
  agency: {
    maxPrompts: 500,
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
    maxBrands: 50,
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
