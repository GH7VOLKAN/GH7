"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SparklesIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

interface DiscoverCompetitorsButtonProps {
  brandId: string;
  hasCompetitors: boolean;
}

export function DiscoverCompetitorsButton({
  brandId,
  hasCompetitors,
}: DiscoverCompetitorsButtonProps) {
  const [status, setStatus] = useState<"idle" | "discovering" | "done">("idle");
  const router = useRouter();

  useEffect(() => {
    if (status === "discovering") {
      // Poll every 5s for up to 60s
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        router.refresh();
        if (attempts >= 12) {
          clearInterval(interval);
          setStatus("done");
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status, router]);

  async function handleDiscover() {
    setStatus("discovering");
    try {
      await fetch("/api/competitors/discover", {
        method: "POST",
        body: JSON.stringify({ brandId }),
        headers: { "Content-Type": "application/json" },
      });
      // Background process started, polling will handle refresh
      setTimeout(() => {
        setStatus("done");
        router.refresh();
      }, 20000);
    } catch {
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <Button variant="outline" size="sm" disabled>
        <CheckCircle2Icon className="mr-1.5 size-4 text-emerald-600" />
        Keşfedildi
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDiscover}
      disabled={status === "discovering"}
      variant={hasCompetitors ? "outline" : "default"}
      size="sm"
    >
      {status === "discovering" ? (
        <>
          <Loader2Icon className="mr-1.5 size-4 animate-spin" />
          <span className="hidden sm:inline">Sonar araştırıyor, Claude analiz ediyor...</span>
          <span className="sm:hidden">Keşfediliyor...</span>
        </>
      ) : (
        <>
          <SparklesIcon className="mr-1.5 size-4" />
          {hasCompetitors ? "Rakipleri Yeniden Kesfet" : "Rakipleri Otomatik Kesfet"}
        </>
      )}
    </Button>
  );
}
