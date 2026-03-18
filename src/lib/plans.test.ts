import { describe, it, expect } from "vitest";
import { PLAN_LIMITS, getPlanLimits, canAccess, isPro } from "./plans";

describe("PLAN_LIMITS", () => {
  // ─── FREE plan ───────────────────────────────────────

  describe("FREE plan", () => {
    const free = PLAN_LIMITS.free;

    it("maxBrands = 1", () => {
      expect(free.maxBrands).toBe(1);
    });

    it("maxPrompts = 10", () => {
      expect(free.maxPrompts).toBe(10);
    });

    it('scanFrequency = "once"', () => {
      expect(free.scanFrequency).toBe("once");
    });

    it("no trend view", () => {
      expect(free.trendView).toBe(false);
    });

    it("no weekly/monthly reports", () => {
      expect(free.weeklyReport).toBe(false);
      expect(free.monthlyReport).toBe(false);
    });

    it("no PDF export", () => {
      expect(free.exportPDF).toBe(false);
    });
  });

  // ─── PRO plan ────────────────────────────────────────

  describe("PRO plan", () => {
    const pro = PLAN_LIMITS.pro;

    it("maxBrands = 1", () => {
      expect(pro.maxBrands).toBe(1);
    });

    it("maxPrompts = 50", () => {
      expect(pro.maxPrompts).toBe(50);
    });

    it('scanFrequency = "thrice_weekly"', () => {
      expect(pro.scanFrequency).toBe("thrice_weekly");
    });

    it("has trend view", () => {
      expect(pro.trendView).toBe(true);
    });

    it("has weekly and monthly reports", () => {
      expect(pro.weeklyReport).toBe(true);
      expect(pro.monthlyReport).toBe(true);
    });

    it("has PDF export", () => {
      expect(pro.exportPDF).toBe(true);
    });

    it("no brand comparison", () => {
      expect(pro.brandComparison).toBe(false);
    });
  });

  // ─── BUSINESS plan ───────────────────────────────────

  describe("BUSINESS plan", () => {
    const business = PLAN_LIMITS.business;

    it("maxBrands = 3", () => {
      expect(business.maxBrands).toBe(3);
    });

    it("has brand comparison", () => {
      expect(business.brandComparison).toBe(true);
    });

    it("no white label", () => {
      expect(business.whiteLabel).toBe(false);
    });
  });

  // ─── AGENCY plan ─────────────────────────────────────

  describe("AGENCY plan", () => {
    const agency = PLAN_LIMITS.agency;

    it("maxBrands = 25", () => {
      expect(agency.maxBrands).toBe(25);
    });

    it("has white label", () => {
      expect(agency.whiteLabel).toBe(true);
    });

    it("has client access", () => {
      expect(agency.clientAccess).toBe(true);
    });

    it("has API access", () => {
      expect(agency.apiAccess).toBe(true);
    });

    it("has agency panel", () => {
      expect(agency.agencyPanel).toBe(true);
    });
  });
});

// ─── Helper functions ──────────────────────────────────

describe("getPlanLimits", () => {
  it("returns free limits for unknown plan", () => {
    const limits = getPlanLimits("unknown");
    expect(limits.maxBrands).toBe(1);
    expect(limits.maxPrompts).toBe(10);
  });

  it("returns correct limits for each plan name", () => {
    expect(getPlanLimits("pro").maxPrompts).toBe(50);
    expect(getPlanLimits("business").maxBrands).toBe(3);
    expect(getPlanLimits("agency").maxBrands).toBe(25);
  });
});

describe("canAccess", () => {
  it("free plan cannot access trendView", () => {
    expect(canAccess("free", "trendView")).toBe(false);
  });

  it("pro plan can access trendView", () => {
    expect(canAccess("pro", "trendView")).toBe(true);
  });
});

describe("isPro", () => {
  it("returns false for free", () => {
    expect(isPro("free")).toBe(false);
  });

  it("returns true for pro", () => {
    expect(isPro("pro")).toBe(true);
  });

  it("returns true for business", () => {
    expect(isPro("business")).toBe(true);
  });

  it("returns true for agency", () => {
    expect(isPro("agency")).toBe(true);
  });
});
