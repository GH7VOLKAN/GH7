"use client";

/**
 * AdvisorView — Firma Advisor dashboard (Brief H-ext Aşama 5).
 *
 * İki durum:
 * - Rapor yok → "İlk Raporu Oluştur" CTA (POST /api/advisor/first-report)
 * - Rapor var → Markdown render + regenerate butonu
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { pageContainer, pageItem } from "@/lib/motion/variants";
import { formatDate } from "@/lib/templates/common/formatters";

export type AdvisorReportSummary = {
  id: string;
  reportType: "first" | "monthly" | "failed_stub";
  content: string;
  generatedAt: Date;
};

type Props = {
  brand: { slug: string; name: string };
  hasScan: boolean;
  latestReport: AdvisorReportSummary | null;
};

export function AdvisorView({ brand, hasScan, latestReport }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(regenerate: boolean) {
    setError(null);
    setLoading(true);
    try {
      const url = `/api/advisor/first-report${regenerate ? "?regenerate=1" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandSlug: brand.slug }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Rapor üretilemedi");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // State 1: henüz scan yok
  if (!hasScan && !latestReport) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">GH7 Advisor</div>
          <h1 className="text-h1">Henüz analiz yok</h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Kişisel danışman raporu için önce bir AI görünürlük analizi
            tamamlanmalı. Insight sayfasından başlayabilirsin.
          </p>
          <Link
            href={`/dashboard/${brand.slug}/insight`}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Insight&apos;a Git →
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // State 2: rapor yok, scan var → CTA
  if (!latestReport) {
    return (
      <motion.div
        variants={pageContainer}
        initial="initial"
        animate="animate"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <motion.div variants={pageItem} className="space-y-6">
          <div className="text-label text-muted-foreground">GH7 Advisor</div>
          <h1 className="text-h1">İlk Kişisel Raporun</h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {brand.name} için Qwen ile marka-özel bir danışman raporu oluştur.
            Mevcut durum özeti, güçlü yönler, iyileştirme alanları ve 30 günlük
            yol haritası içerir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
            >
              {loading ? "Üretiliyor…" : "İlk Raporu Oluştur →"}
            </button>
            <span className="text-xs text-muted-foreground">
              Tahmini süre: 20-40 saniye
            </span>
          </div>
          {error && (
            <p className="text-sm text-destructive">Hata: {error}</p>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // State 3: rapor var → göster
  const isStub = latestReport.reportType === "failed_stub";

  return (
    <motion.div
      variants={pageContainer}
      initial="initial"
      animate="animate"
      className="mx-auto max-w-3xl px-6 py-12 lg:py-20"
    >
      {/* HEADER */}
      <motion.div variants={pageItem} className="mb-12">
        <div className="text-label text-muted-foreground mb-6">GH7 Advisor</div>
        <h1 className="text-h1 mb-4">
          {isStub ? "Rapor Üretilemedi" : "Kişisel Raporun"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(new Date(latestReport.generatedAt))} ·{" "}
          {latestReport.reportType === "first"
            ? "İlk tespit raporu"
            : latestReport.reportType === "monthly"
              ? "Aylık rapor"
              : "Hata raporu"}
        </p>
      </motion.div>

      {/* CONTENT */}
      <motion.article
        variants={pageItem}
        className="advisor-prose space-y-6"
      >
        <MarkdownRender text={latestReport.content} />
      </motion.article>

      {/* REGENERATE — rapor dışı UI footer */}
      <motion.div
        variants={pageItem}
        className="mt-16 border-t border-border pt-8"
      >
        <div className="text-label text-muted-foreground mb-4">
          Rapor Kontrolleri
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleGenerate(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium tracking-tight transition-colors hover:border-foreground/30 disabled:opacity-60"
          >
            {loading ? "Üretiliyor…" : "Raporu Yenile"}
          </button>
          {error && (
            <span className="text-sm text-destructive">Hata: {error}</span>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Yeni Qwen çağrısı yapılır ve bu alanda en son rapor görünür.
          Önceki raporlar veritabanında saklanır.
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Basit Markdown render — ## başlıklar, - listeler, **bold**.
 * Dış kütüphane eklemek yerine sadeleştirilmiş parser.
 */
function MarkdownRender({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let paraBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-2 pl-4">
        {listBuffer.map((item, i) => (
          <li
            key={i}
            className="list-disc text-base leading-relaxed tracking-tight"
          >
            <InlineFmt text={item} />
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };
  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    blocks.push(
      <p
        key={`p-${blocks.length}`}
        className="text-base leading-relaxed tracking-tight"
      >
        <InlineFmt text={paraBuffer.join(" ")} />
      </p>,
    );
    paraBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushPara();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push(
        <h2
          key={`h2-${blocks.length}`}
          className="text-h3 mt-8 mb-2 tracking-tight"
        >
          {line.slice(3).trim()}
        </h2>,
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      flushPara();
      blocks.push(
        <h3
          key={`h3-${blocks.length}`}
          className="text-label text-muted-foreground mt-6 mb-1"
        >
          {line.slice(4).trim()}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushPara();
      listBuffer.push(line.slice(2).trim());
      continue;
    }
    if (/^\*\*.+\*\*$/.test(line)) {
      flushList();
      flushPara();
      blocks.push(
        <p
          key={`wk-${blocks.length}`}
          className="text-base font-semibold tracking-tight mt-6"
        >
          {line.replace(/^\*\*/, "").replace(/\*\*$/, "")}
        </p>,
      );
      continue;
    }
    flushList();
    paraBuffer.push(line);
  }
  flushList();
  flushPara();

  return <>{blocks}</>;
}

function InlineFmt({ text }: { text: string }) {
  // **bold** render
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^\*\*[^*]+\*\*$/.test(p)) {
          return (
            <strong key={i} className="font-semibold">
              {p.replace(/^\*\*/, "").replace(/\*\*$/, "")}
            </strong>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
