import { describe, it, expect } from "vitest";
import {
  calculateHealthScore,
  calculateCategoryPoints,
  scoreAuditBoyut,
  scoreNicheVisibility,
  scoreCategoryDominance,
  scoreSourceDominance,
  scoreTrend,
  scoreCompetitorPosition,
  HEALTH_COMPONENT_MAX,
  type HealthComponents,
} from "./brand-health-v4";
import {
  getUnlockedCategoryQueryCount,
  getNextThreshold,
  CATEGORY_UNLOCK_THRESHOLDS,
} from "./thresholds";

// ─── calculateHealthScore ──────────────────────────────

describe("calculateHealthScore", () => {
  const full: HealthComponents = {
    siteInternalAudit: 20,
    authoritySignalsAudit: 20,
    externalSourceAudit: 15,
    nicheVisibility: 10,
    categoryDominance: 15,
    sourceDominance: 10,
    trend: 5,
    competitor: 5,
  };

  it("100 ham = 100 curved (perfect)", () => {
    const r = calculateHealthScore(full);
    expect(r.raw).toBe(100);
    expect(r.curved).toBe(100);
  });

  it("0 ham = 0 curved", () => {
    const zero: HealthComponents = {
      siteInternalAudit: 0,
      authoritySignalsAudit: 0,
      externalSourceAudit: 0,
      nicheVisibility: 0,
      categoryDominance: 0,
      sourceDominance: 0,
      trend: 0,
      competitor: 0,
    };
    const r = calculateHealthScore(zero);
    expect(r.raw).toBe(0);
    expect(r.curved).toBe(0);
  });

  it("50 ham < 50 curved (curve penalty altta)", () => {
    const r = calculateHealthScore({
      ...full,
      siteInternalAudit: 10,
      authoritySignalsAudit: 10,
      externalSourceAudit: 7,
      nicheVisibility: 5,
      categoryDominance: 7,
      sourceDominance: 5,
      trend: 3,
      competitor: 3,
    });
    expect(r.raw).toBe(50);
    // (0.5)^1.2 ≈ 0.4353 → 44
    expect(r.curved).toBe(44);
  });

  it("bileşenler max üstü ise clamp'lenir", () => {
    const over: HealthComponents = {
      ...full,
      siteInternalAudit: 30, // >20
      nicheVisibility: 15, // >10
    };
    const r = calculateHealthScore(over);
    expect(r.components.siteInternalAudit).toBe(20);
    expect(r.components.nicheVisibility).toBe(10);
    expect(r.raw).toBe(100);
  });

  it("negatif bileşen 0'a kırpılır", () => {
    const neg: HealthComponents = {
      ...full,
      trend: -3,
    };
    const r = calculateHealthScore(neg);
    expect(r.components.trend).toBe(0);
    expect(r.raw).toBe(95);
  });

  it("NaN girilirse hata atar", () => {
    const bad = { ...full, siteInternalAudit: Number.NaN };
    expect(() => calculateHealthScore(bad)).toThrow();
  });

  it("komponentlerin maksimum toplamı 100'dür", () => {
    const total = Object.values(HEALTH_COMPONENT_MAX).reduce(
      (a, b) => a + b,
      0,
    );
    expect(total).toBe(100);
  });
});

// ─── calculateCategoryPoints ──────────────────────────

describe("calculateCategoryPoints", () => {
  it("bulunamadıysa 0", () => {
    expect(calculateCategoryPoints(null, null)).toBe(0);
  });

  it("step 1 rank 1 → 5", () => {
    expect(calculateCategoryPoints(1, 1)).toBe(5);
  });

  it("step 1 rank 2 → 4", () => {
    expect(calculateCategoryPoints(1, 2)).toBe(4);
  });

  it("step 1 rank 3 → 4", () => {
    expect(calculateCategoryPoints(1, 3)).toBe(4);
  });

  it("step 1 rank 4+ → 3", () => {
    expect(calculateCategoryPoints(1, 4)).toBe(3);
    expect(calculateCategoryPoints(1, 10)).toBe(3);
  });

  it("step 1 rank null → 3 (listede var ama sıra belirsiz)", () => {
    expect(calculateCategoryPoints(1, null)).toBe(3);
  });

  it("step 2 rank 1 → 3", () => {
    expect(calculateCategoryPoints(2, 1)).toBe(3);
  });

  it("step 2 rank 2+ → 2", () => {
    expect(calculateCategoryPoints(2, 2)).toBe(2);
    expect(calculateCategoryPoints(2, 5)).toBe(2);
  });

  it("step 3 herhangi bir konum → 1", () => {
    expect(calculateCategoryPoints(3, 1)).toBe(1);
    expect(calculateCategoryPoints(3, 5)).toBe(1);
    expect(calculateCategoryPoints(3, null)).toBe(1);
  });
});

