"use client";

/**
 * ComingSoonView — Kinde editorial yakında şablonu (Brief F Adım 2.3)
 *
 * Display H1 2 satır + intro + numbered features + launch date section.
 */

import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";

type Props = {
  info: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    features: readonly string[];
    launchDate: string;
  };
};

export function ComingSoonView({ info }: Props) {
  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="text-label text-muted-foreground mb-6">
          {info.label}
        </div>
        <h1 className="text-display mb-8">
          {info.titleLine1}
          <br />
          {info.titleLine2}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {info.intro}
        </p>
      </motion.div>

      {/* ÖZELLİKLER */}
      <motion.section variants={pageItem} className="mb-20">
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">Özellikler</div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-0">
          {info.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-baseline gap-6 border-b border-border py-4 last:border-b-0"
            >
              <span className="text-label tabular-nums text-muted-foreground">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-base leading-snug tracking-tight">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* LANSMAN */}
      <motion.section variants={pageItem}>
        <div className="mb-8 flex items-center gap-4">
          <div className="text-label text-muted-foreground">
            Planlanan Lansman
          </div>
          <div className="h-px flex-1 bg-border" />
        </div>

        <h2 className="text-h2 mb-6">{info.launchDate}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Pro ve Pro+ üyeleri için ilk lansmanda ücretsiz açılır. Aktif
          olduğunda e-posta ile haber veririz.
        </p>
      </motion.section>
    </motion.div>
  );
}
