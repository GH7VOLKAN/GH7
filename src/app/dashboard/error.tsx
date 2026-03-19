"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-2xl font-bold">Bir şeyler ters gitti</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      {process.env.NODE_ENV !== "production" || true ? (
        <details className="mt-4 max-w-lg text-left">
          <summary className="text-xs text-muted-foreground cursor-pointer">Hata detayı</summary>
          <pre className="mt-2 text-xs text-red-500 bg-red-50 p-3 rounded overflow-auto max-h-40">
            {error?.message || "Bilinmeyen hata"}
            {error?.digest ? `\nDigest: ${error.digest}` : ""}
          </pre>
        </details>
      ) : null}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
        >
          Tekrar Dene
        </button>
        <Link
          href="/dashboard/genel"
          className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
        >
          Kontrol Paneline Dön
        </Link>
      </div>
    </div>
  );
}
