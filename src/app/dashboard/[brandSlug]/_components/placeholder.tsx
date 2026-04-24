"use client";

/**
 * Geçici placeholder — Aşama 3-5'te ilgili sayfa içerikleriyle değiştirilecek.
 */

import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";

export function Placeholder({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-3xl px-6 py-16"
    >
      <motion.div variants={pageItem} className="space-y-6">
        <div className="text-label text-muted-foreground">{label}</div>
        <h1 className="text-h1">{title}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}
