import Link from "next/link";
import type { FreeToolResult } from "@/lib/free-tool/types";

export function BlurredUpsell({ result }: { result: FreeToolResult }) {
  const isKisisel = result.input.mode === "kisisel";

  return (
    <div className="relative mt-8 overflow-hidden rounded-xl border border-border">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[8px] p-6">
        <div className="space-y-4">
          <div className="rounded-lg bg-background-secondary p-4">
            <p className="text-sm font-bold">
              {isKisisel ? "Senin Yerine Kim Öneriliyor?" : "Rakipleriniz Kimler?"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.blurredInsights.alternativesTeaser}
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-4 w-2/3 rounded bg-muted-foreground/20" />
              <div className="h-4 w-1/2 rounded bg-muted-foreground/20" />
            </div>
          </div>
          <div className="rounded-lg bg-background-secondary p-4">
            <p className="text-sm font-bold">
              {isKisisel ? "Neden Tanımıyor?" : "Neden Bahsetmiyor?"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.blurredInsights.whyNotTeaser}
            </p>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-muted-foreground/20" />
              <div className="h-4 w-5/6 rounded bg-muted-foreground/20" />
            </div>
          </div>
          <div className="rounded-lg bg-background-secondary p-4">
            <p className="text-sm font-bold">Haftalık Takip</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.blurredInsights.weeklyTrackingTeaser}
            </p>
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 flex-1 rounded bg-muted-foreground/20"
                  style={{ height: `${20 + Math.random() * 30}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[1px]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-foreground">
            <svg className="size-5 text-background" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="text-lg font-bold tracking-[-0.02em]">
            Detaylı analizini gör
          </p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {isKisisel
              ? "Senin yerine kimin önerildiğini, neden tanınmadığını ve haftalık takibi aç."
              : "Rakip analizi, kaynak takibi ve haftalık AI görünürlük raporlarını aç."}
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Pro ile Aç — 2.495₺/ay
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            7 gün ücretsiz dene
          </p>
        </div>
      </div>
    </div>
  );
}
