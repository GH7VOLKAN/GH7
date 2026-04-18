"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const CONFIRMATION_WORD = "SIFIRLA";

export function AdminResetButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "running" | "done">(
    "idle",
  );
  const [confirmText, setConfirmText] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setStep("running");
    setError(null);
    try {
      const res = await fetch("/api/admin/test-tools/reset-all-data", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Reset başarısız");
        setStep("confirm");
        return;
      }
      setResult(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası");
      setStep("confirm");
    }
  };

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
      >
        <AlertTriangle className="size-4" />
        Tüm Veriyi Sıfırla
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="rounded-lg border border-red-300 bg-white p-4">
        <p className="text-sm text-gray-900">
          Onaylamak için aşağıya <strong>{CONFIRMATION_WORD}</strong> yazın:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
          placeholder={CONFIRMATION_WORD}
          autoFocus
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
        />
        {error && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-red-600">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={confirmText !== CONFIRMATION_WORD}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="size-3.5" />
            Evet, tümünü sil
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("idle");
              setConfirmText("");
              setError(null);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </div>
    );
  }

  if (step === "running") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-700">
        <Loader2 className="size-4 animate-spin" />
        Tüm veriler siliniyor... Bu işlem 10-30 saniye sürebilir.
      </div>
    );
  }

  // done
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="size-5 text-green-600 shrink-0 mt-0.5" />
        <div className="text-sm text-green-900">
          <p className="font-semibold">Tüm veriler silindi.</p>
          {result && (
            <p className="mt-1 text-xs">
              Supabase: {String(result.supabaseUsersDeleted ?? "?")} kullanıcı ·
              Profile: {JSON.stringify((result.prismaCounts as Record<string, number>)?.profile ?? "?")} · Brand:{" "}
              {JSON.stringify((result.prismaCounts as Record<string, number>)?.brand ?? "?")}
            </p>
          )}
          <p className="mt-2 text-xs text-green-800">
            Senin admin session&apos;ın da silindi. /analiz&apos;den yeniden
            kayıt olabilirsin.
          </p>
          <button
            type="button"
            onClick={() => router.push("/analiz")}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            /analiz&apos;e Git →
          </button>
        </div>
      </div>
    </div>
  );
}
