"use client";

import { useEffect } from "react";

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[panel]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <span className="text-red-500 text-xl">!</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Bu sayfada bir hata oluştu</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mt-1">
        Beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin.
      </p>
      <button
        onClick={reset}
        className="mt-4 bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
