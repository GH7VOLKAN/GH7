"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeroSection,
} from "./hero-section";
import {
  FadeIn,
  Stagger,
  AnimatedNumber,
  AnimBar,
  PageSection,
  SectionTitle,
} from "./animations";
import { PlatformLogo, getPlatformColor, getPlatformDisplayName } from "./ai-logos";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import type { PlatformKey } from "@/lib/types";
import type { CompetitorRankEntry, PlatformStat, RecentMention } from "@/lib/dal/overview";
import {
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Genel Bakış — Kinde.com Landing Page Style
   ───────────────────────────────────────────────────── */

interface GenelBakisContentProps {
  mentionScore: number;
  mentionTrend: number;
  totalMentionCount: number;
  totalResultCount: number;
  lastScanTimeAgo: string | null;
  activePromptCount: number;
  platformStats: PlatformStat[];
  competitorRanking: CompetitorRankEntry[];
  priorityActions: { title: string; impact: string }[];
  recentMentions: RecentMention[];
  plan: string;
}

export function GenelBakisContent({
  mentionScore,
  mentionTrend,
  totalMentionCount,
  totalResultCount,
  lastScanTimeAgo,
  activePromptCount,
  platformStats,
  competitorRanking,
  priorityActions,
  recentMentions,
  plan,
}: GenelBakisContentProps) {
  // How many platforms mention the brand
  const platformsWithMentions = platformStats.filter((p) => p.mentioned > 0).length;

  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="YAPAY ZEKA DURUM RAPORU"
        title={`4 yapay zekadan\n`}
        animatedValue={platformsWithMentions}
        titleAfter="'si seni tanıyor"
        subtitle={`${activePromptCount} soruda, ${totalMentionCount}'${totalMentionCount > 1 ? "i" : "ü"}nde seni öneriyor${lastScanTimeAgo ? ` · Son tarama: ${lastScanTimeAgo}` : ""}`}
      >
        {/* Mini progress bar */}
        <div className="flex items-center justify-center gap-3">
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
                width: `${totalResultCount > 0 ? (totalMentionCount / totalResultCount) * 100 : 0}%`,
                height: "100%",
                background: "#111",
                borderRadius: 3,
                transition: "width 1s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
            %{totalResultCount > 0 ? Math.round((totalMentionCount / totalResultCount) * 100) : 0}
          </span>
        </div>
      </HeroSection>

      {/* ── PLATFORM KARTLARI (4-col grid) ────────────── */}
      <PageSection className="mt-2">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" staggerMs={80}>
          {platformStats.map((stat) => {
            const color = getPlatformColor(stat.platform);
            const displayName = getPlatformDisplayName(stat.platform);
            const isActive = stat.mentioned > 0;
            const score = stat.total > 0 ? Math.round((stat.mentioned / stat.total) * 10) : 0;

            return (
              <div
                key={stat.platform}
                className="kinde-card p-5 lg:p-7 cursor-default"
                style={{
                  borderColor: isActive ? `${color}30` : undefined,
                }}
              >
                <PlatformLogo
                  platform={stat.platform}
                  size={36}
                  mentioned={isActive}
                />
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                    marginTop: 12,
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: isActive ? "var(--foreground)" : "#ddd",
                    marginTop: 4,
                    lineHeight: 1,
                  }}
                >
                  {stat.mentioned}/{stat.total}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted-foreground)",
                    marginTop: 6,
                  }}
                >
                  {isActive
                    ? `${stat.total} sorunun ${stat.mentioned}'${stat.mentioned > 1 ? "i" : "ü"}nde öneriyor`
                    : "Henüz tanımıyor"}
                </p>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ── SENİN YERİNE KİM (bar chart) ─────────────── */}
      {competitorRanking.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Senin yerine kim öneriliyor?"
            subtitle="Yapay zekaların senin yerine önerdiği firmalar"
          />
          <div className="kinde-card p-6 lg:p-8" style={{ cursor: "default" }}>
            <div className="flex flex-col gap-5">
              {competitorRanking.map((entry, i) => {
                const maxMentions = Math.max(
                  ...competitorRanking.map((r) => r.mentionCount),
                  1
                );
                const pct = (entry.mentionCount / maxMentions) * 100;
                const platforms = (["chatgpt", "claude", "gemini", "perplexity"] as PlatformKey[]);

                return (
                  <div key={entry.name}>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          width: 140,
                          fontSize: 13,
                          fontWeight: entry.isUser ? 700 : 400,
                          color: entry.isUser ? "var(--foreground)" : "var(--muted-foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {entry.isUser ? `${entry.name} (Sen)` : entry.name}
                      </span>
                      <div className="flex-1">
                        <AnimBar
                          percent={pct}
                          color={entry.isUser ? "#111" : "#d4d4d4"}
                          height={entry.isUser ? 10 : 8}
                          delay={i * 100}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: entry.isUser ? "var(--foreground)" : "var(--muted-foreground)",
                          width: 36,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {entry.mentionCount}
                      </span>
                    </div>
                    {/* Per-platform breakdown */}
                    <div className="flex items-center gap-2 mt-1.5" style={{ paddingLeft: 140 + 12 }}>
                      {platforms.map((p) => {
                        const stat = entry.perPlatform[p];
                        const mentioned = stat?.mentioned ?? 0;
                        const total = stat?.total ?? 0;
                        const active = mentioned > 0;
                        return (
                          <div
                            key={p}
                            className="flex items-center gap-1"
                            style={{
                              fontSize: 11,
                              color: active ? getPlatformColor(p) : "#ccc",
                              fontWeight: active ? 600 : 400,
                            }}
                          >
                            <PlatformLogo platform={p} size={14} mentioned={active} />
                            <span>{mentioned}/{total}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-right">
              <Link
                href="/dashboard/rakipler"
                className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Detaylı analiz <ArrowRightIcon className="size-3" />
              </Link>
            </div>
          </div>
        </PageSection>
      )}

      {/* ── BU HAFTA DEĞİŞENLER ──────────────────────── */}
      {mentionTrend !== 0 && (
        <PageSection className="mt-12">
          <SectionTitle title="Bu hafta değişenler" />
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {mentionTrend > 0 ? (
              <div className="kinde-card p-5 flex items-start gap-3">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    background: "#f0fdf4",
                  }}
                >
                  <TrendingUpIcon className="size-[18px]" style={{ color: "#22c55e" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                    Bahsedilme arttı
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                    Geçen haftaya göre +{mentionTrend} puan yükseliş
                  </p>
                </div>
              </div>
            ) : (
              <div className="kinde-card p-5 flex items-start gap-3">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    background: "#fef2f2",
                  }}
                >
                  <TrendingDownIcon className="size-[18px]" style={{ color: "#ef4444" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                    Bahsedilme düştü
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                    Geçen haftaya göre {mentionTrend} puan düşüş
                  </p>
                </div>
              </div>
            )}
          </Stagger>
        </PageSection>
      )}

      {/* ── ŞİMDİ NE YAPMALISIN (expand cards) ───────── */}
      {priorityActions.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Şimdi ne yapmalısın?"
            subtitle="Kolay olanlar önce — hemen başlayabilirsin"
          />
          <div className="flex flex-col gap-3">
            {priorityActions.map((action, i) => (
              <ActionExpandCard key={i} action={action} />
            ))}
          </div>
        </PageSection>
      )}

      {/* ── SON BAHSEDİLMELER ─────────────────────────── */}
      {recentMentions.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Son bahsedilmeler"
            subtitle={`${totalMentionCount} bahsedilme / ${totalResultCount} sonuç`}
          />
          <div className="flex flex-col gap-2.5">
            {recentMentions.slice(0, 5).map((m) => (
              <div key={m.id} className="kinde-card p-4 flex items-start gap-3">
                <PlatformLogo platform={m.platform} size={28} mentioned />
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }} className="line-clamp-1">
                    {m.prompt}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }} className="line-clamp-2">
                    {m.excerpt}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>
                  {m.timeAgo}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Link
              href="/dashboard/promptlar"
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Tüm sonuçları gör <ArrowRightIcon className="size-3" />
            </Link>
          </div>
        </PageSection>
      )}

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="trend" plan={plan} />
      </div>
    </div>
  );
}

/* ── Action Expand Card ───────────────────────────────── */
function ActionExpandCard({ action }: { action: { title: string; impact: string } }) {
  const [expanded, setExpanded] = useState(false);

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
          <span style={{ fontSize: 14 }}>✗</span>
        </div>
        <p
          style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", flex: 1 }}
        >
          {action.title}
        </p>
        <ChevronDownIcon
          className="size-4 text-muted-foreground transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
      </div>
      <div
        style={{
          maxHeight: expanded ? 200 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="px-5 pb-5 pt-0">
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            {action.impact}
          </p>
          <Link
            href="/dashboard/gelisim"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-[12px] font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.98]"
            onClick={(e) => e.stopPropagation()}
          >
            Adım adım rehber <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