// ─── scoreAuditBoyut ──────────────────────────────────

describe("scoreAuditBoyut", () => {
  it("tüm passed → max", () => {
    const statuses = Array(15).fill("passed") as Array<"passed">;
    expect(scoreAuditBoyut(statuses, 20)).toBe(20);
  });

  it("yarısı passed, yarısı warning → 0.75×max", () => {
    const statuses = [
      ...Array(8).fill("passed"),
      ...Array(7).fill("warning"),
    ] as Array<"passed" | "warning">;
    // (8 + 7×0.5) / 15 × 20 = 11.5/15×20 = 15.33 → 15
    expect(scoreAuditBoyut(statuses, 20)).toBe(15);
  });

  it("hepsi critical → 0", () => {
    const statuses = Array(13).fill("critical") as Array<"critical">;
    expect(scoreAuditBoyut(statuses, 20)).toBe(0);
  });

  it("boş liste → 0", () => {
    expect(scoreAuditBoyut([], 20)).toBe(0);
  });

  it("warning %50 ağırlıklı", () => {
    const statuses = Array(15).fill("warning") as Array<"warning">;
    expect(scoreAuditBoyut(statuses, 20)).toBe(10);
  });
});

// ─── scoreNicheVisibility ──────────────────────────────

describe("scoreNicheVisibility", () => {
  it("45/50 → 9/10", () => {
    expect(scoreNicheVisibility(45, 50)).toBe(9);
  });

  it("0/50 → 0", () => {
    expect(scoreNicheVisibility(0, 50)).toBe(0);
  });

  it("50/50 → 10", () => {
    expect(scoreNicheVisibility(50, 50)).toBe(10);
  });

  it("hiç check yoksa 0", () => {
    expect(scoreNicheVisibility(0, 0)).toBe(0);
  });
});

// ─── scoreCategoryDominance ────────────────────────────

describe("scoreCategoryDominance", () => {
  it("125/250 → 8/15 (round 7.5)", () => {
    expect(scoreCategoryDominance(125, 250)).toBe(8);
  });

  it("250/250 → 15", () => {
    expect(scoreCategoryDominance(250, 250)).toBe(15);
  });

  it("0/250 → 0", () => {
    expect(scoreCategoryDominance(0, 250)).toBe(0);
  });
});

// ─── scoreSourceDominance ──────────────────────────────

