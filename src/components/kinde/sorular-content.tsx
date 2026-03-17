"use client";

import { useState, useMemo } from "react";
import { HeroSection } from "./hero-section";
import { FadeIn, Stagger, PageSection, SectionTitle } from "./animations";
import { PlatformLogo, getPlatformDisplayName } from "./ai-logos";
import { ProUpgradeCard } from "@/components/pro-upgrade-card";
import type { PromptItemData } from "@/lib/dal/prompts";
import type { PlatformKey } from "@/lib/types";

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

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity"];

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

      {/* ── SORU KARTLARI (2-col grid) ────────────────── */}
      <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" staggerMs={60}>
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
    </div>
  );
}

/* ── Prompt Card ──────────────────────────────────────── */
function PromptCard({ item }: { item: PromptItemData }) {
  const mentionCount = Object.values(item.modelResults).filter(Boolean).length;

  return (
    <div className="kinde-card p-5 lg:p-6 flex flex-col gap-3">
      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5">
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
          fontSize: 15,
          fontWeight: 600,
          color: "var(--foreground)",
          lineHeight: 1.4,
        }}
      >
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Platform logos row */}
      <div className="flex items-center gap-2">
        {PLATFORMS.map((platform) => (
          <PlatformLogo
            key={platform}
            platform={platform}
            size={28}
            mentioned={item.modelResults[platform]}
          />
        ))}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--foreground)",
            marginLeft: 4,
          }}
        >
          {mentionCount}/4
        </span>
      </div>

      {/* Top competitor */}
      {item.topCompetitor && item.topCompetitor !== "—" && (
        <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Senin yerine: <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{item.topCompetitor}</span>
        </p>
      )}
    </div>
  );
}
