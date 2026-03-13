"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrand } from "@/lib/actions";

type BrandType = "firma" | "kisisel";

export default function OnboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [sector, setSector] = useState("");
  const [brandType, setBrandType] = useState<BrandType>("firma");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Marka adini girin");
      return;
    }
    if (!domain.trim()) {
      setError("Domain adresini girin");
      return;
    }

    startTransition(async () => {
      try {
        await createBrand({ name, domain, sector, type: brandType });
        router.push("/dashboard/genel");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata olustu");
      }
    });
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border-[1.5px] border-border bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/50";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-[14px] border border-border bg-card p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground/5">
              <svg
                className="size-6 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-light tracking-[-0.04em]">
              Markanizi Ekleyin
            </h1>
            <p className="text-sm text-muted-foreground">
              Yapay zeka platformlarindaki gorunurlugunuzu takip etmeye baslayin.
            </p>
          </div>

          {/* Brand Type */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Hesap Turu
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "firma" as BrandType,
                    title: "Firma",
                    desc: "Kurumsal marka takibi, rakip analizi",
                  },
                  {
                    value: "kisisel" as BrandType,
                    title: "Kisisel",
                    desc: "Kisisel taninirlik, dijital iz takibi",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBrandType(option.value)}
                  className={`rounded-xl border-[1.5px] p-4 text-left transition-all ${
                    brandType === option.value
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <p className="text-sm font-bold">{option.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {brandType === "firma" ? "Firma / Marka Adi" : "Adiniz Soyadiniz"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder={
                  brandType === "firma"
                    ? "ornegin: ISITMAX"
                    : "ornegin: Volkan Simsirkaya"
                }
                className={inputClass}
                autoFocus
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Web Sitesi
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setError(null);
                }}
                placeholder="ornegin: isitmax.com"
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                https:// olmadan yazin
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Sektor{" "}
                <span className="font-normal normal-case">(istege bagli)</span>
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="ornegin: Isitma & Sogutma"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? "Olusturuluyor..." : "Basla"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
