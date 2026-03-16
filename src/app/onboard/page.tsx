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
  | "type"              // Adım 1: Firma mı Kişisel mi?
  | "domain"            // Adım 2a: Firma → web sitesi gir
  | "kisisel-info"      // Adım 2b: Kişisel → ad soyad + meslek
  | "analyzing"         // Sonar analiz ediliyor (geçiş ekranı)
  | "approval"          // Adım 3a: Firma onay
  | "approval-kisisel"  // Adım 3b: Kişisel onay
  | "loading";          // Brand oluşturuluyor (geçiş ekranı)

interface CompetitorEntry {
  name: string;
  domain: string | null;
}

interface FirmaAnalysis {
  companyName: string | null;
  sector: string | null;
  categories: string[];
  regions: string[];
  competitors: CompetitorEntry[];
  strengths: string[];
  weaknesses: string[];
  rawAnalysis: Record<string, string>;
}

interface KisiselAnalysis {
  name: string | null;
  profession: string | null;
  city: string | null;
  specialties: string[];
  competitors: Array<{ name: string }>;
  strengths: string[];
  weaknesses: string[];
  rawAnalysis: Record<string, string>;
}

export default function OnboardPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("type");
  const [brandType, setBrandType] = useState<BrandType>("firma");

  // ── Firma: Domain ──
  const [domain, setDomain] = useState("");

  // ── Kişisel: Ad Soyad + Meslek ──
  const [kisiselName, setKisiselName] = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");

  // ── Firma onay ekranı ──
  const [firmaAnalysis, setFirmaAnalysis] = useState<FirmaAnalysis | null>(null);
  const [approvedName, setApprovedName] = useState("");
  const [approvedSector, setApprovedSector] = useState("");
  const [approvedCategories, setApprovedCategories] = useState<string[]>([]);
  const [approvedCompetitors, setApprovedCompetitors] = useState<CompetitorEntry[]>([]);
  const [approvedRegions, setApprovedRegions] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [newRegionInput, setNewRegionInput] = useState("");

  // ── Kişisel onay ekranı ──
  const [kisiselAnalysis, setKisiselAnalysis] = useState<KisiselAnalysis | null>(null);
  const [approvedKisiselName, setApprovedKisiselName] = useState("");
  const [approvedProfession, setApprovedProfession] = useState("");
  const [approvedCity, setApprovedCity] = useState("");
  const [approvedSpecialties, setApprovedSpecialties] = useState<string[]>([]);
  const [approvedKisiselCompetitors, setApprovedKisiselCompetitors] = useState<string[]>([]);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");
  const [newKisiselCompInput, setNewKisiselCompInput] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analyzeLabel, setAnalyzeLabel] = useState("");

  function handleTypeSelect(type: BrandType) {
    setBrandType(type);
    setStep(type === "firma" ? "domain" : "kisisel-info");
  }

  // ═══ FIRMA: Domain → Sonar analiz → Onay ═══
  function handleDomainSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) { setError("Web adresinizi girin"); return; }
    setError(null);
    setAnalyzeLabel("firma");
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
          throw new Error(data.error || "Analiz basarisiz oldu");
        }
        const data: FirmaAnalysis = await res.json();
        setFirmaAnalysis(data);
        setApprovedName(data.companyName || domain.replace(/\.(com|net|org|com\.tr|tr)$/i, ""));
        setApprovedSector(data.sector || "");
        setApprovedCategories(data.categories);
        setApprovedCompetitors(data.competitors);
        setApprovedRegions(data.regions);
        setStep("approval");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata olustu");
        setStep("domain");
      }
    });
  }

  // ═══ KİŞİSEL: Ad Soyad + Meslek → Sonar analiz → Onay ═══
  function handleKisiselSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kisiselName.trim()) { setError("Adinizi girin"); return; }
    if (!profession.trim()) { setError("Mesleginizi girin"); return; }
    setError(null);
    setAnalyzeLabel("kisisel");
    setStep("analyzing");

    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding/analyze-personal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: kisiselName.trim(),
            profession: profession.trim(),
            city: city.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Analiz basarisiz oldu");
        }
        const data: KisiselAnalysis = await res.json();
        setKisiselAnalysis(data);
        setApprovedKisiselName(data.name || kisiselName);
        setApprovedProfession(data.profession || profession);
        setApprovedCity(data.city || city);
        setApprovedSpecialties(data.specialties);
        setApprovedKisiselCompetitors(data.competitors.map((c) => c.name));
        setStep("approval-kisisel");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata olustu");
        setStep("kisisel-info");
      }
    });
  }

  // ═══ Firma onay → brand oluştur ═══
  function handleFirmaApprovalSubmit() {
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
      approvedStrengths: firmaAnalysis?.strengths,
      approvedWeaknesses: firmaAnalysis?.weaknesses,
      sonarRawAnalysis: firmaAnalysis?.rawAnalysis,
    });
  }

  // ═══ Kişisel onay → brand oluştur ═══
  function handleKisiselApprovalSubmit() {
    handleFinalSubmit({
      name: approvedKisiselName,
      domain: "",
      sector: "",
      type: "kisisel",
      city: approvedCity || undefined,
      profession: approvedProfession || undefined,
      specialties: approvedSpecialties,
      competitorNames: approvedKisiselCompetitors,
      approvedStrengths: kisiselAnalysis?.strengths,
      approvedWeaknesses: kisiselAnalysis?.weaknesses,
      sonarRawAnalysis: kisiselAnalysis?.rawAnalysis,
    });
  }

  // ═══ Final brand creation ═══
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
        setError(err instanceof Error ? err.message : "Bir hata olustu");
      }
    });
  }

  // ── Editable list helpers ──
  function addCategory() { const v = newCategoryInput.trim(); if (v && !approvedCategories.includes(v)) { setApprovedCategories((p) => [...p, v]); setNewCategoryInput(""); } }
  function removeCategory(i: number) { setApprovedCategories((p) => p.filter((_, idx) => idx !== i)); }
  function addCompetitor() { const n = newCompetitorName.trim(); if (n) { setApprovedCompetitors((p) => [...p, { name: n, domain: newCompetitorDomain.trim() || null }]); setNewCompetitorName(""); setNewCompetitorDomain(""); } }
  function removeCompetitor(i: number) { setApprovedCompetitors((p) => p.filter((_, idx) => idx !== i)); }
  function addRegion() { const v = newRegionInput.trim(); if (v && !approvedRegions.includes(v)) { setApprovedRegions((p) => [...p, v]); setNewRegionInput(""); } }
  function removeRegion(i: number) { setApprovedRegions((p) => p.filter((_, idx) => idx !== i)); }
  function addSpecialty() { const v = newSpecialtyInput.trim(); if (v && !approvedSpecialties.includes(v)) { setApprovedSpecialties((p) => [...p, v]); setNewSpecialtyInput(""); } }
  function removeSpecialty(i: number) { setApprovedSpecialties((p) => p.filter((_, idx) => idx !== i)); }
  function addKisiselComp() { const v = newKisiselCompInput.trim(); if (v && !approvedKisiselCompetitors.includes(v)) { setApprovedKisiselCompetitors((p) => [...p, v]); setNewKisiselCompInput(""); } }
  function removeKisiselComp(i: number) { setApprovedKisiselCompetitors((p) => p.filter((_, idx) => idx !== i)); }

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-sm focus:border-foreground focus:outline-none transition-colors placeholder:text-muted-foreground/40";
  const chipClass = "inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm transition-colors";

  // ═══════════════════════════════════════════════════════
  // ADIM 1: Firma mi Kişisel mi?
  // ═══════════════════════════════════════════════════════
  if (step === "type") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs text-muted-foreground">Adim 1 / 3</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-4xl font-light tracking-[-0.04em] md:text-5xl lg:text-6xl">
              Yapay Zeka Seni<br /><span className="font-semibold">Taniyor mu?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Markanizin ChatGPT, Claude, Gemini ve Perplexity&apos;deki gorunurlugunuzu olcun ve iyilestirin.
            </p>
            <div className="mx-auto mt-12 grid max-w-xl gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => handleTypeSelect("firma")} className="group relative overflow-hidden rounded-2xl border border-border p-6 text-left transition-all hover:border-foreground hover:shadow-lg">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background"><BuildingIcon className="size-6" /></div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">Firma / Kurum</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">Sirket, marka veya kurum icin yapay zeka gorunurluk takibi</p>
                <ArrowRightIcon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/30 transition-all group-hover:right-3 group-hover:text-foreground" />
              </button>
              <button type="button" onClick={() => handleTypeSelect("kisisel")} className="group relative overflow-hidden rounded-2xl border border-border p-6 text-left transition-all hover:border-foreground hover:shadow-lg">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background"><UserIcon className="size-6" /></div>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">Kisisel Marka</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">Bireysel taninirlik ve kisisel gorunurluk analizi</p>
                <ArrowRightIcon className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/30 transition-all group-hover:right-3 group-hover:text-foreground" />
              </button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />Ucretsiz basla</span>
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />Kredi karti gerekmez</span>
              <span className="flex items-center gap-1.5"><CheckIcon className="size-3.5" />2 dakikada kurulum</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADIM 2a: FIRMA — Sadece Web Sitesi
  // ═══════════════════════════════════════════════════════
  if (step === "domain") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /><span className="text-xs text-muted-foreground">Adim 2 / 3</span></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-lg">
            <button type="button" onClick={() => setStep("type")} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5"><GlobeIcon className="size-6 text-foreground/70" /></div>
              <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">Web Adresiniz</h1>
            </div>
            <p className="mt-3 text-base text-muted-foreground">Web sitenizi girin, yapay zeka firmanizi otomatik analiz etsin.</p>
            <form onSubmit={handleDomainSubmit} className="mt-10 space-y-6">
              <div>
                <div className="relative">
                  <GlobeIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
                  <input type="text" value={domain} onChange={(e) => { setDomain(e.target.value); setError(null); }} placeholder="isitmax.com" className={`${inputClass} pl-11 text-base`} autoFocus />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">https:// olmadan yazin</p>
              </div>
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</p>}
              <button type="submit" disabled={isPending || !domain.trim()} className="w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">
                {isPending ? "Analiz ediliyor..." : "Analiz Et"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADIM 2b: KİŞİSEL — Ad Soyad + Meslek
  // ═══════════════════════════════════════════════════════
  if (step === "kisisel-info") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /><span className="text-xs text-muted-foreground">Adim 2 / 3</span></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-lg">
            <button type="button" onClick={() => setStep("type")} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5"><UserIcon className="size-6 text-foreground/70" /></div>
              <h1 className="text-3xl font-light tracking-[-0.04em] md:text-4xl">Sizi Taniyalim</h1>
            </div>
            <p className="mt-3 text-base text-muted-foreground">Adinizi ve mesleginizi girin, yapay zeka sizi arastirsin.</p>
            <form onSubmit={handleKisiselSubmit} className="mt-10 space-y-5">
              <div>
                <label className="text-sm font-medium">Ad Soyad</label>
                <input type="text" value={kisiselName} onChange={(e) => { setKisiselName(e.target.value); setError(null); }} placeholder="Dr. Ahmet Yilmaz" className={`mt-2 ${inputClass}`} autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium">Meslek</label>
                <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ortopedi Uzmani" className={`mt-2 ${inputClass}`} />
              </div>
              <div>
                <label className="text-sm font-medium">Sehir <span className="font-normal text-muted-foreground">(istege bagli)</span></label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Istanbul" className={`mt-2 ${inputClass}`} />
              </div>
              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</p>}
              <button type="submit" disabled={isPending || !kisiselName.trim() || !profession.trim()} className="w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">
                {isPending ? "Analiz ediliyor..." : "Analiz Et"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // GECİS: Analiz ediliyor (Sonar running)
  // ═══════════════════════════════════════════════════════
  if (step === "analyzing") {
    const isFirma = analyzeLabel === "firma";
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5"><SparklesIcon className="size-8 animate-pulse text-foreground" /></div>
            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">{isFirma ? "Siteniz Analiz Ediliyor" : "Profiliniz Arastiriliyor"}</h1>
            <p className="mt-3 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{isFirma ? domain : kisiselName}</span> yapay zeka ile arastiriliyor
            </p>
            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              {(isFirma
                ? ["Faaliyet alanlari arastiriliyor", "Guclu yonler tespit ediliyor", "Rakipler bulunuyor", "Bolge bilgileri cikariliyor"]
                : ["Uzmanlik alanlari arastiriliyor", "Dijital varlik taraniyor", "Senin yerine kim oneriliyor bulunuyor"]
              ).map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground"><Loader2Icon className="size-3.5 animate-spin" /></div>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xs text-muted-foreground/60">Bu islem 10-20 saniye surebilir</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADIM 3a: FIRMA ONAY EKRANI
  // ═══════════════════════════════════════════════════════
  if (step === "approval") {
    const promptCount = approvedCategories.length > 0 ? approvedCategories.length * 10 : 50;
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /><span className="text-xs text-muted-foreground">Adim 3 / 3</span></div>
        <div className="flex flex-1 flex-col items-center px-6 pb-20 pt-4">
          <div className="w-full max-w-2xl">
            <button type="button" onClick={() => setStep("domain")} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Farkli bir adres gir</button>

            {/* Header */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
              <CheckIcon className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">{domain} analiz edildi</p>
                <p className="text-xs text-muted-foreground">Sonuclari inceleyin, duzenleyin ve onaylayin</p>
              </div>
            </div>

            {/* Firma adi + sektor */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-muted-foreground">Firma</label><input type="text" value={approvedName} onChange={(e) => setApprovedName(e.target.value)} className={`mt-1 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Sektor</label><input type="text" value={approvedSector} onChange={(e) => setApprovedSector(e.target.value)} className={`mt-1 ${inputClass}`} /></div>
            </div>

            <div className="mt-6 space-y-5">
              {/* Faaliyet Alanlari */}
              <EditableChipSection title="Faaliyet Alanlari" subtitle="Sorular bu alanlara gore uretilecek" items={approvedCategories} onRemove={removeCategory} inputValue={newCategoryInput} onInputChange={setNewCategoryInput} onAdd={addCategory} placeholder="Yeni alan ekle..." chipClass={chipClass} inputClass={inputClass} />

              {/* Rakipler */}
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Rakipler ({approvedCompetitors.length})</h2><p className="text-xs text-muted-foreground">Bu markalarla kiyaslanacaksiniz</p></div></div>
                <div className="mt-3 space-y-2">
                  {approvedCompetitors.map((comp, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium">{comp.name}</span>
                      {comp.domain && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><ExternalLinkIcon className="size-3" />{comp.domain}</span>}
                      <button type="button" onClick={() => removeCompetitor(i)} className="rounded-full p-1 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground"><XIcon className="size-3" /></button>
                    </div>
                  ))}
                  {approvedCompetitors.length === 0 && <p className="text-xs text-muted-foreground/60">Rakip bulunamadi</p>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input type="text" value={newCompetitorName} onChange={(e) => setNewCompetitorName(e.target.value)} placeholder="Rakip adi" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                  <input type="text" value={newCompetitorDomain} onChange={(e) => setNewCompetitorDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())} placeholder="domain.com" className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                  <button type="button" onClick={addCompetitor} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"><PlusIcon className="size-3.5" />Ekle</button>
                </div>
              </div>

              {/* Hizmet Bolgeleri */}
              {approvedRegions.length > 0 && (
                <EditableChipSection title="Hizmet Bolgeleri" subtitle="Konum bazli sorularda kullanilacak" items={approvedRegions} onRemove={removeRegion} inputValue={newRegionInput} onInputChange={setNewRegionInput} onAdd={addRegion} placeholder="Yeni bolge ekle..." chipClass={chipClass} inputClass={inputClass} />
              )}

              {/* Guclu/Zayif */}
              <StrengthsWeaknesses strengths={firmaAnalysis?.strengths ?? []} weaknesses={firmaAnalysis?.weaknesses ?? []} />
            </div>

            {/* Soru bilgisi + Submit */}
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Her faaliyet alani icin <span className="font-semibold text-foreground">10 soru</span> olusturulacak.
                {" "}Toplam: <span className="font-semibold text-foreground">{Math.min(promptCount, 50)} soru</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">Tum sorular firma onerisi alma odakli.</p>
            </div>

            <button type="button" onClick={handleFirmaApprovalSubmit} disabled={isPending} className="mt-6 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">{isPending ? "Hazirlaniyor..." : "Onayla ve Basla"}</button>
            <p className="mt-3 text-center text-xs text-muted-foreground/60">Duzenlemeleriniz yapay zeka sorularinin kalitesini dogrudan etkiler</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ADIM 3b: KİŞİSEL ONAY EKRANI
  // ═══════════════════════════════════════════════════════
  if (step === "approval-kisisel") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /><span className="text-xs text-muted-foreground">Adim 3 / 3</span></div>
        <div className="flex flex-1 flex-col items-center px-6 pb-20 pt-4">
          <div className="w-full max-w-2xl">
            <button type="button" onClick={() => setStep("kisisel-info")} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>

            {/* Header */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
              <CheckIcon className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">{approvedKisiselName || "Profiliniz"} analiz edildi</p>
                <p className="text-xs text-muted-foreground">Sonuclari inceleyin, duzenleyin ve onaylayin</p>
              </div>
            </div>

            {/* Ad + Meslek + Sehir */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground">Ad Soyad</label><input type="text" value={approvedKisiselName} onChange={(e) => setApprovedKisiselName(e.target.value)} className={`mt-1 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Meslek</label><input type="text" value={approvedProfession} onChange={(e) => setApprovedProfession(e.target.value)} className={`mt-1 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Sehir</label><input type="text" value={approvedCity} onChange={(e) => setApprovedCity(e.target.value)} className={`mt-1 ${inputClass}`} /></div>
            </div>

            <div className="mt-6 space-y-5">
              {/* Uzmanlik Alanlari */}
              <EditableChipSection title="Uzmanlik Alanlari" subtitle="Sorular bu alanlara gore uretilecek" items={approvedSpecialties} onRemove={removeSpecialty} inputValue={newSpecialtyInput} onInputChange={setNewSpecialtyInput} onAdd={addSpecialty} placeholder="Yeni uzmanlik ekle..." chipClass={chipClass} inputClass={inputClass} />

              {/* Senin yerine onerilen kisiler */}
              <div className="rounded-2xl border border-border p-5">
                <h2 className="text-sm font-semibold">Senin Yerine Onerilen Kisiler ({approvedKisiselCompetitors.length})</h2>
                <p className="text-xs text-muted-foreground">Bu kisilerle kiyaslanacaksiniz</p>
                <div className="mt-3 space-y-2">
                  {approvedKisiselCompetitors.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                      <span className="flex-1 text-sm">{name}</span>
                      <button type="button" onClick={() => removeKisiselComp(i)} className="rounded-full p-1 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground"><XIcon className="size-3" /></button>
                    </div>
                  ))}
                  {approvedKisiselCompetitors.length === 0 && <p className="text-xs text-muted-foreground/60">Henuz kimse bulunamadi</p>}
                </div>
                <div className="mt-3 flex gap-2">
                  <input type="text" value={newKisiselCompInput} onChange={(e) => setNewKisiselCompInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKisiselComp())} placeholder="Kisi adi ekle..." className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
                  <button type="button" onClick={addKisiselComp} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"><PlusIcon className="size-3.5" />Ekle</button>
                </div>
              </div>

              {/* Guclu/Zayif */}
              <StrengthsWeaknesses strengths={kisiselAnalysis?.strengths ?? []} weaknesses={kisiselAnalysis?.weaknesses ?? []} />
            </div>

            <button type="button" onClick={handleKisiselApprovalSubmit} disabled={isPending} className="mt-8 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">{isPending ? "Hazirlaniyor..." : "Onayla ve Basla"}</button>
            <p className="mt-3 text-center text-xs text-muted-foreground/60">Duzenlemeleriniz yapay zeka sorularinin kalitesini dogrudan etkiler</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // GECİS: Brand oluşturuluyor
  // ═══════════════════════════════════════════════════════
  if (step === "loading") {
    const steps = [
      { label: brandType === "firma" ? "Sektorunuz analiz ediliyor" : "Dijital iziniz arastiriliyor", done: loadingStep > 1, active: loadingStep === 1 },
      { label: "Akilli sorular uretiliyor", done: loadingStep > 2, active: loadingStep === 2 },
      { label: "Sayfaniz hazirlaniyor", done: loadingStep >= 3, active: loadingStep === 3 },
    ];
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10"><GH7Logo size="default" /></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-20">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-foreground/5"><Loader2Icon className="size-8 animate-spin text-foreground" /></div>
            <h1 className="mt-8 text-3xl font-light tracking-[-0.04em] md:text-4xl">Hazirlaniyor</h1>
            <p className="mt-3 text-base text-muted-foreground">Yapay zeka gorunurluk altyapisi kuruluyor</p>
            <div className="mx-auto mt-10 max-w-xs space-y-4 text-left">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${s.done || s.active ? "opacity-100" : "opacity-30"}`}>
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${s.done ? "bg-foreground text-background" : s.active ? "border-2 border-foreground" : "border border-border"}`}>
                    {s.done ? <CheckIcon className="size-3.5" /> : s.active ? <Loader2Icon className="size-3.5 animate-spin" /> : <span className="text-[10px] text-muted-foreground">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${s.done ? "text-muted-foreground line-through" : s.active ? "font-medium" : ""}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-xs text-muted-foreground/60">Bu islem 10-30 saniye surebilir</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Reusable: Editable Chip Section ─────────────────────
function EditableChipSection({ title, subtitle, items, onRemove, inputValue, onInputChange, onAdd, placeholder, chipClass, inputClass: _inputClass }: {
  title: string; subtitle: string; items: string[]; onRemove: (i: number) => void;
  inputValue: string; onInputChange: (v: string) => void; onAdd: () => void;
  placeholder: string; chipClass: string; inputClass: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={chipClass}>
            <CheckIcon className="size-3 text-emerald-500" />{item}
            <button type="button" onClick={() => onRemove(i)} className="ml-0.5 rounded-full p-0.5 text-muted-foreground/60 hover:bg-foreground/10 hover:text-foreground"><XIcon className="size-3" /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground/60">Henuz bulunamadi</span>}
      </div>
      <div className="mt-3 flex gap-2">
        <input type="text" value={inputValue} onChange={(e) => onInputChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())} placeholder={placeholder} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none" />
        <button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"><PlusIcon className="size-3.5" />Ekle</button>
      </div>
    </div>
  );
}

// ─── Reusable: Strengths & Weaknesses ────────────────────
function StrengthsWeaknesses({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  if (strengths.length === 0 && weaknesses.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {strengths.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Guclu Yonler</h3>
          <ul className="mt-2 space-y-1">{strengths.map((s, i) => (<li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700/80 dark:text-emerald-300/80"><CheckIcon className="mt-0.5 size-3 shrink-0" />{s}</li>))}</ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-800/30 dark:bg-amber-900/10">
          <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">Gelistirilebilir Alanlar</h3>
          <ul className="mt-2 space-y-1">{weaknesses.map((w, i) => (<li key={i} className="flex items-start gap-1.5 text-xs text-amber-700/80 dark:text-amber-300/80"><span className="mt-0.5 shrink-0">&#x2022;</span>{w}</li>))}</ul>
        </div>
      )}
    </div>
  );
}
