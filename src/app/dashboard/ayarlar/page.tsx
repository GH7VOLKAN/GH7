"use client";

import { mockBrand } from "@/lib/mock-data";

export default function AyarlarPage() {
  return (
    <div className="space-y-8">
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
            defaultValue={mockBrand.name}
            className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Domain
          </label>
          <input
            type="text"
            defaultValue={mockBrand.domain}
            className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Sektör
          </label>
          <input
            type="text"
            defaultValue={mockBrand.sector}
            className="mt-1 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors"
          />
        </div>
        <button className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-[1.03] active:scale-[0.97]">
          Kaydet
        </button>
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
