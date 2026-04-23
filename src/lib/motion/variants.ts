/**
 * Brief F — Framer Motion variant kütüphanesi
 *
 * Pattern'ler:
 * 1. pageContainer + pageItem — staggered page entrance
 * 2. cardHover — subtle Y shift + border accent
 *
 * Kurallar:
 * - Bounce / spring YOK (sert, professional değil)
 * - Rotation / flip YOK
 * - Ease: [0.22, 1, 0.36, 1] (smooth out-expo benzeri)
 * - Duration'lar: 120ms (nav hover) · 150ms (buton) · 200ms (kart) · 400–500ms (page)
 */

import type { Variants } from "motion/react";

export const pageContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const pageItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const cardHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};
