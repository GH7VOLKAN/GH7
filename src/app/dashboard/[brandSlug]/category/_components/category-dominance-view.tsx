"use client";

/**
 * CategoryDominanceView — Brief N v4 Aşama 8.
 *
 * Her kategori sorgusu için 3-adım funnel sonuçlarını platform bazlı
 * tablo + rakip listesi gösterir.
 */

import Link from "next/link";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { formatPlatform } from "@/lib/templates/common/formatters";

type QuerySummary = {
  id: string;
  orderIndex: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | null;
  unlockedAt: Date | null;
  step1: string;
  step2: string;
  step3: string;
  platformResults: Array<{
    platform: string;
    foundAtStep: number | null;
    rank: number | null;
    points: number;
    competitors: string[];
  }>;
  totalPoints: number;
  maxPossible: number;
};

type Props = {
  brand: { slug: string; name: string };
  queries: QuerySummary[];
};

export function CategoryDominanceView({ brand, queries }: Props) {
  if (queries.length === 0) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">
            GH7 · Kategori Hakimiyeti
          </div>
          <h1 className="text-h1">Henüz kategori sorgusu yok</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Kategori hakimiyeti ölçümü için önce sorgu onayı yapman gerekli.
          </p>
          <Link
            href={`/dashboard/${brand.slug}/queries/approve`}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Sorgu Onayına Git →
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const unlockedCount = queries.filter((q) => q.unlockedAt !== null).length;

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-16"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-12">
        <div className="mb-4 text-label text-muted-foreground">
          <Link
            href={`/dashboard/${brand.slug}`}
            className="hover:text-foreground"
          >
            {brand.name}
          </Link>
          {" / "}
          Kategori Hakimiyeti
        </div>
        <h1 className="text-h1 mb-4">Kategori Hakimiyeti</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {queries.length} kategori sorgusundan {unlockedCount}&apos;i aktif. Her
          sorgu 3 adımda daraltılır: geniş kategori → bölge → niş özellik.
          Listede var ve sıralama puanına göre 0-5 puan.
        </p>
      </motion.div>

      {/* QUERIES */}
      <div className="space-y-6">
        {queries.map((q) => (
          <QueryCard key={q.id} query={q} />
        ))}
      </div>
    </motion.div>
  );
}

function QueryCard({ query }: { query: QuerySummary }) {
  const locked = query.unlockedAt === null;
  const diffLabel = query.difficulty
    ? { EASY: "Kolay", MEDIUM: "Orta", HARD: "Zor" }[query.difficulty]
    : null;

  return (
    <motion.section
      variants={pageItem}
      className={`rounded-xl border ${locked ? "border-border bg-muted/30" : "border-border bg-card"} p-6`}
    >
      {/* Title */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-label tabular-nums text-muted-foreground">
          {String(query.orderIndex).padStart(2, "0")}
        </span>
        {diffLabel && (
          <span className="rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {diffLabel}
          </span>
        )}
        {locked && (
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Kilitli
          </span>
        )}
        <span className="ml-auto text-sm tabular-nums text-muted-foreground">
          <span className="font-medium text-foreground">
            {query.totalPoints}
          </span>
          {" / "}
          {query.maxPossible}
          {" puan"}
        </span>
      </div>

      {/* 3 Step */}
      <div className="space-y-2 mb-4">
        <StepLine label="Step 1" text={query.step1} />
        <StepLine label="Step 2" text={query.step2} />
        <StepLine label="Step 3" text={query.step3} />
      </div>

      {/* Platform sonuçları */}
      {!locked && query.platformResults.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="text-label text-muted-foreground mb-3">
            Platform Sonuçları
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-label text-muted-foreground py-2">
                    Platform
                  </th>
                  <th className="text-center text-label text-muted-foreground py-2">
                    Bulundu
                  </th>
                  <th className="text-center text-label text-muted-foreground py-2">
                    Sıra
                  </th>
                  <th className="text-right text-label text-muted-foreground py-2">
                    Puan
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.platformResults.map((p) => (
                  <tr key={p.platform} className="border-b border-border last:border-b-0">
                    <td className="py-2 text-sm tracking-tight">
                      {formatPlatform(p.platform)}
                    </td>
                    <td className="py-2 text-center text-sm tabular-nums">
                      {p.foundAtStep ? `Step ${p.foundAtStep}` : "—"}
                    </td>
                    <td className="py-2 text-center text-sm tabular-nums">
                      {p.rank ? `#${p.rank}` : "—"}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      <span
                        className={
                          p.points > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {p.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rakipler */}
          {query.platformResults.some((p) => p.competitors.length > 0) && (
            <div className="mt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                Bu sorguda öne çıkan markalar:
              </span>{" "}
              {Array.from(
                new Set(
                  query.platformResults.flatMap((p) => p.competitors),
                ),
              )
                .slice(0, 8)
                .join(", ")}
            </div>
          )}
        </div>
      )}

      {locked && (
        <p className="mt-4 text-xs text-muted-foreground">
          Bu sorgu sağlık skorun yükselince otomatik açılır. Aşama 7 eşik
          sistemine bakın.
        </p>
      )}
    </motion.section>
  );
}

function StepLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-16 shrink-0 text-label text-muted-foreground">
        {label}
      </span>
      <span className="text-sm tracking-tight">{text}</span>
    </div>
  );
}
