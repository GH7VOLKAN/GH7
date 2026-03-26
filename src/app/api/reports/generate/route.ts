import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generatePdfReport } from "@/lib/reports/generate-pdf";
import type { PlatformKey } from "@/lib/types";
import type { PdfReportInput } from "@/lib/reports/generate-pdf";

const PLATFORMS: PlatformKey[] = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "google_aio",
];

export async function POST() {
  // ── Auth ────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Profile + plan check (min pro) ─────────────────
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil bulunamadi" }, { status: 404 });
  }

  const plan = profile.plan ?? "free";
  if (plan === "free") {
    return NextResponse.json(
      { error: "PDF raporu sadece Pro ve Business planlarda kullanilabilir" },
      { status: 403 },
    );
  }

  // ── Get default brand ──────────────────────────────
  const brand = await prisma.brand.findFirst({
    where: { profileId: profile.id, isDefault: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Marka bulunamadi" }, { status: 404 });
  }

  // ── Gather data ────────────────────────────────────

  // Latest scores
  const latestScore = await prisma.scoreHistory.findFirst({
    where: { brandId: brand.id },
    orderBy: { date: "desc" },
  });
  const mentionScore = latestScore?.mentionScore ?? 0;

  // Latest completed scan + platform breakdown
  const latestScan = await prisma.scan.findFirst({
    where: { brandId: brand.id, status: "completed" },
    orderBy: { completedAt: "desc" },
  });

  const platCounts: Record<PlatformKey, { mentioned: number; total: number }> =
    {
      chatgpt: { mentioned: 0, total: 0 },
      claude: { mentioned: 0, total: 0 },
      gemini: { mentioned: 0, total: 0 },
      perplexity: { mentioned: 0, total: 0 },
      google_aio: { mentioned: 0, total: 0 },
    };

  let totalMentioned = 0;
  let totalResults = 0;

  // Keyword-level aggregation: prompt text -> { mentioned, total }
  const keywordMap = new Map<string, { mentioned: number; total: number }>();

  if (latestScan) {
    const results = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: {
        platform: true,
        mentioned: true,
        prompt: { select: { text: true } },
      },
    });
    totalResults = results.length;

    for (const r of results) {
      const p = r.platform as PlatformKey;
      if (platCounts[p]) {
        platCounts[p].total++;
        if (r.mentioned) {
          platCounts[p].mentioned++;
          totalMentioned++;
        }
      }

      // Keyword aggregation
      const kwText = r.prompt.text;
      const existing = keywordMap.get(kwText) ?? { mentioned: 0, total: 0 };
      existing.total++;
      if (r.mentioned) existing.mentioned++;
      keywordMap.set(kwText, existing);
    }
  }

  // Top keywords sorted by mention rate
  const topKeywords = Array.from(keywordMap.entries())
    .map(([keyword, stats]) => ({
      keyword,
      score:
        stats.total > 0 ? Math.round((stats.mentioned / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Competitors
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
  const checklistCompleted = checklistItems.filter(
    (i) => i.status === "complete",
  ).length;

  // Share of voice approximation
  const sesPayi =
    totalResults > 0 ? Math.round((totalMentioned / totalResults) * 100) : 0;

  // Sentiment: count from latest scan results
  let sentimentLabel = "Notr";
  if (latestScan) {
    const sentimentResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id, mentioned: true },
      select: { sentiment: true },
    });
    let pos = 0;
    let neg = 0;
    for (const r of sentimentResults) {
      if (r.sentiment === "pozitif") pos++;
      else if (r.sentiment === "negatif") neg++;
    }
    if (pos > neg * 2) sentimentLabel = "Pozitif";
    else if (neg > pos * 2) sentimentLabel = "Negatif";
    else sentimentLabel = "Notr";
  }

  // Average position calculation
  let avgPosition = 0;
  if (latestScan) {
    const posResults = await prisma.promptResult.findMany({
      where: { scanId: latestScan.id },
      select: { position: true, mentioned: true },
    });
    let posSum = 0;
    let posCount = 0;
    for (const r of posResults) {
      let val = 5; // not mentioned
      if (r.position === "1. sira") val = 1;
      else if (r.position === "2. sira") val = 2;
      else if (r.position === "3. sira") val = 3;
      else if (r.mentioned) val = 4; // mentioned but no specific position
      posSum += val;
      posCount++;
    }
    avgPosition = posCount > 0 ? posSum / posCount : 0;
  }

  // Build recommended actions
  const actions: string[] = [];
  const mentioningPlatforms = PLATFORMS.filter(
    (p) => platCounts[p].mentioned > 0,
  );
  const nonMentioningPlatforms = PLATFORMS.filter(
    (p) => platCounts[p].total > 0 && platCounts[p].mentioned === 0,
  );

  if (nonMentioningPlatforms.length > 0) {
    const names = nonMentioningPlatforms
      .map(
        (p) =>
          ({
            chatgpt: "ChatGPT",
            claude: "Claude",
            gemini: "Gemini",
            perplexity: "Perplexity",
            google_aio: "Google AIO",
          })[p],
      )
      .join(", ");
    actions.push(
      `${names} platformlarinda gorunurluk saglamak icin icerik optimizasyonu yapin.`,
    );
  }
  if (checklistTotal > 0 && checklistCompleted < checklistTotal) {
    actions.push(
      `Gelisim planindaki ${checklistTotal - checklistCompleted} tamamlanmamis adimi tamamlayin.`,
    );
  }
  if (mentionScore < 50) {
    actions.push(
      "Web sitenizin yapisal verilerini (schema.org) ve FAQ bolumlerini guncelleyin.",
    );
  }
  if (actions.length === 0) {
    actions.push(
      "Mevcut basarili stratejiyi surdurun ve yeni anahtar kelimeler ekleyin.",
    );
  }

  // ── Build input and generate PDF ───────────────────
  const pdfInput: PdfReportInput = {
    brandName: brand.name,
    brandDomain: brand.domain,
    ownerName: profile.fullName ?? profile.email,
    geoScore: mentionScore,
    metrics: {
      sesPayi,
      kapsam:
        totalResults > 0
          ? Math.round((mentioningPlatforms.length / PLATFORMS.length) * 100)
          : 0,
      ortSira: Number(avgPosition.toFixed(1)),
      algi: sentimentLabel,
    },
    platformBreakdown: PLATFORMS.map((p) => ({
      platform: p,
      mentioned: platCounts[p].mentioned,
      total: platCounts[p].total,
    })),
    topKeywords,
    competitors: competitors.map((c) => ({
      name: c.name,
      mentionScore: c.mentionScore,
    })),
    actions,
    checklistProgress: {
      completed: checklistCompleted,
      total: checklistTotal,
    },
  };

  const pdfBuffer = generatePdfReport(pdfInput);

  const safeName = brand.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u00C0-\u024F-]/g, "");
  const dateSlug = new Date().toISOString().split("T")[0];
  const filename = `GH7-Haftalik-Rapor-${safeName}-${dateSlug}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
