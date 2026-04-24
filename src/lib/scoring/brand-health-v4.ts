/**
 * Brand Health Score v4 — Brief N v4 Aşama 3.
 *
 * 3 audit boyutu (20+20+15=55) + 3 görünürlük katmanı (10+15+10=35)
 * + 2 ek metrik (5+5=10) = 100 ham puan. Curved formül: (ham/100)^1.2 × 100.
 *
 * Ağırlık mantığı:
 *   A · Audit: %55  (site-içi 20 + otorite 20 + dış kaynak 15)
 *   B · Görünürlük: %35  (niş 10 + kategori 15 + kaynak 10)
 *   C · Ek: %10  (trend 5 + rakip 5)
 *
 * Her audit boyutu kendi görünürlük katmanına hizmet eder — yan etki
 * zinciri: audit maddesi düzelt → ilgili katmanda skor yükselir.
 */

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export type HealthComponents = {
  /** 3 audit boyutu (maksimumlar: 20/20/15) */
  siteInternalAudit: number;
  authoritySignalsAudit: number;
  externalSourceAudit: number;

  /** 3 görünürlük katmanı (maksimumlar: 10/15/10) */
  nicheVisibility: number;
  categoryDominance: number;
  sourceDominance: number;

  /** Ek metrikler (maksimumlar: 5/5) */
  trend: number;
  competitor: number;
};

export type HealthScore = {
  /** Ham toplam (0-100) */
  raw: number;
  /** Curved — (ham/100)^1.2 × 100 (0-100) */
  curved: number;
  components: HealthComponents;
};

export const HEALTH_COMPONENT_MAX: Readonly<HealthComponents> = {
  siteInternalAudit: 20,
  authoritySignalsAudit: 20,
  externalSourceAudit: 15,
  nicheVisibility: 10,
  categoryDominance: 15,
  sourceDominance: 10,
  trend: 5,
  competitor: 5,
};

// ─────────────────────────────────────────────────────
// Ana fonksiyon
// ─────────────────────────────────────────────────────

function clampComponent(
  value: number,
  max: number,
  key: keyof HealthComponents,
): number {
  if (!Number.isFinite(value)) {
    throw new Error(`HealthComponents.${key} geçerli bir sayı olmalı`);
  }
  if (value < 0) return 0;
  if (value > max) return max;
  return Math.round(value);
}

export function calculateHealthScore(
  components: HealthComponents,
): HealthScore {
  // Her alanı [0, max] aralığına kırp (defensive programming)
  const normalized: HealthComponents = {
    siteInternalAudit: clampComponent(
      components.siteInternalAudit,
      HEALTH_COMPONENT_MAX.siteInternalAudit,
      "siteInternalAudit",
    ),
    authoritySignalsAudit: clampComponent(
      components.authoritySignalsAudit,
      HEALTH_COMPONENT_MAX.authoritySignalsAudit,
      "authoritySignalsAudit",
    ),
    externalSourceAudit: clampComponent(
      components.externalSourceAudit,
      HEALTH_COMPONENT_MAX.externalSourceAudit,
      "externalSourceAudit",
    ),
    nicheVisibility: clampComponent(
      components.nicheVisibility,
      HEALTH_COMPONENT_MAX.nicheVisibility,
      "nicheVisibility",
    ),
    categoryDominance: clampComponent(
      components.categoryDominance,
      HEALTH_COMPONENT_MAX.categoryDominance,
      "categoryDominance",
    ),
    sourceDominance: clampComponent(
      components.sourceDominance,
      HEALTH_COMPONENT_MAX.sourceDominance,
      "sourceDominance",
    ),
    trend: clampComponent(components.trend, HEALTH_COMPONENT_MAX.trend, "trend"),
    competitor: clampComponent(
      components.competitor,
      HEALTH_COMPONENT_MAX.competitor,
      "competitor",
    ),
  };

  const raw =
    normalized.siteInternalAudit +
    normalized.authoritySignalsAudit +
    normalized.externalSourceAudit +
    normalized.nicheVisibility +
    normalized.categoryDominance +
    normalized.sourceDominance +
    normalized.trend +
    normalized.competitor;

  const curved = Math.round(Math.pow(raw / 100, 1.2) * 100);

  return { raw, curved, components: normalized };
}

// ─────────────────────────────────────────────────────
// Audit boyutu skorlama
// ─────────────────────────────────────────────────────

export type AuditItemStatus = "passed" | "warning" | "critical" | "not-applicable";

/**
 * Bir boyut için geçmiş madde sayısından 0-max aralığında skor hesaplar.
 * `passed` = 1.0, `warning` = 0.5, `critical/not-applicable` = 0.
 *
 * Örnek: SITE_INTERNAL (max=20, total=15 madde) → 12 passed + 2 warning
 * → (12 × 1 + 2 × 0.5) / 15 × 20 = 13 × 20 / 15 = 17.33 → round → 17
 */
