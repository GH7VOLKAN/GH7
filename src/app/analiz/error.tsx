"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AnalizError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[analiz]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <span className="text-red-500 text-xl">!</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Analiz sırasında bir hata oluştu</h2>
      <p className="text-sm text-gray-500 text-center max-w-md mt-1">
        Lütfen tekrar deneyin veya ana sayfaya dönün.
      </p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={reset}
          className="bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="border border-gray-200 rounded-lg px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
