"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrand } from "@/lib/actions";
import { GH7Logo } from "@/components/gh7-logo";
import {
  BuildingIcon,
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  CheckIcon,
} from "lucide-react";

type BrandType = "firma" | "kisisel";
type Step = "type" | "info" | "loading";

export default function OnboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("type");
  const [brandType, setBrandType] = useState<BrandType>("firma");

  // Common fields
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");

  // Firma fields
  const [competitors, setCompetitors] = useState(["", "", ""]);

  // Kisisel fields
  const [profession, setProfession] = useState("");
  const [specialties, setSpecialties] = useState(["", "", ""]);

  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  function handleTypeSelect(type: BrandType) {
    setBrandType(type);
    setStep("info");
  }

  function updateCompetitor(index: number, value: string) {
    setCompetitors((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function updateSpecialty(index: number, value: string) {
    setSpecialties((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(brandType === "firma" ? "Firma adını girin" : "Adınızı girin");
      return;
    }
    if (!domain.trim()) {
      setError("Web sitesi adresini girin");
      return;
    }

    setStep("loading");
    setError(null);
    setLoadingStep(1);

    // Animate through loading steps
    const timer1 = setTimeout(() => setLoadingStep(2), 3000);
    const timer2 = setTimeout(() => setLoadingStep(3), 8000);

    startTransition(async () => {
      try {
        await createBrand({
          name,
          domain,
          sector,
          type: brandType,
          city: city || undefined,
          profession: brandType === "kisisel" ? profession || undefined : undefined,
          specialties: brandType === "kisisel" ? specialties.filter((s) => s.trim()) : undefined,
          competitorNames: brandType === "firma" ? competitors.filter((c) => c.trim()) : undefined,
        });
        clearTimeout(timer1);
        clearTimeout(timer2);
        setLoadingStep(3);
        setTimeout(() => {
          router.push("/dashboard/genel");
          router.refresh();
        }, 500);
      } catch (err) {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setStep("info");
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      }
    });
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/40";

  // ─── Step 1: Type Selection ────────────────────────────
  if (step === "type") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 1 / 3</span>
        </div>

        {/* Hero */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-4xl font-light tracking-[-0.04em] md:text-5xl lg:text-6xl">
              Yapay Zeka Seni
              <br />
              <span className="font-semibold">Tanıyor mu?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Markanızın ChatGPT, Claude, Gemini ve Perplexity&apos;deki
              görünürlüğünü ölçün ve iyileştirin.
            </p>

            {/* Type Selection Cards */}
            <div className="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleTypeSelect("firma")}
                className="group relative overflow-hidden rounded-2xl border border-border p-6 text-left transition-all hover:border-foreground hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background">
                  <BuildingIcon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
                  Firma / Kurum
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Şirket, marka veya kurum için yapay zeka gorunurluk takibi ve rakip analizi
                </p>
                <ArrowRightIcon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/30 transition-all group-hover:right-3 group-hover:text-foreground" />
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("kisisel")}
                className="group relative overflow-hidden rounded-2xl border border-border p-6 text-left transition-all hover:border-foreground hover:shadow-lg"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background">
                  <UserIcon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
                  Kişisel Marka
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Bireysel tanınırlık, dijital iz takibi ve kişisel görünürlük analizi
                </p>
                <ArrowRightIcon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/30 transition-all group-hover:right-3 group-hover:text-foreground" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5" />
                Ücretsiz başla
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5" />
                Kredi kartı gerekmez
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="size-3.5" />
                2 dakikada kurulum
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: Loading State ────────────────────────────
  if (step === "loading") {
    const steps = [
      {
        label: brandType === "firma" ? "Sektörünüz analiz ediliyor" : "Dijital iziniz araştırılıyor",
        done: loadingStep > 1,
        active: loadingStep === 1,
      },
      {
        label: "Akıllı promptlar üretiliyor",
        done: loadingStep > 2,
        active: loadingStep === 2,
      },
      {
        label: "Sayfaniz hazirlaniyor",
        done: loadingStep >= 3,
        active: loadingStep === 3,
      },
    ];

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 3 / 3</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            {/* Animated Icon */}
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5">
              <Loader2Icon className="size-8 animate-spin text-foreground" />
            </div>

            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Hazırlanıyor
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span> için yapay zeka gorunurluk altyapisi kuruluyor
            </p>

            {/* Steps */}
            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity duration-500 ${
                    s.done || s.active ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      s.done
                        ? "bg-foreground text-background"
                        : s.active
                          ? "border-2 border-foreground"
                          : "border border-border"
                    }`}
                  >
                    {s.done ? (
                      <CheckIcon className="size-3.5" />
                    ) : s.active ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${s.done ? "text-muted-foreground line-through" : s.active ? "font-medium" : ""}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-10 text-xs text-muted-foreground/60">
              Bu işlem 10-30 saniye sürebilir
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 2: Info Form ────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <GH7Logo size="default" />
        <span className="text-xs text-muted-foreground">Adım 2 / 3</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg">
          {/* Back + Title */}
          <button
            type="button"
            onClick={() => setStep("type")}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Geri
          </button>

          <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
            {brandType === "firma" ? "Markanızı Tanıyalım" : "Sizi Tanıyalım"}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {brandType === "firma"
              ? "Firmanız hakkında bilgi verin, size özel yapay zeka sorulari üretelim."
              : "Kendiniz hakkında bilgi verin, dijital görünürlüğünüzü ölçelim."}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">
                {brandType === "firma" ? "Firma / Marka Adı" : "Adınız Soyadınız"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                placeholder={brandType === "firma" ? "örneğin: ISITMAX" : "örneğin: Volkan Şimşirkaya"}
                className={`mt-2 ${inputClass}`}
                autoFocus
              />
            </div>

            {/* Domain */}
            <div>
              <label className="text-sm font-medium">Web Sitesi</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => { setDomain(e.target.value); setError(null); }}
                placeholder="örneğin: isitmax.com"
                className={`mt-2 ${inputClass}`}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">https:// olmadan yazın</p>
            </div>

            {/* Sector / Profession */}
            <div>
              <label className="text-sm font-medium">
                {brandType === "firma" ? "Sektör" : "Meslek Alanı"}
              </label>
              <input
                type="text"
                value={brandType === "firma" ? sector : profession}
                onChange={(e) => brandType === "firma" ? setSector(e.target.value) : setProfession(e.target.value)}
                placeholder={brandType === "firma" ? "örneğin: Isıtma & Soğutma" : "örneğin: Avukat"}
                className={`mt-2 ${inputClass}`}
              />
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium">
                Şehir <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="örneğin: İstanbul"
                className={`mt-2 ${inputClass}`}
              />
            </div>

            {/* Firma: Competitors */}
            {brandType === "firma" && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Rakipler <span className="font-normal text-muted-foreground">(isteğe bağlı, 3&apos;e kadar)</span>
                </label>
                {competitors.map((comp, i) => (
                  <input
                    key={i}
                    type="text"
                    value={comp}
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                    placeholder={`Rakip ${i + 1}`}
                    className={inputClass}
                  />
                ))}
              </div>
            )}

            {/* Kisisel: Specialties */}
            {brandType === "kisisel" && (
              <>
                <div>
                  <label className="text-sm font-medium">
                    Sektör <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="örneğin: Hukuk"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Uzmanlık Alanları <span className="font-normal text-muted-foreground">(isteğe bağlı, 3&apos;e kadar)</span>
                  </label>
                  {specialties.map((spec, i) => (
                    <input
                      key={i}
                      type="text"
                      value={spec}
                      onChange={(e) => updateSpecialty(i, e.target.value)}
                      placeholder={`Uzmanlık ${i + 1}`}
                      className={inputClass}
                    />
                  ))}
                </div>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "Hazırlanıyor..." : "Devam Et"}
            </button>

            <p className="text-center text-xs text-muted-foreground/60">
              Yapay zeka destekli soru uretimi yaklaşık 10-30 saniye sürebilir
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
