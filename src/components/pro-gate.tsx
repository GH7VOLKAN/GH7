/**
 * ProGate — Free/Pro içerik gate bileşeni
 *
 * Free kullanıcıda children'ı blur + overlay + CTA ile gösterir.
 * Pro kullanıcıda children'ı doğrudan render eder.
 *
 * Server component (pure presentation + Link). Plan prop'u parent'tan gelir.
 */

import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { PLAN_PRICES } from "@/lib/iyzico/plans";
import { isPro } from "@/lib/plans";
import { cn } from "@/lib/utils";

export interface ProGateProps {
  plan: string;
  feature: string;
  description: string;
  ctaLabel?: string;
  className?: string;
  minHeight?: string;
  children: ReactNode;
}

function formatTRY(n: number): string {
  return `₺${n.toLocaleString("tr-TR")}`;
}

export function ProGate({
  plan,
  feature: _feature,
  description,
  ctaLabel = "Pro'ya Geç",
  className,
  minHeight,
  children,
}: ProGateProps) {
  if (isPro(plan)) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative isolate", className)}
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="pointer-events-none select-none opacity-40 blur-[5px]">
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] px-4 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
          <Lock className="size-4 text-gray-500" />
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-700">
          {description}
        </p>
        <Link
          href="/panel/abonelik"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          {ctaLabel}
          <span className="text-gray-300">·</span>
          <span>{formatTRY(PLAN_PRICES.pro.monthly)}/ay</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Daha ince gate — satır içinde kullanım için (örn. "Satın Al" butonunu kilitler).
 */
export function ProGateInline({
  plan,
  description,
  ctaLabel = "Pro ile Aç",
  children,
}: Omit<ProGateProps, "feature" | "minHeight" | "className"> & {
  children?: ReactNode;
}) {
  if (isPro(plan)) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
      <div className="flex items-center gap-1.5">
        <Lock className="size-3.5 text-gray-400" />
        <span>{description}</span>
      </div>
      <Link
        href="/panel/abonelik"
        className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
      >
        {ctaLabel} · {formatTRY(PLAN_PRICES.pro.monthly)}/ay
      </Link>
    </div>
  );
}
