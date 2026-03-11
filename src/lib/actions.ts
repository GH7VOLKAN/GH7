"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

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

// ─── Competitors ────────────────────────────────────────
export async function addCompetitor(
  brandId: string,
  data: { name: string; domain: string },
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
