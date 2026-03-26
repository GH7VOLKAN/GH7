import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";
import type { PlatformKey } from "@/lib/types";

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
  google_aio: "Google AIO",
};

const PLATFORMS: PlatformKey[] = ["chatgpt", "claude", "gemini", "perplexity", "google_aio"];

export async function GET() {
  // ── Auth ────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Get profile + brand ─────────────────────────────────
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
  }

  // ── PRO+ plan check ─────────────────────────────────────
  const plan = profile.plan ?? "free";
  if (plan === "free") {
    return NextResponse.json(
      { error: "PDF raporu sadece Pro ve Business planlarda kullanilabilir" },
      { status: 403 },
    );
  }

  const brand = await prisma.brand.findFirst({
    where: { profileId: profile.id, isDefault: true },
  });
  if (!brand) {
    return NextResponse.json({ error: "Marka bulunamadı" }, { status: 404 });
  }

  // ── Gather data ─────────────────────────────────────────
  // Latest scores
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId: brand.id },
    orderBy: { date: "desc" },
  });
  const mentionScore = latestScore?.mentionScore ?? 0;
  const readinessScore = latestScore?.readinessScore ?? 0;

  // Latest scan + platform breakdown
  const latestScan = await prisma.scan.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const platCounts: Record<PlatformKey, { mentioned: number; total: number }> = {
    chatgpt: { mentioned: 0, total: 0 },
    claude: { mentioned: 0, total: 0 },
    gemini: { mentioned: 0, total: 0 },
    perplexity: { mentioned: 0, total: 0 },
    google_aio: { mentioned: 0, total: 0 },
  };

  let totalMentioned = 0;
  let totalResults = 0;

  if (latestScan) {
    const results = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: { platform: true, mentioned: true },
    });
    totalResults = results.length;

    for (const r of results) {
      const p = r.platform as PlatformKey;
      if (!platCounts[p]) continue;
      platCounts[p].total++;
      if (r.mentioned) {
        platCounts[p].mentioned++;
        totalMentioned++;
      }
    }
  }

  // Platforms that mention the brand
  const mentioningPlatforms = PLATFORMS.filter((p) => platCounts[p].mentioned > 0);
  const overallScore = `${mentioningPlatforms.length}/5 platform seni bahsediyor`;

  // Top competitors (Senin Yerine Kim)
  const competitors = await prisma.competitor.findMany({
    where: { brandId: brand.id },
    orderBy: { mentionScore: "desc" },
    take: 5,
  });

  // Checklist progress
  const checklistItems = await prisma.checklistItem.findMany({
    where: { brandId: brand.id },
    select: { status: true },
  });
  const checklistTotal = checklistItems.length;
  const checklistCompleted = checklistItems.filter((i) => i.status === "complete").length;

  // ── Generate PDF ────────────────────────────────────────
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

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("Helvetica", "bold");
  doc.text("GH7.ai", marginLeft, 18);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text("Yapay Zeka Gorunurluk Raporu", marginLeft, 26);

  doc.setFontSize(12);
  doc.text(brand.name, pageWidth - marginRight, 18, { align: "right" });
  doc.setFontSize(9);
  doc.text(brand.domain, pageWidth - marginRight, 26, { align: "right" });

  y = 50;

  // ── Title ───────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");
  doc.text("GEO Gorunurluk Raporu", marginLeft, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(dateStr, marginLeft, y);
  y += 6;
  doc.text(`${profile.fullName ?? profile.email}`, marginLeft, y);
  y += 10;

  // ── Separator ───────────────────────────────────────────
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  // ── Overall Score ───────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Genel Skor", marginLeft, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(overallScore, marginLeft, y);
  y += 12;

  // ── Key Metrics ─────────────────────────────────────────
  const metrics = [
    { label: "Bahsedilme Skoru", value: `${mentionScore}/100` },
    { label: "Hazırlık Skoru", value: `${readinessScore}/100` },
    { label: "Toplam Sonuç", value: `${totalMentioned}/${totalResults}` },
    { label: "Gelişim Planı", value: `${checklistCompleted}/${checklistTotal}` },
  ];

  const boxWidth = (contentWidth - 12) / 4;
  const boxHeight = 22;

  ensureSpace(boxHeight + 4);

  metrics.forEach((metric, i) => {
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

  // ── Platform Breakdown ──────────────────────────────────
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  ensureSpace(60);

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
  doc.text("Bahsedilme", marginLeft + 55, y);
  doc.text("Toplam", marginLeft + 95, y);
  doc.text("Oran", marginLeft + 125, y);
  y += 3;
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 5;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);

  for (const p of PLATFORMS) {
    ensureSpace(8);
    const pct =
      platCounts[p].total > 0
        ? Math.round((platCounts[p].mentioned / platCounts[p].total) * 100)
        : 0;

    doc.text(PLATFORM_LABELS[p], marginLeft, y);
    doc.text(`${platCounts[p].mentioned}`, marginLeft + 65, y, { align: "center" });
    doc.text(`${platCounts[p].total}`, marginLeft + 100, y, { align: "center" });

    // Color-coded percentage
    if (pct >= 50) {
      doc.setTextColor(22, 163, 74); // green
    } else if (pct >= 20) {
      doc.setTextColor(202, 138, 4); // amber
    } else {
      doc.setTextColor(220, 38, 38); // red
    }
    doc.text(`%${pct}`, marginLeft + 130, y, { align: "center" });
    doc.setTextColor(55, 65, 81);

    y += 7;
  }

  y += 8;

  // ── Top Competitors ─────────────────────────────────────
  if (competitors.length > 0) {
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    ensureSpace(30);

    doc.setFontSize(13);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Senin Yerine Kim? (Rakipler)", marginLeft, y);
    y += 10;

    // Table header
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(107, 114, 128);
    doc.text("#", marginLeft, y);
    doc.text("Rakip", marginLeft + 8, y);
    doc.text("Bahsedilme Skoru", marginLeft + 90, y);
    y += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    competitors.forEach((comp, i) => {
      ensureSpace(8);
      doc.text(`${i + 1}.`, marginLeft, y);
      doc.text(comp.name, marginLeft + 8, y);
      doc.text(`${comp.mentionScore}/100`, marginLeft + 100, y, { align: "center" });
      y += 7;
    });

    // Add user brand for comparison
    ensureSpace(10);
    y += 2;
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.text("->", marginLeft, y);
    doc.text(`${brand.name} (Siz)`, marginLeft + 8, y);
    doc.text(`${mentionScore}/100`, marginLeft + 100, y, { align: "center" });
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "normal");

    y += 12;
  }

  // ── Checklist Progress ──────────────────────────────────
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  ensureSpace(30);

  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Gelişim Planı Durumu", marginLeft, y);
  y += 10;

  // Progress bar
  const barWidth = contentWidth * 0.6;
  const barHeight = 8;
  const progressPct = checklistTotal > 0 ? checklistCompleted / checklistTotal : 0;

  doc.setFillColor(229, 231, 235);
  doc.roundedRect(marginLeft, y, barWidth, barHeight, 2, 2, "F");

  if (progressPct > 0) {
    // Color based on progress
    if (progressPct >= 0.5) {
      doc.setFillColor(22, 163, 74); // green
    } else if (progressPct >= 0.25) {
      doc.setFillColor(202, 138, 4); // amber
    } else {
      doc.setFillColor(220, 38, 38); // red
    }
    doc.roundedRect(marginLeft, y, barWidth * progressPct, barHeight, 2, 2, "F");
  }

  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text(
    `${checklistCompleted}/${checklistTotal} tamamlandı (%${Math.round(progressPct * 100)})`,
    marginLeft + barWidth + 6,
    y + 6,
  );

  y += barHeight + 10;

  // ── Checklist items by layer ────────────────────────────
  const LAYER_NAMES: Record<number, string> = {
    1: "Temel Altyapı",
    2: "İçerik & SEO",
    3: "Otorite & Dış Sinyaller",
  };

  const allItems = await prisma.checklistItem.findMany({
    where: { brandId: brand.id },
    select: { layer: true, simpleTitle: true, status: true },
    orderBy: [{ layer: "asc" }, { itemNumber: "asc" }],
  });

  const itemsByLayer = new Map<number, { simpleTitle: string; status: string }[]>();
  for (const item of allItems) {
    const layerItems = itemsByLayer.get(item.layer) ?? [];
    layerItems.push({ simpleTitle: item.simpleTitle, status: item.status });
    itemsByLayer.set(item.layer, layerItems);
  }

  for (const [layer, items] of itemsByLayer) {
    ensureSpace(20);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(`Katman ${layer}: ${LAYER_NAMES[layer] ?? ""}`, marginLeft + 4, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");

    for (const item of items) {
      ensureSpace(6);
      // Status indicator
      const statusChar = item.status === "complete" ? "[OK]" : item.status === "warning" ? "[!!]" : "[  ]";
      if (item.status === "complete") {
        doc.setTextColor(22, 163, 74);
      } else if (item.status === "warning") {
        doc.setTextColor(202, 138, 4);
      } else {
        doc.setTextColor(156, 163, 175);
      }
      doc.text(statusChar, marginLeft + 6, y);

      doc.setTextColor(55, 65, 81);
      doc.text(item.simpleTitle, marginLeft + 18, y);
      y += 5;
    }

    y += 4;
  }

  // ── Footer on every page ────────────────────────────────
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
    doc.text(`Sayfa ${p} / ${totalPages}`, pageWidth - marginRight, pageHeight - 10, {
      align: "right",
    });
  }

  // ── Return PDF ──────────────────────────────────────────
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const safeName = brand.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u00C0-\u024F-]/g, "");
  const filename = `GH7-Rapor-${safeName}-${now.toISOString().split("T")[0]}.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
