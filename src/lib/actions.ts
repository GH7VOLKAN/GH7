"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateSmartPrompts } from "@/lib/ai/prompt-generator";
import { runSiteAudit } from "@/lib/ai/site-auditor";
import { runPersonalAudit } from "@/lib/ai/personal-auditor";
import { persistAuditResults } from "@/lib/ai/audit-persister";
import { generateActionPlan } from "@/lib/ai/action-plan-generator";
import { analyzeWhyCompetitorAhead, type CompetitorAnalysis } from "@/lib/ai/competitor-analyzer";
import { getCompetitorDeepDetail } from "@/lib/dal/competitors";
import { getPlanLimits, isPro } from "@/lib/plans";
import { CHECKLIST_DEFAULTS } from "@/lib/checklist-defaults";

// ─── Auth helper ────────────────────────────────────────
async function getAuthenticatedBrand(brandId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, profileId: user.id },
  });
  if (!brand) throw new Error("Brand not found");

  return { user, brand };
}

// ─── Brand Creation ─────────────────────────────────────
export async function createBrand(data: {
  name: string;
  domain: string;
  sector: string;
  type: "firma" | "kisisel";
  city?: string;
  profession?: string;
  specialties?: string[];
  competitorNames?: string[];
  competitorDomains?: string[];
  linkedinUrl?: string;
  // V3: Pre-approved Sonar analysis results from onboarding approval screen
  approvedBusinessCategories?: string[];
  approvedServiceRegions?: string[];
  approvedStrengths?: string[];
  approvedWeaknesses?: string[];
  sonarRawAnalysis?: Record<string, string>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (!data.name.trim()) throw new Error("Marka adı gerekli");
  if (!data.domain.trim()) throw new Error("Domain gerekli");

  // Get user's plan for prompt limits
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const plan = profile?.plan ?? "free";
  const limits = getPlanLimits(plan);

  const brandName = data.name.trim();
  const sectorName = data.sector.trim() || null;
  const cityName = data.city?.trim() || null;
  const profession = data.profession?.trim() || null;
  const specialties = data.specialties?.filter((s) => s.trim()) ?? [];
  const competitorNames = data.competitorNames
    ?.map((c) => c.replace(/\*\*/g, "").replace(/^\||\|$/g, "").trim())
    .filter((c) => c.length >= 2 && !/^(aşağıda|yukarıda|bu firmalar|arama sonuç)/i.test(c)) ?? [];
  const cleanDomain = data.domain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");

  // V3: Use pre-approved data from onboarding approval screen, or run Sonar fresh
  const hasApprovedData = data.approvedBusinessCategories && data.approvedBusinessCategories.length > 0;

  let finalSector = sectorName;
  let finalCompetitors = competitorNames;
  let businessCategories: string[] = [];
  let serviceRegions: string[] = [];
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let sonarRawAnalysis: Record<string, string> | undefined;

  if (hasApprovedData) {
    // Onay ekranından gelen veriler — Sonar tekrar çalışmaz
    businessCategories = data.approvedBusinessCategories ?? [];
    serviceRegions = data.approvedServiceRegions ?? [];
    strengths = data.approvedStrengths ?? [];
    weaknesses = data.approvedWeaknesses ?? [];
    sonarRawAnalysis = data.sonarRawAnalysis;
    if (competitorNames.length === 0 && data.competitorNames && data.competitorNames.length > 0) {
      finalCompetitors = data.competitorNames;
    }
  } else if (data.type === "firma" && cleanDomain) {
    // Fallback: Sonar'ı burada çalıştır (approval ekranı kullanılmadıysa)
    try {
      const { researchOnboardingDomain } = await import("@/lib/ai/sonar-research");
      const sonarOnboarding = await researchOnboardingDomain(cleanDomain);
      businessCategories = sonarOnboarding.businessCategories;
      serviceRegions = sonarOnboarding.serviceRegions;
      strengths = sonarOnboarding.strengths;
      weaknesses = sonarOnboarding.weaknesses;
      sonarRawAnalysis = sonarOnboarding.rawAnalysis;
      if (!finalSector) finalSector = sonarOnboarding.sector;
      if (finalCompetitors.length === 0) {
        finalCompetitors = sonarOnboarding.competitors.map((c) => c.name);
      }
    } catch (err) {
      console.error("[createBrand] Sonar onboarding failed (non-fatal):", err);
    }
  }

  const brand = await prisma.brand.create({
    data: {
      profileId: user.id,
      name: brandName,
      domain: cleanDomain,
      sector: finalSector,
      city: cityName,
      profession,
      specialties,
      competitorNames: finalCompetitors,
      competitorDomains: data.competitorDomains ?? [],
      type: data.type,
      isDefault: true,
      autoScan: true,
      scanInterval: "thrice_weekly",
      // V3 fields
      businessCategories,
      serviceRegions,
      strengths,
      weaknesses,
      sonarAnalysis: sonarRawAnalysis
        ? JSON.parse(JSON.stringify(sonarRawAnalysis))
        : undefined,
      linkedinUrl: data.linkedinUrl?.trim() || null,
    },
  });

  // Sync competitors to Competitor table (onboarding'den gelen rakipleri tabloya yaz)
  if (finalCompetitors.length > 0) {
    try {
      const competitorData = finalCompetitors
        .map((raw) => raw.replace(/\*\*/g, "").replace(/^\||\|$/g, "").trim()) // Clean markdown artifacts
        .filter((name) => name.length >= 2 && !/^(aşağıda|yukarıda|bu firmalar|arama sonuç)/i.test(name))
        .map((name, idx) => ({
        brandId: brand.id,
        name,
        domain: data.competitorDomains?.[idx] ?? "",
        mentionScore: 0,
        readinessScore: 0,
        platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
        source: "onboarding",
        reason: "Onboarding analizi sırasında tespit edildi",
        products: [] as string[],
        relevance: "direct",
      }));
      await prisma.competitor.createMany({ data: competitorData });
    } catch (compErr) {
      console.error("[createBrand] Competitor sync failed (non-fatal):", compErr);
    }
  }

  // Smart prompt generation using Sonar + Claude
  const promptCount = limits.maxPrompts;

  try {
    const smartPrompts = await generateSmartPrompts(
      {
        name: brandName,
        domain: brand.domain,
        sector: finalSector,
        city: cityName,
        type: data.type,
        profession,
        specialties,
        competitorNames: finalCompetitors,
        businessCategories,
        serviceRegions,
      },
      promptCount,
    );

    if (smartPrompts.length > 0) {
      await prisma.prompt.createMany({
        data: smartPrompts.map((p) => ({
          brandId: brand.id,
          text: p.text,
          tags: p.tags,
          source: p.source,
          category: p.category,
          isActive: true,
          businessArea: p.businessArea || null,
          searchIntent: p.searchIntent || null,
          salesPotential: p.salesPotential || null,
        })),
      });
    } else {
      // Fallback: generate basic prompts if smart generation fails
      const fallbackPrompts = generateFallbackPrompts(brandName, sectorName, data.type === "firma", promptCount);
      await prisma.prompt.createMany({
        data: fallbackPrompts.map((p) => ({
          brandId: brand.id,
          text: p.text,
          tags: p.tags,
          source: "ai_generated",
          isActive: true,
        })),
      });
    }
  } catch (err) {
    console.error("[createBrand] Smart prompt generation failed, using fallback:", err);
    const fallbackPrompts = generateFallbackPrompts(brandName, sectorName, data.type === "firma", promptCount);
    await prisma.prompt.createMany({
      data: fallbackPrompts.map((p) => ({
        brandId: brand.id,
        text: p.text,
        tags: p.tags,
        source: "ai_generated",
        isActive: true,
      })),
    });
  }

  // Checklist items seed (Gelişim Planı)
  try {
    const isFree = plan === "free";
    await prisma.checklistItem.createMany({
      data: CHECKLIST_DEFAULTS.map((d) => ({
        brandId: brand.id,
        layer: d.layer,
        itemNumber: d.itemNumber,
        simpleTitle: d.simpleTitle,
        simpleDescription: d.simpleDescription,
        status: isFree && d.layer === 3 ? "locked" : "missing",
        difficulty: d.difficulty,
        impact: d.impact,
        estimatedTime: d.estimatedTime,
        technicalDetail: JSON.parse(JSON.stringify(d.technicalDetail)),
        selfServiceSteps: d.selfServiceSteps,
        canAgencyDo: d.canAgencyDo,
        agencyPrice: d.agencyPrice,
      })),
    });
  } catch (checklistErr) {
    console.error("[createBrand] Checklist seed failed (non-fatal):", checklistErr);
  }

  // Pro+ kullanicilar icin audit + action plan (non-fatal, background)
  if (isPro(plan)) {
    // Fire and forget — onboarding'i yavaslamamasi icin
    (async () => {
      try {
        const auditResult = data.type === "kisisel"
          ? await runPersonalAudit({
              name: brandName,
              domain: brand.domain,
              profession,
              city: cityName,
              sector: sectorName,
              specialties,
            })
          : await runSiteAudit(brand.domain);

        await persistAuditResults(brand.id, auditResult);

        await generateActionPlan(
          {
            id: brand.id,
            name: brandName,
            domain: brand.domain,
            type: data.type,
            sector: sectorName,
            city: cityName,
            profession,
            specialties,
          },
          auditResult,
          0, // initial mentionScore = 0
        );
      } catch (auditErr) {
        console.error("[createBrand] Audit/action plan failed (non-fatal):", auditErr);
      }
    })();
  }

  revalidatePath("/dashboard", "layout");
  return { success: true, brandId: brand.id };
}

function generateFallbackPrompts(
  brandName: string,
  sector: string | null,
  isFirma: boolean,
  maxCount: number,
): { text: string; tags: string[] }[] {
  if (isFirma) {
    const base = [
      { text: `${brandName} hakkında ne biliyorsun?`, tags: ["marka", "tanınırlık"] },
      { text: `${brandName} nasıl bir firma?`, tags: ["marka", "genel"] },
      { text: `En iyi ${sector || brandName} firmaları hangileri?`, tags: ["marka", "karşılaştırma"] },
      { text: `${brandName} güvenilir mi?`, tags: ["marka", "güven"] },
      { text: `${brandName} müşteri yorumları nasıl?`, tags: ["marka", "yorum"] },
      { text: `${brandName} marka analizi`, tags: ["marka", "analiz"] },
    ];

    if (sector) {
      base.push(
        { text: `${sector} sektöründe en iyi firmalar`, tags: ["sektör", "karşılaştırma"] },
        { text: `${sector} fiyatları 2026`, tags: ["sektör", "fiyat"] },
        { text: `${sector} tavsiyeleri`, tags: ["sektör", "tavsiye"] },
        { text: `${brandName} ${sector} hizmetleri`, tags: ["marka", "ürün"] },
      );
    }

    return base.slice(0, maxCount);
  }

  // Kişisel marka
  const personal = [
    { text: `${brandName} kimdir?`, tags: ["kişisel", "tanınırlık"] },
    { text: `${brandName} hakkında ne biliyorsun?`, tags: ["kişisel", "genel"] },
    { text: `${brandName} ne iş yapar?`, tags: ["kişisel", "uzmanlık"] },
    { text: `${brandName} nerede çalışır?`, tags: ["kişisel", "kariyer"] },
    { text: `${brandName} başarıları nelerdir?`, tags: ["kişisel", "başarı"] },
  ];

  return personal.slice(0, maxCount);
}

// ─── Settings ───────────────────────────────────────────
export async function updateBrand(
  brandId: string,
  data: { name: string; domain: string; sector: string },
) {
  await getAuthenticatedBrand(brandId);

  await prisma.brand.update({
    where: { id: brandId },
    data: {
      name: data.name.trim(),
      domain: data.domain.trim(),
      sector: data.sector.trim() || null,
    },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── Prompts ────────────────────────────────────────────
export async function addPromptFromSuggested(
  brandId: string,
  suggestedPromptId: string,
) {
  await getAuthenticatedBrand(brandId);

  const suggested = await prisma.suggestedPrompt.findUnique({
    where: { id: suggestedPromptId },
  });
  if (!suggested || suggested.brandId !== brandId) {
    throw new Error("Not found");
  }

  await prisma.prompt.create({
    data: {
      brandId,
      text: suggested.text,
      tags: [],
      isActive: true,
    },
  });

  await prisma.suggestedPrompt.delete({
    where: { id: suggestedPromptId },
  });

  revalidatePath("/dashboard/promptlar");
  return { success: true };
}

export async function addCustomPrompt(brandId: string, text: string) {
  await getAuthenticatedBrand(brandId);

  if (!text.trim()) throw new Error("Prompt text required");

  await prisma.prompt.create({
    data: { brandId, text: text.trim(), tags: [], isActive: true },
  });

  revalidatePath("/dashboard/promptlar");
  return { success: true };
}

export async function deletePrompt(brandId: string, promptId: string) {
  await getAuthenticatedBrand(brandId);

  await prisma.prompt.deleteMany({
    where: { id: promptId, brandId },
  });

  revalidatePath("/dashboard/promptlar");
  return { success: true };
}

// ─── Action Tasks ───────────────────────────────────────
export async function completeActionTask(
  brandId: string,
  taskId: string,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.actionTask.updateMany({
    where: { id: taskId, brandId, completed: false },
    data: { completed: true },
  });

  revalidatePath("/dashboard/aksiyon");
  return { success: true };
}

export async function createActionFromAuditCheck(
  brandId: string,
  data: { label: string; recommendation: string; raasEligible: boolean },
) {
  await getAuthenticatedBrand(brandId);

  // Avoid duplicates
  const existing = await prisma.actionTask.findFirst({
    where: { brandId, title: data.label, completed: false },
  });
  if (existing) return { success: true, duplicate: true };

  await prisma.actionTask.create({
    data: {
      brandId,
      title: data.label,
      impact: "Site SEO kontrolünden tespit edildi.",
      source: "site_audit",
      detail: data.recommendation,
      priority: data.raasEligible ? "high" : "medium",
      raasEligible: data.raasEligible,
    },
  });

  revalidatePath("/dashboard/aksiyon");
  revalidatePath("/dashboard/site");
  return { success: true };
}

// ─── Competitors ────────────────────────────────────────
export async function addCompetitor(
  brandId: string,
  data: { name: string; domain: string; reason?: string },
) {
  await getAuthenticatedBrand(brandId);

  if (!data.name.trim()) throw new Error("Name required");

  await prisma.competitor.create({
    data: {
      brandId,
      name: data.name.trim(),
      domain: data.domain.trim(),
      mentionScore: 0,
      readinessScore: 0,
      platforms: { chatgpt: 0, claude: 0, gemini: 0, perplexity: 0 },
      source: "manual",
      reason: data.reason?.trim() ?? null,
      products: [],
      relevance: "direct",
    },
  });

  revalidatePath("/dashboard/rakipler");
  return { success: true };
}

export async function removeCompetitor(
  brandId: string,
  competitorId: string,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.competitor.deleteMany({
    where: { id: competitorId, brandId },
  });

  revalidatePath("/dashboard/rakipler");
  return { success: true };
}

// ─── Competitor Analysis (Neden Önde?) ──────────────────
export async function getCompetitorAnalysis(
  brandId: string,
  competitorId: string,
): Promise<CompetitorAnalysis> {
  const { brand } = await getAuthenticatedBrand(brandId);

  const competitor = await prisma.competitor.findFirst({
    where: { id: competitorId, brandId },
  });
  if (!competitor) throw new Error("Competitor not found");

  // Get latest user mention score
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId },
    orderBy: { date: "desc" },
  });
  const userMentionScore = latestScore?.mentionScore ?? 0;

  // Get deep detail for prompt appearances and sources
  const deepDetail = await getCompetitorDeepDetail(brandId, competitor.name);

  // Call AI analyzer
  const analysis = await analyzeWhyCompetitorAhead(
    brand.name,
    competitor.name,
    userMentionScore,
    competitor.mentionScore,
    deepDetail.promptAppearances.map((a) => ({
      promptText: a.promptText,
      platform: a.platform,
      excerpt: a.excerpt,
    })),
    deepDetail.competitorOnlySources,
  );

  return analysis;
}

// ─── Notifications ─────────────────────────────────────
export async function markNotificationRead(
  brandId: string,
  notificationId: string,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.notification.updateMany({
    where: { id: notificationId, brandId },
    data: { read: true },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function markAllNotificationsRead(brandId: string) {
  await getAuthenticatedBrand(brandId);

  await prisma.notification.updateMany({
    where: { brandId, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── Brand Type ───────────────────────────────────────
export async function updateBrandType(
  brandId: string,
  type: "firma" | "kisisel",
) {
  await getAuthenticatedBrand(brandId);

  await prisma.brand.update({
    where: { id: brandId },
    data: { type },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// ─── Scan Schedule ─────────────────────────────────────
export async function updateScanSchedule(
  brandId: string,
  data: { autoScan: boolean; scanInterval: string },
) {
  await getAuthenticatedBrand(brandId);

  await prisma.brand.update({
    where: { id: brandId },
    data: {
      autoScan: data.autoScan,
      scanInterval: data.scanInterval,
    },
  });

  revalidatePath("/dashboard/ayarlar");
  return { success: true };
}

// ─── Brand Management ──────────────────────────────────
export async function deleteBrand(brandId: string) {
  const { user } = await getAuthenticatedBrand(brandId);

  const brandCount = await prisma.brand.count({
    where: { profileId: user.id },
  });
  if (brandCount <= 1) {
    throw new Error("Son markanızı silemezsiniz");
  }

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (brand?.isDefault) {
    const other = await prisma.brand.findFirst({
      where: { profileId: user.id, id: { not: brandId } },
    });
    if (other) {
      await prisma.brand.update({
        where: { id: other.id },
        data: { isDefault: true },
      });
    }
  }

  await prisma.brand.delete({ where: { id: brandId } });
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function setDefaultBrand(brandId: string) {
  const { user } = await getAuthenticatedBrand(brandId);

  await prisma.brand.updateMany({
    where: { profileId: user.id },
    data: { isDefault: false },
  });

  await prisma.brand.update({
    where: { id: brandId },
    data: { isDefault: true },
  });

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function activateTestPlan(plan: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const validPlans = ["pro", "business", "agency"] as const;
  if (!validPlans.includes(plan as (typeof validPlans)[number])) {
    throw new Error("Invalid plan");
  }

  try {
    const { activatePlan } = await import("@/lib/iyzico/activate-plan");
    await activatePlan(user.id, plan as "pro" | "business" | "agency", "yearly");
    console.log(`[activateTestPlan] SUCCESS: ${user.id} → ${plan}`);
  } catch (err) {
    console.error(`[activateTestPlan] FAILED:`, err);
    throw err;
  }

  revalidatePath("/dashboard", "layout");
  return { success: true, plan };
}

// ─── Integration (Agency) ───────────────────────────────
export async function regenerateApiKey(brandId: string) {
  const { brand } = await getAuthenticatedBrand(brandId);

  // Verify agency plan
  const profile = await prisma.profile.findUnique({ where: { id: brand.profileId } });
  if (profile?.plan !== "agency") throw new Error("Bu özellik yalnızca Ajans planında kullanılabilir");

  const { randomBytes } = await import("crypto");
  const key = `gh7_${randomBytes(32).toString("hex")}`;

  await prisma.brand.update({
    where: { id: brandId },
    data: { apiKey: key },
  });

  revalidatePath("/dashboard/ayarlar");
  return { success: true, apiKey: key };
}

export async function updateWebhookUrl(brandId: string, url: string) {
  const { brand } = await getAuthenticatedBrand(brandId);

  // Verify agency plan
  const profile = await prisma.profile.findUnique({ where: { id: brand.profileId } });
  if (profile?.plan !== "agency") throw new Error("Bu özellik yalnızca Ajans planında kullanılabilir");

  // Basic URL validation
  if (url && !url.startsWith("https://")) {
    throw new Error("Webhook URL'si https:// ile başlamalıdır");
  }

  await prisma.brand.update({
    where: { id: brandId },
    data: { webhookUrl: url || null },
  });

  revalidatePath("/dashboard/ayarlar");
  return { success: true };
}

// ─── Notification Preferences ───────────────────────────
export async function updateNotificationPreferences(data: {
  phone: string;
  smsEnabled: boolean;
  emailScanComplete: boolean;
  emailScoreChange: boolean;
  emailWeeklyReport: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      phone: data.phone.trim() || null,
      smsEnabled: data.smsEnabled,
      emailScanComplete: data.emailScanComplete,
      emailScoreChange: data.emailScoreChange,
      emailWeeklyReport: data.emailWeeklyReport,
    },
  });

  revalidatePath("/dashboard/ayarlar");
  return { success: true };
}

// ─── Checklist (Gelişim Planı) ──────────────────────────

export async function seedChecklistItems(brandId: string, plan: string = "free") {
  const { brand } = await getAuthenticatedBrand(brandId);

  // Check if already seeded
  const existing = await prisma.checklistItem.count({ where: { brandId } });
  if (existing > 0) return { success: true, alreadySeeded: true };

  const isFree = plan === "free";

  await prisma.checklistItem.createMany({
    data: CHECKLIST_DEFAULTS.map((d) => ({
      brandId: brand.id,
      layer: d.layer,
      itemNumber: d.itemNumber,
      simpleTitle: d.simpleTitle,
      simpleDescription: d.simpleDescription,
      status: isFree && d.layer === 3 ? "locked" : "missing",
      difficulty: d.difficulty,
      impact: d.impact,
      feasibilityScore: d.feasibilityScore,
      estimatedTime: d.estimatedTime,
      technicalDetail: JSON.parse(JSON.stringify(d.technicalDetail)),
      selfServiceSteps: d.selfServiceSteps,
      canAgencyDo: d.canAgencyDo,
      agencyPrice: d.agencyPrice,
    })),
  });

  revalidatePath("/dashboard/gelisim");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function markChecklistItemDone(
  brandId: string,
  itemId: string,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.checklistItem.updateMany({
    where: { id: itemId, brandId },
    data: {
      status: "complete",
      userMarkedDone: true,
      completedAt: new Date(),
      verifiedByAI: false, // sonraki taramada doğrulanacak
    },
  });

  revalidatePath("/dashboard/gelisim");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function resetChecklistItemStatus(
  brandId: string,
  itemId: string,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.checklistItem.updateMany({
    where: { id: itemId, brandId },
    data: {
      status: "missing",
      userMarkedDone: false,
      verifiedByAI: false,
      completedAt: null,
      verificationNote: null,
    },
  });

  revalidatePath("/dashboard/gelisim");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function setChecklistReminder(
  brandId: string,
  itemId: string,
  reminderDate: string | null,
) {
  await getAuthenticatedBrand(brandId);

  await prisma.checklistItem.updateMany({
    where: { id: itemId, brandId },
    data: {
      reminderDate: reminderDate ? new Date(reminderDate) : null,
    },
  });

  revalidatePath("/dashboard/gelisim");
  return { success: true };
}
