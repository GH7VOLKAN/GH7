"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
import { DualCTA } from "./dual-cta";
import type { PlatformKey } from "@/lib/types";
import type {
  CompetitorRankEntry,
  PlatformStat,
  RecentMention,
  WeeklyTrendPoint,
  ChecklistProgress,
  PromptSummaryItem,
  AiResponseExcerpt,
  PlatformQA,
  ChecklistOverviewItem,
  SourceMapEntry,
} from "@/lib/dal/overview";
import {
  ArrowRightIcon,
  SearchIcon,
  BarChart3Icon,
  ListChecksIcon,
  LinkIcon,
  LockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  StarIcon,
  ZapIcon,
  ChevronDownIcon,
  MessageSquareIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Genel Bakis — Enriched Overview Dashboard (v2)
   9 sections: Hero, Sorular, Rakipler, AI Yanit, Trend,
   Gelisim, Kaynaklar, Genel Durum, CTA
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
  weeklyTrend: WeeklyTrendPoint[];
  checklistProgress: ChecklistProgress;
  totalScanCount: number;
  totalSourceCount: number;
  plan: string;
  bestPrompts: PromptSummaryItem[];
  worstPrompts: PromptSummaryItem[];
  aiResponseExcerpts: AiResponseExcerpt[];
  platformQAs: PlatformQA[];
  easiestChecklistItems: ChecklistOverviewItem[];
  highImpactChecklistItems: ChecklistOverviewItem[];
  sourceMap: SourceMapEntry[];
  brandDomain: string;
}

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];

