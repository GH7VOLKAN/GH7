"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ScanStatus {
  status: "scanning" | "completed" | "idle";
  completed: number;
  total: number;
  phase: "scanning" | "audit" | "checklist" | "completed" | "idle";
}

const phaseLabels: Record<string, string> = {
  scanning: "Yapay zekalara soruluyor...",
  audit: "Site kontrolü yapılıyor...",
  checklist: "Gelişim planı hazırlanıyor...",
};

export function AnalysisBanner({ brandId }: { brandId: string }) {
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const router = useRouter();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/scan/status?brandId=${brandId}`);
      if (!res.ok) return;
      const data: ScanStatus = await res.json();
      setStatus(data);

      // If scan just completed, refresh the page data
      if (data.status === "completed") {
        router.refresh();
      }
    } catch {
      // Ignore fetch errors silently
    }
  }, [brandId, router]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    const poll = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(poll);
  }, [fetchStatus]);

  // Stop polling once idle or completed
  useEffect(() => {
    if (!status) return;
    if (status.status === "idle" || status.status === "completed") {
      // No need to continue polling — component will hide itself
    }
  }, [status]);

  if (!status || status.status === "idle" || status.status === "completed") {
    return null;
  }

  const progressText =
    status.total > 0
      ? `${status.completed}/${status.total} soru tamamlandı`
      : "Başlatılıyor...";

  const phaseText = phaseLabels[status.phase] ?? "Analiz devam ediyor...";

  return (
    <div className="bg-neutral-900 text-white px-6 py-3 flex justify-between items-center rounded-xl mx-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        <span className="text-sm">
          {phaseText} {progressText}
        </span>
      </div>
      <span className="text-xs text-neutral-400 hidden sm:inline">
        Sayfayi gezebilirsiniz, sonuclar otomatik guncellenir
      </span>
    </div>
  );
}
