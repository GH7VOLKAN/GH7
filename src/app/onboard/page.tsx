"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrand, analyzeDomainForOnboarding } from "@/lib/actions";
import { GH7Logo } from "@/components/gh7-logo";
import {
  BuildingIcon,
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  CheckIcon,
  XIcon,
  PlusIcon,
  PencilIcon,
  SparklesIcon,
} from "lucide-react";

type BrandType = "firma" | "kisisel";
type Step = "type" | "info" | "analyzing" | "approval" | "loading";

interface SonarResults {
  businessCategories: string[];
  competitors: string[];
  strengths: string[];
  weaknesses: string[];
  serviceRegions: string[];
  sector: string | null;
  rawAnalysis: Record<string, string>;
}

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
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Sonar analysis results (approval screen)
  const [sonarResults, setSonarResults] = useState<SonarResults | null>(null);
  const [approvedCategories, setApprovedCategories] = useState<string[]>([]);
  const [approvedCompetitors, setApprovedCompetitors] = useState<string[]>([]);
  const [approvedRegions, setApprovedRegions] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newCompetitorInput, setNewCompetitorInput] = useState("");
  const [newRegionInput, setNewRegionInput] = useState("");

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

  // Step 2 → Step 3 (analyzing) → Step 4 (approval)
  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(brandType === "firma" ? "Firma adını girin" : "Adınızı girin");
      return;
    }
    if (!domain.trim()) {
      setError("Web sitesi adresini girin");
      return;
    }

    setError(null);

    // Firma: Sonar analizi çalıştır, sonra onay ekranı
    if (brandType === "firma") {
      setStep("analyzing");

      startTransition(async () => {
        try {
          const results = await analyzeDomainForOnboarding(name, domain);
          setSonarResults(results);

          // Pre-fill approval fields
          setApprovedCategories(results.businessCategories.length > 0 ? results.businessCategories : []);
          setApprovedCompetitors(
            results.competitors.length > 0
              ? results.competitors
              : competitors.filter((c) => c.trim())
          );
          setApprovedRegions(results.serviceRegions.length > 0 ? results.serviceRegions : []);

          // Sector from Sonar if not manually set
          if (!sector.trim() && results.sector) {
            setSector(results.sector);
          }

          setStep("approval");
        } catch {
          // Sonar failed — skip approval, go direct to brand creation
          handleFinalSubmit();
        }
      });
    } else {
      // Kisisel: Skip Sonar, go to loading directly
      handleFinalSubmit();
    }
  }

  // Approval screen → Final brand creation
  function handleApprovalSubmit() {
    handleFinalSubmit();
  }

  function handleFinalSubmit() {
    setStep("loading");
    setLoadingStep(1);

    const timer1 = setTimeout(() => setLoadingStep(2), 3000);
    const timer2 = setTimeout(() => setLoadingStep(3), 8000);

    startTransition(async () => {
      try {
        const userCompetitors = brandType === "firma"
          ? (approvedCompetitors.length > 0 ? approvedCompetitors : competitors.filter((c) => c.trim()))
          : undefined;

        await createBrand({
          name,
          domain,
          sector,
          type: brandType,
          city: city || undefined,
          profession: brandType === "kisisel" ? profession || undefined : undefined,
          specialties: brandType === "kisisel" ? specialties.filter((s) => s.trim()) : undefined,
          competitorNames: userCompetitors,
          linkedinUrl: brandType === "kisisel" && linkedinUrl.trim() ? linkedinUrl.trim() : undefined,
          // V3: Approved Sonar results
          approvedBusinessCategories: approvedCategories.length > 0 ? approvedCategories : undefined,
          approvedServiceRegions: approvedRegions.length > 0 ? approvedRegions : undefined,
          approvedStrengths: sonarResults?.strengths,
          approvedWeaknesses: sonarResults?.weaknesses,
          sonarRawAnalysis: sonarResults?.rawAnalysis,
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

  // ── Editable list helpers ──
  function addCategory() {
    const val = newCategoryInput.trim();
    if (val && !approvedCategories.includes(val)) {
      setApprovedCategories((prev) => [...prev, val]);
      setNewCategoryInput("");
    }
  }

  function removeCategory(idx: number) {
    setApprovedCategories((prev) => prev.filter((_, i) => i !== idx));
  }

  function addCompetitor() {
    const val = newCompetitorInput.trim();
    if (val && !approvedCompetitors.includes(val)) {
      setApprovedCompetitors((prev) => [...prev, val]);
      setNewCompetitorInput("");
    }
  }

  function removeCompetitor(idx: number) {
    setApprovedCompetitors((prev) => prev.filter((_, i) => i !== idx));
  }

  function addRegion() {
    const val = newRegionInput.trim();
    if (val && !approvedRegions.includes(val)) {
      setApprovedRegions((prev) => [...prev, val]);
      setNewRegionInput("");
    }
  }

  function removeRegion(idx: number) {
    setApprovedRegions((prev) => prev.filter((_, i) => i !== idx));
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/40";

  const chipClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm transition-colors";

  // ─── Step 1: Type Selection ────────────────────────────
  if (step === "type") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 1 / 4</span>
        </div>

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

  // ─── Step 3: Analyzing (Sonar running) ──────────────────
  if (step === "analyzing") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 3 / 4</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5">
              <SparklesIcon className="size-8 animate-pulse text-foreground" />
            </div>

            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Analiz Ediliyor
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span> hakkında yapay zeka araştırması yapılıyor
            </p>

            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              <div className="flex items-center gap-3 opacity-100">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground">
                  <Loader2Icon className="size-3.5 animate-spin" />
                </div>
                <span className="text-sm font-medium">Faaliyet alanları araştırılıyor</span>
              </div>
              <div className="flex items-center gap-3 opacity-30">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border">
                  <span className="text-[10px] text-muted-foreground">2</span>
                </div>
                <span className="text-sm">Rakipler tespit ediliyor</span>
              </div>
              <div className="flex items-center gap-3 opacity-30">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border">
                  <span className="text-[10px] text-muted-foreground">3</span>
                </div>
                <span className="text-sm">Güçlü ve zayıf yönler belirleniyor</span>
              </div>
            </div>

            <p className="mt-10 text-xs text-muted-foreground/60">
              Bu işlem 10-20 saniye sürebilir
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 4: Approval Screen ────────────────────────────
  if (step === "approval") {
    const hasData = approvedCategories.length > 0 || approvedCompetitors.length > 0 || approvedRegions.length > 0;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 3 / 4</span>
        </div>

        <div className="flex flex-1 flex-col items-center px-6 pb-20 pt-8">
          <div className="w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setStep("info")}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              Bilgileri Düzenle
            </button>

            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5">
                <SparklesIcon className="size-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                  Analiz Sonuçları
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yapay zeka <span className="font-medium text-foreground">{name}</span> için şunları buldu. Düzenleyebilir, ekleyebilir veya çıkarabilirsiniz.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {/* Faaliyet Alanları */}
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2">
                  <PencilIcon className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Faaliyet Alanları</h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Sorular bu alanlara göre üretilecek
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {approvedCategories.map((cat, i) => (
                    <span key={i} className={chipClass}>
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(i)}
                        className="rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                  {approvedCategories.length === 0 && (
                    <span className="text-xs text-muted-foreground/60">Henüz faaliyet alanı bulunamadı</span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                    placeholder="Yeni alan ekle..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <PlusIcon className="size-3.5" />
                    Ekle
                  </button>
                </div>
              </div>

              {/* Rakipler */}
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2">
                  <PencilIcon className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Rakipler</h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Bu markalarla kıyaslanacaksınız
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {approvedCompetitors.map((comp, i) => (
                    <span key={i} className={chipClass}>
                      {comp}
                      <button
                        type="button"
                        onClick={() => removeCompetitor(i)}
                        className="rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                  {approvedCompetitors.length === 0 && (
                    <span className="text-xs text-muted-foreground/60">Henüz rakip bulunamadı</span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCompetitorInput}
                    onChange={(e) => setNewCompetitorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                    placeholder="Yeni rakip ekle..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCompetitor}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <PlusIcon className="size-3.5" />
                    Ekle
                  </button>
                </div>
              </div>

              {/* Hizmet Bölgeleri */}
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2">
                  <PencilIcon className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Hizmet Bölgeleri</h2>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Konum bazlı sorularda kullanılacak
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {approvedRegions.map((region, i) => (
                    <span key={i} className={chipClass}>
                      {region}
                      <button
                        type="button"
                        onClick={() => removeRegion(i)}
                        className="rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                  {approvedRegions.length === 0 && (
                    <span className="text-xs text-muted-foreground/60">Henüz bölge bulunamadı</span>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newRegionInput}
                    onChange={(e) => setNewRegionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRegion())}
                    placeholder="Yeni bölge ekle..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addRegion}
                    className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <PlusIcon className="size-3.5" />
                    Ekle
                  </button>
                </div>
              </div>

              {/* Güçlü / Zayıf Yönler (read-only summary) */}
              {(sonarResults?.strengths?.length ?? 0) > 0 || (sonarResults?.weaknesses?.length ?? 0) > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(sonarResults?.strengths?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                      <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Güçlü Yönler
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {sonarResults?.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                            <CheckIcon className="mt-0.5 size-3 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(sonarResults?.weaknesses?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                      <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Geliştirilebilir Alanlar
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {sonarResults?.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                            <span className="mt-0.5 shrink-0">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleApprovalSubmit}
              disabled={isPending}
              className="mt-8 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "Hazırlanıyor..." : "Onayla ve Analizi Başlat"}
            </button>

            {!hasData && (
              <button
                type="button"
                onClick={handleApprovalSubmit}
                className="mt-3 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Analiz bulunamadı, yine de devam et →
              </button>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground/60">
              Düzenlemeleriniz yapay zeka sorularının kalitesini doğrudan etkiler
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 5: Loading State ──────────────────────────────
  if (step === "loading") {
    const steps = [
      {
        label: brandType === "firma" ? "Sektörünüz analiz ediliyor" : "Dijital iziniz araştırılıyor",
        done: loadingStep > 1,
        active: loadingStep === 1,
      },
      {
        label: "Akıllı sorular üretiliyor",
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
          <span className="text-xs text-muted-foreground">Adım 4 / 4</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5">
              <Loader2Icon className="size-8 animate-spin text-foreground" />
            </div>

            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Hazırlanıyor
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{name}</span> için yapay zeka gorunurluk altyapisi kuruluyor
            </p>

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

  // ─── Step 2: Info Form ──────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <GH7Logo size="default" />
        <span className="text-xs text-muted-foreground">Adım 2 / 4</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg">
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

          <form onSubmit={handleInfoSubmit} className="mt-10 space-y-6">
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
                    LinkedIn Profili <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="örneğin: linkedin.com/in/volkansimsirkaya"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
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
              {brandType === "firma"
                ? "Yapay zeka firmanızı analiz edecek — sonuçları onaylayabileceksiniz"
                : "Yapay zeka destekli soru uretimi yaklaşık 10-30 saniye sürebilir"}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
