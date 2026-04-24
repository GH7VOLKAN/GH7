"use client";

/**
 * AuditItemView — Madde detay (Brief G Aşama 4).
 *
 * Sections:
 * - Header: label "MADDE N/43 · KATEGORİ" + title + status badge
 * - Neden Önemli? (descriptionStatic)
 * - Senin Sitende Mevcut Durum (Opus currentState)
 * - Yapılacaklar (Opus instructions[] — numaralı, opsiyonel kod bloğu)
 * - Etki (Opus impactText + expectedGain + difficulty + estimatedHours)
 * - Footer: Önceki / Yaptım / Sonraki
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { AuditItem } from "@prisma/client";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { AUDIT_CATEGORIES } from "@/lib/audit/master-items";

type InstructionStep = {
  step: number;
  text: string;
  code?: string;
};

type Props = {
  auditId: string;
  brandSlug: string;
  item: AuditItem;
  prevCode: string | null;
  nextCode: string | null;
  totalItems: number;
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

export function AuditItemView({
  auditId,
  brandSlug,
  item,
  prevCode,
  nextCode,
  totalItems,
}: Props) {
  const auditRoot = `/dashboard/${brandSlug}/audit`;
  const router = useRouter();
  const [completed, setCompleted] = useState(!!item.completedAt);
  const [saving, setSaving] = useState(false);

  const catLabel =
    AUDIT_CATEGORIES[item.category as keyof typeof AUDIT_CATEGORIES]?.label ||
    item.category;

  const instructions = (Array.isArray(item.instructions)
    ? (item.instructions as unknown as InstructionStep[])
    : []
  ).sort((a, b) => (a.step ?? 0) - (b.step ?? 0));

  const markDone = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/audit/complete-item", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ auditId, itemCode: item.itemCode }),
      });
      if (res.ok) {
        setCompleted(true);
        // 400ms sonra sonraki maddeye geç
        setTimeout(() => {
          if (nextCode) {
            router.push(`${auditRoot}/${nextCode}`);
          } else {
            router.push(auditRoot);
          }
        }, 400);
      }
    } finally {
      setSaving(false);
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
      <motion.div variants={pageItem} className="mb-12">
        <div className="text-label text-muted-foreground mb-6">
          Madde{" "}
          <span className="tabular-nums">
            {String(item.itemIndex).padStart(2, "0")} / {totalItems}
          </span>
          {" · "}
          {catLabel}
        </div>
        <h1 className="text-h1 mb-4 leading-[1.1]">{item.title}</h1>
        <StatusBadge status={item.status} done={completed} />
      </motion.div>

      {/* NEDEN ÖNEMLİ */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label="Neden Önemli?" />
        <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {item.descriptionStatic}
        </p>
      </motion.section>

      {/* MEVCUT DURUM */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label="Senin Sitende Mevcut Durum" />
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {item.currentState}
        </p>
      </motion.section>

      {/* YAPILACAKLAR */}
      {instructions.length > 0 && (
        <motion.section variants={pageItem} className="mb-16">
          <SectionHeading label="Yapılacaklar" />
          <ol className="space-y-8">
            {instructions.map((step, idx) => (
              <li
                key={idx}
                className="flex items-baseline gap-6 border-b border-border pb-8 last:border-b-0 last:pb-0"
              >
                <span className="text-label tabular-nums text-muted-foreground">
                  {String(step.step ?? idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 space-y-4">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {step.text}
                  </p>
                  {step.code && (
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 font-geist-mono text-xs leading-relaxed">
                      <code>{step.code}</code>
                    </pre>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </motion.section>
      )}

      {/* ETKİ */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label="Etki" />
        <p className="mb-6 text-base leading-relaxed whitespace-pre-wrap">
          {item.impactText}
        </p>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <MetaBlock
            label="Beklenen Kazanç"
            value={item.expectedGain || "—"}
          />
          <MetaBlock
            label="Zorluk"
            value={DIFFICULTY_LABELS[item.difficulty] || item.difficulty}
          />
          <MetaBlock
            label="Süre"
            value={
              item.estimatedHours > 0
                ? `${item.estimatedHours} saat`
                : "Otomatik"
            }
          />
        </dl>
      </motion.section>

      {/* FOOTER NAV */}
      <motion.div
        variants={pageItem}
        className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
      >
        {prevCode ? (
          <Link
            href={`${auditRoot}/${prevCode}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Önceki Madde
          </Link>
        ) : (
          <Link
            href={auditRoot}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Liste
          </Link>
        )}

        <button
          type="button"
          onClick={markDone}
          disabled={saving || completed}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
            completed
              ? "bg-muted text-muted-foreground"
              : "bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
          }`}
        >
          {completed ? "✓ Yapıldı" : saving ? "Kaydediliyor..." : "Yaptım ✓"}
        </button>

        {nextCode ? (
          <Link
            href={`${auditRoot}/${nextCode}`}
            className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Sonraki Madde →
          </Link>
        ) : (
          <Link
            href={auditRoot}
            className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Liste →
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="text-label text-muted-foreground">{label}</div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-label text-muted-foreground mb-2">{label}</div>
      <div className="text-sm font-medium tracking-tight">{value}</div>
    </div>
  );
}

function StatusBadge({ status, done }: { status: string; done: boolean }) {
  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        ✓ Yapıldı
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
      className={`inline-flex items-center rounded border bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest ${styles[status] ?? "border-border text-muted-foreground"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
