"use client";

/**
 * RadarView — Firma Radar dashboard (Brief H-ext Aşama 4).
 *
 * Bölümler:
 * - Rakipler listesi (N/3)
 * - Karşılaştırma matrisi (query × competitor)
 * - Önde/eşit/geride özeti
 * - Rakip site analizi (Brief I — şimdilik placeholder)
 * - Rakibin önde olduğu sorgular
 * - Sonraki rapor kartı
 */

import Link from "next/link";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { formatDate } from "@/lib/templates/common/formatters";

export type RadarCompetitor = {
  id: string;
  name: string;
  domain: string;
  isPrimary: boolean;
};

export type RadarMatrixRow = {
  text: string;
  userMentioned: boolean;
  competitorMentions: boolean[];
};

export type RadarData = {
  competitors: RadarCompetitor[];
  matrix: RadarMatrixRow[];
  summary: {
    aheadCount: number;
    tieCount: number;
    behindCount: number;
    totalQueries: number;
  };
  competitorLeadingQueries: Array<{
    text: string;
    leaders: string[];
  }>;
};

type Props = {
  data: RadarData | null;
  brand: { slug: string; name: string };
  hasCompetitors: boolean;
  hasScan: boolean;
  nextReportAt: Date;
};

export function RadarView({
  data,
  brand,
  hasCompetitors,
  hasScan,
  nextReportAt,
}: Props) {
  if (!data) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">GH7 Radar</div>
          <h1 className="text-h1">
            {!hasCompetitors ? "Rakip eklenmedi" : "Henüz tarama yok"}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {!hasCompetitors
              ? "Radar haftalık rakip takibi için en az 1 rakip gerekli. Marka ayarlarından rakip ekle."
              : "İlk rakip karşılaştırması için analiz tamamlanmalı."}
          </p>
          <Link
            href={
              hasCompetitors
                ? `/dashboard/${brand.slug}/insight`
                : `/dashboard/studio`
            }
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            {hasCompetitors ? "Insight'a Git →" : "Studio'ya Git →"}
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-4xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-16">
        <div className="text-label text-muted-foreground mb-6">GH7 Radar</div>
        <h1 className="text-h1 mb-6">Rakip Takip ve Karşılaştırma</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {brand.name} için {data.competitors.length} rakip izleniyor. Bu hafta
          {" "}
          <span className="font-medium text-foreground">
            {data.matrix.length}
          </span>{" "}
          sorguda pozisyon karşılaştırması yapıldı.
        </p>
      </motion.div>

      {/* RAKİPLER LİSTESİ */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label={`Rakiplerin · ${data.competitors.length}`} />
        <div className="space-y-0">
          {data.competitors.map((c, idx) => (
            <div
              key={c.id}
              className="flex items-baseline justify-between border-b border-border py-4 last:border-b-0"
            >
              <div className="flex items-baseline gap-6">
                <span className="text-label tabular-nums text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium tracking-tight">
                  {c.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {c.domain && !c.domain.endsWith(".placeholder")
                  ? c.domain
                  : "URL yok"}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={`/dashboard/studio`}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 font-medium tracking-tight transition-colors hover:border-foreground/30"
          >
            Rakip Düzenle
          </Link>
        </div>
      </motion.section>

      {/* KARŞILAŞTIRMA MATRİSİ */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label="Karşılaştırma Matrisi" />
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-[40%] px-4 py-3 text-left text-label tracking-[0.14em] text-muted-foreground">
                  Sorgu
                </th>
                <th className="w-16 px-2 py-3 text-center text-label tracking-[0.14em] text-muted-foreground">
                  Sen
                </th>
                {data.competitors.map((c) => (
                  <th
                    key={c.id}
                    className="w-16 px-2 py-3 text-center text-label tracking-[0.14em] text-muted-foreground"
                  >
                    {c.name.split(" ")[0].slice(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm tracking-tight">
                    {row.text}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <MatrixCell mentioned={row.userMentioned} />
                  </td>
                  {row.competitorMentions.map((m, i) => (
                    <td key={i} className="px-2 py-3 text-center">
                      <MatrixCell mentioned={m} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
          <SummaryStat
            label="Öndesin"
            value={data.summary.aheadCount}
            total={data.summary.totalQueries}
          />
          <SummaryStat
            label="Eşitsin"
            value={data.summary.tieCount}
            total={data.summary.totalQueries}
          />
          <SummaryStat
            label="Geridesin"
            value={data.summary.behindCount}
            total={data.summary.totalQueries}
          />
        </div>
      </motion.section>

      {/* RAKİBİN ÖNDE OLDUĞU SORGULAR */}
      {data.competitorLeadingQueries.length > 0 && (
        <motion.section variants={pageItem} className="mb-16">
          <SectionHeading label="Rakibin Önde Olduğu Sorgular" />
          <div className="space-y-0">
            {data.competitorLeadingQueries.map((q, idx) => (
              <div
                key={idx}
                className="border-b border-border py-5 last:border-b-0"
              >
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-destructive" aria-hidden>
                    ❗
                  </span>
                  <span className="text-base font-medium tracking-tight">
                    {q.text}
                  </span>
                </div>
                <p className="ml-6 text-sm text-muted-foreground">
                  Önde olan:{" "}
                  <span className="font-medium text-foreground">
                    {q.leaders.join(", ")}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* RAKIP SİTE ANALİZİ (placeholder — Brief I'da DataForSEO) */}
      <motion.section variants={pageItem} className="mb-16">
        <SectionHeading label="Rakip Site Analizi" />
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <p className="mb-2 text-sm text-muted-foreground">
            DataForSEO ile backlink + site sağlığı karşılaştırması
          </p>
          <p className="text-xs text-muted-foreground">
            Haftalık cron (Brief I) aktif olduğunda rakip site performansı
            (referring domains, site health) burada gösterilecek.
          </p>
        </div>
      </motion.section>

      {/* SONRAKI RAPOR */}
      <motion.section variants={pageItem}>
        <SectionHeading label="Haftalık Rakip Takibi" />
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">
              Pazartesi · 08:00
            </div>
            <div className="text-h3">{formatDate(nextReportAt)}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Haftalık raporda:
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>· Rakip öne geçmesi</li>
            <li>· Yeni sorguda rakip mention</li>
            <li>· Rakip site güncellemeleri</li>
          </ul>
        </div>
      </motion.section>
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

function MatrixCell({ mentioned }: { mentioned: boolean }) {
  return (
    <span
      aria-label={mentioned ? "Bahsediyor" : "Bahsetmiyor"}
      className={`inline-flex size-5 items-center justify-center rounded text-xs ${
        mentioned
          ? "bg-foreground text-background font-semibold"
          : "bg-transparent text-muted-foreground/40"
      }`}
    >
      {mentioned ? "✓" : "—"}
    </span>
  );
}

function SummaryStat({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div>
      <div className="text-label text-muted-foreground mb-2">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-h3 tabular-nums">{value}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          / {total}
        </span>
      </div>
    </div>
  );
}
