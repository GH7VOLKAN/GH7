"use client";

/**
 * DashboardHome — Kinde editorial layout
 * (Brief F + Brief H-ext Aşama 1 + Brief H-polish Aşama 1).
 *
 * Yapı:
 * - Hero (marka adı + plan satırı)
 * - Görünürlük metrikleri (skor + platform kapsamı)
 * - Araçlar (6 kart: Insight / Audit / Tracker / Radar / Advisor / Studio)
 *   Her kart canlı durum satırı gösterir. "Yakında" YOK.
 * - Bu Hafta Öncelikler (Advisor raporundan 3 aksiyon)
 */

import Link from "next/link";
import { motion } from "motion/react";
import type { Profile, Brand, Scan } from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { PLANS } from "@/lib/constants/plan";
import type {
  DashboardToolStatuses,
  ToolStatus,
  ToolStatusIcon,
} from "@/lib/dashboard/get-tool-statuses";
import type { AdvisorPriority } from "@/lib/advisor/get-top-priorities";

type BrandWithScans = Brand & { scans: Scan[] };

type Props = {
  profile: Profile;
  brand: BrandWithScans;
  brands: BrandWithScans[];
  toolStatuses: DashboardToolStatuses;
  priorities: AdvisorPriority[];
};

export function DashboardHome({
  profile,
  brand,
  brands,
  toolStatuses,
  priorities,
}: Props) {
  const latestScan = brand.scans[0];
  const previousScan = brand.scans[1];

  const score = latestScan?.score ?? 0;
  const scoreTotal = latestScan?.scoreTotal ?? 25;
  const scoreTrend = previousScan ? score - (previousScan.score ?? 0) : null;

  const heroSubtitle =
    profile.plan === PLANS.FREE
      ? "Ücretsiz analizin hazır. Pro+ ile 6 araçlık GEO panelinin tamamı kullanımında olur."
      : profile.plan === PLANS.PRO
        ? "Pro üyesin. Markanın AI görünürlüğünü sürekli izle, haftalık rapor al."
        : `Pro+ üyesin. ${brands.length}/5 marka izliyorsun, 6 aracın tamamı aktif.`;

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-6xl px-6 py-12 lg:py-20"
    >
      {/* HERO */}
      <motion.section variants={pageItem} className="mb-20">
        <div className="text-label text-muted-foreground mb-6">Marka</div>
        <h1 className="text-display mb-8 max-w-3xl">{brand.name}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {heroSubtitle}
        </p>
      </motion.section>

      {/* GÖRÜNÜRLÜK */}
      <motion.section variants={pageItem} className="mb-20">
        <SectionHeading label="Görünürlük" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <div className="text-label text-muted-foreground mb-4">Skor</div>
            <div className="mb-3 flex items-baseline gap-4">
              <span className="text-metric">{score}</span>
              <span className="text-2xl tabular-nums text-muted-foreground">
                / {scoreTotal}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {scoreTrend !== null && scoreTrend > 0 && (
                <>
                  <span className="font-medium text-foreground">
                    ↗ +{scoreTrend} puan
                  </span>{" "}
                  bu hafta
                </>
              )}
              {scoreTrend !== null && scoreTrend < 0 && (
                <>
                  <span className="font-medium text-foreground">
                    ↘ {scoreTrend} puan
                  </span>{" "}
                  bu hafta
                </>
              )}
              {(scoreTrend === null || scoreTrend === 0) &&
                (latestScan?.completedAt
                  ? "İlk tarama tamamlandı"
                  : "Tarama bekleniyor")}
            </p>
          </div>

          <div>
            <div className="text-label text-muted-foreground mb-4">
              Platform Kapsamı
            </div>
            <div className="mb-3 flex items-baseline gap-4">
              <span className="text-metric">5</span>
              <span className="text-2xl tabular-nums text-muted-foreground">
                / 5
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              ChatGPT, Claude, Gemini, Perplexity, Google AIO
            </p>
          </div>
        </div>
      </motion.section>

      {/* ARAÇLAR (6 kart, hepsi canlı) */}
      <motion.section variants={pageItem} className="mb-20">
        <SectionHeading label="Araçlar" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            label="GH7 Insight"
            title="Görünürlük detayı"
            status={toolStatuses.insight}
            href={`/dashboard/${brand.slug}/insight`}
          />
          <ToolCard
            label="GH7 Audit"
            title="43 madde denetim"
            status={toolStatuses.audit}
            href={`/dashboard/${brand.slug}/audit`}
          />
          <ToolCard
            label="GH7 Tracker"
            title="Haftalık takip"
            status={toolStatuses.tracker}
            href={`/dashboard/${brand.slug}/tracker`}
          />
          <ToolCard
            label="GH7 Radar"
            title="Rakip karşılaştırma"
            status={toolStatuses.radar}
            href={`/dashboard/${brand.slug}/radar`}
          />
          <ToolCard
            label="GH7 Advisor"
            title="Kişisel rapor"
            status={toolStatuses.advisor}
            href={`/dashboard/${brand.slug}/advisor`}
          />
          <ToolCard
            label="GH7 Studio"
            title="Ayarlar ve markalar"
            status={toolStatuses.studio}
            href="/dashboard/studio"
          />
        </div>
      </motion.section>

      {/* BU HAFTA ÖNCELİKLER */}
      <motion.section variants={pageItem}>
        <SectionHeading label="Bu Hafta Öncelikler" />

        {priorities.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <p className="mb-2 text-sm text-foreground">
              Öncelikler Advisor raporundan gelir.
            </p>
            <p className="text-xs text-muted-foreground">
              İlk kişisel raporunu oluşturduktan sonra haftalık aksiyon
              önerileri burada görünecek.
            </p>
            <Link
              href={`/dashboard/${brand.slug}/advisor`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Advisor&apos;a Git →
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {priorities.map((p, idx) => (
              <div
                key={idx}
                className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0"
              >
                <div className="flex items-baseline gap-6 min-w-0">
                  <span className="text-label tabular-nums text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-medium tracking-tight">
                      {p.text}
                    </p>
                    {p.weekLabel && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.weekLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/${brand.slug}/advisor`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30"
              >
                Tüm Raporu Gör
              </Link>
              <Link
                href={`/dashboard/${brand.slug}/audit`}
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Audit&apos;e Git →
              </Link>
            </div>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="text-label text-muted-foreground">{label}</div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function StatusIndicator({ icon }: { icon: ToolStatusIcon }) {
  if (icon === "ok") {
    return (
      <span
        aria-hidden
        className="inline-flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background"
      >
        ✓
      </span>
    );
  }
  if (icon === "warn") {
    return (
      <span
        aria-hidden
        className="inline-flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-semibold text-background"
      >
        !
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px] text-muted-foreground"
    >
      —
    </span>
  );
}

function ToolCard({
  label,
  title,
  status,
  href,
}: {
  label: string;
  title: string;
  status: ToolStatus;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group block h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-zinc-400"
      >
        <div className="mb-6 text-label text-muted-foreground">{label}</div>
        <h3 className="mb-4 text-base font-semibold tracking-tight">{title}</h3>
        <div className="flex items-center gap-2 text-sm">
          <StatusIndicator icon={status.statusIcon} />
          <span
            className={
              status.statusIcon === "empty"
                ? "text-muted-foreground"
                : "text-foreground"
            }
          >
            {status.statusLine}
          </span>
        </div>
        <div className="mt-6 flex items-center gap-1 text-sm font-medium">
          <span>Aç</span>
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
