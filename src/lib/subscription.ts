export type SubscriptionTier = 'free' | 'pro';

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = { free: 0, pro: 1 };

export function hasAccess(userTier: string, required: SubscriptionTier): boolean {
  return TIER_HIERARCHY[normaliseTier(userTier)] >= TIER_HIERARCHY[required];
}

export function normaliseTier(plan: string): SubscriptionTier {
  if (plan === 'agency' || plan === 'business' || plan === 'pro') return 'pro';
  return 'free';
}

export const PROTECTED_ROUTES: Record<string, SubscriptionTier> = {
  '/panel/aksiyonlar': 'pro',
  '/panel/icerik': 'pro',
  '/panel/istihbarat': 'pro',
  '/panel/korelasyon': 'pro',
  '/panel/raporlar': 'pro',
};

export const LIMITS = {
  free: { keywords: 10, cities: 1, projects: 1 },
  pro:  { keywords: 20, cities: 5, projects: 3 },
} as const;

export const TIER_LABELS: Record<SubscriptionTier, string> = { free: 'Ücretsiz', pro: 'Pro' };

export const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/panel/aksiyonlar': 'Haftalık aksiyon planları ve AI destekli görev yönetimi',
  '/panel/icerik': 'AI destekli içerik taslakları ve yayın yönetimi',
  '/panel/istihbarat': 'Rakip istihbaratı ve rekabet analizi',
  '/panel/korelasyon': 'Aksiyon-sonuç korelasyonu ve etki analizi',
  '/panel/raporlar': 'Detaylı tarama raporları ve haftalık analizler',
};
