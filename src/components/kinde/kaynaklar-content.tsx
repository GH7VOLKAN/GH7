"use client";

import {
  FadeIn,
  Stagger,
  AnimatedNumber,
  AnimBar,
  PageSection,
  SectionTitle,
} from "./animations";
import { HeroSection } from "./hero-section";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { DualCTA } from "./dual-cta";
import type { SourceType } from "@/lib/types";
import { sourceTypeLabels } from "@/lib/types";
import type { SourceDomainData } from "@/lib/dal/sources";
import {
  GlobeIcon,
  BookOpenIcon,
  UsersIcon,
  AwardIcon,
  NewspaperIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Source type icon + color mapping
   ───────────────────────────────────────────────────── */

const sourceTypeConfig: Record<
  SourceType,
  { icon: typeof GlobeIcon; color: string; bg: string }
> = {
  kurumsal: { icon: GlobeIcon, color: "#3b82f6", bg: "#eff6ff" },
  dizin: { icon: BookOpenIcon, color: "#8b5cf6", bg: "#f5f3ff" },
  ugc: { icon: UsersIcon, color: "#f59e0b", bg: "#fffbeb" },
  referans: { icon: AwardIcon, color: "#10b981", bg: "#ecfdf5" },
  medya: { icon: NewspaperIcon, color: "#ef4444", bg: "#fef2f2" },
};

/* ─────────────────────────────────────────────────────
   Props
   ───────────────────────────────────────────────────── */

interface KaynaklarContentProps {
  sourceDomains: SourceDomainData[];
  totalSources: number;
  actionableSources: number;
  avgCitations: number;
  topSource: SourceDomainData | null;
  plan: string;
}

/* ─────────────────────────────────────────────────────
   Component
   ───────────────────────────────────────────────────── */

export function KaynaklarContent({
  sourceDomains,
  totalSources,
  actionableSources,
  avgCitations,
  topSource,
  plan,
}: KaynaklarContentProps) {
  const activeSources = sourceDomains.filter((s) => s.usagePercent > 0);
  const activeCount = activeSources.length;
  const activePercent =
    totalSources > 0 ? Math.round((activeCount / totalSources) * 100) : 0;

  // Group sources by type for summary
  const typeGroups = sourceDomains.reduce<Record<string, SourceDomainData[]>>(
    (acc, s) => {
      if (!acc[s.type]) acc[s.type] = [];
      acc[s.type].push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="KAYNAK ANAL\u0130Z\u0130"
        title={"Yapay zeka seni\nnereden \u00F6\u011Frenmi\u015F?"}
        subtitle={
          topSource
            ? `En \u00E7ok kullan\u0131lan kaynak: ${topSource.domain} (%${Math.round(topSource.usagePercent)})`
            : "Hen\u00FCz kaynak verisi bulunamad\u0131"
        }
      />

      {/* ── KAYNAK \u0130KONLARI (3-col grid) ────────────── */}
      <PageSection className="mt-2">
        <SectionTitle
          title="Kaynak \u0130konlar\u0131"
          subtitle="Yapay zekan\u0131n seni \u00F6\u011Frendi\u011Fi kaynaklar ve durumlar\u0131"
        />
        <Stagger
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
          staggerMs={80}
        >
          {sourceDomains.map((source) => {
            const isActive = source.usagePercent > 0;
            const config = sourceTypeConfig[source.type];
            const Icon = config.icon;

            return (
              <div
                key={source.id}
                className="kinde-card p-4 sm:p-5 lg:p-7 cursor-default"
                style={{
                  borderColor: isActive ? `${config.color}30` : undefined,
                  position: "relative",
                }}
              >
                {/* Missing label */}
                {!isActive && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: "#ef4444",
                      background: "#fef2f2",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    EKS\u0130K
                  </span>
                )}

                {/* Icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? config.bg : "#f5f5f5",
                  }}
                >
                  <Icon
                    style={{
                      width: 24,
                      height: 24,
                      color: isActive ? config.color : "#ccc",
                    }}
                  />
                </div>

                {/* Domain name */}
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isActive
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                    marginTop: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {source.domain}
                </p>

                {/* Type label */}
                <p
                  style={{
                    fontSize: 12,
                    color: isActive ? config.color : "#bbb",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {sourceTypeLabels[source.type]}
                </p>

                {/* Usage bar + percent */}
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Kullan\u0131m
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isActive
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                      }}
                    >
                      %{Math.round(source.usagePercent)}
                    </span>
                  </div>
                  <AnimBar
                    percent={source.usagePercent}
                    color={isActive ? config.color : "#e5e5e5"}
                    height={6}
                  />
                </div>

                {/* Citations */}
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginTop: 10,
                  }}
                >
                  Ort. {source.avgCitations.toFixed(1)} at\u0131f
                </p>

                {/* Action note */}
                {source.actionNote && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#f59e0b",
                      fontWeight: 500,
                      marginTop: 6,
                      lineHeight: 1.4,
                    }}
                  >
                    {source.actionNote}
                  </p>
                )}
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ── DOLULUK SUMMARY ─────────────────────────────── */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Doluluk Durumu"
          subtitle="Kaynaklar\u0131n ne kadar\u0131 aktif olarak kullan\u0131l\u0131yor"
        />
        <div className="kinde-card p-4 sm:p-6 lg:p-8" style={{ cursor: "default" }}>
          {/* Main stat */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              <AnimatedNumber value={activeCount} />
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: "var(--muted-foreground)",
              }}
            >
              / {totalSources} kaynak aktif
            </span>
          </div>

          {/* Progress bar */}
          <AnimBar
            percent={activePercent}
            color="#111"
            height={10}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              %{activePercent} doluluk
            </span>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Ort. {avgCitations.toFixed(1)} at\u0131f
            </span>
          </div>

          {/* Type breakdown */}
          {Object.keys(typeGroups).length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 20,
              }}
            >
              {Object.entries(typeGroups).map(([type, sources]) => {
                const config =
                  sourceTypeConfig[type as SourceType];
                const activeInGroup = sources.filter(
                  (s) => s.usagePercent > 0
                ).length;
                return (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 10,
                      background: config.bg,
                      fontSize: 12,
                      fontWeight: 600,
                      color: config.color,
                    }}
                  >
                    {sourceTypeLabels[type as SourceType]}: {activeInGroup}/
                    {sources.length}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actionable sources note */}
          {actionableSources > 0 && (
            <p
              style={{
                fontSize: 12,
                color: "#f59e0b",
                fontWeight: 500,
                marginTop: 16,
              }}
            >
              {actionableSources} kaynakta aksiyon \u00F6nerisi var
            </p>
          )}
        </div>
      </PageSection>

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="verification" plan={plan} />
      </div>

      {/* ── DUAL CTA ──────────────────────────────────── */}
      <DualCTA
        contextMessage="Yeni kaynaklar ekledin mi? Etkisini takip et."
        plan={plan}
      />
    </div>
  );
}