export function scoreAuditBoyut(
  itemStatuses: AuditItemStatus[],
  max: number,
): number {
  const totalItems = itemStatuses.length;
  if (totalItems === 0) return 0;

  const weight = itemStatuses.reduce((acc, s) => {
    if (s === "passed") return acc + 1;
    if (s === "warning") return acc + 0.5;
    return acc;
  }, 0);

  return Math.round((weight / totalItems) * max);
}

// ─────────────────────────────────────────────────────
// Niş görünürlük skorlama (binary)
// ─────────────────────────────────────────────────────

/**
 * NICHE sorgular × platformlar × mention binary matrisinden 0-10 skor.
 * 10 sorgu × 5 platform = 50 max mention; skor = (mentionCount / max) × 10.
 */
export function scoreNicheVisibility(
  mentionCount: number,
  totalChecks: number,
  max = 10,
): number {
  if (totalChecks === 0) return 0;
  return Math.round((mentionCount / totalChecks) * max);
}

// ─────────────────────────────────────────────────────
// Kategori hakimiyeti skorlama (funnel-based)
// ─────────────────────────────────────────────────────

/**
 * Funnel puanlaması — Brief N v4 spec:
 * Step 1 (kategori otoritesi):
 *   rank 1  → 5
 *   rank 2-3 → 4
 *   rank 4+ → 3
 * Step 2 (bölgesel otorite):
 *   rank 1  → 3
 *   rank 2-3 → 2
 *   rank 4+ → 2
 * Step 3 (niş otorite):
 *   her konum → 1
 * Bulunamadı: 0
 */
export function calculateCategoryPoints(
  foundAtStep: number | null,
  rank: number | null,
): number {
  if (foundAtStep === null) return 0;

  if (foundAtStep === 1) {
    if (rank === 1) return 5;
    if (rank !== null && rank <= 3) return 4;
    return 3;
  }

  if (foundAtStep === 2) {
    if (rank === 1) return 3;
    return 2;
  }

  if (foundAtStep === 3) return 1;

  return 0;
}

/**
 * Toplam kategori puanı → 0-15 aralığına normalize eder.
 * Max: 10 sorgu × 5 platform × 5 puan = 250.
 */
export function scoreCategoryDominance(
  totalPoints: number,
  maxPossible: number,
  max = 15,
): number {
  if (maxPossible === 0) return 0;
  return Math.round((totalPoints / maxPossible) * max);
}

// ─────────────────────────────────────────────────────
// Kaynak hakimiyeti skorlama
// ─────────────────────────────────────────────────────

export type SourceAnalysisSummary = {
  status: "analyzed" | "unreachable" | "pending";
  mentionsBrand: boolean;
  mentionedCompetitors: string[];
};

/**
 * Kaynak analiz özetlerinden 0-10 aralığında skor.
 *
 * Her analyzed kaynak:
 *   - Marka var          → 5 puan
 *   - Sadece rakip var   → 0 puan (kritik eksik)
 *   - Hiçbiri yok        → 2 puan (neutral)
 *
 * unreachable/pending durumlar hesaba katılmaz.
 */
export function scoreSourceDominance(
  sources: SourceAnalysisSummary[],
  max = 10,
): number {
  const analyzed = sources.filter((s) => s.status === "analyzed");
  if (analyzed.length === 0) return 0;

  let totalPoints = 0;
  const maxPerSource = 5;

  for (const s of analyzed) {
    if (s.mentionsBrand) {
      totalPoints += 5;
    } else if (s.mentionedCompetitors.length > 0) {
      totalPoints += 0;
    } else {
      totalPoints += 2;
    }
  }

  const maxPossible = analyzed.length * maxPerSource;
  return Math.round((totalPoints / maxPossible) * max);
}

// ─────────────────────────────────────────────────────
// Trend ve rakip skorlama (basit heuristic)
// ─────────────────────────────────────────────────────

/**
 * Bir önceki haftaya göre skor değişiminden 0-5 aralığında trend puanı.
 * Her +5 puan değişim → +1 trend. Düşüş → 0.
 */
export function scoreTrend(previousRaw: number, currentRaw: number, max = 5): number {
  const delta = currentRaw - previousRaw;
  if (delta <= 0) return 0;
  return Math.min(max, Math.round(delta / 5));
}

/**
 * Rakip karşılaştırma — primary rakiplerin ortalama skoruna göre konum.
 * Markanın skoru ortalamadan X puan üstünde ise daha yüksek puan.
 */
export function scoreCompetitorPosition(
  brandRaw: number,
  competitorRaws: number[],
  max = 5,
): number {
  if (competitorRaws.length === 0) return 0;
  const avg =
    competitorRaws.reduce((acc, n) => acc + n, 0) / competitorRaws.length;
  const lead = brandRaw - avg;
  if (lead <= -20) return 0;
  if (lead <= -10) return 1;
  if (lead <= 0) return 2;
  if (lead <= 10) return 3;
  if (lead <= 20) return 4;
  return max;
}
