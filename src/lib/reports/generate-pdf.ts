/**
 * GH7.ai — PDF Report Generator
 * Generates a professional Turkish-language GEO report using jsPDF.
 */

import { jsPDF } from "jspdf";
import type { PlatformKey } from "@/lib/types";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

const PLATFORMS: PlatformKey[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
];

// ─── Input Types ────────────────────────────────────

export interface PdfReportInput {
  brandName: string;
  brandDomain: string;
  ownerName: string;
  geoScore: number; // 0-100 composite
  metrics: {
    sesPayi: number; // share of voice %
    kapsam: number; // coverage / mention rate %
    ortSira: number; // average position (lower = better)
    algi: string; // sentiment label (Pozitif / Nötr / Negatif)
  };
  platformBreakdown: Array<{
    platform: PlatformKey;
    mentioned: number;
    total: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    score: number; // 0-100
  }>;
  competitors: Array<{
    name: string;
    mentionScore: number;
  }>;
  actions: string[];
  checklistProgress: {
    completed: number;
    total: number;
  };
}

// ─── Generator ──────────────────────────────────────

export function generatePdfReport(input: PdfReportInput): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const marginBottom = 25;
  const marginTop = 20;
  let y = marginTop;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ── Header ──────────────────────────────────────────
  doc.setFillColor(17, 24, 39); // gray-900
  doc.rect(0, 0, pageWidth, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("Helvetica", "bold");
  doc.text("GH7.ai", marginLeft, 18);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text("Yapay Zeka Gorunurluk Platformu", marginLeft, 26);

  doc.setFontSize(9);
  doc.text(dateStr, marginLeft, 34);

  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text(input.brandName, pageWidth - marginRight, 18, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.text(input.brandDomain, pageWidth - marginRight, 26, { align: "right" });
  doc.text(input.ownerName, pageWidth - marginRight, 34, { align: "right" });

  y = 52;

  // ── Title ───────────────────────────────────────────
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(20);
  doc.setFont("Helvetica", "bold");
  doc.text("Haftalik GEO Raporu", marginLeft, y);
  y += 12;

  // ── GEO Score (large) ──────────────────────────────
  ensureSpace(40);
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(marginLeft, y, contentWidth, 32, 3, 3, "FD");

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("GEO Skoru", marginLeft + 12, y + 12);

  doc.setFontSize(28);
  doc.setFont("Helvetica", "bold");
  if (input.geoScore >= 60) {
    doc.setTextColor(22, 163, 74); // green
  } else if (input.geoScore >= 30) {
    doc.setTextColor(202, 138, 4); // amber
  } else {
    doc.setTextColor(220, 38, 38); // red
  }
  doc.text(`${input.geoScore}`, marginLeft + 12, y + 26);

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text("/ 100", marginLeft + 32, y + 26);

  y += 40;

  // ── 4 Metrics ──────────────────────────────────────
  ensureSpace(34);
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Temel Metrikler", marginLeft, y);
  y += 10;

  const metricBoxes = [
    { label: "Ses Payi", value: `%${input.metrics.sesPayi}` },
    { label: "Kapsam", value: `%${input.metrics.kapsam}` },
    { label: "Ort. Sira", value: `${input.metrics.ortSira.toFixed(1)}` },
    { label: "Algi", value: input.metrics.algi },
  ];

  const boxWidth = (contentWidth - 12) / 4;
  const boxHeight = 22;

  metricBoxes.forEach((metric, i) => {
    const bx = marginLeft + i * (boxWidth + 4);

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(metric.label, bx + boxWidth / 2, y + 8, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(metric.value, bx + boxWidth / 2, y + 18, { align: "center" });
  });

  y += boxHeight + 14;

  // ── Top 5 Keywords ─────────────────────────────────
  if (input.topKeywords.length > 0) {
    ensureSpace(50);
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("En Iyi Anahtar Kelimeler", marginLeft, y);
    y += 10;

    // Table header
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("#", marginLeft, y);
    doc.text("Anahtar Kelime", marginLeft + 8, y);
    doc.text("Skor", marginLeft + 120, y);
    y += 3;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    input.topKeywords.slice(0, 5).forEach((kw, i) => {
      ensureSpace(8);
      doc.setTextColor(55, 65, 81);
      doc.text(`${i + 1}.`, marginLeft, y);

      // Truncate long keywords
      const maxLen = 55;
      const kwText =
        kw.keyword.length > maxLen
          ? kw.keyword.substring(0, maxLen) + "..."
          : kw.keyword;
      doc.text(kwText, marginLeft + 8, y);

      // Color-coded score
      if (kw.score >= 60) {
        doc.setTextColor(22, 163, 74);
      } else if (kw.score >= 30) {
        doc.setTextColor(202, 138, 4);
      } else {
        doc.setTextColor(220, 38, 38);
      }
      doc.text(`${kw.score}/100`, marginLeft + 125, y, { align: "center" });
      doc.setTextColor(55, 65, 81);
      y += 7;
    });

    y += 6;
  }

  // ── Platform Breakdown ─────────────────────────────
  ensureSpace(55);
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Platform Bazinda Gorunurluk", marginLeft, y);
  y += 10;

  // Table header
  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(107, 114, 128);
  doc.text("Platform", marginLeft, y);
  doc.text("Bahsedilme", marginLeft + 60, y);
  doc.text("Toplam", marginLeft + 95, y);
  doc.text("Oran", marginLeft + 125, y);
  y += 3;
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 5;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  for (const pb of input.platformBreakdown) {
    ensureSpace(8);
    const pct =
      pb.total > 0 ? Math.round((pb.mentioned / pb.total) * 100) : 0;

    doc.text(PLATFORM_LABELS[pb.platform] ?? pb.platform, marginLeft, y);
    doc.text(`${pb.mentioned}`, marginLeft + 68, y, { align: "center" });
    doc.text(`${pb.total}`, marginLeft + 100, y, { align: "center" });

    if (pct >= 50) {
      doc.setTextColor(22, 163, 74);
    } else if (pct >= 20) {
      doc.setTextColor(202, 138, 4);
    } else {
      doc.setTextColor(220, 38, 38);
    }
    doc.text(`%${pct}`, marginLeft + 130, y, { align: "center" });
    doc.setTextColor(55, 65, 81);

    y += 7;
  }

  y += 6;

  // ── Competitor Ranking ─────────────────────────────
  if (input.competitors.length > 0) {
    ensureSpace(40);
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Rakip Siralaması", marginLeft, y);
    y += 10;

    // Table header
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("#", marginLeft, y);
    doc.text("Rakip", marginLeft + 8, y);
    doc.text("Bahsedilme Skoru", marginLeft + 100, y);
    y += 3;
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    input.competitors.forEach((comp, i) => {
      ensureSpace(8);
      doc.text(`${i + 1}.`, marginLeft, y);
      doc.text(comp.name, marginLeft + 8, y);
      doc.text(`${comp.mentionScore}/100`, marginLeft + 110, y, {
        align: "center",
      });
      y += 7;
    });

    // Brand itself
    ensureSpace(10);
    y += 2;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text("->", marginLeft, y);
    doc.text(`${input.brandName} (Siz)`, marginLeft + 8, y);
    doc.text(`${input.geoScore}/100`, marginLeft + 110, y, {
      align: "center",
    });
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "normal");

    y += 12;
  }

  // ── Recommended Actions ────────────────────────────
  if (input.actions.length > 0) {
    ensureSpace(40);
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Onerilen Aksiyonlar", marginLeft, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    input.actions.slice(0, 5).forEach((action, i) => {
      ensureSpace(12);
      const lines = doc.splitTextToSize(
        `${i + 1}. ${action}`,
        contentWidth - 8,
      );
      for (const line of lines) {
        doc.text(line, marginLeft + 4, y);
        y += 5;
      }
      y += 2;
    });
  }

  // ── Checklist Progress ─────────────────────────────
  ensureSpace(25);
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Gelisim Plani", marginLeft, y);
  y += 10;

  const barWidth = contentWidth * 0.55;
  const barHeight = 8;
  const progressPct =
    input.checklistProgress.total > 0
      ? input.checklistProgress.completed / input.checklistProgress.total
      : 0;

  doc.setFillColor(229, 231, 235);
  doc.roundedRect(marginLeft, y, barWidth, barHeight, 2, 2, "F");

  if (progressPct > 0) {
    if (progressPct >= 0.5) {
      doc.setFillColor(22, 163, 74);
    } else if (progressPct >= 0.25) {
      doc.setFillColor(202, 138, 4);
    } else {
      doc.setFillColor(220, 38, 38);
    }
    doc.roundedRect(
      marginLeft,
      y,
      barWidth * progressPct,
      barHeight,
      2,
      2,
      "F",
    );
  }

  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(
    `${input.checklistProgress.completed}/${input.checklistProgress.total} tamamlandi (%${Math.round(progressPct * 100)})`,
    marginLeft + barWidth + 6,
    y + 6,
  );

  // ── Footer on every page ───────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `GH7.ai - Olusturulma tarihi: ${dateStr}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text(
      `Sayfa ${p} / ${totalPages}`,
      pageWidth - marginRight,
      pageHeight - 10,
      { align: "right" },
    );
  }

  // ── Return Buffer ──────────────────────────────────
  return Buffer.from(doc.output("arraybuffer"));
}
