"use client";

import { useState } from "react";
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
} from "@/lib/dal/overview";
import {
  ArrowRightIcon,
  DownloadIcon,
  FileTextIcon,
  SearchIcon,
  BarChart3Icon,
  ListChecksIcon,
  LinkIcon,
  LockIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Genel Bakis — Enriched Overview Dashboard
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
}: GenelBakisContentProps) {
  const platformsWithMentions = platformStats.filter((p) => p.mentioned > 0).length;
  const mentionRate = totalResultCount > 0 ? Math.round((totalMentionCount / totalResultCount) * 100) : 0;
  const isPro = plan !== "free";

  return (
    <div className="flex flex-col gap-0">
      {/* ══════════════════════════════════════════════════════
          1. HERO SCORE SECTION
          ══════════════════════════════════════════════════════ */}
      <HeroSection
        label="YAPAY ZEKA SENi NE KADAR TANIYOR?"
        title={`5 yapay zekadan\n`}
        animatedValue={platformsWithMentions}
        titleAfter="'si seni taniyor"
        subtitle={`${activePromptCount} soruda, ${totalMentionCount} tanesinde seni oneriyor${lastScanTimeAgo ? ` · Son tarama: ${lastScanTimeAgo}` : ""}`}
      >
        {/* Large progress indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="12"
              />
              {/* Progress circle */}
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
                bahsedilme orani
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

            return (
              <div
                key={stat.platform}
                className="kinde-card p-4 sm:p-5 lg:p-7 cursor-default min-w-[160px] sm:min-w-0 shrink-0 sm:shrink"
                style={{
                  borderColor: isActive ? `${color}30` : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <PlatformLogo
                    platform={stat.platform}
                    size={36}
                    mentioned={isActive}
                  />
                  {/* Status dot */}
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: isActive ? "#22c55e" : "#ef4444",
                      flexShrink: 0,
                    }}
                  />
                </div>
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
                    ? `${stat.total} sorunun ${stat.mentioned}'${stat.mentioned > 1 ? "i" : "u"}nde oneriyor`
                    : "Henuz tanimiyor"}
                </p>
              </div>
            );
          })}
        </Stagger>
      </PageSection>

      {/* ══════════════════════════════════════════════════════
          2. 4-WEEK TREND CHART
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Haftalik trend"
          subtitle="Son 4 haftada yapay zekalarin seni ne kadar tanidigi"
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
                Henuz yeterli veri yok. Birkaç tarama sonrasinda trend grafigini goreceksin.
              </div>
            )}
          </div>
        ) : (
          /* FREE users see blurred placeholder */
          <div className="kinde-card p-6 lg:p-8 relative overflow-hidden" style={{ cursor: "default" }}>
            {/* Fake blurred chart */}
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
            {/* Overlay CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <LockIcon className="size-8 text-muted-foreground mb-3" />
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", textAlign: "center" }}>
                Haftalik trend takibi icin Pro&apos;ya gec
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, textAlign: "center" }}>
                Hangi yapay zeka seni daha fazla taniyor, haftaya gore gor
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
          3. SENiN YERiNE KiM SUMMARY
          ══════════════════════════════════════════════════════ */}
      {competitorRanking.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Senin yerine kim oneriliyor?"
            subtitle="Yapay zekalarin senin yerine onerdigi ilk 3 firma"
          />
          <div className="kinde-card p-4 sm:p-6 lg:p-8" style={{ cursor: "default" }}>
            <div className="flex flex-col gap-4 sm:gap-5">
              {competitorRanking.slice(0, 3).map((entry, i) => {
                const maxMentions = Math.max(
                  ...competitorRanking.slice(0, 3).map((r) => r.mentionCount),
                  1
                );
                const pct = (entry.mentionCount / maxMentions) * 100;

                return (
                  <div key={entry.name}>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: entry.isUser ? "#111" : "#f0f0f0",
                          color: entry.isUser ? "#fff" : "#999",
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
                      <span
                        className="hidden sm:inline"
                        style={{
                          width: 120,
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
                      <span
                        className="sm:hidden"
                        style={{
                          width: 80,
                          fontSize: 12,
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
                    {/* Per-platform mini logos */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 overflow-x-auto" style={{ paddingLeft: 36 }}>
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
            <div className="mt-5 text-right">
              <Link
                href="/dashboard/rakipler"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Detayli karsilastirma <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          4. EN ONEMLi AKSiYON (Top Priority Action)
          ══════════════════════════════════════════════════════ */}
      {priorityActions.length > 0 && (
        <PageSection className="mt-12">
          <SectionTitle
            title="Simdi ne yapmalisin?"
            subtitle="En cok etki yaratacak adim"
          />
          <div
            className="kinde-card p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start gap-3 sm:gap-4"
            style={{ cursor: "default" }}
          >
            <div
              className="flex items-center justify-center rounded-2xl shrink-0"
              style={{
                width: 48,
                height: 48,
                background: "#fef3c7",
              }}
            >
              <span style={{ fontSize: 22 }}>1</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                {priorityActions[0].title}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, lineHeight: 1.6 }}>
                {priorityActions[0].impact}
              </p>
              <Link
                href="/dashboard/gelisim"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-2.5 text-[13px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Basla <ArrowRightIcon className="size-3.5" />
              </Link>
            </div>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          5. AYLIK RAPOR CARD (Pro only)
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle
          title="Aylik GEO Durum Raporun"
        />
        {isPro ? (
          <div
            className="kinde-card p-4 sm:p-6 lg:p-8"
            style={{ cursor: "default" }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="flex items-center justify-center rounded-2xl shrink-0"
                style={{ width: 48, height: 48, background: "#f0f0f0" }}
              >
                <FileTextIcon className="size-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>
                  Mart 2026 GEO Durum Raporun
                </p>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, lineHeight: 1.6 }}>
                  Gecen aya gore neler degisti, hangi yapay zekalar seni daha fazla taniyor,
                  rakiplerin ne yapti — hepsi tek bir raporda.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Link
                    href="/dashboard/aksiyon"
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-[12px] font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Raporun tamamini oku <ArrowRightIcon className="size-3" />
                  </Link>
                  <Link
                    href="/api/export/pdf"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <DownloadIcon className="size-3" />
                    PDF indir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="kinde-card p-6 lg:p-8 relative overflow-hidden"
            style={{ cursor: "default" }}
          >
            <div style={{ filter: "blur(4px)", opacity: 0.4, pointerEvents: "none" }}>
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-2xl shrink-0"
                  style={{ width: 48, height: 48, background: "#f0f0f0" }}
                >
                  <FileTextIcon className="size-5" />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700 }}>Mart 2026 GEO Durum Raporun</p>
                  <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
                    Gecen aya gore neler degisti, hangi yapay zekalar seni daha fazla taniyor...
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <LockIcon className="size-8 text-muted-foreground mb-3" />
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", textAlign: "center" }}>
                Aylik rapor Pro&apos;da
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4, textAlign: "center", maxWidth: 300 }}>
                Her ay otomatik hazirlanir. Rakip karsilastirmasi, ilerleme ozeti, PDF indirme.
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
          6. QUICK STATS ROW
          ══════════════════════════════════════════════════════ */}
      <PageSection className="mt-12">
        <SectionTitle title="Genel durum" />
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" staggerMs={80}>
          <QuickStatCard
            icon={<SearchIcon className="size-4" />}
            label="Toplam soru"
            value={activePromptCount}
          />
          <QuickStatCard
            icon={<BarChart3Icon className="size-4" />}
            label="Tarama sayisi"
            value={totalScanCount}
          />
          <QuickStatCard
            icon={<ListChecksIcon className="size-4" />}
            label="Gelisim plani"
            value={checklistProgress.completed}
            suffix={`/${checklistProgress.total || 22}`}
          />
          <QuickStatCard
            icon={<LinkIcon className="size-4" />}
            label="Kaynak sayisi"
            value={totalSourceCount}
          />
        </Stagger>
      </PageSection>

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="trend" plan={plan} />
      </div>

      {/* ── DUAL CTA ──────────────────────────────────── */}
      <DualCTA
        contextMessage="Durumun her hafta degisiyor. Takipte kal."
        platformCount={platformsWithMentions}
        plan={plan}
      />
    </div>
  );
}

/* ── Quick Stat Card ──────────────────────────────────── */
function QuickStatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="kinde-card p-4 sm:p-5 lg:p-6 cursor-default">
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
    </div>
  );
}
