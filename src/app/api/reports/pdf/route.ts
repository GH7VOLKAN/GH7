import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { jsPDF } from "jspdf";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("notificationId");

  if (!notificationId) {
    return NextResponse.json(
      { error: "notificationId gerekli" },
      { status: 400 },
    );
  }

  // Fetch notification with brand relation to verify ownership
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { brand: true },
  });

  if (!notification) {
    return NextResponse.json(
      { error: "Bildirim bulunamadı" },
      { status: 404 },
    );
  }

  // Auth check: user must own the brand
  if (notification.brand.profileId !== user.id) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 403 });
  }

  if (notification.type !== "monthly_report") {
    return NextResponse.json(
      { error: "Bu bildirim bir aylik rapor degil" },
      { status: 400 },
    );
  }

  // Extract data from notification
  const data = (notification.data ?? {}) as Record<string, unknown>;
  const month = (data.month as string) ?? "";
  const competitorCount = (data.competitorCount as number) ?? 0;
  const mentionScore = (data.mentionScore as number) ?? 0;
  const readinessScore = (data.readinessScore as number) ?? 0;
  const checklistProgress = (data.checklistProgress as number) ?? 0;
  const reportText = notification.message;

  // ── Generate PDF ──────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const marginTop = 20;
  const marginBottom = 25;
  let y = marginTop;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage();
      y = marginTop;
    }
  };

  // ── Header / Branding ─────────────────────────────────
  doc.setFillColor(17, 24, 39); // gray-900
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("Helvetica", "bold");
  doc.text("GH7.ai", marginLeft, 18);

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text("Yapay Zeka Gorunurluk Platformu", marginLeft, 26);

  doc.setFontSize(12);
  doc.text(notification.brand.name, pageWidth - marginRight, 18, {
    align: "right",
  });
  doc.setFontSize(9);
  doc.text(notification.brand.domain, pageWidth - marginRight, 26, {
    align: "right",
  });

  y = 50;

  // ── Report Title ──────────────────────────────────────
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");
  doc.text("Aylik GEO Durum Raporu", marginLeft, y);
  y += 8;

  if (month) {
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(month, marginLeft, y);
    y += 10;
  }

  // ── Metrics Section ───────────────────────────────────
  y += 4;
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Temel Metrikler", marginLeft, y);
  y += 10;

  // Draw metric boxes
  const metrics = [
    { label: "Bahsedilme Skoru", value: `${mentionScore}/100` },
    { label: "Hazırlık Skoru", value: `${readinessScore}/100` },
    {
      label: "Gelişim Planı",
      value: `%${checklistProgress}`,
    },
    { label: "Rakip Sayısı", value: `${competitorCount}` },
  ];

  const boxWidth = (contentWidth - 12) / 4; // 4mm gap between boxes
  const boxHeight = 22;

  metrics.forEach((metric, i) => {
    const bx = marginLeft + i * (boxWidth + 4);

    doc.setFillColor(249, 250, 251); // gray-50
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(bx, y, boxWidth, boxHeight, 2, 2, "FD");

    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(metric.label, bx + boxWidth / 2, y + 8, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(metric.value, bx + boxWidth / 2, y + 18, { align: "center" });
  });

  y += boxHeight + 12;

  // ── Separator ─────────────────────────────────────────
  doc.setDrawColor(229, 231, 235);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  // ── Report Body ───────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Detayli Rapor", marginLeft, y);
  y += 8;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81); // gray-700

  // Split report text into lines that fit within content width
  const lines = doc.splitTextToSize(reportText, contentWidth);
  const lineHeight = 5;

  for (let i = 0; i < lines.length; i++) {
    ensureSpace(lineHeight + 2);
    doc.text(lines[i], marginLeft, y);
    y += lineHeight;
  }

  // ── Footer on every page ──────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  // ── Return PDF ────────────────────────────────────────
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const safeMonth = month
    ? month.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\u00C0-\u024F-]/g, "")
    : "rapor";
  const filename = `GH7-Aylik-Rapor-${safeMonth}.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
