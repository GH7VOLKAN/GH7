"use client";

/**
 * TrackerView — Firma dashboard (Brief H-ext Aşama 3).
 *
 * Bölümler:
 * - Baseline skor (text-metric + progress bar)
 * - Platform durumu (5 platform, mention count + bar)
 * - Sorgu durumu (N sorgu, mention × platform count + tick)
 * - Sonraki rapor kartı (haftalık Pazartesi 08:00)
 */

import Link from "next/link";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { formatDate, formatPlatform } from "@/lib/templates/common/formatters";

export type TrackerPlatform = {
  key: string;
  mentioned: number;
  total: number;
};

export type TrackerQuery = {
  text: string;
  mentioned: number;
  total: number;
};

export type TrackerData = {
  score: number;
  scoreTotal: number;
  measuredAt: Date;
  totalQueries: number;
  platforms: TrackerPlatform[];
  queries: TrackerQuery[];
  strongestPlatforms: string[];
  weakestPlatforms: string[];
};

type Props = {
  data: TrackerData | null;
  brand: { slug: string; name: string };
  nextReportAt: Date;
};

export function TrackerView({ data, brand, nextReportAt }: Props) {
  if (!data) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">GH7 Tracker</div>
          <h1 className="text-h1">Henüz tarama verisi yok</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            İlk baseline skoru için bir analiz tamamlandıktan sonra tracker
            aktif olur.
          </p>
          <Link
            href={`/dashboard/${brand.slug}/insight`}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Insight&apos;a Git →
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const scorePercentage =
    data.scoreTotal > 0
      ? Math.round((data.score / data.scoreTotal) * 100)
      : 0;

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="text-label text-muted-foreground mb-6">GH7 Tracker</div>
        <h1 className="text-h1 mb-6">Haftalık Otomatik Takip</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {brand.name} için ilk baseline skorun hazır. Haftalık takip
          Pazartesi 08:00&apos;dan itibaren başlayacak.
        </p>
      </motion.div>

      {/* BASELINE SKORU */}
      <motion.section variants={pageItem} className="mb-20">
        <SectionHeading label="Baseline Skorun" />
        <div className="flex items-baseline gap-4">
          <span className="text-metric">{data.score}</span>
          <span className="text-2xl tabular-nums text-muted-foreground">
            / {data.scoreTotal}
          </span>
        </div>
        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {formatDate(data.measuredAt)} · İlk ölçüm
        </p>
      </motion.section>

      {/* PLATFORM DURUMU */}
      <motion.section variants={pageItem} className="mb-20">
        <SectionHeading label="Platform Durumu" />
        <div className="space-y-0">
          {data.platforms.map((p) => (
            <PlatformRow
              key={p.key}
              platformKey={p.key}
              mentioned={p.mentioned}
              total={p.total}
            />
          ))}
        </div>
        {(data.strongestPlatforms.length > 0 ||
          data.weakestPlatforms.length > 0) && (
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {data.strongestPlatforms.length > 0 && (
              <p>
                En güçlü olduğun:{" "}
                <span className="font-medium text-foreground">
                  {data.strongestPlatforms.map(formatPlatform).join(", ")}
                </span>
              </p>
            )}
            {data.weakestPlatforms.length > 0 && (
              <p>
                İyileştirme fırsatı:{" "}
                <span className="font-medium text-foreground">
                  {data.weakestPlatforms.map(formatPlatform).join(", ")}
                </span>
              </p>
            )}
          </div>
        )}
      </motion.section>

      {/* SORGU DURUMU */}
      <motion.section variants={pageItem} className="mb-20">
        <SectionHeading
          label={`Sorgu Durumu · ${data.totalQueries}`}
        />
        <div className="space-y-0">
          {data.queries.map((q, idx) => (
            <QueryRow
              key={idx}
              index={idx + 1}
              text={q.text}
              mentioned={q.mentioned}
              total={q.total}
            />
          ))}
        </div>
      </motion.section>

      {/* SONRAKI RAPOR */}
      <motion.section variants={pageItem}>
        <SectionHeading label="Sonraki Rapor" />
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">
              Pazartesi · 08:00
            </div>
            <div className="text-h3">{formatDate(nextReportAt)}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Haftalık raporunda yer alacaklar:
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>· Skor değişimi</li>
            <li>· Yeni mention&apos;lar</li>
            <li>· Kayıp pozisyonlar</li>
            <li>· Önerilen aksiyon</li>
          </ul>
        </div>
      </motion.section>
    </motion.div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="text-label text-muted-foreground">{label}</div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function PlatformRow({
  platformKey,
  mentioned,
  total,
}: {
  platformKey: string;
  mentioned: number;
  total: number;
}) {
  const percent = total > 0 ? (mentioned / total) * 100 : 0;
  const verb = mentioned > 0 ? "sorguda bahsediliyor" : "sorguda yok";
  return (
    <div className="flex items-center gap-6 border-b border-border py-4 last:border-b-0">
      <div className="w-32 shrink-0 text-base font-medium tracking-tight">
        {formatPlatform(platformKey)}
      </div>
      <div className="flex-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <div className="w-40 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        <span className="text-foreground font-medium">
          {mentioned}/{total}
        </span>{" "}
        {verb}
      </div>
    </div>
  );
}

function QueryRow({
  index,
  text,
  mentioned,
  total,
}: {
  index: number;
  text: string;
  mentioned: number;
  total: number;
}) {
  const ratio = total > 0 ? mentioned / total : 0;
  const mark =
    ratio >= 0.8 ? "✓" : ratio >= 0.3 ? "○" : "✗";
  const strengthLabel =
    ratio >= 0.8
      ? "Tam eşleşme"
      : ratio >= 0.6
        ? "Güçlü"
        : ratio >= 0.3
          ? "Orta"
          : "Zayıf";

  return (
    <div className="flex items-baseline gap-6 border-b border-border py-4 last:border-b-0">
      <span className="text-label tabular-nums text-muted-foreground">
        {String(index).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className={`text-base font-medium ${
          ratio >= 0.8
            ? "text-foreground"
            : ratio >= 0.3
              ? "text-muted-foreground"
              : "text-muted-foreground/70"
        }`}
      >
        {mark}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium tracking-tight">
          {text}
        </p>
      </div>
      <div className="shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        <span className="text-foreground font-medium">
          {mentioned}/{total}
        </span>{" "}
        <span className="text-xs">· {strengthLabel}</span>
      </div>
    </div>
  );
}
