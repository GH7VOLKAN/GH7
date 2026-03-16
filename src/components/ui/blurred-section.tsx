"use client";

import Link from "next/link";

interface BlurredSectionProps {
  isLocked: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * BlurredSection — Free plan icin icerik blur + upgrade CTA overlay
 * isLocked=true ise children blur edilir ve ustune upgrade CTA gosterilir.
 */
export function BlurredSection({
  isLocked,
  children,
  title = "Pro Ozellik",
  description = "Bu ozelligi kullanmak icin Pro plana gecin.",
}: BlurredSectionProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <div className="blur-[6px] opacity-50">{children}</div>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-sm p-6 text-center shadow-lg max-w-sm mx-4">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-foreground/5">
            <svg
              className="size-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <Link
            href="/dashboard/ayarlar"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-xs font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Pro&apos;ya Gec
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