const PLATFORM_LINE_COLORS: Record<PlatformKey, string> = {
  chatgpt: "#10a37f",
  claude: "#d97706",
  gemini: "#4285f4",
  perplexity: "#14b8a6",
  google_aio: "#ea4335",
};

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
  weeklyTrend,
  checklistProgress,
  totalScanCount,
  totalSourceCount,
  plan,
  bestPrompts,
  worstPrompts,
  aiResponseExcerpts,
  platformQAs,
  easiestChecklistItems,
  highImpactChecklistItems,
  sourceMap,
  brandDomain,
}: GenelBakisContentProps) {
  // A platform "knows" the brand if it mentions in at least 20% of questions (min 2)
  const platformsWithMentions = platformStats.filter(
    (p) => p.mentioned >= 2 && p.total > 0 && (p.mentioned / p.total) >= 0.2
  ).length;
  const mentionRate = totalResultCount > 0 ? Math.round((totalMentionCount / totalResultCount) * 100) : 0;
  const isPro = plan !== "free";
  const promptsWithMentions = bestPrompts.length;
  const activeSourceCount = sourceMap.filter((s) => s.exists).length;

  return (
    <div className="flex flex-col gap-0">
      {/* ══════════════════════════════════════════════════════
          1. HERO SCORE SECTION
          ══════════════════════════════════════════════════════ */}
      <HeroSection
        label="YAPAY ZEKA SENi NE KADAR TANIYOR?"
        title={`5 yapay zekadan\n`}
        animatedValue={platformsWithMentions}
        titleAfter="'si seni tanıyor"
        subtitle={`${activePromptCount} soruda, ${totalMentionCount} tanesinde seni öneriyor${lastScanTimeAgo ? ` · Son tarama: ${lastScanTimeAgo}` : ""}`}
      >
        {/* Large progress indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#111"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(mentionRate / 100) * 534} 534`}
                transform="rotate(-90 100 100)"
                style={{ transition: "stroke-dasharray 1.5s ease" }}
              />
            </svg>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span className="text-[32px] sm:text-[40px]" style={{ fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>
                %<AnimatedNumber value={mentionRate} />
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                bahsedilme oranı
              </span>
            </div>
          </div>
        </div>
      </HeroSection>

      {/* ── Platform cards row ──────────────────────────── */}
      <PageSection className="mt-2">
        <Stagger className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5 sm:gap-3.5 sm:pb-0" staggerMs={80}>
          {platformStats.map((stat) => {
            const color = getPlatformColor(stat.platform);
            const displayName = getPlatformDisplayName(stat.platform);
            const isActive = stat.mentioned > 0;
            const pct = stat.total > 0 ? Math.round((stat.mentioned / stat.total) * 100) : 0;

            return (
              <div
                key={stat.platform}
                className="kinde-card p-4 sm:p-5 lg:p-6 cursor-default min-w-[160px] sm:min-w-0 shrink-0 sm:shrink"
                style={{
                  borderColor: isActive ? `${color}30` : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <PlatformLogo
                    platform={stat.platform}
                    size={36}
                    mentioned={isActive}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? "#22c55e" : "#ef4444",
                      background: isActive ? "#f0fdf4" : "#fef2f2",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {isActive ? `%${pct}` : "0"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                    marginTop: 12,
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: isActive ? "var(--foreground)" : "#ddd",
                    marginTop: 2,
                    lineHeight: 1,
                  }}
                >
                  {stat.mentioned}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--muted-foreground)" }}>/{stat.total}</span>
                </p>
                {/* Mini progress bar */}
                <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "#f0f0f0", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: isActive ? color : "#e5e5e5",
                      borderRadius: 2,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    marginTop: 6,
                  }}
                >
                  {isActive
<<<<<<< Updated upstream
                    ? `${stat.total} sorunun ${stat.mentioned}'${stat.mentioned > 1 ? "i" : "u"}nde öneriyor`
                    : "Henüz tanımıyor"}
=======
                    ? `${stat.mentioned} soruda seni öneriyor`
                    : "Henüz seni tanımıyor"}
>>>>>>> Stashed changes
                </p>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ══════════════════════════════════════════════════════
          2. SORULAR OZETi (Prompt Summary)
          ══════════════════════════════════════════════════════ */}
      {(bestPrompts.length > 0 || worstPrompts.length > 0) && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Sorularda durum"
            subtitle="Yapay zekalara sorulan sorularda ne kadar çıkıyorsun?"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Best performing prompts */}
            {bestPrompts.length > 0 && (
              <div className="kinde-card p-4 sm:p-6 lg:p-7 cursor-default">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: 32, height: 32, background: "#f0fdf4" }}
                  >
                    <CheckCircle2Icon className="size-4" style={{ color: "#22c55e" }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                    En çok çıktığın sorular
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {bestPrompts.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#22c55e",
                          minWidth: 20,
                          marginTop: 2,
                        }}
                      >
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.4 }}>
                          &ldquo;{p.promptText}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>
                            {p.mentionedPlatforms}/{p.totalPlatforms} platformda
                          </span>
                          <div className="flex items-center gap-1">
                            {PLATFORMS.map((plat) => (
                              <PlatformLogo
                                key={plat}
                                platform={plat}
                                size={16}
                                mentioned={!!p.platformResults[plat]}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worst performing prompts */}
            {worstPrompts.length > 0 && (
              <div className="kinde-card p-4 sm:p-6 lg:p-7 cursor-default">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: 32, height: 32, background: "#fef2f2" }}
                  >
                    <XCircleIcon className="size-4" style={{ color: "#ef4444" }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                    Hiç çıkamadığın sorular
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {worstPrompts.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#ef4444",
                          minWidth: 20,
                          marginTop: 2,
                        }}
                      >
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.4 }}>
                          &ldquo;{p.promptText}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}>
                            0/{p.totalPlatforms} platformda
                          </span>
                          <div className="flex items-center gap-1">
                            {PLATFORMS.map((plat) => (
                              <PlatformLogo
                                key={plat}
                                platform={plat}
                                size={16}
                                mentioned={false}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/dashboard/sorular"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Tüm soruları gör <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          3. SENiN YERiNE KiM — EXPANDED (Top 5 Competitors)
          ══════════════════════════════════════════════════════ */}
      {competitorRanking.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Senin yerine kim öneriliyor?"
<<<<<<< Updated upstream
            subtitle={`Yapay zekaların önerdiği ${competitorRanking.filter((c) => !c.isUser).length} firma${competitorRanking.some((c) => c.isUser) ? ` — sen ${competitorRanking.findIndex((c) => c.isUser) + 1}. sıradasın` : ""}`}
=======
            subtitle={`Yapay zekaların önerdiği ${competitorRanking.length} firma — sen ${competitorRanking.findIndex((c) => c.isUser) + 1}. sıradasın`}
>>>>>>> Stashed changes
          />
          <div className="kinde-card p-4 sm:p-6 lg:p-8" style={{ cursor: "default" }}>
            <div className="flex flex-col gap-4 sm:gap-5">
              {competitorRanking.slice(0, 10).map((entry, i) => {
                const maxMentions = Math.max(
                  ...competitorRanking.slice(0, 10).map((r) => r.mentionCount),
                  1
                );
                const pct = (entry.mentionCount / maxMentions) * 100;

                return (
                  <div
                    key={entry.name}
                    style={{
                      padding: entry.isUser ? "12px 16px" : undefined,
                      background: entry.isUser ? "#f8f8f8" : undefined,
                      borderRadius: entry.isUser ? 12 : undefined,
                      border: entry.isUser ? "1px solid #e5e5e5" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: entry.isUser ? "#111" : i === 0 ? "#fbbf24" : "#f0f0f0",
                          color: entry.isUser ? "#fff" : i === 0 ? "#78350f" : "#999",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      {/* Name + domain */}
                      <div className="flex flex-col min-w-0" style={{ width: 140, flexShrink: 0 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: entry.isUser ? 700 : 500,
                            color: entry.isUser ? "var(--foreground)" : "var(--muted-foreground)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {entry.isUser ? `${entry.name} (Sen)` : entry.name}
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="flex-1 hidden sm:block">
                        <AnimBar
                          percent={pct}
                          color={entry.isUser ? "#111" : i === 0 ? "#fbbf24" : "#d4d4d4"}
                          height={entry.isUser ? 10 : 8}
                          delay={i * 100}
                        />
                      </div>
                      {/* Mention count */}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: entry.isUser ? "var(--foreground)" : "var(--muted-foreground)",
                          width: 40,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {entry.mentionCount}
                      </span>
                    </div>
                    {/* Per-platform mini dots */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-2" style={{ paddingLeft: 40 }}>
                      {PLATFORMS.map((p) => {
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
            <div className="mt-6 text-right">
              <Link
                href="/dashboard/rakipler"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Detaylı rakip analizi <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          4. YAPAY ZEKA NE DiYOR? (AI Response — Per-Platform Q&A)
          ══════════════════════════════════════════════════════ */}
      {platformQAs.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
<<<<<<< Updated upstream
            title="Yapay zeka senden nasil bahsediyor?"
=======
            title="Yapay zeka senden nasıl bahsediyor?"
>>>>>>> Stashed changes
            subtitle="Seni öneren platformların gerçek yanıtlarından örnekler"
          />
          <PlatformQASection platformQAs={platformQAs} />
          <div className="mt-4 text-right">
            <Link
              href="/dashboard/sorular"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Tüm yanıtları gör <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          5. HAFTALIK TREND CHART (keep existing blur for Free)
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Haftalık trend"
          subtitle="Son 4 haftada yapay zekaların seni ne kadar tanıdığı"
        />
        {isPro ? (
          <div className="kinde-card p-4 sm:p-6 lg:p-8" style={{ cursor: "default" }}>
            {weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: "#999" }}
                    axisLine={{ stroke: "#eee" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#999" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `%${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value: number, name: string) => [
                      `%${value}`,
                      getPlatformDisplayName(name),
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: 12, color: "#666" }}>
                        {getPlatformDisplayName(value)}
                      </span>
                    )}
                  />
                  {PLATFORMS.map((p) => (
                    <Line
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={PLATFORM_LINE_COLORS[p]}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: PLATFORM_LINE_COLORS[p] }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Henüz yeterli veri yok. Birkaç tarama sonrasında trend grafiğini göreceksin.
              </div>
            )}
          </div>
        ) : (
          <div className="kinde-card p-6 lg:p-8 relative overflow-hidden" style={{ cursor: "default" }}>
            <div style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}>
              <div style={{ height: 280, display: "flex", alignItems: "flex-end", gap: 4 }}>
                {[40, 55, 48, 62, 70, 58, 75, 80, 65, 85, 72, 90].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      background: i % 2 === 0 ? "#e0e0e0" : "#d0d0d0",
                      borderRadius: 4,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <LockIcon className="size-8 text-muted-foreground mb-3" />
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", textAlign: "center" }}>
                Haftalık trend takibi için Pro&apos;ya geç
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, textAlign: "center" }}>
                Hangi yapay zeka seni daha fazla tanıyor, haftaya göre gör
              </p>
              <Link
                href="/dashboard/paketler"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-[13px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Pro&apos;ya gec <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </PageSection>

      {/* ══════════════════════════════════════════════════════
<<<<<<< Updated upstream
          6. GELiSiM PLANI OZETi (Professional Single Card)
=======
          6. GELiSiM PLANI OZETi (Checklist — Unified Professional Design)
>>>>>>> Stashed changes
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Gelişim planın"
          subtitle={`${checklistProgress.total || 22} adımdan ${checklistProgress.completed} tamamlandı`}
        />
        <div className="kinde-card p-5 sm:p-6 lg:p-8 cursor-default">
<<<<<<< Updated upstream
          {/* Top: Progress + CTA */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 44, height: 44, background: "#f5f5f5" }}
              >
                <ListChecksIcon className="size-5" />
=======
          {/* Progress header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #111 0%, #333 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ListChecksIcon className="size-5 text-white" />
>>>>>>> Stashed changes
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>
                  %{checklistProgress.total > 0 ? Math.round((checklistProgress.completed / checklistProgress.total) * 100) : 0}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                  tamamlandı
                </p>
<<<<<<< Updated upstream
              </div>
            </div>
            <Link
              href="/dashboard/gelisim"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Planı gör <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>

          {/* Progress bar */}
          <AnimBar
            percent={checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}
            color="#22c55e"
            height={6}
          />

          {/* Top 3 priority items */}
          <div className="flex flex-col gap-0 mt-5">
            {[...easiestChecklistItems, ...highImpactChecklistItems]
              .filter((item, i, arr) => arr.findIndex((a) => a.simpleTitle === item.simpleTitle) === i)
              .slice(0, 3)
              .map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={{ borderTop: i > 0 ? "1px solid #f0f0f0" : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                      {item.simpleTitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.estimatedTime && (
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {item.estimatedTime}
                      </span>
                    )}
                    {item.impact === "HIGH" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#7c3aed",
                          background: "#ede9fe",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        Yüksek Etki
                      </span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <div
                          key={si}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: si < item.feasibilityScore ? "#d97706" : "#e5e5e5",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Motivation text */}
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 12, textAlign: "center" }}>
            İlk adımı atarak yapay zekalarda daha görünür ol.
          </p>
=======
              </div>
            </div>
            <Link
              href="/dashboard/gelisim"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[12px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Planı gör <ArrowRightIcon className="size-3" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-4 mb-6">
            <AnimBar
              percent={checklistProgress.total > 0 ? (checklistProgress.completed / checklistProgress.total) * 100 : 0}
              color="#111"
              height={6}
            />
          </div>

          {/* Combined checklist items — deduplicated, unified list */}
          {(() => {
            // Merge easiest + high impact, deduplicate by title, max 5
            const seen = new Set<string>();
            const allItems: { title: string; time: string | null; impact: string; feasibility: number }[] = [];
            for (const item of [...easiestChecklistItems, ...highImpactChecklistItems]) {
              if (seen.has(item.simpleTitle)) continue;
              seen.add(item.simpleTitle);
              allItems.push({
                title: item.simpleTitle,
                time: item.estimatedTime,
                impact: item.impact,
                feasibility: item.feasibilityScore,
              });
            }
            return (
              <div className="flex flex-col gap-0">
                {allItems.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3"
                    style={{
                      borderBottom: i < allItems.length - 1 && i < 4 ? "1px solid #f0f0f0" : undefined,
                    }}
                  >
                    {/* Step number */}
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#f5f5f5",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
                        {item.title}
                      </p>
                    </div>
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.time && (
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                          {item.time}
                        </span>
                      )}
                      {item.impact === "HIGH" && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#7c3aed",
                            background: "#ede9fe",
                            padding: "2px 8px",
                            borderRadius: 6,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Yüksek Etki
                        </span>
                      )}
                      <div className="hidden sm:flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <div
                            key={si}
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: si < item.feasibility ? "#d97706" : "#e5e5e5",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {checklistProgress.completed === 0 && (
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 12, textAlign: "center" }}>
              İlk adımı atarak yapay zekalarda daha görünür ol.
            </p>
          )}
>>>>>>> Stashed changes
        </div>
      </PageSection>

      {/* ══════════════════════════════════════════════════════
          7. KAYNAK HARiTASI OZETi (Source Map)
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Yapay zeka seni nereden öğrenmiş?"
          subtitle={`Aktif kaynaklar: ${activeSourceCount}/${sourceMap.length}`}
        />
        <div className="kinde-card p-4 sm:p-6 lg:p-7 cursor-default">
          <div className="flex flex-col gap-3">
            {sourceMap.map((source, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: source.exists ? "#f0fdf4" : "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {source.exists ? (
                    <CheckCircle2Icon className="size-3.5" style={{ color: "#22c55e" }} />
                  ) : (
                    <XCircleIcon className="size-3.5" style={{ color: "#ef4444" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: source.exists ? 600 : 400,
                      color: source.exists ? "var(--foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {source.domain}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: source.exists ? "#22c55e" : "#ef4444",
                  }}
                >
                  {source.exists ? "Aktif" : "Yok"}
                </span>
              </div>
            ))}
          </div>
          {activeSourceCount < sourceMap.length && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "#fffbeb",
                borderRadius: 10,
                fontSize: 12,
                color: "#92400e",
                lineHeight: 1.5,
              }}
            >
              Eksik kaynaklar eklendikçe yapay zekaların seni tanıma oranı artar.
            </div>
          )}
          <div className="mt-4 text-right">
            <Link
              href="/dashboard/kaynaklar"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Tüm kaynakları gör <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </PageSection>

      {/* ══════════════════════════════════════════════════════
          8. GENEL DURUM STATS (Enriched)
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Genel durum"
          subtitle="Yapay zeka görünürlüğünün özeti"
        />
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" staggerMs={80}>
          <EnrichedStatCard
            icon={<SearchIcon className="size-4" />}
            label="Analiz edilen soru"
            value={activePromptCount}
<<<<<<< Updated upstream
            description={`${activePromptCount} soru analiz edildi, ${promptsWithMentions > 0 ? `${totalMentionCount}'inde çıkıyorsun` : "henüz çıkamıyorsun"}`}
            linkHref="/dashboard/sorular"
            linkText="Soruları gör"
          />
          <EnrichedStatCard
            icon={<BarChart3Icon className="size-4" />}
            label="Tarama sayısı"
            value={totalScanCount}
            description={totalScanCount === 1 ? "İlk tarama tamamlandı" : `${totalScanCount} tarama yapıldı`}
          />
          <EnrichedStatCard
            icon={<ListChecksIcon className="size-4" />}
            label="Gelişim planı"
=======
            description={promptsWithMentions > 0
              ? `${mentionRate}% bahsedilme oranıyla ${totalMentionCount} kez önerildin`
              : `${activePromptCount} soru 5 yapay zekaya soruldu`}
            linkHref="/dashboard/sorular"
            linkText="Detaylı analiz"
          />
          <EnrichedStatCard
            icon={<BarChart3Icon className="size-4" />}
            label="Yapılan tarama"
            value={totalScanCount}
            description={totalScanCount === 1
              ? "İlk tarama tamamlandı — Pro ile haftalık takip yap"
              : `${totalScanCount} tarama ile trendler ölçülüyor`}
          />
          <EnrichedStatCard
            icon={<ListChecksIcon className="size-4" />}
            label="Gelişim adımları"
>>>>>>> Stashed changes
            value={checklistProgress.completed}
            suffix={`/${checklistProgress.total || 22}`}
            description={
              checklistProgress.completed === 0
<<<<<<< Updated upstream
                ? "Henüz başlamadın — ilk adımı at"
                : `${checklistProgress.completed} adım tamamlandı`
=======
                ? `${checklistProgress.total || 22} adım seni bekliyor — hemen başla`
                : `${checklistProgress.total - checklistProgress.completed} adım kaldı`
>>>>>>> Stashed changes
            }
            linkHref="/dashboard/gelisim"
            linkText="Planı gör"
          />
          <EnrichedStatCard
            icon={<LinkIcon className="size-4" />}
<<<<<<< Updated upstream
            label="Kaynak sayısı"
            value={totalSourceCount}
            description={`Yapay zekalar ${totalSourceCount} farklı kaynağa referans verdi`}
            linkHref="/dashboard/kaynaklar"
            linkText="Kaynakları gör"
=======
            label="Bulunan kaynak"
            value={totalSourceCount}
            description={`${activeSourceCount} aktif kaynak. ${activeSourceCount < sourceMap.length ? `${sourceMap.length - activeSourceCount} kaynak eksik.` : "Tüm kaynaklar mevcut."}`}
            linkHref="/dashboard/kaynaklar"
            linkText="Kaynakları yönet"
>>>>>>> Stashed changes
          />
        </Stagger>
      </PageSection>

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="trend" plan={plan} />
      </div>

      {/* ══════════════════════════════════════════════════════
          9. DUAL CTA (keep existing)
          ══════════════════════════════════════════════════════ */}
      <DualCTA
        contextMessage="Durumun her hafta değişiyor. Takipte kal."
        platformCount={platformsWithMentions}
        plan={plan}
      />
    </div>
  );
}

/* ── Platform Q&A Section ────────────────────────────── */
const SENTIMENT_MAP = {
  pozitif: { label: "Pozitif", color: "#22c55e", bg: "#f0fdf4" },
  nötr: { label: "Nötr", color: "#d97706", bg: "#fffbeb" },
  negatif: { label: "Negatif", color: "#ef4444", bg: "#fef2f2" },
} as const;

function PlatformQASection({ platformQAs }: { platformQAs: PlatformQA[] }) {
  // Group by question text
  const grouped = useMemo(() => {
    const map = new Map<string, PlatformQA[]>();
    for (const qa of platformQAs) {
      const existing = map.get(qa.promptText) ?? [];
      existing.push(qa);
      map.set(qa.promptText, existing);
    }
    return Array.from(map.entries());
  }, [platformQAs]);

  // Show first 3 questions
  return (
    <div className="flex flex-col gap-4">
      {grouped.slice(0, 3).map(([question, qas], idx) => (
        <QACard key={idx} question={question} qas={qas} />
      ))}
    </div>
  );
}

function QACard({ question, qas }: { question: string; qas: PlatformQA[] }) {
  const [expanded, setExpanded] = useState(false);
  const mentionedCount = qas.filter((q) => q.mentioned).length;

  return (
    <div className="kinde-card overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 lg:p-6 cursor-pointer hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareIcon className="size-4 text-muted-foreground" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>
            SORULAN SORU
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.4 }}>
          &ldquo;{question}&rdquo;
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {PLATFORMS.map((p) => {
              const qa = qas.find((q) => q.platform === p);
              const mentioned = qa?.mentioned ?? false;
              return (
                <div key={p} className="flex items-center gap-0.5">
                  <PlatformLogo platform={p} size={22} mentioned={mentioned} />
                  {mentioned ? (
                    <CheckCircle2Icon className="size-3" style={{ color: "#22c55e" }} />
                  ) : (
                    <XCircleIcon className="size-3" style={{ color: "#ddd" }} />
                  )}
                </div>
              );
            })}
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", marginLeft: 4 }}>
              {mentionedCount}/{qas.length}
            </span>
          </div>
          <ChevronDownIcon
            className="size-5 text-muted-foreground transition-transform"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      {/* Expanded: per-platform responses */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
          {PLATFORMS.map((p) => {
            const qa = qas.find((q) => q.platform === p);
            if (!qa) return null;
            return <QAPlatformRow key={p} qa={qa} />;
          })}
        </div>
      )}
    </div>
  );
}

/** Detect garbled/error responses (base64-like, [ERROR] prefix, etc.) */
function isGarbledResponse(text: string): boolean {
  if (!text) return false;
  if (text.startsWith("ERROR") || text.startsWith("error") || text.startsWith("[ERROR]")) return true;
  // "AI Bakışı mevcut değil" = Google AIO no-result
  if (text.includes("mevcut değil") && text.length < 100) return true;
  // Strip URLs before checking (URLs have long "words" but that's normal)
  const textNoUrls = text.replace(/https?:\/\/[^\s)]+/g, "URL");
  // Detect base64/hash-like strings: long sequences without spaces (after URL removal)
  const words = textNoUrls.split(/\s+/);
  const longNonsenseWords = words.filter((w) => w.length > 40 && !/^URL$/.test(w));
  if (longNonsenseWords.length >= 2) return true;
  // Very few spaces relative to length = garbled (after URL removal)
  const spaceCount = (textNoUrls.match(/\s/g) || []).length;
  if (textNoUrls.length > 50 && spaceCount / textNoUrls.length < 0.02) return true;
  return false;
}

function QAPlatformRow({ qa }: { qa: PlatformQA }) {
  const [showFull, setShowFull] = useState(false);
  const color = getPlatformColor(qa.platform);
  const name = getPlatformDisplayName(qa.platform);
  const garbled = isGarbledResponse(qa.fullAnswer);
  const cleanAnswer = garbled ? "" : qa.fullAnswer;
  const isLong = cleanAnswer.length > 250;
  const displayText = showFull ? cleanAnswer : cleanAnswer.slice(0, 250) + (isLong ? "..." : "");
  const sentimentInfo = qa.sentiment ? SENTIMENT_MAP[qa.sentiment] : null;

  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
      {/* Platform header */}
      <div className="flex items-center gap-2 mb-2">
        <PlatformLogo platform={qa.platform} size={22} mentioned={qa.mentioned} />
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{name}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: qa.mentioned ? "#22c55e" : "#ef4444",
            background: qa.mentioned ? "#f0fdf4" : "#fef2f2",
            padding: "1px 8px",
            borderRadius: 6,
          }}
        >
          {qa.mentioned ? "Bahsetti" : "Bahsetmedi"}
        </span>
        {sentimentInfo && qa.mentioned && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: sentimentInfo.color,
              background: sentimentInfo.bg,
              padding: "1px 8px",
              borderRadius: 6,
            }}
          >
            {sentimentInfo.label}
          </span>
        )}
      </div>

      {/* Response text */}
      {garbled ? (
        <div style={{ marginLeft: 34 }}>
          <p
            style={{
              fontSize: 12,
              color: "#ef4444",
              background: "#fef2f2",
              borderRadius: 8,
              padding: "10px 14px",
              borderLeft: "3px solid #fca5a5",
              fontStyle: "italic",
            }}
          >
            Bu platformdan hatalı yanıt alındı. Sonraki taramada tekrar denenecek.
          </p>
        </div>
      ) : cleanAnswer ? (
        <div style={{ marginLeft: 34 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground)",
              lineHeight: 1.6,
              background: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              borderLeft: `3px solid ${qa.mentioned ? color : "#e5e5e5"}`,
            }}
          >
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={() => setShowFull(!showFull)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color,
                marginTop: 4,
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              {showFull ? "Kısalt" : "Devamını gör"}
            </button>
          )}
        </div>
      ) : (
        <p style={{ marginLeft: 34, fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic" }}>
          Yanıt alınamadı.
        </p>
      )}

      {/* Competitors */}
      {qa.competitors.length > 0 && (
        <div style={{ marginLeft: 34, marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
            Önerilen rakipler:
          </span>
          {qa.competitors.slice(0, 6).map((comp) => (
            <span
              key={comp}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#f5f5f5",
                color: "#555",
              }}
            >
              {comp}
            </span>
          ))}
          {qa.competitors.length > 6 && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              +{qa.competitors.length - 6}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Enriched Stat Card ──────────────────────────────── */
function EnrichedStatCard({
  icon,
  label,
  value,
  suffix,
  description,
  linkHref,
  linkText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  description: string;
  linkHref?: string;
  linkText?: string;
}) {
  return (
    <div className="kinde-card p-4 sm:p-5 lg:p-6 cursor-default flex flex-col">
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ width: 34, height: 34, background: "#f5f5f5" }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--muted-foreground)",
          marginTop: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        className="text-[24px] sm:text-[28px]"
        style={{
          fontWeight: 800,
          color: "var(--foreground)",
          marginTop: 2,
          lineHeight: 1.2,
        }}
      >
        <AnimatedNumber value={value} />
        {suffix && (
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)" }}>
            {suffix}
          </span>
        )}
      </p>
      <p
        style={{
          fontSize: 12,
          color: "var(--muted-foreground)",
          marginTop: 6,
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {description}
      </p>
      {linkHref && linkText && (
        <Link
          href={linkHref}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {linkText} <ArrowRightIcon className="size-3" />
        </Link>
      )}
    </div>
  );
}
