/**
 * GH7.ai — RBAC Plan Control Utility
 * Tier hierarchy, route protection, and resource limits
 */

export type SubscriptionTier = 'free' | 'pro' | 'business';

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

/**
 * Check if user's tier meets the required tier level.
 * "agency" is treated as business-level access.
 */
export function hasAccess(userTier: string, required: SubscriptionTier): boolean {
  const normalised = normaliseTier(userTier);
  return TIER_HIERARCHY[normalised] >= TIER_HIERARCHY[required];
}

/**
 * Normalise plan string from DB (which may include "agency") to SubscriptionTier.
 */
export function normaliseTier(plan: string): SubscriptionTier {
  if (plan === 'agency' || plan === 'business') return 'business';
  if (plan === 'pro') return 'pro';
  return 'free';
}

/**
 * Routes that require a specific subscription tier.
 */
export const PROTECTED_ROUTES: Record<string, SubscriptionTier> = {
  '/panel/aksiyonlar': 'business',
  '/panel/icerik': 'business',
  '/panel/istihbarat': 'business',
  '/panel/korelasyon': 'business',
  '/panel/raporlar': 'pro',
};

/**
 * Per-tier resource limits.
 */
export const LIMITS = {
  free:     { keywords: 10,       cities: 1,  projects: 1 },
  pro:      { keywords: 50,       cities: 3,  projects: 1 },
  business: { keywords: Infinity, cities: 10, projects: 3 },
} as const;

/**
 * Human-readable tier labels (Turkish).
 */
export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Ücretsiz',
  pro: 'Pro',
  business: 'Business',
};

/**
 * Route descriptions for upgrade page (Turkish).
 */
export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/panel/aksiyonlar': 'Haftalık aksiyon planları ve AI destekli görev yönetimi',
  '/panel/icerik': 'AI destekli içerik taslakları ve yayın yönetimi',
  '/panel/istihbarat': 'Rakip istihbaratı ve rekabet analizi',
  '/panel/korelasyon': 'Aksiyon-sonuç korelasyonu ve etki analizi',
  '/panel/raporlar': 'Detaylı tarama raporları ve haftalık analizler',
};
