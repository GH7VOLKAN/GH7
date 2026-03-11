"use client";

import { useState, useTransition } from "react";
import { updateBrand } from "@/lib/actions";

interface AyarlarClientProps {
  brandId: string;
  brandName: string;
  brandDomain: string;
  brandSector: string;
}

export function AyarlarClient({
  brandId,
  brandName,
  brandDomain,
  brandSector,
}: AyarlarClientProps) {
  const [name, setName] = useState(brandName);
  const [domain, setDomain] = useState(brandDomain);
  const [sector, setSector] = useState(brandSector);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateBrand(brandId, { name, domain, sector });
        setMessage("Kaydedildi");
        setTimeout(() => setMessage(null), 2000);
      } catch {
        setMessage("Hata oluştu");
      }
    });
  }

  const inputClass =
    "mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors";

  return (
    <div className="space-y-8 px-4 lg:px-6">
      <div className="rounded-[14px] border border-border bg-card p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Ayarlar
        </p>
        <h1 className="mt-2 text-2xl font-light tracking-[-0.04em]">
          Marka Bilgileri
        </h1>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Marka Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sektör
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
        </div>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-5">
        <h3 className="text-sm font-medium tracking-[-0.04em] uppercase">
          Plan Bilgisi
        </h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-bold">Pro</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dönem</span>
            <span className="font-bold">Aylık</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sonraki Ödeme</span>
            <span className="font-bold">10 Nisan 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
