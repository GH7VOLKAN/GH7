"use client";

/**
 * Gate !== FIRMA için coming-soon fallback (Brief H-ext Aşama 1).
 *
 * Kişi / E-Ticaret / Yurtdışı kapıları aktif olana kadar gösterilir.
 * Kullanıcı manuel URL ile bu markaya erişirse ürünü yeni kapı açılana
 * kadar göremez — ama markanın varlığı kaybolmaz.
 */

import Link from "next/link";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";

const GATE_LABELS: Record<string, { label: string; launch: string }> = {
  KISI: { label: "Kişi", launch: "Q3 2026" },
  ETICARET: { label: "E-Ticaret", launch: "Q4 2026" },
  YURTDISI: { label: "Yurt Dışı", launch: "Q1 2027" },
};

type Props = {
  gate: string;
  brandName: string;
};

export function GateComingSoon({ gate, brandName }: Props) {
  const info = GATE_LABELS[gate] ?? { label: gate, launch: "yakında" };
  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-2xl px-6 py-20 text-center lg:py-28"
    >
      <motion.div variants={pageItem}>
        <div className="text-label text-muted-foreground mb-6">
          GH7 · {info.label} Kapısı
        </div>
        <h1 className="text-display mb-8">
          {info.label}
          <br />
          Kapısı Yakında
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-base leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{brandName}</span>{" "}
          markası {info.label.toLowerCase()} kapısından eklendi. Bu kapı{" "}
          <span className="font-medium text-foreground">{info.launch}</span>{" "}
          tarihinde açıldığında tüm araçlar aktif olacak.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          ← Dashboard&apos;a Dön
        </Link>
      </motion.div>
    </motion.div>
  );
}
