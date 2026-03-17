"use client";

import { type ReactNode } from "react";
import { AnimatedNumber } from "./animations";

/* ─────────────────────────────────────────────────────
   Hero Section — Kinde.com style landing page hero
   Centered, big title (56px), animated counter, label
   ───────────────────────────────────────────────────── */

interface HeroSectionProps {
  /** Top label — 12px, uppercase, #bbb */
  label: string;
  /** Title text — can contain \n for line breaks */
  title: string;
  /** Number to animate in the title (optional) */
  animatedValue?: number;
  /** Text after the animated value */
  titleAfter?: string;
  /** Subtitle / description line */
  subtitle?: string;
  /** Extra content below subtitle (e.g. progress bar) */
  children?: ReactNode;
}

export function HeroSection({
  label,
  title,
  animatedValue,
  titleAfter,
  subtitle,
  children,
}: HeroSectionProps) {
  // Split title on \n for line breaks
  const titleLines = title.split("\n");

  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px 40px",
      }}
    >
      {/* Top label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: 3,
          color: "#bbb",
          marginBottom: 16,
        }}
      >
        {label}
      </div>

      {/* Main title */}
      <h1
        style={{
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 800,
          letterSpacing: "-2px",
          color: "var(--foreground)",
          lineHeight: 1.1,
          margin: "0 auto",
          maxWidth: 600,
        }}
      >
        {animatedValue !== undefined ? (
          <>
            {titleLines[0]}
            {titleLines.length > 1 && <br />}
            <AnimatedNumber
              value={animatedValue}
              className="tabular-nums"
            />
            {titleAfter}
            {titleLines.length > 2 &&
              titleLines.slice(2).map((line, i) => (
                <span key={i}>
                  <br />
                  {line}
                </span>
              ))}
          </>
        ) : (
          titleLines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))
        )}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: "var(--muted-foreground)",
            marginTop: 16,
            maxWidth: 500,
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Extra content */}
      {children && <div style={{ marginTop: 20 }}>{children}</div>}
    </div>
  );
}
