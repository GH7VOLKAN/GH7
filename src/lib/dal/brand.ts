import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Get the current authenticated user's active brand.
 * Falls back to null if no user or no brand.
 */
export const getActiveBrand = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ensure profile exists
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "" },
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

  // Get default brand
  let brand = await prisma.brand.findFirst({
    where: { profileId: profile.id, isDefault: true },
  });

  // Fallback: first brand
  if (!brand) {
    brand = await prisma.brand.findFirst({
      where: { profileId: profile.id },
    });
  }

  return brand
    ? { profile, brand, plan: profile.plan ?? "free" }
    : { profile, brand: null, plan: profile.plan ?? "free" };
});

/**
 * Get user profile for sidebar display.
 * Returns null if Supabase is not configured or user is not authenticated.
 */
export const getUserProfile = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    };
  } catch {
    // Supabase not configured or error — return null
    return null;
  }
});
