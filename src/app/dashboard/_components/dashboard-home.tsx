"use client";

/**
 * DashboardHome — Kinde editorial layout (Brief F)
 *
 * Hero (display 72px) → Görünürlük metrikleri (skor + platform) →
 * Aktif Araçlar (Insight + Studio) → Yakında (4 placeholder).
 *
 * Tasarım dili:
 * - text-display / text-label / text-metric utility classes
 * - zinc monochrome, saf siyah accent
 * - Framer Motion staggered entrance
 * - Border'lar 1px zinc-200, hover'da zinc-400
 */

import Link from "next/link";
import { motion } from "motion/react";
import type { Profile, Brand, Scan } from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { PLANS } from "@/lib/constants/plan";

type BrandWithScans = Brand & { scans: Scan[] };

type Props = {
  profile: Profile;
  brand: BrandWithScans;
  brands: BrandWithScans[];
};

export function DashboardHome({ profile, brand, brands }: Props) {
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
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">Görünürlük</div>
          <div className="h-px flex-1 bg-border" />
        </div>

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

      {/* AKTİF ARAÇLAR */}
      <motion.section variants={pageItem} className="mb-20">
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">
            Aktif Araçlar
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ActiveCard
            label="GH7 Insight"
            title="Görünürlük detayı"
            description="Her AI platformunda kaç kere anıldığını, hangi sorguların kazandığını gör."
            cta="Detayları Gör"
            href="/dashboard/insight"
          />
          <ActiveCard
            label="GH7 Studio"
            title="Ayarlar ve kontrol"
            description="Profil, bülten aboneliği, marka yönetimi ve üyelik durumu."
            cta="Ayarlar"
            href="/dashboard/studio"
          />
        </div>
      </motion.section>

      {/* YAKINDA */}
      <motion.section variants={pageItem}>
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">
            Yakında · Pro ve Pro+ Üyelerine Açılıyor
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ComingSoonCard
            label="GH7 Audit"
            title="43 maddelik denetim"
            description="Schema, içerik, hız. Her madde için iyileştirme talimatı."
          />
          <ComingSoonCard
            label="GH7 Tracker"
            title="Haftalık otomatik takip"
            description="Her Pazartesi tarama, trend grafiği, değişim bildirimi."
          />
          <ComingSoonCard
            label="GH7 Radar"
            title="Rakip karşılaştırma"
            description="3 rakibin sürekli takibi, skor karşılaştırması, uyarılar."
          />
          <ComingSoonCard
            label="GH7 Advisor"
            title="Opus haftalık rapor"
            description="Sektör trendi, öncelik listesi, kişisel aksiyon adımları."
          />
        </div>
      </motion.section>
    </motion.div>
  );
}

function ActiveCard({
  label,
  title,
  description,
  cta,
  href,
}: {
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group block rounded-xl border border-border bg-card p-8 transition-colors hover:border-zinc-400"
      >
        <div className="text-label text-muted-foreground mb-6">{label}</div>
        <h3 className="text-h3 mb-3">{title}</h3>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>{cta}</span>
          <span className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ComingSoonCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="text-label text-muted-foreground">{label}</div>
        <div className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Yakında
        </div>
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
