import Link from "next/link";
import { LockIcon } from "lucide-react";
import type { FreeToolResult } from "@/lib/free-tool/types";

function LockedSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <LockIcon className="size-3.5 text-muted-foreground" />
        <p className="text-sm font-bold">{title}</p>
      </div>
      <div className="pointer-events-none select-none">{children}</div>
    </div>
  );
}

function SkeletonBar({ width }: { width: string }) {
  return <div className={`h-3.5 rounded bg-muted-foreground/15 ${width}`} />;
}

export function BlurredUpsell({ result }: { result: FreeToolResult }) {
  const isKisisel = result.input.mode === "kisisel";

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Pro Analizler
      </p>

      {/* 1. Competitors — first name visible, rest blurred */}
      <LockedSection
        title={isKisisel ? "Senin Yerine Kim Öneriliyor?" : "Rakipleriniz Kimler?"}
      >
        <div className="space-y-3">
          {result.competitors.length > 0 ? (
            result.competitors.map((comp, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10 text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                {i === 0 ? (
                  <p className="flex-1 text-sm font-medium">{comp.name}</p>
                ) : (
                  <div className="h-3.5 flex-1 rounded bg-muted-foreground/15" />
                )}
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {comp.score}/100
                </span>
              </div>
            ))
          ) : (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted-foreground/10 text-[10px] font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="h-3.5 flex-1 rounded bg-muted-foreground/15" />
              </div>
            ))
          )}
        </div>
      </LockedSection>

      {/* 2. Why not recognized — first reason visible, rest blurred */}
      <LockedSection
        title={isKisisel ? "AI Neden Seni Tanımıyor?" : "AI Neden Bahsetmiyor?"}
      >
        <div className="space-y-2.5">
          {result.whyNotFound.length > 0 ? (
            <>
              {/* First reason: visible */}
              <div className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-400" />
                <p className="text-sm leading-relaxed text-foreground/80">
                  {result.whyNotFound[0]}
                </p>
              </div>
              {/* Rest: blurred skeleton */}
              {result.whyNotFound.slice(1).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400" />
                  <SkeletonBar width={i === 0 ? "w-5/6" : "w-4/6"} />
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-400" />
                <SkeletonBar width="w-full" />
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400" />
                <SkeletonBar width="w-5/6" />
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400" />
                <SkeletonBar width="w-4/6" />
              </div>
            </>
          )}
        </div>
      </LockedSection>

      {/* 3. Action plan — first item visible, rest blurred */}
      <LockedSection title="Kişiselleştirilmiş Aksiyon Planı">
        <div className="space-y-2.5">
          {result.actionItems.length > 0 ? (
            <>
              {/* First action: visible */}
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <svg className="size-3 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {result.actionItems[0]}
                </p>
              </div>
              {/* Rest: skeleton */}
              {result.actionItems.slice(1).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded border border-muted-foreground/20">
                    <svg className="size-3 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <SkeletonBar width={["w-11/12", "w-5/6", "w-4/6", "w-3/4"][i] ?? "w-5/6"} />
                </div>
              ))}
            </>
          ) : (
            ["w-full", "w-11/12", "w-5/6", "w-4/6", "w-3/4"].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded border border-muted-foreground/20">
                  <svg className="size-3 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <SkeletonBar width={w} />
              </div>
            ))
          )}
        </div>
      </LockedSection>

      {/* 4. Weekly tracking */}
      <LockedSection title="Haftalık AI Takip Raporu">
        <div className="flex h-16 items-end gap-1.5">
          {[35, 42, 38, 52, 48, 55, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-muted-foreground/15"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Pzt</span>
          <span>Sal</span>
          <span>Çar</span>
          <span>Per</span>
          <span>Cum</span>
          <span>Cmt</span>
          <span>Paz</span>
        </div>
      </LockedSection>

      {/* CTA */}
      <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 text-center">
        <p className="text-lg font-bold tracking-[-0.02em]">
          Tüm analizleri aç
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {isKisisel
            ? "Senin yerine kimin önerildiğini, neden tanınmadığını ve kişiselleştirilmiş aksiyon planını gör."
            : "Rakip analizi, kaynak takibi, aksiyon planı ve haftalık AI görünürlük raporlarını aç."}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-foreground px-8 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Pro ile Başla — 2.495₺/ay
        </Link>
        <div className="mt-3 flex flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground">
            7 gün ücretsiz dene — istediğin zaman iptal et
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            1,247 profesyonel bu ay Pro&apos;ya geçti
          </p>
        </div>
      </div>
    </div>
  );
}
