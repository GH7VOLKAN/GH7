"use client";

import { useState } from "react";
import {
  FadeIn,
  Stagger,
  AnimatedNumber,
  AnimBar,
  PageSection,
  SectionTitle,
} from "@/components/kinde/animations";
import { HeroSection } from "@/components/kinde/hero-section";
import {
  PlatformLogo,
  getPlatformDisplayName,
  getPlatformColor,
} from "@/components/kinde/ai-logos";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import type { PlatformKey } from "@/lib/types";
import type {
  CompetitorRowData,
  CompetitorDetailData,
  EmptyAreaOpportunity,
} from "@/lib/dal/competitors";
import { ChevronDownIcon, ArrowRightIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────
   Props — everything passed from the server component
   ───────────────────────────────────────────────────── */

interface ShareOfVoiceEntry {
  name: string;
  isUser: boolean;
  percentage: number;
  color: string;
}

interface RakiplerContentProps {
  rows: CompetitorRowData[];
  detail: CompetitorDetailData | null;
  userMentionScore: number;
  userReadinessScore: number;
  totalResults: number;
  totalMentions: number;
  shareOfVoice: ShareOfVoiceEntry[];
  emptyAreaOpportunities: EmptyAreaOpportunity[];
  aiDiscoveredCount: number;
  manualCount: number;
  userName: string;
  plan: string;
  maxVisibleCompetitors: number;
}

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

/* ─────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────── */

export function RakiplerContent({
  rows,
  detail,
  userMentionScore,
  totalResults,
  totalMentions,
  shareOfVoice,
  emptyAreaOpportunities,
  userName,
  plan,
  maxVisibleCompetitors,
}: RakiplerContentProps) {
  const userRow = rows.find((r) => r.isUser);
  const competitorRows = rows.filter((r) => !r.isUser);
  const visibleCompetitors = competitorRows.slice(0, maxVisibleCompetitors);
  const blurredCount = competitorRows.length - visibleCompetitors.length;

  // Sorted rows for the bar chart (user + visible competitors)
  const chartRows = [
    ...(userRow ? [userRow] : []),
    ...visibleCompetitors,
  ].sort((a, b) => b.mentionScore - a.mentionScore);

  const topCompetitor = competitorRows[0];

  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="RAKİP ANALİZİ"
        title={"Senin yerine kim\nöneriliyor?"}
        animatedValue={competitorRows.length}
        titleAfter={` rakip${competitorRows.length !== 1 ? "" : ""} takipte`}
        subtitle={
          topCompetitor
            ? `En güçlü rakibin ${topCompetitor.name} (%${topCompetitor.mentionScore}) — senin skorun %${userMentionScore}`
            : `${totalResults} soruda tarama yapıldı`
        }
      >
        {/* Mini progress comparing user vs top competitor */}
        {topCompetitor && (
          <div className="flex items-center justify-center gap-3">
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Sen
            </span>
            <div
              style={{
                width: 180,
                height: 6,
                background: "#f0f0f0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    topCompetitor.mentionScore > 0
                      ? (userMentionScore / topCompetitor.mentionScore) * 100
                      : 100,
                    100
                  )}%`,
                  height: "100%",
                  background: "#111",
                  borderRadius: 3,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              %{userMentionScore}
            </span>
          </div>
        )}
      </HeroSection>

      {/* ── GENEL SIRALAMA (bar chart) ────────────────── */}
      {chartRows.length > 0 && (
        <PageSection className="mt-2">
          <SectionTitle
            title="Genel Sıralama"
            subtitle="Tüm platformlardaki toplam bahsedilme oranı"
          />
          <div className="kinde-card p-6 lg:p-8" style={{ cursor: "default" }}>
            <div className="flex flex-col gap-4">
              {chartRows.map((row, i) => {
                const maxScore = Math.max(
                  ...chartRows.map((r) => r.mentionScore),
                  1
                );
                const pct = (row.mentionScore / maxScore) * 100;

                return (
                  <div key={row.id} className="flex items-center gap-3">
                    <span
                      style={{
                        width: 140,
                        fontSize: 13,
                        fontWeight: row.isUser ? 700 : 400,
                        color: row.isUser
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {row.isUser ? `${row.name} (Sen)` : row.name}
                    </span>
                    <div className="flex-1">
                      <AnimBar
                        percent={pct}
                        color={row.isUser ? "#111" : "#d4d4d4"}
                        height={row.isUser ? 10 : 8}
                        delay={i * 100}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: row.isUser
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                        width: 44,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      %{row.mentionScore}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Blurred rows hint */}
            {blurredCount > 0 && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "#fafafa",
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                  }}
                >
                  +{blurredCount} rakip daha var.{" "}
                  <a
                    href="/dashboard/ayarlar"
                    style={{
                      fontWeight: 600,
                      color: "var(--foreground)",
                      textDecoration: "underline",
                    }}
                  >
                    Pro ile tamamını gör
                  </a>
                </p>
              </div>
            )}
          </div>
        </PageSection>
      )}

      {/* ── PLATFORM BAZLI SIRALAMA (4 cards) ─────────── */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Platform Bazlı Sıralama"
          subtitle="Her yapay zekada sen vs. rakiplerin"
        />
        <Stagger
          className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
          staggerMs={80}
        >
          {PLATFORMS.map((platform) => {
            const displayName = getPlatformDisplayName(platform);
            const color = getPlatformColor(platform);
            const userScore = userRow?.platforms[platform] ?? 0;

            // Find user rank among visible competitors for this platform
            const allScores = [
              { name: userName, score: userScore, isUser: true },
              ...visibleCompetitors.map((c) => ({
                name: c.name,
                score: c.platforms[platform] ?? 0,
                isUser: false,
              })),
            ].sort((a, b) => b.score - a.score);

            const userRank =
              allScores.findIndex((s) => s.isUser) + 1;
            const topEntry = allScores[0];

            return (
              <div
                key={platform}
                className="kinde-card p-5 lg:p-7 cursor-default"
                style={{
                  borderColor:
                    userRank === 1 ? `${color}30` : undefined,
                }}
              >
                <PlatformLogo
                  platform={platform}
                  size={36}
                  mentioned={userScore > 0}
                />
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--foreground)",
                    marginTop: 12,
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color:
                      userRank === 1 ? "var(--foreground)" : "#ddd",
                    marginTop: 4,
                    lineHeight: 1,
                  }}
                >
                  #{userRank}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginTop: 6,
                  }}
                >
                  {userRank === 1
                    ? `%${userScore} ile lidersin`
                    : `%${userScore} — Lider: ${topEntry.name} (%${topEntry.score})`}
                </p>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ── NEDEN ÖNDE (expand cards — gap analysis) ──── */}
      {detail && detail.readinessGaps.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Neden önde?"
            subtitle={`${detail.name} senden bu alanlarda ayrışıyor`}
          />
          <div className="flex flex-col gap-3">
            {detail.readinessGaps.slice(0, 6).map((gap, i) => (
              <GapExpandCard key={i} gap={gap} />
            ))}
          </div>
        </PageSection>
      )}

      {/* ── BOŞ ALANLAR (empty area opportunities) ────── */}
      {emptyAreaOpportunities.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Boş alanlar"
            subtitle="Kimsenin domine edemediği sorular — fırsat alanın"
          />
          <div className="flex flex-col gap-2.5">
            {emptyAreaOpportunities.slice(0, 6).map((opp, i) => (
              <div key={i} className="kinde-card p-4 flex items-start gap-3">
                <div className="flex gap-1 shrink-0 pt-0.5">
                  {opp.platforms.slice(0, 4).map((p) => (
                    <PlatformLogo
                      key={p}
                      platform={p}
                      size={20}
                      mentioned
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                    className="line-clamp-2"
                  >
                    {opp.promptText}
                  </p>
                  {opp.topMention && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--muted-foreground)",
                        marginTop: 2,
                      }}
                    >
                      Tek bahsedilen: {opp.topMention}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      )}

      {/* ── SHARE OF VOICE ────────────────────────────── */}
      {shareOfVoice.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Ses Payı"
            subtitle="Yapay zekaların karar verirken kimi ne kadar öneriyor"
          />
          <div className="kinde-card p-6 lg:p-8" style={{ cursor: "default" }}>
            {/* Stacked bar */}
            <div
              style={{
                display: "flex",
                height: 16,
                borderRadius: 8,
                overflow: "hidden",
                background: "#f0f0f0",
              }}
            >
              {shareOfVoice.map((entry) => (
                <div
                  key={entry.name}
                  style={{
                    width: `${entry.percentage}%`,
                    height: "100%",
                    background: entry.color,
                    transition: "width 0.8s ease",
                  }}
                />
              ))}
            </div>
            {/* Legend */}
            <div
              className="flex flex-wrap gap-4 mt-4"
              style={{ fontSize: 12 }}
            >
              {shareOfVoice.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5"
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: entry.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: entry.isUser ? 700 : 400,
                      color: entry.isUser
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {entry.name} %{entry.percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard
          type="competitor"
          plan={plan}
          competitorName={topCompetitor?.name}
        />
      </div>
    </div>
  );
}

/* ── Gap Expand Card ──────────────────────────────────── */
function GapExpandCard({ gap }: { gap: string }) {
  const [expanded, setExpanded] = useState(false);

  // Split on first colon — label : detail
  const colonIdx = gap.indexOf(":");
  const title = colonIdx > -1 ? gap.slice(0, colonIdx).trim() : gap;
  const detail = colonIdx > -1 ? gap.slice(colonIdx + 1).trim() : "";

  return (
    <div
      className="kinde-card overflow-hidden cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-5">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 28, height: 28, background: "#fef2f2" }}
        >
          <span style={{ fontSize: 14, color: "#ef4444" }}>!</span>
        </div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground)",
            flex: 1,
          }}
        >
          {title}
        </p>
        <ChevronDownIcon
          className="size-4 text-muted-foreground transition-transform"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </div>
      {detail && (
        <div
          style={{
            maxHeight: expanded ? 200 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <div className="px-5 pb-5 pt-0">
            <p
              style={{
                fontSize: 13,
                color: "var(--muted-foreground)",
                lineHeight: 1.6,
              }}
            >
              {detail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
