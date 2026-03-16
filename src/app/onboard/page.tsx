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
  XIcon,
  PlusIcon,
  SparklesIcon,
  GlobeIcon,
  ExternalLinkIcon,
} from "lucide-react";

type BrandType = "firma" | "kisisel";
type Step =
  | "type"
  | "domain"           // firma: sadece domain gir
  | "manual-info"      // firma: "web sitem yok" fallback formu
  | "kisisel-info"     // kişisel: bilgi formu
  | "analyzing"        // Sonar analiz ediliyor
  | "approval"         // sonuçları onayla
  | "loading";         // brand oluşturuluyor

interface CompetitorEntry {
  name: string;
  domain: string | null;
}

interface AnalysisResult {
  companyName: string | null;
  sector: string | null;
  categories: string[];
  regions: string[];
  competitors: CompetitorEntry[];
  strengths: string[];
  weaknesses: string[];
  rawAnalysis: Record<string, string>;
}

export default function OnboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("type");
  const [brandType, setBrandType] = useState<BrandType>("firma");

  // Domain-only step (firma)
  const [domain, setDomain] = useState("");

  // Manual fallback fields (firma "web sitem yok")
  const [manualName, setManualName] = useState("");
  const [manualSector, setManualSector] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualCompetitors, setManualCompetitors] = useState(["", "", ""]);

  // Kişisel marka fields
  const [kisiselName, setKisiselName] = useState("");
  const [kisiselDomain, setKisiselDomain] = useState("");
  const [profession, setProfession] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [specialties, setSpecialties] = useState(["", "", ""]);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Analysis results (approval screen)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [approvedName, setApprovedName] = useState("");
  const [approvedSector, setApprovedSector] = useState("");
  const [approvedCategories, setApprovedCategories] = useState<string[]>([]);
  const [approvedCompetitors, setApprovedCompetitors] = useState<CompetitorEntry[]>([]);
  const [approvedRegions, setApprovedRegions] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [newRegionInput, setNewRegionInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  function handleTypeSelect(type: BrandType) {
    setBrandType(type);
    setStep(type === "firma" ? "domain" : "kisisel-info");
  }

  // ── Firma: Domain submit → analyze ──
  function handleDomainSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Web adresinizi girin");
      return;
    }
    setError(null);
    setStep("analyzing");

    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding/analyze-domain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: domain.trim() }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Analiz başarısız oldu");
        }

        const data: AnalysisResult = await res.json();
        setAnalysis(data);

        // Pre-fill approval fields
        setApprovedName(data.companyName || domain.replace(/\.(com|net|org|com\.tr|tr)$/i, ""));
        setApprovedSector(data.sector || "");
        setApprovedCategories(data.categories);
        setApprovedCompetitors(data.competitors);
        setApprovedRegions(data.regions);
        setStep("approval");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        setStep("domain");
      }
    });
  }

  // ── Firma manual fallback submit ──
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName.trim()) { setError("Firma adını girin"); return; }
    setError(null);
    handleFinalSubmit({
      name: manualName,
      domain: "",
      sector: manualSector,
      type: "firma",
      city: manualCity || undefined,
      competitorNames: manualCompetitors.filter((c) => c.trim()),
    });
  }

  // ── Kişisel submit ──
  function handleKisiselSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kisiselName.trim()) { setError("Adınızı girin"); return; }
    setError(null);
    handleFinalSubmit({
      name: kisiselName,
      domain: kisiselDomain,
      sector,
      type: "kisisel",
      city: city || undefined,
      profession: profession || undefined,
      specialties: specialties.filter((s) => s.trim()),
      linkedinUrl: linkedinUrl.trim() || undefined,
    });
  }

  // ── Approval submit ──
  function handleApprovalSubmit() {
    const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    handleFinalSubmit({
      name: approvedName,
      domain: cleanDomain,
      sector: approvedSector,
      type: "firma",
      competitorNames: approvedCompetitors.map((c) => c.name),
      competitorDomains: approvedCompetitors.map((c) => c.domain).filter(Boolean) as string[],
      approvedBusinessCategories: approvedCategories,
      approvedServiceRegions: approvedRegions,
      approvedStrengths: analysis?.strengths,
      approvedWeaknesses: analysis?.weaknesses,
      sonarRawAnalysis: analysis?.rawAnalysis,
    });
  }

  // ── Final brand creation ──
  function handleFinalSubmit(brandData: Parameters<typeof createBrand>[0]) {
    setStep("loading");
    setLoadingStep(1);

    const timer1 = setTimeout(() => setLoadingStep(2), 3000);
    const timer2 = setTimeout(() => setLoadingStep(3), 8000);

    startTransition(async () => {
      try {
        await createBrand(brandData);
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
        setStep(brandType === "firma" ? "domain" : "kisisel-info");
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      }
    });
  }

  // ── Editable list helpers ──
  function addCategory() {
    const v = newCategoryInput.trim();
    if (v && !approvedCategories.includes(v)) {
      setApprovedCategories((p) => [...p, v]);
      setNewCategoryInput("");
    }
  }
  function removeCategory(i: number) {
    setApprovedCategories((p) => p.filter((_, idx) => idx !== i));
  }
  function addCompetitor() {
    const name = newCompetitorName.trim();
    if (name) {
      setApprovedCompetitors((p) => [...p, { name, domain: newCompetitorDomain.trim() || null }]);
      setNewCompetitorName("");
      setNewCompetitorDomain("");
    }
  }
  function removeCompetitor(i: number) {
    setApprovedCompetitors((p) => p.filter((_, idx) => idx !== i));
  }
  function addRegion() {
    const v = newRegionInput.trim();
    if (v && !approvedRegions.includes(v)) {
      setApprovedRegions((p) => [...p, v]);
      setNewRegionInput("");
    }
  }
  function removeRegion(i: number) {
    setApprovedRegions((p) => p.filter((_, idx) => idx !== i));
  }
  function updateManualCompetitor(i: number, v: string) {
    setManualCompetitors((p) => p.map((c, idx) => (idx === i ? v : c)));
  }
  function updateSpecialty(i: number, v: string) {
    setSpecialties((p) => p.map((s, idx) => (idx === i ? v : s)));
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/40";
  const chipClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm transition-colors";
  const stepCount = brandType === "firma" ? 3 : 3;

  // ═══════════════════════════════════════════════════════
  // STEP 1: Type Selection
  // ═══════════════════════════════════════════════════════
  if (step === "type") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 1 / {stepCount}</span>
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
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">Firma / Kurum</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Şirket, marka veya kurum için yapay zeka görünürlük takibi ve rakip analizi
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
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">Kişisel Marka</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Bireysel tanınırlık, dijital iz takibi ve kişisel görünürlük analizi
                </p>
                <ArrowRightIcon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/30 transition-all group-hover:right-3 group-hover:text-foreground" />
              </button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />Ücretsiz başla</span>
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />2 dakikada kurulum</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP 2a: Firma — Domain Only
  // ═══════════════════════════════════════════════════════
  if (step === "domain") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 2 / {stepCount}</span>
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

            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5">
                <GlobeIcon className="size-6 text-foreground/70" />
              </div>
              <div>
                <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
                  Web Adresinizi Girin
                </h1>
              </div>
            </div>
            <p className="mt-3 text-base text-muted-foreground">
              Yapay zeka web sitenizi analiz edecek ve firmanızı otomatik tanıyacak.
            </p>

            <form onSubmit={handleDomainSubmit} className="mt-10 space-y-6">
              <div>
                <div className="relative">
                  <GlobeIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => { setDomain(e.target.value); setError(null); }}
                    placeholder="isitmax.com"
                    className={`${inputClass} pl-11 text-base`}
                    autoFocus
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">https:// olmadan yazın</p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !domain.trim()}
                className="w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              >
                {isPending ? "Analiz ediliyor..." : "Analiz Et →"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep("manual-info")}
                  className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  Web sitem yok
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP 2b: Firma — Manual Fallback (no website)
  // ═══════════════════════════════════════════════════════
  if (step === "manual-info") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 2 / {stepCount}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-lg">
            <button
              type="button"
              onClick={() => setStep("domain")}
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              Geri
            </button>

            <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Markanızı Tanıyalım
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Web siteniz olmasa da firmanız hakkında bilgi verebilirsiniz.
            </p>

            <form onSubmit={handleManualSubmit} className="mt-10 space-y-6">
              <div>
                <label className="text-sm font-medium">Firma / Marka Adı</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => { setManualName(e.target.value); setError(null); }}
                  placeholder="örneğin: ISITMAX"
                  className={`mt-2 ${inputClass}`}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sektör</label>
                <input
                  type="text"
                  value={manualSector}
                  onChange={(e) => setManualSector(e.target.value)}
                  placeholder="örneğin: Isıtma & Soğutma"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Şehir <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="örneğin: İstanbul"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Rakipler <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                </label>
                {manualCompetitors.map((comp, i) => (
                  <input
                    key={i}
                    type="text"
                    value={comp}
                    onChange={(e) => updateManualCompetitor(i, e.target.value)}
                    placeholder={`Rakip ${i + 1}`}
                    className={inputClass}
                  />
                ))}
              </div>

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
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP 2c: Kişisel Marka — Info Form
  // ═══════════════════════════════════════════════════════
  if (step === "kisisel-info") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 2 / {stepCount}</span>
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

            <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">Sizi Tanıyalım</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Kendiniz hakkında bilgi verin, dijital görünürlüğünüzü ölçelim.
            </p>

            <form onSubmit={handleKisiselSubmit} className="mt-10 space-y-6">
              <div>
                <label className="text-sm font-medium">Adınız Soyadınız</label>
                <input
                  type="text"
                  value={kisiselName}
                  onChange={(e) => { setKisiselName(e.target.value); setError(null); }}
                  placeholder="örneğin: Volkan Şimşirkaya"
                  className={`mt-2 ${inputClass}`}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Web Sitesi <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={kisiselDomain}
                  onChange={(e) => setKisiselDomain(e.target.value)}
                  placeholder="örneğin: volkansimsirkaya.com"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meslek Alanı</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="örneğin: Avukat"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  LinkedIn Profili <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="linkedin.com/in/volkansimsirkaya"
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
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Uzmanlık Alanları <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
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
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP: Analyzing (Sonar running)
  // ═══════════════════════════════════════════════════════
  if (step === "analyzing") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5">
              <SparklesIcon className="size-8 animate-pulse text-foreground" />
            </div>
            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">
              Siteniz Analiz Ediliyor
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{domain}</span> yapay zeka ile araştırılıyor
            </p>

            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              {[
                "Faaliyet alanları araştırılıyor",
                "Güçlü yönler tespit ediliyor",
                "Rakipler bulunuyor",
                "Bölge bilgileri çıkarılıyor",
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-3 opacity-100">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground">
                    <Loader2Icon className="size-3.5 animate-spin" />
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>

            <p className="mt-10 text-xs text-muted-foreground/60">
              Bu işlem 10-20 saniye sürebilir
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP: Approval Screen
  // ═══════════════════════════════════════════════════════
  if (step === "approval") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adım 3 / {stepCount}</span>
        </div>
        <div className="flex flex-1 flex-col items-center px-6 pb-20 pt-4">
          <div className="w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setStep("domain")}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              Farklı bir adres gir
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
              <CheckIcon className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">
                  {domain} analiz edildi
                </p>
                <p className="text-xs text-muted-foreground">
                  Sonuçları inceleyin, düzenleyin ve onaylayın
                </p>
              </div>
            </div>

            {/* Firma adı + sektör (editable) */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Firma</label>
                <input
                  type="text"
                  value={approvedName}
                  onChange={(e) => setApprovedName(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sektör</label>
                <input
                  type="text"
                  value={approvedSector}
                  onChange={(e) => setApprovedSector(e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {/* ── Faaliyet Alanları ── */}
              <div className="rounded-2xl border border-border p-5">
                <h2 className="text-sm font-semibold">Faaliyet Alanları</h2>
                <p className="text-xs text-muted-foreground">Sorular bu alanlara göre üretilecek</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {approvedCategories.map((cat, i) => (
                    <span key={i} className={chipClass}>
                      <CheckIcon className="size-3 text-emerald-500" />
                      {cat}
                      <button type="button" onClick={() => removeCategory(i)} className="ml-0.5 rounded-full p-0.5 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground">
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                  {approvedCategories.length === 0 && (
                    <span className="text-xs text-muted-foreground/60">Faaliyet alanı bulunamadı</span>
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
                  <button type="button" onClick={addCategory} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted">
                    <PlusIcon className="size-3.5" /> Ekle
                  </button>
                </div>
              </div>

              {/* ── Rakipler ── */}
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">Rakipler ({approvedCompetitors.length})</h2>
                    <p className="text-xs text-muted-foreground">Bu markalarla kıyaslanacaksınız</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {approvedCompetitors.map((comp, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium">{comp.name}</span>
                      {comp.domain && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <ExternalLinkIcon className="size-3" />
                          {comp.domain}
                        </span>
                      )}
                      <button type="button" onClick={() => removeCompetitor(i)} className="rounded-full p-1 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground">
                        <XIcon className="size-3" />
                      </button>
                    </div>
                  ))}
                  {approvedCompetitors.length === 0 && (
                    <p className="text-xs text-muted-foreground/60">Rakip bulunamadı</p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newCompetitorName}
                    onChange={(e) => setNewCompetitorName(e.target.value)}
                    placeholder="Rakip adı"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newCompetitorDomain}
                    onChange={(e) => setNewCompetitorDomain(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                    placeholder="domain.com"
                    className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                  <button type="button" onClick={addCompetitor} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted">
                    <PlusIcon className="size-3.5" /> Ekle
                  </button>
                </div>
              </div>

              {/* ── Hizmet Bölgeleri ── */}
              {approvedRegions.length > 0 && (
                <div className="rounded-2xl border border-border p-5">
                  <h2 className="text-sm font-semibold">Hizmet Bölgeleri</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {approvedRegions.map((r, i) => (
                      <span key={i} className={chipClass}>
                        {r}
                        <button type="button" onClick={() => removeRegion(i)} className="ml-0.5 rounded-full p-0.5 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground">
                          <XIcon className="size-3" />
                        </button>
                      </span>
                    ))}
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
                    <button type="button" onClick={addRegion} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted">
                      <PlusIcon className="size-3.5" /> Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* ── Güçlü / Zayıf Yönler (read-only) ── */}
              {((analysis?.strengths?.length ?? 0) > 0 || (analysis?.weaknesses?.length ?? 0) > 0) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(analysis?.strengths?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
                      <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Güçlü Yönler</h3>
                      <ul className="mt-2 space-y-1">
                        {analysis!.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                            <CheckIcon className="mt-0.5 size-3 shrink-0" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(analysis?.weaknesses?.length ?? 0) > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
                      <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">Geliştirilebilir Alanlar</h3>
                      <ul className="mt-2 space-y-1">
                        {analysis!.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                            <span className="mt-0.5 shrink-0">•</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleApprovalSubmit}
              disabled={isPending}
              className="mt-8 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "Hazırlanıyor..." : "Onayla ve Başlat →"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground/60">
              Düzenlemeleriniz yapay zeka sorularının kalitesini doğrudan etkiler
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STEP: Loading (brand creation)
  // ═══════════════════════════════════════════════════════
  if (step === "loading") {
    const loadingSteps = [
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
        label: "Sayfanız hazırlanıyor",
        done: loadingStep >= 3,
        active: loadingStep === 3,
      },
    ];

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5">
              <Loader2Icon className="size-8 animate-spin text-foreground" />
            </div>
            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">Hazırlanıyor</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Yapay zeka görünürlük altyapısı kuruluyor
            </p>
            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              {loadingSteps.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity duration-500 ${s.done || s.active ? "opacity-100" : "opacity-30"}`}
                >
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    s.done ? "bg-foreground text-background" : s.active ? "border-2 border-foreground" : "border border-border"
                  }`}>
                    {s.done ? <CheckIcon className="size-3.5" /> : s.active ? <Loader2Icon className="size-3.5 animate-spin" /> : <span className="text-[10px] text-muted-foreground">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${s.done ? "text-muted-foreground line-through" : s.active ? "font-medium" : ""}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xs text-muted-foreground/60">Bu işlem 10-30 saniye sürebilir</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
