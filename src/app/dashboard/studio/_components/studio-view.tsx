"use client";

/**
 * StudioView — Kinde editorial ayarlar (Brief F Adım 2.2)
 *
 * Numbered sections (01 Hesap, 02 Bülten, 03 Markalar, 04 Üyelik).
 * Free/Pro/Pro+ tier'lara göre farklı içerik.
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import type { Profile, Brand } from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { getPlanLabel, PLANS } from "@/lib/constants/plan";

type Props = {
  profile: Profile;
  brands: Brand[];
  canStartNewAnalysis: boolean;
  canAddMoreBrands: boolean;
};

function formatPhone(raw: string | null): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length === 12) {
    return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return `+${raw}`;
}

export function StudioView({
  profile,
  brands,
  canStartNewAnalysis,
  canAddMoreBrands,
}: Props) {
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    profile.newsletterOptIn,
  );
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  const isSyntheticEmail =
    !!profile.email &&
    profile.email.startsWith("phone_") &&
    profile.email.endsWith("@gh7.ai");
  const emailDisplay =
    profile.email && !isSyntheticEmail ? profile.email : "—";
  const newsletterDisabled =
    !profile.email || isSyntheticEmail || savingNewsletter;

  const toggleNewsletter = async () => {
    if (newsletterDisabled) return;
    setSavingNewsletter(true);
    const newValue = !newsletterOptIn;
    try {
      const res = await fetch("/api/analiz/newsletter-optin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, optIn: newValue }),
      });
      if (res.ok) setNewsletterOptIn(newValue);
    } catch (err) {
      console.error("Newsletter toggle failed:", err);
    } finally {
      setSavingNewsletter(false);
    }
  };

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-3xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="text-label text-muted-foreground mb-6">GH7 Studio</div>
        <h1 className="text-h1 mb-6">Ayarlar</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Hesap, bülten aboneliği, marka yönetimi ve üyelik durumu.
        </p>
      </motion.div>

      {/* 01 · HESAP */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionLabel index="01" title="Hesap" />
        <dl className="space-y-0">
          <InfoRow label="Telefon" value={formatPhone(profile.phone)} />
          <InfoRow label="E-posta" value={emailDisplay} />
          <InfoRow label="Üyelik" value={getPlanLabel(profile.plan)} />
        </dl>
      </motion.section>

      {/* 02 · BÜLTEN */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionLabel index="02" title="Bülten" />
        <div className="flex items-start justify-between gap-6 border-b border-border py-5">
          <div className="flex-1">
            <div className="mb-1 text-base font-medium tracking-tight">
              GH7 Advisor · Haftalık
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI görünürlük trendleri ve sektöründeki fırsatlar her Pazartesi
              sabahı e-postanda.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleNewsletter}
            disabled={newsletterDisabled}
            aria-pressed={newsletterOptIn}
            aria-label={newsletterOptIn ? "Bültenden çık" : "Bültene katıl"}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              newsletterOptIn
                ? "border-foreground bg-foreground"
                : "border-border bg-background"
            }`}
          >
            <span
              className={`absolute top-[2px] size-[18px] rounded-full transition-all ${
                newsletterOptIn
                  ? "left-[22px] bg-background"
                  : "left-[2px] bg-foreground/80"
              }`}
            />
          </button>
        </div>
        {(!profile.email || isSyntheticEmail) && (
          <p className="mt-3 text-xs text-muted-foreground">
            Bülten için önce e-posta adresi eklemen gerek.
          </p>
        )}
      </motion.section>

      {/* 03 · MARKALAR */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionLabel
          index="03"
          title={`Markalar${profile.plan === PLANS.PRO_PLUS ? ` · ${brands.length} / 5` : ` · ${brands.length}`}`}
        />
        <div className="space-y-0">
          {brands.map((brand, idx) => (
            <div
              key={brand.id}
              className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0"
            >
              <div className="flex min-w-0 items-baseline gap-6">
                <span className="text-label tabular-nums text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-base font-medium tracking-tight">
                    {brand.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {brand.domain}
                    {brand.sector ? ` · ${brand.sector}` : ""}
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/${brand.slug}/insight`}
                className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Detay →
              </Link>
            </div>
          ))}
        </div>

        {canStartNewAnalysis && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            {profile.plan === PLANS.PRO && (
              <Link
                href="/analiz?force=true"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Bu Markayı Yeniden Analiz Et →
              </Link>
            )}
            {canAddMoreBrands && (
              <Link
                href="/analiz"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Yeni Marka Ekle →
              </Link>
            )}
            {profile.plan === PLANS.PRO_PLUS && !canAddMoreBrands && (
              <p className="text-xs text-muted-foreground">
                Pro+ 5 marka limitine ulaştın. Yeni marka eklemek için birini
                kaldır (yakında).
              </p>
            )}
          </div>
        )}
      </motion.section>

      {/* 04 · ÜYELİK */}
      <motion.section variants={pageItem}>
        <SectionLabel index="04" title="Üyelik" />
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6">
            <div className="text-label text-muted-foreground mb-2">
              Mevcut Plan
            </div>
            <div className="text-h3">{getPlanLabel(profile.plan)}</div>
          </div>
          {profile.plan === PLANS.FREE && (
            <>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Ücretsiz üyelikte 1 kez analiz hakkın var. Pro ile aynı marka
                için sınırsız analiz, Pro+ ile 5 markaya kadar izleme.
              </p>
              <a
                href="https://wa.me/905326629792?text=GH7%20Pro%20üyelik%20istiyorum"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                WhatsApp ile Pro&apos;ya Geç →
              </a>
            </>
          )}
          {profile.plan === PLANS.PRO && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pro üyesin. Tüm araçlar aktif, aynı marka için sınırsız analiz
              hakkın var. Pro+ ile 5 markaya kadar izleme açılır.
            </p>
          )}
          {profile.plan === PLANS.PRO_PLUS && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pro+ üyesin. 5 markaya kadar izleme hakkın var, tüm araçlar
              aktif, öncelikli destek WhatsApp üzerinden.
            </p>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="text-label tabular-nums text-muted-foreground">
        {index}
      </span>
      <span className="text-label text-foreground">{title}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium tracking-tight">{value}</dd>
    </div>
  );
}
