"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PlayIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

interface ScanButtonProps {
  brandId: string;
  lastScanAt: string | null;
  initialRunning?: boolean;
  runningScanId?: string | null;
}

export function ScanButton({
  brandId,
  lastScanAt,
  initialRunning,
  runningScanId: initialScanId,
}: ScanButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "running" | "completed" | "failed"
  >(initialRunning ? "running" : "idle");
  const [scanId, setScanId] = useState<string | null>(initialScanId ?? null);

  async function startScan() {
    setStatus("running");
    try {
      const res = await fetch("/api/scans/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });
      const data = await res.json();
      if (res.ok) {
        setScanId(data.scanId);
      } else if (res.status === 409) {
        // Already running
        setScanId(data.scanId);
      } else {
        setStatus("failed");
      }
    } catch {
      setStatus("failed");
    }
  }

  const checkStatus = useCallback(async () => {
    if (!scanId) return;
    try {
      const res = await fetch(`/api/scans/${scanId}/status`);
      const data = await res.json();
      if (data.status === "completed") {
        setStatus("completed");
        toast.success("Tarama tamamlandı!");
        setTimeout(() => window.location.reload(), 1000);
      } else if (data.status === "failed") {
        setStatus("failed");
        toast.error("Tarama başarısız oldu.");
      }
    } catch {
      // Ignore poll errors
    }
  }, [scanId]);

  useEffect(() => {
    if (status !== "running" || !scanId) return;
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [status, scanId, checkStatus]);

  const timeAgo = lastScanAt
    ? formatTimeAgo(new Date(lastScanAt))
    : null;

  return (
    <div className="flex items-center gap-2">
      {timeAgo && status === "idle" && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Son: {timeAgo}
        </span>
      )}
      <Button
        size="sm"
        variant={status === "completed" ? "outline" : "default"}
        onClick={startScan}
        disabled={status === "running"}
      >
        {status === "running" ? (
          <>
            <Loader2Icon className="animate-spin" />
            <span className="hidden sm:inline">Taranıyor...</span>
          </>
        ) : status === "completed" ? (
          <>
            <CheckIcon />
            <span className="hidden sm:inline">Tamamlandı</span>
          </>
        ) : (
          <>
            <PlayIcon />
            <span className="hidden sm:inline">{lastScanAt ? "Yeniden Tara" : "Tarama Başlat"}</span>
          </>
        )}
      </Button>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes}dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa önce`;
  const days = Math.floor(hours / 24);
  return `${days}g önce`;
}
