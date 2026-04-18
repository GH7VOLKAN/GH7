/**
 * TEK MERKEZ: getAuthState()
 *
 * Uygulama genelinde auth durumunu TEK yerden hesaplar.
 * Panel layout guard, /analiz mount guard, /api/auth/state endpoint
 * hepsi bunu kullanır. DRY.
 *
 * Profile.id = Supabase auth.users.id (mevcut şema).
 */

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export type AuthStatus =
  | "no_session" // Supabase oturumu yok
  | "no_profile" // Session var ama Prisma Profile yok (orphan — nadir)
  | "no_brand" // Profile var ama Brand yok (analiz yapılmamış)
  | "complete"; // Tümü var — dashboard'a girebilir

export interface AuthStateComplete {
  status: "complete";
  userId: string;
  email: string | null;
  phone: string | null;
  profile: {
    id: string;
    email: string;
    phone: string | null;
    fullName: string | null;
    plan: string;
  };
  brand: {
    id: string;
    name: string;
    domain: string | null;
    userType: string;
  };
  isAdmin: boolean;
}

export interface AuthStateNoBrand {
  status: "no_brand";
  userId: string;
  email: string | null;
  phone: string | null;
  profile: {
    id: string;
    email: string;
    phone: string | null;
    fullName: string | null;
    plan: string;
  };
  isAdmin: boolean;
}

export interface AuthStateNoProfile {
  status: "no_profile";
  userId: string;
  email: string | null;
  phone: string | null;
}

export interface AuthStateNoSession {
  status: "no_session";
}

export type AuthState =
  | AuthStateComplete
  | AuthStateNoBrand
  | AuthStateNoProfile
  | AuthStateNoSession;

/**
 * Supabase oturum + Prisma Profile + Brand'i kontrol eder, yapılandırılmış
 * AuthState döner. Asla throw etmez — hata durumunda "no_session" döner.
 */
export async function getAuthState(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { status: "no_session" };

    // Profile ara — önce id, yoksa email (orphan tutarsızlık önleme)
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile && user.email) {
      profile = await prisma.profile.findUnique({
        where: { email: user.email.toLowerCase() },
      });
    }

    if (!profile) {
      return {
        status: "no_profile",
        userId: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      };
    }

    const profileSummary = {
      id: profile.id,
      email: profile.email,
      phone: profile.phone,
      fullName: profile.fullName,
      plan: profile.plan ?? "free",
    };

    const adminFlag = isAdmin({
      email: profile.email,
      phone: profile.phone ?? user.phone ?? null,
    });

    // Default brand
    let brand = await prisma.brand.findFirst({
      where: { profileId: profile.id, isDefault: true },
    });
    if (!brand) {
      brand = await prisma.brand.findFirst({
        where: { profileId: profile.id },
      });
    }

    if (!brand) {
      return {
        status: "no_brand",
        userId: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
        profile: profileSummary,
        isAdmin: adminFlag,
      };
    }

    return {
      status: "complete",
      userId: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      profile: profileSummary,
      brand: {
        id: brand.id,
        name: brand.name,
        domain: brand.domain ?? null,
        userType: (brand as { userType?: string }).userType ?? "firma",
      },
      isAdmin: adminFlag,
    };
  } catch (err) {
    console.error("[getAuthState] Unexpected error:", err);
    return { status: "no_session" };
  }
}
