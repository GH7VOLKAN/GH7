"use client";

/**
 * AuditListView — 43 madde liste (Brief G Aşama 4).
 *
 * Durumlar:
 * - audit=null: Empty state + "Denetim Başlat" CTA
 * - audit.status in (pending/crawling/analyzing/generating): polling ekranı
 * - audit.status=failed: hata + retry
 * - audit.status=completed: liste (kategori filtresi, durum rozeti)
 *
 * Tasarım: Brief F Kinde estetiği (text-display, numbered, separator, motion).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Audit, AuditItem } from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { AUDIT_CATEGORIES } from "@/lib/audit/master-items";

type BrandLite = { id: string; name: string; domain: string };
type AuditWithItems = Audit & { items: AuditItem[] };

type Props = {
  brand: BrandLite;
  audit: AuditWithItems | null;
};

export function AuditListView({ brand, audit }: Props) {
  if (!audit) {
    return <EmptyState brand={brand} />;
  }

  if (audit.status === "failed") {
    return <FailedState audit={audit} brand={brand} />;
  }

  if (
    audit.status === "pending" ||
    audit.status === "crawling" ||
    audit.status === "analyzing"
  ) {
    return <LoadingState audit={audit} />;
  }

  // "generating" (batch çalışıyor) + "awaiting-opus" (batch bekliyor) +
  // "completed" hepsi aynı ekran: batch runner + 43 madde. Status'e göre
  // UI detayları farklılaşır.
  return <CompletedList audit={audit} brand={brand} />;
}

// ═══════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════

function EmptyState({ brand }: { brand: BrandLite }) {
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  const startAudit = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      });
      if (!res.ok) {
        setStarting(false);
        return;
      }
      // Audit başlatıldı — sayfayı refresh et, LoadingState'e geç
      router.refresh();
    } catch {
      setStarting(false);
    }
  };

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28"
    >
      <motion.div variants={pageItem}>
        <div className="text-label text-muted-foreground mb-6">GH7 Audit</div>
        <h1 className="text-display mb-8">
          43 Maddelik
          <br />
          Denetim
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-muted-foreground">
          {brand.name} için ilk denetim 60-90 saniye sürer. Site taranır, AI
          platformlarda görünürlük ölçülür, 43 madde için marka-özel talimat
          hazırlanır.
        </p>
        <button
          type="button"
          onClick={startAudit}
          disabled={starting}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-4 text-base font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {starting ? "Başlatılıyor..." : "Denetimi Başlat →"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// LOADING (polling)
// ═══════════════════════════════════════════════════════

function LoadingState({ audit }: { audit: AuditWithItems }) {
  const [progress, setProgress] = useState(audit.progress);
  const [step, setStep] = useState(audit.currentStep);
  const [status, setStatus] = useState(audit.status);
  const router = useRouter();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/audit/status?auditId=${audit.id}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: string;
          progress: number;
          currentStep: string | null;
        };
        setProgress(data.progress);
        setStep(data.currentStep);
        setStatus(data.status);
        // Phase 1 bitti (awaiting-opus) veya son durum — refresh
        if (
          data.status === "awaiting-opus" ||
          data.status === "completed" ||
          data.status === "failed"
        ) {
          router.refresh();
        }
      } catch {
        // network glitch, sessiz geç
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [audit.id, router]);

  const steps = [
    { label: "Site taranıyor", threshold: 10 },
    { label: "Backlink verisi toplanıyor", threshold: 40 },
    { label: "AI platformlarda görünürlük ölçülüyor", threshold: 60 },
    { label: "43 madde değerlendiriliyor", threshold: 75 },
    { label: "Marka-özel talimatlar yazılıyor", threshold: 85 },
  ];

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl px-6 py-20"
    >
      <motion.div variants={pageItem}>
        <div className="text-label text-muted-foreground mb-6">GH7 Audit</div>
        <h1 className="text-h1 mb-12">Denetim Hazırlanıyor</h1>
      </motion.div>

      <motion.ol variants={pageItem} className="mb-12 space-y-5">
        {steps.map((s, i) => {
          const isCompleted = progress >= s.threshold + 15;
          const isActive = progress >= s.threshold && !isCompleted;
          return (
            <li
              key={i}
              className="flex items-baseline gap-4 border-b border-border py-3 last:border-b-0"
            >
              <span
                className={`text-label tabular-nums ${
                  isCompleted || isActive
                    ? "text-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`flex-1 text-base tracking-tight ${
                  isCompleted
                    ? "text-muted-foreground line-through decoration-muted-foreground/30"
                    : isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/60"
                }`}
              >
                {s.label}
              </span>
              {isCompleted && (
                <span aria-hidden className="text-muted-foreground">
                  ✓
                </span>
              )}
              {isActive && (
                <span aria-hidden className="text-foreground">
                  ·
                </span>
              )}
            </li>
          );
        })}
      </motion.ol>

      <motion.div variants={pageItem}>
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {progress}% · {step || "Bekleniyor..."}{" "}
          <span className="text-muted-foreground/60">· {status}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// FAILED
// ═══════════════════════════════════════════════════════

function FailedState({
  audit,
  brand,
}: {
  audit: AuditWithItems;
  brand: BrandLite;
}) {
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();

  const retry = async () => {
    setRetrying(true);
    try {
      await fetch("/api/audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      });
      router.refresh();
    } catch {
      setRetrying(false);
    }
  };

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl px-6 py-20 text-center"
    >
      <motion.div variants={pageItem}>
        <div className="text-label text-muted-foreground mb-6">GH7 Audit</div>
        <h1 className="text-h1 mb-6">Denetim tamamlanamadı</h1>
        <p className="mx-auto mb-12 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {audit.errorMessage ||
            "Beklenmedik bir hata oldu. Lütfen tekrar dene."}
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {retrying ? "Başlatılıyor..." : "Tekrar Dene →"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// COMPLETED LIST
// ═══════════════════════════════════════════════════════

type Filter = "all" | "critical" | "warning" | "passed" | "done";

const FILTER_LABELS: Record<Filter, string> = {
  all: "Tümü",
  critical: "Kritik",
  warning: "Dikkat",
  passed: "Geçildi",
  done: "Yapıldı",
};

function CompletedList({
  audit,
  brand,
}: {
  audit: AuditWithItems;
  brand: BrandLite;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [reAuditing, setReAuditing] = useState(false);
  const router = useRouter();

  const counts = useMemo(() => {
    const done = audit.items.filter((i) => i.completedAt).length;
    return {
      all: audit.items.length,
      critical: audit.items.filter((i) => i.status === "critical").length,
      warning: audit.items.filter((i) => i.status === "warning").length,
      passed: audit.items.filter((i) => i.status === "passed").length,
      done,
    };
  }, [audit.items]);

  const donePercent = Math.round((counts.done / counts.all) * 100);

  const startReAudit = async () => {
    if (
      !confirm(
        "Yeni bir denetim başlatılsın mı? Mevcut sonuçlar arşivde kalır, yeni denetim 60-90 saniye sürer.",
      )
    )
      return;
    setReAuditing(true);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      });
      if (res.ok) router.refresh();
      else setReAuditing(false);
    } catch {
      setReAuditing(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (filter === "all") return audit.items;
    if (filter === "done") return audit.items.filter((i) => i.completedAt);
    return audit.items.filter((i) => i.status === filter);
  }, [audit.items, filter]);

  const formattedDate = audit.completedAt
    ? new Date(audit.completedAt).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div
        variants={pageItem}
        className="mb-16 flex flex-wrap items-end justify-between gap-6"
      >
        <div className="min-w-0 flex-1">
          <div className="text-label text-muted-foreground mb-6">GH7 Audit</div>
          <h1 className="text-display mb-8">
            43 Maddelik
            <br />
            Denetim
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {brand.name} · {formattedDate} · Skor{" "}
            <span className="font-medium text-foreground tabular-nums">
              {audit.totalScore ?? 0}/100
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={startReAudit}
          disabled={reAuditing}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30 disabled:opacity-50"
        >
          {reAuditing ? "Başlatılıyor..." : "Tekrar Denetle →"}
        </button>
      </motion.div>

      {/* İLERLEME: X / 43 yapıldı */}
      <motion.section variants={pageItem} className="mb-16">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <div className="text-label text-muted-foreground">
            İlerleme ·{" "}
            <span className="tabular-nums text-foreground">
              {counts.done} / {counts.all}
            </span>{" "}
            yapıldı
          </div>
          <span className="text-label tabular-nums text-muted-foreground">
            {donePercent}%
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${donePercent}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.section>

      {/* SCORE METRIC */}
      <motion.section variants={pageItem} className="mb-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">Skor</div>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatBlock
            label="Toplam"
            value={audit.totalScore ?? 0}
            suffix="/100"
          />
          <StatBlock
            label="Geçildi"
            value={audit.passedCount ?? 0}
            suffix={`/ ${counts.all}`}
          />
          <StatBlock
            label="Dikkat"
            value={audit.warningCount ?? 0}
            suffix={`/ ${counts.all}`}
          />
          <StatBlock
            label="Kritik"
            value={audit.criticalCount ?? 0}
            suffix={`/ ${counts.all}`}
          />
        </div>
      </motion.section>

      {/* BATCH RUNNER — awaiting-opus + generating + completed */}
      <motion.section variants={pageItem} className="mb-16">
        <BatchRunner audit={audit} />
      </motion.section>

      {/* FILTRE */}
      <motion.section variants={pageItem} className="mb-12">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-tight transition-colors ${
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {FILTER_LABELS[f]} · {counts[f]}
            </button>
          ))}
        </div>
      </motion.section>

      {/* LİSTE */}
      <motion.section variants={pageItem}>
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">Maddeler</div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-0">
          {filteredItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Bu filtrede madde yok.
            </p>
          )}
          {filteredItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

function StatBlock({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="text-label text-muted-foreground mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-metric-sm">{value}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  done,
}: {
  status: string;
  done: boolean;
}) {
  if (done) {
    return (
      <span className="rounded border border-border bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        Yapıldı
      </span>
    );
  }
  const styles: Record<string, string> = {
    critical: "border-destructive/30 text-destructive",
    warning: "border-amber-400/40 text-amber-700 dark:text-amber-400",
    passed: "border-border text-foreground",
    "not-applicable": "border-border text-muted-foreground",
  };
  const labels: Record<string, string> = {
    critical: "Kritik",
    warning: "Dikkat",
    passed: "Geçildi",
    "not-applicable": "Uygulanmıyor",
  };
  return (
    <span
      className={`rounded border bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-widest ${styles[status] ?? "border-border text-muted-foreground"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function ItemRow({ item }: { item: AuditItem }) {
  const catLabel =
    AUDIT_CATEGORIES[item.category as keyof typeof AUDIT_CATEGORIES]?.label ||
    item.category;
  const done = !!item.completedAt;

  return (
    <Link
      href={`/dashboard/audit/${item.itemCode}`}
      className="group flex items-baseline gap-6 border-b border-border py-5 last:border-b-0 hover:bg-muted/40"
    >
      <span className="text-label tabular-nums text-muted-foreground">
        {String(item.itemIndex).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-base font-medium leading-snug tracking-tight">
            {item.title}
          </p>
          <StatusBadge status={item.status} done={done} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{catLabel}</p>
      </div>
      <span className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════
// BATCH RUNNER — 3 batch'i manuel tetikle
// ═══════════════════════════════════════════════════════

type BatchUiSummary = {
  index: number;
  label: string;
  indexFrom: number;
  indexTo: number;
  doneCount: number;
  itemCount: number;
  state: "pending" | "running" | "done";
};

function computeBatchesForUi(
  audit: AuditWithItems,
): BatchUiSummary[] {
  // Hardcoded — provider.ts'deki AUDIT_BATCHES ile senkron.
  const batches = [
    { index: 0, label: "AI Crawler + Entity", indexFrom: 1, indexTo: 14 },
    {
      index: 1,
      label: "Structured Data + Content-AI",
      indexFrom: 15,
      indexTo: 28,
    },
    {
      index: 2,
      label: "Query-Match + Authority + AI Platform",
      indexFrom: 29,
      indexTo: 43,
    },
  ];
  return batches.map((b) => {
    const items = audit.items.filter(
      (i) => i.itemIndex >= b.indexFrom && i.itemIndex <= b.indexTo,
    );
    const doneCount = items.filter(
      (i) =>
        i.currentState &&
        i.currentState !== "Tarama devam ediyor...",
    ).length;
    return {
      ...b,
      doneCount,
      itemCount: items.length,
      state:
        doneCount === items.length
          ? ("done" as const)
          : doneCount > 0
            ? ("running" as const)
            : ("pending" as const),
    };
  });
}

function BatchRunner({ audit }: { audit: AuditWithItems }) {
  const router = useRouter();
  const [runningIdx, setRunningIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const batches = computeBatchesForUi(audit);
  const allDone = batches.every((b) => b.state === "done");
  const isBusy = audit.status === "generating" || runningIdx !== null;

  const runBatch = async (index: number) => {
    setRunningIdx(index);
    setError(null);
    try {
      const res = await fetch("/api/audit/run-batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ auditId: audit.id, batchIndex: index }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? data.message ?? "Beklenmeyen hata");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunningIdx(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="text-label text-muted-foreground">
          {allDone ? "Marka-özel Talimatlar" : "Talimat Batch'leri"}
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>

      {!allDone && (
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          43 madde için marka-özel Qwen talimatlarını 3 batch halinde üret.
          Her batch yaklaşık 2-3 dakika sürer. Başlatınca sayfa kitlenir,
          tamamlanınca otomatik yenilenir.
        </p>
      )}

      <div className="space-y-0">
        {batches.map((b) => {
          const isRunning = runningIdx === b.index;
          return (
            <div
              key={b.index}
              className="flex items-baseline gap-6 border-b border-border py-5 last:border-b-0"
            >
              <span className="text-label tabular-nums text-muted-foreground">
                {String(b.index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium tracking-tight">
                  {b.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Madde {b.indexFrom}-{b.indexTo} ·{" "}
                  <span className="tabular-nums">
                    {b.doneCount}/{b.itemCount}
                  </span>{" "}
                  hazır
                </p>
              </div>
              <div className="shrink-0">
                {b.state === "done" ? (
                  <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    ✓ Hazır
                  </span>
                ) : isRunning ? (
                  <span className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-foreground">
                    Çalışıyor…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => runBatch(b.index)}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                  >
                    {b.state === "running" ? "Devam Et →" : "Çalıştır →"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-xs text-destructive">
          Hata: {error}
        </p>
      )}

      {isBusy && runningIdx !== null && (
        <p className="mt-4 text-xs text-muted-foreground">
          Batch {runningIdx + 1} çalışıyor… sayfayı kapatma, 2-3 dakika sürer.
        </p>
      )}
    </div>
  );
}