describe("scoreSourceDominance", () => {
  it("tüm kaynaklarda marka var → 10", () => {
    const sources = Array(5).fill({
      status: "analyzed",
      mentionsBrand: true,
      mentionedCompetitors: [],
    });
    expect(scoreSourceDominance(sources)).toBe(10);
  });

  it("hiçbir kaynakta marka yok, sadece rakipler → 0", () => {
    const sources = Array(5).fill({
      status: "analyzed",
      mentionsBrand: false,
      mentionedCompetitors: ["X", "Y"],
    });
    expect(scoreSourceDominance(sources)).toBe(0);
  });

  it("2 markada var, 3 rakip → 4 (neutral=2)", () => {
    const sources = [
      { status: "analyzed" as const, mentionsBrand: true, mentionedCompetitors: [] },
      { status: "analyzed" as const, mentionsBrand: true, mentionedCompetitors: [] },
      {
        status: "analyzed" as const,
        mentionsBrand: false,
        mentionedCompetitors: ["X"],
      },
      {
        status: "analyzed" as const,
        mentionsBrand: false,
        mentionedCompetitors: ["Y"],
      },
      {
        status: "analyzed" as const,
        mentionsBrand: false,
        mentionedCompetitors: ["Z"],
      },
    ];
    // (5+5+0+0+0)/25 × 10 = 10/25×10 = 4
    expect(scoreSourceDominance(sources)).toBe(4);
  });

  it("unreachable kaynaklar hesaba katılmaz", () => {
    const sources = [
      { status: "analyzed" as const, mentionsBrand: true, mentionedCompetitors: [] },
      {
        status: "unreachable" as const,
        mentionsBrand: false,
        mentionedCompetitors: [],
      },
    ];
    // Sadece 1 analyzed → 5/5 × 10 = 10
    expect(scoreSourceDominance(sources)).toBe(10);
  });

  it("hiç analyzed yoksa 0", () => {
    const sources = [
      {
        status: "pending" as const,
        mentionsBrand: false,
        mentionedCompetitors: [],
      },
    ];
    expect(scoreSourceDominance(sources)).toBe(0);
  });
});

// ─── scoreTrend / scoreCompetitorPosition ──────────────

describe("scoreTrend", () => {
  it("düşüşte 0", () => {
    expect(scoreTrend(60, 55)).toBe(0);
    expect(scoreTrend(60, 60)).toBe(0);
  });

  it("+3 puan → 1", () => {
    expect(scoreTrend(60, 63)).toBe(1);
  });

  it("+25 puan → 5 (max)", () => {
    expect(scoreTrend(50, 75)).toBe(5);
  });

  it("+100 puan → 5 (clamp)", () => {
    expect(scoreTrend(0, 100)).toBe(5);
  });
});

describe("scoreCompetitorPosition", () => {
  it("rakip yoksa 0", () => {
    expect(scoreCompetitorPosition(60, [])).toBe(0);
  });

  it("ortalamanın 20+ üstü → 5", () => {
    expect(scoreCompetitorPosition(80, [50, 55, 60])).toBe(5);
  });

  it("ortalamayla eşit → 2", () => {
    expect(scoreCompetitorPosition(55, [50, 55, 60])).toBe(2);
  });

  it("ortalamanın çok altında → 0", () => {
    expect(scoreCompetitorPosition(30, [70, 75, 80])).toBe(0);
  });

  it("ortalamanın 10 üstü → 3", () => {
    expect(scoreCompetitorPosition(65, [50, 55, 60])).toBe(3);
  });
});

// ─── Thresholds ────────────────────────────────────────

describe("getUnlockedCategoryQueryCount", () => {
  it("skor 0 → 0 kilit açık", () => {
    expect(getUnlockedCategoryQueryCount(0)).toBe(0);
  });

  it("skor 49 → 0 kilit açık", () => {
    expect(getUnlockedCategoryQueryCount(49)).toBe(0);
  });

  it("skor 50 → 5 kilit açık", () => {
    expect(getUnlockedCategoryQueryCount(50)).toBe(5);
  });

  it("skor 75 → 7 kilit açık (70 eşiği)", () => {
    expect(getUnlockedCategoryQueryCount(75)).toBe(7);
  });

  it("skor 100 → 10 kilit açık (hepsi)", () => {
    expect(getUnlockedCategoryQueryCount(100)).toBe(10);
  });

  it("6 eşik tanımlı (50, 60, 70, 80, 90, 100)", () => {
    expect(CATEGORY_UNLOCK_THRESHOLDS).toHaveLength(6);
  });
});

describe("getNextThreshold", () => {
  it("skor 45 → sonraki eşik 50 (5 puan uzakta)", () => {
    const next = getNextThreshold(45);
    expect(next).toEqual({
      score: 50,
      categoryQueriesUnlocked: 5,
      pointsAway: 5,
    });
  });

  it("skor 100 → sonraki eşik yok (null)", () => {
    expect(getNextThreshold(100)).toBeNull();
  });

  it("skor 55 → sonraki eşik 60 (5 puan)", () => {
    expect(getNextThreshold(55)?.score).toBe(60);
  });
});
