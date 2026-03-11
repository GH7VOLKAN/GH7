"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SearchIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

interface AuditButtonProps {
  brandId: string;
}

export function AuditButton({ brandId }: AuditButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");

  async function startAudit() {
    setStatus("running");
    try {
      const res = await fetch("/api/audit/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      });

      if (res.ok) {
        setStatus("done");
        toast.success("Site analizi tamamlandı!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Analiz başarısız oldu.");
        setStatus("idle");
      }
    } catch {
      toast.error("Analiz başarısız oldu.");
      setStatus("idle");
    }
  }

  return (
    <Button
      size="sm"
      variant={status === "done" ? "outline" : "default"}
      onClick={startAudit}
      disabled={status === "running"}
    >
      {status === "running" ? (
        <>
          <Loader2Icon className="animate-spin" />
          Analiz Ediliyor...
        </>
      ) : status === "done" ? (
        <>
          <CheckIcon />
          Tamamlandı
        </>
      ) : (
        <>
          <SearchIcon />
          Analizi Başlat
        </>
      )}
    </Button>
  );
}
