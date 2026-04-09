"use client";

import { useState, useMemo } from "react";
import { HeroSection } from "./hero-section";
import { FadeIn, Stagger, PageSection } from "./animations";
import { PlatformLogo, getPlatformDisplayName, getPlatformColor } from "./ai-logos";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import { DualCTA } from "./dual-cta";
import type { PromptItemData, PlatformResult } from "@/lib/dal/prompts";
import type { PlatformKey } from "@/lib/types";
import {
  ChevronDownIcon,
  CheckCircle2Icon,
  XCircleIcon,
  UsersIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────
   Sorular — Kinde.com Landing Page Style
   ───────────────────────────────────────────────────── */

interface SorularContentProps {
  promptItems: PromptItemData[];
  activeCount: number;
  plan: string;
}

const CATEGORIES = [
  { key: "all", label: "Tümü" },
  { key: "oneri", label: "Öneri" },
  { key: "karsilastirma", label: "Karşılaştırma" },
  { key: "fiyat", label: "Fiyat" },
  { key: "genel", label: "Genel" },
];

function matchCategory(item: PromptItemData, key: string): boolean {
  if (key === "all") return true;
  const cat = (item.category ?? "genel").toLowerCase();
  const tags = item.tags.map((t) => t.toLowerCase());
  if (key === "oneri") return cat.includes("öner") || cat.includes("oneri") || tags.some((t) => t.includes("öner") || t.includes("oneri"));
  if (key === "karsilastirma") return cat.includes("karşılaştır") || cat.includes("karsilastir") || tags.some((t) => t.includes("karşılaştır") || t.includes("karsilastir") || t.includes("vs"));
  if (key === "fiyat") return cat.includes("fiyat") || tags.some((t) => t.includes("fiyat") || t.includes("ücret") || t.includes("maliyet"));
  if (key === "genel") return cat === "genel" || (!cat);
  return true;
}

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];

/** Strip markdown/URLs from AI response text for clean display */
function cleanText(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[_~|>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SENTIMENT_CONFIG = {
  pozitif: { label: "Pozitif", color: "#22c55e", bg: "#f0fdf4" },
  nötr: { label: "Nötr", color: "#d97706", bg: "#fffbeb" },
  negatif: { label: "Negatif", color: "#ef4444", bg: "#fef2f2" },
} as const;

export function SorularContent({
  promptItems,
  activeCount,
  plan,
}: SorularContentProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const mentionedCount = promptItems.filter(
    (p) => Object.values(p.modelResults).some(Boolean)
  ).length;

  const filtered = useMemo(
    () => promptItems.filter((p) => matchCategory(p, activeFilter)),
    [promptItems, activeFilter]
  );

  return (
    <div className="flex flex-col gap-0">
      {/* ── HERO ──────────────────────────────────────── */}
      <HeroSection
        label="SORU ANALİZİ"
        title={`${activeCount} sorunun `}
        animatedValue={mentionedCount}
        titleAfter={`'${mentionedCount > 1 ? "i" : "ü"}nde\nçıkıyorsun`}
      />

      {/* ── FILTER BUTTONS ────────────────────────────── */}
      <FadeIn className="flex flex-wrap items-center gap-2 justify-center mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveFilter(cat.key)}
            className="transition-all"
            style={{
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              border: activeFilter === cat.key ? "none" : "1px solid #e5e5e5",
              background: activeFilter === cat.key ? "#111" : "transparent",
              color: activeFilter === cat.key ? "#fff" : "#888",
              cursor: "pointer",
            }}
          >
            {cat.label}
          </button>
        ))}
      </FadeIn>

      {/* ── SORU KARTLARI (single column for richer cards) ── */}
      <Stagger className="flex flex-col gap-4" staggerMs={60}>
        {filtered.map((item) => (
          <PromptCard key={item.id} item={item} />
        ))}
      </Stagger>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          Bu kategoride soru bulunamadı.
        </div>
      )}

      {/* ── PRO CTA ───────────────────────────────────── */}
      <div className="mt-12">
        <ProUpgradeCard type="trend" plan={plan} />
      </div>

      {/* ── DUAL CTA ──────────────────────────────────── */}
      <DualCTA
        contextMessage="Bu sorularda ilerliyor musun? Haftalık takip et."
        plan={plan}
      />
    </div>
  );
}

