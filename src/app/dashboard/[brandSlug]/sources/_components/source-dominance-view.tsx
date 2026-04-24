"use client";

/**
 * SourceDominanceView — Brief N v4 Aşama 8.
 *
 * 3 kategori:
 *   ✓ Var olduğun kaynaklar
 *   ⚠ Zayıf varlık (neutral)
 *   ✗ Eksik kaynaklar (rakip var, sen yok) — öncelik
 */

import Link from "next/link";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";

type PresentSource = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  mentionedCompetitors: string[];
};

type WeakSource = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
};

type MissingSource = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  competitors: string[];
};

type Props = {
  brand: { slug: string; name: string };
  present: PresentSource[];
  weak: WeakSource[];
  missing: MissingSource[];
  unreachableCount: number;
};

export function SourceDominanceView({
  brand,
  present,
  weak,
  missing,
  unreachableCount,
}: Props) {
  const total = present.length + weak.length + missing.length;

  if (total === 0) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">
            GH7 · Kaynak Hakimiyeti
          </div>
          <h1 className="text-h1">Henüz kaynak analizi yok</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Kaynak analizi kategori sorgularının test edilmesiyle otomatik
            üretilir. Kategori sorgular sağlık skorun %50&apos;yi geçince
            aktifleşir.
          </p>
          <Link
            href={`/dashboard/${brand.slug}/category`}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Kategori Hakimiyeti&apos;ne Git →
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // Öncelik listesi — en çok rakip mention'lı missing'ler
  const prioritized = [...missing].sort(
    (a, b) => b.competitors.length - a.competitors.length,
  );

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
          Kaynak Hakimiyeti
        </div>
        <h1 className="text-h1 mb-4">Kaynak Hakimiyeti</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          AI&apos;ın kategori sorgularında referans aldığı <strong>{total}</strong>{" "}
          kaynak tespit edildi
          {unreachableCount > 0 && (
            <>
              {" "}
              (ayrıca {unreachableCount} kaynak ulaşılamadı — neutral)
            </>
          )}
          .
        </p>
      </motion.div>

      {/* ÖNCELİK */}
      {prioritized.length > 0 && (
        <motion.section variants={pageItem} className="mb-16">
          <SectionHeading label="Öncelik · Rakiplerin Var, Sen Yok" />
          <div className="space-y-0">
            {prioritized.slice(0, 10).map((s, idx) => (
              <div
                key={s.id}
                className="flex items-baseline justify-between gap-4 border-b border-border py-4 last:border-b-0"
              >
                <div className="flex items-baseline gap-6 min-w-0">
                  <span className="text-label tabular-nums text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium tracking-tight hover:underline"
                    >
                      {s.domain}
                    </a>
                    {s.title && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {s.title}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rakipler:{" "}
                      <span className="font-medium text-foreground">
                        {s.competitors.slice(0, 4).join(", ")}
                        {s.competitors.length > 4 &&
                          ` +${s.competitors.length - 4}`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* VAR OLDUĞU KAYNAKLAR */}
      {present.length > 0 && (
        <motion.section variants={pageItem} className="mb-16">
          <SectionHeading label={`Var Olduğun Kaynaklar · ${present.length}`} />
          <SourceGrid
            items={present.map((s) => ({
              key: s.id,
              url: s.url,
              domain: s.domain,
              title: s.title,
              tone: "ok" as const,
            }))}
          />
        </motion.section>
      )}

      {/* ZAYIF VARLIK */}
      {weak.length > 0 && (
        <motion.section variants={pageItem} className="mb-16">
          <SectionHeading label={`Nötr Kaynaklar · ${weak.length}`} />
          <p className="mb-4 text-xs text-muted-foreground">
            Ne sen, ne rakiplerin — AI için alakasız görünen kaynaklar.
          </p>
          <SourceGrid
            items={weak.map((s) => ({
              key: s.id,
              url: s.url,
              domain: s.domain,
              title: s.title,
              tone: "neutral" as const,
            }))}
          />
        </motion.section>
      )}

      {/* EKSİK KAYNAKLAR (tüm liste) */}
      {missing.length > prioritized.slice(0, 10).length && (
        <motion.section variants={pageItem} className="mb-8">
          <SectionHeading
            label={`Diğer Eksik Kaynaklar · ${missing.length - 10}`}
          />
          <SourceGrid
            items={missing.slice(10).map((s) => ({
              key: s.id,
              url: s.url,
              domain: s.domain,
              title: s.title,
              tone: "missing" as const,
            }))}
          />
        </motion.section>
      )}
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

function SourceGrid({
  items,
}: {
  items: Array<{
    key: string;
    url: string;
    domain: string;
    title: string | null;
    tone: "ok" | "neutral" | "missing";
  }>;
}) {
  const toneClasses = {
    ok: "border-border bg-card",
    neutral: "border-border bg-muted/30",
    missing: "border-destructive/30 bg-destructive/5",
  };
  const icon = {
    ok: "✓",
    neutral: "—",
    missing: "✗",
  };
  const iconClass = {
    ok: "text-foreground",
    neutral: "text-muted-foreground",
    missing: "text-destructive",
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-lg border ${toneClasses[item.tone]} p-4 transition-colors hover:border-foreground/30`}
        >
          <div className="flex items-baseline gap-3">
            <span className={`text-sm font-semibold ${iconClass[item.tone]}`}>
              {icon[item.tone]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium tracking-tight">
                {item.domain}
              </div>
              {item.title && (
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {item.title}
                </div>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
