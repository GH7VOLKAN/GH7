"use client";

import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  Children,
  cloneElement,
  isValidElement,
} from "react";

/* ─────────────────────────────────────────────────────
   1. FadeIn — Scroll'a gelince fade-in (IntersectionObserver)
   ───────────────────────────────────────────────────── */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   2. Stagger — children appear one by one (80ms gap)
   ───────────────────────────────────────────────────── */
interface StaggerProps {
  children: ReactNode;
  staggerMs?: number;
  className?: string;
}

export function Stagger({
  children,
  staggerMs = 80,
  className = "",
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease ${i * staggerMs}ms, transform 0.5s ease ${i * staggerMs}ms`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   3. AnimatedNumber — Counter 0 → target over 1.2s
   ───────────────────────────────────────────────────── */
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedNumber({
  value,
  duration = 1200,
  className = "",
  suffix = "",
  prefix = "",
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   4. AnimBar — Animated progress bar (grows on scroll)
   ───────────────────────────────────────────────────── */
interface AnimBarProps {
  percent: number;
  color?: string;
  height?: number;
  delay?: number;
  className?: string;
}

export function AnimBar({
  percent,
  color = "#111",
  height = 8,
  delay = 0,
  className = "",
}: AnimBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, background: "#f0f0f0" }}
    >
      <div
        style={{
          width: visible ? `${Math.min(percent, 100)}%` : "0%",
          height: "100%",
          background: color,
          borderRadius: "inherit",
          transition: `width 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   5. PageSection — Landing-page section wrapper
   ───────────────────────────────────────────────────── */
interface PageSectionProps {
  children: ReactNode;
  className?: string;
}

export function PageSection({ children, className = "" }: PageSectionProps) {
  return (
    <FadeIn className={`w-full ${className}`}>
      {children}
    </FadeIn>
  );
}

/* ─────────────────────────────────────────────────────
   6. SectionTitle — Consistent section header
   ───────────────────────────────────────────────────── */
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`mb-5 ${className}`}>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "var(--foreground)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: "var(--muted-foreground)",
            marginTop: 6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
