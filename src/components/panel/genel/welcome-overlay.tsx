"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Sparkles } from "lucide-react";

/**
 * WelcomeOverlay — Free audit sonrası dashboard'a ilk geliş için hoş geldin modal'ı.
 * searchParams?newAudit=1 → otomatik açılır. Kullanıcı kapatınca URL temizlenir.
 */
export function WelcomeOverlay() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewAudit = searchParams.get("newAudit") === "1";
  const [open, setOpen] = useState(isNewAudit);

  useEffect(() => {
    if (isNewAudit) setOpen(true);
  }, [isNewAudit]);

  const close = () => {
    setOpen(false);
    // URL'den newAudit paramını temizle
    const params = new URLSearchParams(searchParams.toString());
    params.delete("newAudit");
    const qs = params.toString();
    router.replace(`/panel/genel${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Kapat"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900">
            <Sparkles className="size-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Analiziniz hazır
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          Hoş geldiniz! Markanızın AI platformlarındaki görünürlük analizini
          aşağıda görebilirsiniz. 43 madde kontrolünüzün detayları{" "}
          <strong>Audit Detay</strong>&apos;da, rakiplerinizin sorgularda nasıl
          cevaplandığı <strong>Senin Yerine Kim?</strong>&apos;de.
        </p>

        <button
          type="button"
          onClick={close}
          className="mt-5 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Sonuçları Gör →
        </button>
      </div>
    </div>
  );
}
