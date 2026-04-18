"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ChevronDown, Home, RotateCw } from "lucide-react";
import { captureError } from "@/lib/monitoring";

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    captureError(error, { context: "panel-error-boundary" });
    // Ayrıca console'a yaz — kullanıcı developer ise F12 ile görür
    console.error("[panel/error-boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 mb-4">
        <AlertCircle className="size-6 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900">
        Bu sayfada bir hata oluştu
      </h2>
      <p className="mt-1 max-w-md text-center text-sm text-gray-500">
        Beklenmeyen bir sorun oluştu. Aşağıdaki adımları deneyin veya ana
        sayfaya dönün.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <RotateCw className="size-3.5" />
          Tekrar Dene
        </button>
        <Link
          href="/panel/genel"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Home className="size-3.5" />
          Genel Bakışa Dön
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
      >
        <ChevronDown
          className={`size-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
        />
        Teknik detay
      </button>

      {showDetails && (
        <div className="mt-2 max-w-2xl w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Error
          </div>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-700">
            {error.message || "Unknown error"}
          </pre>
          {error.digest && (
            <div className="mt-3 text-[11px] text-gray-500">
              Digest:{" "}
              <code className="font-mono text-gray-700">{error.digest}</code>
            </div>
          )}
          <p className="mt-3 text-[11px] text-gray-500">
            Sorun devam ederse: volkan@isitmax.com adresine bu digest kodu ile
            ulaşabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
