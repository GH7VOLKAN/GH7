"use client";

/**
 * Kinde estetikli paylaşımlı primitivler.
 *
 * Tüm redesigned panel sayfaları (genel, audit-detay, aramalar, hizmetler,
 * ayarlar) bu modülü kullanır.
 *
 * Kurallar:
 *  - Beyaz arka plan, siyah tipografi
 *  - Plus Jakarta Sans
 *  - 680px max-width tek akış
 *  - Intersection Observer fade-in
 *  - FREE/PRO gate: blur(4px) + "Pro ile devamını görün · ₺699/ay"
 */

import { useEffect, useRef } from "react";
import Link from "next/link";

export const KINDE_FONT =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif';

export const KINDE_COLORS = {
  black: "#000000",
  white: "#FFFFFF",
  muted: "#888888",
  mutedLight: "#AAAAAA",
  divider: "#E8E8E8",
  bgSoft: "#F7F7F7",
};

export const PRO_PRICE_LABEL = "Pro'ya Geç · ₺699/ay";
export const PRO_CTA_ARAMALAR =
  "Tüm sorguları, tam AI yanıtlarını ve il bazlı filtreleri açın.";
export const PRO_CTA_AUDIT = "43 maddenin tamamını detaylı analiz edin.";

/* -------------------------------------------------- */
/*  useFadeIn — intersection observer                 */
/* -------------------------------------------------- */
export function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("gh7-fade-in-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* -------------------------------------------------- */
/*  Global styles (injected once)                      */
/* -------------------------------------------------- */
export function KindeStyles() {
  return (
    <style jsx global>{`
      @keyframes gh7FadeIn {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .gh7-fade-in {
        opacity: 0;
      }
      .gh7-fade-in-visible {
        animation: gh7FadeIn 0.7s ease forwards;
      }
    `}</style>
  );
}

/* -------------------------------------------------- */
/*  Page shell                                          */
/* -------------------------------------------------- */
export function KindePage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <KindeStyles />
      <div style={{ background: KINDE_COLORS.white, color: KINDE_COLORS.black }}>
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "80px 24px",
            fontFamily: KINDE_FONT,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------- */
/*  Divider                                            */
/* -------------------------------------------------- */
export function Divider() {
  return (
    <hr
      style={{
        border: 0,
        borderTop: `1px solid ${KINDE_COLORS.divider}`,
        margin: "80px 0",
      }}
    />
  );
}

/* -------------------------------------------------- */
/*  Section heading + lead                             */
/* -------------------------------------------------- */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "clamp(32px, 5vw, 42px)",
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: "-0.03em",
        marginBottom: 16,
      }}
    >
      {children}
    </h2>
  );
}

export function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 16,
        color: KINDE_COLORS.muted,
        lineHeight: 1.6,
        marginBottom: 32,
      }}
    >
      {children}
    </p>
  );
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        marginTop: 32,
        fontSize: 12,
        color: KINDE_COLORS.mutedLight,
        lineHeight: 1.6,
      }}
    >
      {children}
    </p>
  );
}

/* -------------------------------------------------- */
/*  ProGate — blur overlay                             */
/* -------------------------------------------------- */
export function ProGate({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          filter: "blur(4px)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        <Link href="/panel/abonelik" style={BTN_PRIMARY}>
          {PRO_PRICE_LABEL}
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Pro CTA blok — sayfa sonunda sade                   */
/* -------------------------------------------------- */
export function ProCTA({
  lead,
}: {
  lead: string;
}) {
  return (
    <div
      style={{
        padding: 32,
        border: `1px solid ${KINDE_COLORS.divider}`,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.4,
          marginBottom: 20,
          color: KINDE_COLORS.black,
        }}
      >
        {lead}
      </p>
      <Link href="/panel/abonelik" style={BTN_PRIMARY}>
        {PRO_PRICE_LABEL}
      </Link>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Status label — düz metin, renksiz                   */
/* -------------------------------------------------- */
export function StatusPill({
  status,
}: {
  status: "pass" | "partial" | "fail" | "locked";
}) {
  const label =
    status === "pass"
      ? "geçti"
      : status === "partial"
        ? "kısmen"
        : status === "fail"
          ? "eksik"
          : "kilitli";
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: KINDE_COLORS.black,
        textTransform: "lowercase",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------- */
/*  Siyah/beyaz buton varyantları                       */
/* -------------------------------------------------- */
export const BTN_PRIMARY: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 22px",
  background: KINDE_COLORS.black,
  color: KINDE_COLORS.white,
  border: 0,
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: KINDE_FONT,
  cursor: "pointer",
};

export const BTN_OUTLINE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "12px 22px",
  background: KINDE_COLORS.white,
  color: KINDE_COLORS.black,
  border: `1px solid ${KINDE_COLORS.black}`,
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: KINDE_FONT,
  cursor: "pointer",
};

/* -------------------------------------------------- */
/*  Toggle switch — siyah/gri                           */
/* -------------------------------------------------- */
export function KindeToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 0",
        borderBottom: `1px solid ${KINDE_COLORS.divider}`,
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{label}</div>
        {description && (
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: KINDE_COLORS.mutedLight,
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          position: "relative",
          width: 44,
          height: 24,
          borderRadius: 999,
          border: 0,
          background: checked ? "#111111" : "#E0E0E0",
          cursor: "pointer",
          transition: "background 0.18s ease",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#FFFFFF",
            transition: "left 0.18s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/*  formatDate                                          */
/* -------------------------------------------------- */
export function formatKindeDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/* -------------------------------------------------- */
/*  Hero (shared large-score hero)                     */
/* -------------------------------------------------- */
export function KindeHero({
  score,
  title,
  subtitle,
  tertiary,
}: {
  score?: number | string;
  title: string;
  subtitle?: string;
  tertiary?: string;
}) {
  const ref = useFadeIn<HTMLDivElement>();
  return (
    <div ref={ref} className="gh7-fade-in" style={{ paddingBottom: 40 }}>
      {score !== undefined && (
        <div
          style={{
            fontSize: "clamp(72px, 15vw, 120px)",
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          {score}
          {typeof score === "number" && (
            <span
              style={{
                fontSize: "0.35em",
                color: KINDE_COLORS.muted,
                fontWeight: 500,
              }}
            >
              /100
            </span>
          )}
        </div>
      )}
      <h1
        style={{
          marginTop: score !== undefined ? 40 : 0,
          fontSize: "clamp(36px, 6vw, 48px)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            marginTop: 24,
            fontSize: 16,
            color: KINDE_COLORS.muted,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
      {tertiary && (
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            color: KINDE_COLORS.mutedLight,
            lineHeight: 1.6,
          }}
        >
          {tertiary}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Footer                                              */
/* -------------------------------------------------- */
export function KindeFooter({ lastUpdate }: { lastUpdate: string | null }) {
  return (
    <footer
      style={{
        marginTop: 40,
        paddingTop: 40,
        borderTop: `1px solid ${KINDE_COLORS.divider}`,
        color: KINDE_COLORS.mutedLight,
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <div style={{ marginBottom: 8 }}>
        Son güncelleme: {formatKindeDate(lastUpdate)}
      </div>
      <div>GH7.ai · Türkiye'nin ilk Türkçe GEO platformu</div>
    </footer>
  );
}