/* ── Prompt Card (Expandable) ────────────────────────── */
function PromptCard({ item }: { item: PromptItemData }) {
  const [expanded, setExpanded] = useState(false);
  const mentionCount = Object.values(item.modelResults).filter(Boolean).length;

  // Build a map of platform -> result for quick lookup
  const resultMap = useMemo(() => {
    const map: Partial<Record<PlatformKey, PlatformResult>> = {};
    for (const r of item.platformResults) {
      map[r.platform] = r;
    }
    return map;
  }, [item.platformResults]);

  return (
    <div className="kinde-card overflow-hidden">
      {/* ── Card Header (always visible, clickable) ─── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 lg:p-6 flex flex-col gap-3 cursor-pointer hover:bg-[#fafafa] transition-colors"
      >
        {/* Tags + category */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#f5f5f5",
                color: "#666",
              }}
            >
              {tag}
            </span>
          ))}
          {item.category && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#111",
                color: "#fff",
              }}
            >
              {item.category}
            </span>
          )}
        </div>

        {/* Question text */}
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--foreground)",
            lineHeight: 1.4,
          }}
        >
          &ldquo;{item.text}&rdquo;
        </p>

        {/* Platform logos row + expand chevron */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {PLATFORMS.map((platform) => {
              const mentioned = item.modelResults[platform];
              return (
                <div key={platform} className="flex items-center gap-1">
                  <PlatformLogo
                    platform={platform}
                    size={26}
                    mentioned={mentioned}
                  />
                  {mentioned ? (
                    <CheckCircle2Icon className="size-3" style={{ color: "#22c55e" }} />
                  ) : (
                    <XCircleIcon className="size-3" style={{ color: "#ddd" }} />
                  )}
                </div>
              );
            })}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: mentionCount > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                marginLeft: 8,
              }}
            >
              {mentionCount}/{PLATFORMS.length}
            </span>
          </div>

          <ChevronDownIcon
            className="size-5 text-muted-foreground transition-transform"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
      </button>

      {/* ── Expanded Detail Section ─────────────────── */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          {/* Per-platform responses */}
          <div className="flex flex-col">
            {PLATFORMS.map((platform) => {
              const result = resultMap[platform];
              const mentioned = result?.mentioned ?? false;
              const color = getPlatformColor(platform);
              const name = getPlatformDisplayName(platform);

              return (
                <PlatformResponseRow
                  key={platform}
                  platform={platform}
                  name={name}
                  color={color}
                  mentioned={mentioned}
                  result={result}
                />
              );
            })}
          </div>

          {/* Top competitor summary */}
          {item.topCompetitor && item.topCompetitor !== "—" && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <UsersIcon className="size-4 text-muted-foreground" />
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                En çok önerilen rakip:{" "}
                <span style={{ fontWeight: 700, color: "var(--foreground)" }}>
                  {item.topCompetitor}
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Platform Response Row ───────────────────────────── */
function PlatformResponseRow({
  platform,
  name,
  color,
  mentioned,
  result,
}: {
  platform: string;
  name: string;
  color: string;
  mentioned: boolean;
  result?: PlatformResult;
}) {
  const [showFull, setShowFull] = useState(false);

  const rawText = result?.fullResponse ?? result?.excerpt ?? "";
  const isGarbled = rawText ? (() => {
    if (rawText.startsWith("ERROR") || rawText.startsWith("error") || rawText.startsWith("[ERROR]")) return true;
    if (rawText.includes("mevcut değil") && rawText.length < 100) return true;
    const noUrls = rawText.replace(/https?:\/\/[^\s)]+/g, "URL");
    const words = noUrls.split(/\s+/);
    if (words.filter((w: string) => w.length > 40 && w !== "URL").length >= 2) return true;
    const spaceCount = (noUrls.match(/\s/g) || []).length;
    if (noUrls.length > 50 && spaceCount / noUrls.length < 0.02) return true;
    return false;
  })() : false;
  const cleaned = isGarbled ? "" : (rawText ? cleanText(rawText) : "");
  const isLong = cleaned.length > 200;
  const displayText = showFull ? cleaned : cleaned.slice(0, 200) + (isLong ? "..." : "");

  const sentiment = result?.sentiment;
  const sentimentInfo = sentiment ? SENTIMENT_CONFIG[sentiment] : null;
  const competitors = result?.competitors ?? [];

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* Platform header */}
      <div className="flex items-center gap-2.5 mb-2">
        <PlatformLogo platform={platform} size={22} mentioned={mentioned} />
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {name}
        </span>
        {mentioned ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#22c55e",
              background: "#f0fdf4",
              padding: "1px 8px",
              borderRadius: 6,
            }}
          >
            Bahsetti
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#ef4444",
              background: "#fef2f2",
              padding: "1px 8px",
              borderRadius: 6,
            }}
          >
            Bahsetmedi
          </span>
        )}
        {sentimentInfo && mentioned && (
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
      {isGarbled ? (
        <div style={{ marginLeft: 34, marginTop: 4 }}>
          <p style={{ fontSize: 12, color: "#ef4444", background: "#fef2f2", borderRadius: 8, padding: "10px 14px", borderLeft: "3px solid #fca5a5", fontStyle: "italic" }}>
            Bu platformdan hatalı yanıt alındı. Sonraki taramada tekrar denenecek.
          </p>
        </div>
      ) : cleaned ? (
        <div style={{ marginLeft: 34, marginTop: 4 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground)",
              lineHeight: 1.6,
              fontStyle: "italic",
              background: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              borderLeft: `3px solid ${mentioned ? color : "#e5e5e5"}`,
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
      ) : null}

      {/* Competitors mentioned in this platform */}
      {competitors.length > 0 && mentioned && (
        <div
          style={{
            marginLeft: 34,
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>
            Rakipler:
          </span>
          {competitors.slice(0, 5).map((comp) => (
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
          {competitors.length > 5 && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              +{competitors.length - 5}
            </span>
          )}
        </div>
      )}

      {/* No response fallback */}
      {!cleaned && !mentioned && (
        <p
          style={{
            marginLeft: 34,
            fontSize: 12,
            color: "var(--muted-foreground)",
            fontStyle: "italic",
          }}
        >
          Bu platformda seni önermedi.
        </p>
      )}
    </div>
  );
}
