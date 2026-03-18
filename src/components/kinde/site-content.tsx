"use client";

import { HeroSection } from "@/components/kinde/hero-section";
import {
  FadeIn,
  Stagger,
  PageSection,
  SectionTitle,
} from "@/components/kinde/animations";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { DualCTA } from "./dual-cta";
import { AuditButton } from "@/components/site/audit-button";
import type { AuditCategoryData } from "@/lib/dal/site-audit";
import type { CheckStatus } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   Site Content — Kinde.com Landing Page Style
   ───────────────────────────────────────────────────── */

interface SiteContentProps {
  brandId: string;
  brandType: "firma" | "kisisel";
  plan: string;
  auditCategories: AuditCategoryData[];
  totalScore: number;
  targetScore: number;
  passCount: number;
  failCount: number;
  partialCount: number;
  totalChecks: number;
  raasEligibleCount: number;
}

const statusIcon: Record<CheckStatus, { icon: string; bg: string; color: string }> = {
  pass: { icon: "\u2713", bg: "#f0fdf4", color: "#22c55e" },
  partial: { icon: "\u26A0", bg: "#fffbeb", color: "#f59e0b" },
  fail: { icon: "\u2717", bg: "#fef2f2", color: "#ef4444" },
};

const statusLabel: Record<CheckStatus, string> = {
  pass: "Basarili",
  partial: "Kismi",
  fail: "Basarisiz",
};

export function SiteContent({
  brandId,
  brandType,
  plan,
  auditCategories,
  passCount,
  totalChecks,
}: SiteContentProps) {
  const hasData = auditCategories.length > 0;

  const heroTitle =
    brandType === "kisisel"
      ? "Dijital varligin yapay\nzekaya ne kadar hazir?"
      : "Siten yapay zekaya\nne kadar hazir?";

  const allChecks = auditCategories.flatMap((cat) => cat.checks);

  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="SITE ANALIZI"
        title={heroTitle}
      >
        <AuditButton brandId={brandId} />
      </HeroSection>

      {/* ── KONTROL LISTESI ───────────────────────────── */}
      {hasData ? (
        <PageSection className="mt-2">
          <SectionTitle
            title="Kontrol Listesi"
            subtitle={`Toplam: ${passCount}/${totalChecks} kontrol gecti`}
          />
          <Stagger className="flex flex-col gap-3" staggerMs={60}>
            {allChecks.map((check) => {
              const s = statusIcon[check.status];
              return (
                <div
                  key={check.id}
                  className="kinde-card p-5 flex items-center gap-4"
                  style={{ cursor: "default" }}
                >
                  {/* Status icon */}
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 34,
                      height: 34,
                      background: s.bg,
                    }}
                  >
                    <span style={{ fontSize: 16, color: s.color, lineHeight: 1 }}>
                      {s.icon}
                    </span>
                  </div>

                  {/* Title + status text */}
                  <div className="min-w-0 flex-1">
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      {check.label}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                        marginTop: 2,
                      }}
                    >
                      {check.detail ?? statusLabel[check.status]}
                    </p>
                  </div>
                </div>
              );
            })}
          </Stagger>
        </PageSection>
      ) : (
        <FadeIn className="mt-6">
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: 16,
              padding: "64px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: "var(--muted-foreground)",
                maxWidth: 360,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Henuz site analizi yapilmadi. Analizi baslatmak icin
              yukaridaki butona tiklayin.
            </p>
          </div>
        </FadeIn>
      )}

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="verification" plan={plan} />
      </div>

      {/* ── DUAL CTA ──────────────────────────────────── */}
      <DualCTA
        contextMessage="Site değişikliklerinin etkisini haftalık takip et."
        plan={plan}
      />
    </div>
  );
}
