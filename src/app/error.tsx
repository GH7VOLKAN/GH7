"use client";

import { useEffect } from "react";

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
      <button
        onClick={reset}
        className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
