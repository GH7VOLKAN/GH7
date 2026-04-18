import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Get the current authenticated user's active brand.
 * Returns null if no user. Never throws — hata durumunda null döner.
 *
 * Email conflict handling: Eğer aynı email ile farklı id'de bir Profile
 * varsa (eski Supabase user silinmiş, yenisi oluşturulmuş), upsert crash
 * olmaz — mevcut profile kullanılır.
 */
export const getActiveBrand = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const userEmail = user.email ?? "";

    // 1) Önce id ile Profile ara
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    // 2) Yoksa email ile ara (email conflict önle)
    if (!profile && userEmail) {
      profile = await prisma.profile.findUnique({
        where: { email: userEmail },
      });
      if (profile && profile.id !== user.id) {
        console.warn(
          `[getActiveBrand] Email conflict: Supabase user.id=${user.id} but Profile.id=${profile.id} has same email ${userEmail}. Using existing Profile.`,
        );
      }
    }

    // 3) Hâlâ yoksa create (yeni kullanıcı)
    if (!profile) {
      try {
        profile = await prisma.profile.create({
          data: {
            id: user.id,
            email: userEmail,
            fullName: user.user_metadata?.full_name ?? null,
            avatarUrl: user.user_metadata?.avatar_url ?? null,
          },
        });
      } catch (err) {
        // Create sırasında race condition veya benzer bir conflict →
        // bir kez daha findUnique ile dene (cache timing issue)
        console.warn("[getActiveBrand] Profile.create failed, retry find:", err);
        profile = await prisma.profile.findUnique({
          where: { id: user.id },
        });
        if (!profile && userEmail) {
          profile = await prisma.profile.findUnique({
            where: { email: userEmail },
          });
        }
        if (!profile) {
          // Çözülemeyen conflict — null döner, panel EmptyState gösterir
          console.error(
            "[getActiveBrand] Could not find or create profile for user:",
            user.id,
          );
          return null;
        }
      }
    } else {
      // Mevcut profile — email güncelleme (Supabase'te değişmiş olabilir)
      if (userEmail && profile.email !== userEmail) {
        try {
          profile = await prisma.profile.update({
            where: { id: profile.id },
            data: { email: userEmail },
          });
        } catch {
          // email unique conflict — dokunma, mevcut kalsın
        }
      }
    }

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
  } catch (err) {
    console.error("[getActiveBrand] Unexpected error:", err);
    return null;
  }
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
