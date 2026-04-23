"use client";

import { useState } from "react";
import Link from "next/link";
import type { Profile, Brand } from "@prisma/client";
import { getPlanLabel, PLANS } from "@/lib/constants/plan";
import s from "../studio.module.css";

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

  const toggleNewsletter = async () => {
    if (!profile.email || isSyntheticEmail) return;
    setSavingNewsletter(true);
    const newValue = !newsletterOptIn;
    try {
      const res = await fetch("/api/analiz/newsletter-optin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, optIn: newValue }),
      });
      if (res.ok) {
        setNewsletterOptIn(newValue);
      }
    } catch (err) {
      console.error("Newsletter toggle failed:", err);
    } finally {
      setSavingNewsletter(false);
    }
  };

  return (
    <div className={s.shell}>
      <main className={s.main}>
        <div className={s.banner}>
          <span className={s.bannerBrand}>GH7 STUDIO</span>
          <span className={s.bannerSub}>· Ayarlar ve kontrol</span>
        </div>

        <div className={s.headerRow}>
          <Link href="/dashboard" className={s.backLink}>
            ← Dashboard
          </Link>
          <h1 className={s.title}>Ayarlar</h1>
        </div>

        {/* Profile bilgileri */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Hesap Bilgileri</h2>
          <div className={s.infoCard}>
            <div className={s.infoRow}>
              <span className={s.infoLabel}>Telefon</span>
              <span className={s.infoValue}>{formatPhone(profile.phone)}</span>
            </div>
            <div className={s.infoRow}>
              <span className={s.infoLabel}>E-posta</span>
              <span className={s.infoValue}>{emailDisplay}</span>
            </div>
            <div className={s.infoRow}>
              <span className={s.infoLabel}>Üyelik</span>
              <span className={s.infoValue}>{getPlanLabel(profile.plan)}</span>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Bültenler</h2>
          <div className={s.toggleCard}>
            <div className={s.toggleInfo}>
              <div className={s.toggleTitle}>GH7 Advisor Haftalık</div>
              <div className={s.toggleDesc}>
                AI görünürlük trendleri ve sektöründeki fırsatlar her Pazartesi
                sabahı e-postanda.
              </div>
            </div>
            <button
              type="button"
              onClick={toggleNewsletter}
              disabled={savingNewsletter || !profile.email || isSyntheticEmail}
              className={`${s.toggle} ${newsletterOptIn ? s.toggleOn : ""}`}
              aria-label={
                newsletterOptIn ? "Bültenden çık" : "Bültene katıl"
              }
              aria-pressed={newsletterOptIn}
            >
              <span className={s.toggleKnob} />
            </button>
          </div>
          {(!profile.email || isSyntheticEmail) && (
            <p className={s.note}>
              Bülten için önce e-posta adresi eklemen gerek.
            </p>
          )}
        </section>

        {/* Marka yönetimi */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            İzlenen Markalar{" "}
            <span className={s.sectionSub}>
              ({brands.length}
              {profile.plan === PLANS.PRO_PLUS ? " / 5" : ""})
            </span>
          </h2>
          <div className={s.brandList}>
            {brands.map((brand) => (
              <div key={brand.id} className={s.brandRow}>
                <div>
                  <div className={s.brandName}>{brand.name}</div>
                  <div className={s.brandDomain}>
                    {brand.domain}
                    {brand.sector ? ` · ${brand.sector}` : " · —"}
                  </div>
                </div>
                <Link href="/dashboard/insight" className={s.brandLink}>
                  Detay →
                </Link>
              </div>
            ))}
          </div>

          {canStartNewAnalysis && (
            <div className={s.actionRow}>
              {profile.plan === PLANS.PRO && (
                <Link href="/analiz?force=true" className={s.primaryBtn}>
                  Bu Markayı Yeniden Analiz Et →
                </Link>
              )}
              {canAddMoreBrands && (
                <Link href="/analiz" className={s.primaryBtn}>
                  Yeni Marka Ekle →
                </Link>
              )}
              {profile.plan === PLANS.PRO_PLUS && !canAddMoreBrands && (
                <p className={s.note}>
                  Pro+ 5 marka limitine ulaştın. Yeni marka eklemek için birini
                  kaldır (yakında).
                </p>
              )}
            </div>
          )}

          {!canStartNewAnalysis && (
            <div className={s.upgradeCTA}>
              <p className={s.upgradeText}>
                Free üyelikte yeniden analiz hakkın yok. Pro ile aynı marka için
                sınırsız analiz, Pro+ ile 5 markaya kadar izleme.
              </p>
              <a
                href="https://wa.me/905326629792?text=GH7%20Pro%20üyelik%20istiyorum"
                target="_blank"
                rel="noopener noreferrer"
                className={s.primaryBtn}
              >
                Pro&apos;ya Geç →
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
