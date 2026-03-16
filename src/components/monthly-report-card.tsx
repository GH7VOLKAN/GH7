"use client";

import * as React from "react";
import {
  FileTextIcon,
  DownloadIcon,
  SparklesIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthlyReportCardProps {
  brandId: string;
  plan: string;
}

export function MonthlyReportCard({ brandId, plan }: MonthlyReportCardProps) {
  const [generating, setGenerating] = React.useState(false);
  const isPro = plan !== "free";

  // Ay adı
  const currentMonth = new Date().toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  async function handleDownloadPdf() {
    setGenerating(true);
    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (!res.ok) throw new Error("PDF oluşturulamadı");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gh7-rapor-${currentMonth.replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50">
            <FileTextIcon className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Aylik GEO Durum Raporu</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {currentMonth} — yapay zeka gorunurluk analizi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="size-3.5 text-violet-500" />
          <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
            Opus ile
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Rakip hareketleri, kapanan/acilan farklar, yeni firsatlar ve oncelikli
          aksiyonlar iceren detayli aylik rapor. PDF olarak indirebilirsiniz.
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isPro ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleDownloadPdf}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                Hazirlaniyor...
              </>
            ) : (
              <>
                <DownloadIcon className="size-3.5" />
                PDF Indir
              </>
            )}
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            <DownloadIcon className="size-3.5" />
            PDF Indir (Pro)
          </Button>
        )}
      </div>
    </div>
  );
}
