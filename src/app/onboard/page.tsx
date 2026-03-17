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
          throw new Error(data.error || "Analiz başarısız oldu");
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
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
        setStep("domain");
      }
    });
  }

  // ═══ KİŞİSEL: Ad Soyad + Meslek → Sonar analiz → Onay ═══
  function handleKisiselSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kisiselName.trim()) { setError("Adınızı girin"); return; }
    if (!profession.trim()) { setError("Mesleğinizi girin"); return; }
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
          throw new Error(data.error || "Analiz başarısız oldu");
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
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
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
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
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

  const inputClass = "w-full rounded-xl border border-border/60 bg-white px-4 py-3.5 text-sm focus:border-foreground focus:ring-2 focus:ring-foreground/5 focus:outline-none transition-all placeholder:text-muted-foreground/40";
  const chipClass = "inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-3.5 py-1.5 text-sm transition-colors";

  // ═══════════════════════════════════════════════════════
  // ADIM 1: Firma mı Kişisel mi?
  // ═══════════════════════════════════════════════════════
  if (step === "type") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <GH7Logo size="default" />
          <span className="text-xs tracking-wide text-muted-foreground">Adım 1 / 3</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl text-center">
            <h1 className="font-inter text-4xl font-light tracking-[-0.04em] text-foreground md:text-5xl lg:text-6xl">
              Yapay Zeka Seni<br /><span className="font-semibold">Tanıyor mu?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Markanızın ChatGPT, Claude, Gemini ve Perplexity&apos;deki görünürlüğünü ölçün ve iyileştirin.
            </p>
            <div className="mx-auto mt-14 grid max-w-xl gap-5 sm:grid-cols-2">
              <button type="button" onClick={() => handleTypeSelect("firma")} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white p-7 text-left shadow-sm transition-all hover:border-foreground hover:shadow-lg">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background"><BuildingIcon className="size-6" /></div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em]">Şirket / Kurum</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Şirket, marka veya kurum için yapay zeka görünürlük takibi</p>
                <ArrowRightIcon className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/20 transition-all group-hover:right-4 group-hover:text-foreground" />
              </button>
              <button type="button" onClick={() => handleTypeSelect("kisisel")} className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white p-7 text-left shadow-sm transition-all hover:border-foreground hover:shadow-lg">
                <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground group-hover:text-background"><UserIcon className="size-6" /></div>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em]">Kişisel Marka</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Bireysel tanınırlık ve kişisel görünürlük analizi</p>
                <ArrowRightIcon className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/20 transition-all group-hover:right-4 group-hover:text-foreground" />
              </button>
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-7 text-xs text-muted-foreground/50">
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
  // ADIM 2a: FIRMA — Sadece Web Sitesi
  // ═══════════════════════════════════════════════════════
  if (step === "domain") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /><span className="text-xs tracking-wide text-muted-foreground">Adım 2 / 3</span></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-lg">
            <button type="button" onClick={() => setStep("type")} className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>
            <div className="flex items-center gap-3.5 mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5"><GlobeIcon className="size-6 text-foreground/70" /></div>
              <h1 className="font-inter text-3xl font-light tracking-[-0.04em] md:text-4xl">Web Adresiniz</h1>
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Web sitenizi girin, yapay zeka firmanızı otomatik analiz etsin.</p>
            <form onSubmit={handleDomainSubmit} className="mt-12 space-y-6">
              <div>
                <div className="relative">
                  <GlobeIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
                  <input type="text" value={domain} onChange={(e) => { setDomain(e.target.value); setError(null); }} placeholder="isitmax.com" className={`${inputClass} pl-11 text-base`} autoFocus />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">https:// olmadan yazın</p>
              </div>
              {error && <p className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</p>}
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
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /><span className="text-xs tracking-wide text-muted-foreground">Adım 2 / 3</span></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-lg">
            <button type="button" onClick={() => setStep("type")} className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>
            <div className="flex items-center gap-3.5 mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-foreground/5"><UserIcon className="size-6 text-foreground/70" /></div>
              <h1 className="font-inter text-3xl font-light tracking-[-0.04em] md:text-4xl">Sizi Tanıyalım</h1>
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Adınızı ve mesleğinizi girin, yapay zeka sizi araştırsın.</p>
            <form onSubmit={handleKisiselSubmit} className="mt-12 space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Ad Soyad</label>
                <input type="text" value={kisiselName} onChange={(e) => { setKisiselName(e.target.value); setError(null); }} placeholder="Dr. Ahmet Yılmaz" className={`mt-2.5 ${inputClass}`} autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Meslek</label>
                <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ortopedi Uzmanı" className={`mt-2.5 ${inputClass}`} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Şehir <span className="font-normal text-muted-foreground">(isteğe bağlı)</span></label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" className={`mt-2.5 ${inputClass}`} />
              </div>
              {error && <p className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</p>}
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
  // GEÇİŞ: Analiz ediliyor (Sonar running)
  // ═══════════════════════════════════════════════════════
  if (step === "analyzing") {
    const isFirma = analyzeLabel === "firma";
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-white shadow-sm"><SparklesIcon className="size-8 animate-pulse text-foreground" /></div>
            <h1 className="mt-10 font-inter text-3xl font-light tracking-[-0.04em] md:text-4xl">{isFirma ? "Siteniz Analiz Ediliyor" : "Profiliniz Araştırılıyor"}</h1>
            <p className="mt-4 text-base text-muted-foreground">
              <span className="font-medium text-foreground">{isFirma ? domain : kisiselName}</span> yapay zeka ile araştırılıyor
            </p>
            <div className="mx-auto mt-12 max-w-xs space-y-5 text-left">
              {(isFirma
                ? ["Faaliyet alanları araştırılıyor", "Güçlü yönler tespit ediliyor", "Rakipler bulunuyor", "Bölge bilgileri çıkarılıyor"]
                : ["Uzmanlık alanları araştırılıyor", "Dijital varlık taranıyor", "Senin yerine kim öneriliyor bulunuyor"]
              ).map((label, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-foreground/20"><Loader2Icon className="size-3.5 animate-spin text-foreground/60" /></div>
                  <span className="text-sm text-foreground/80">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-12 text-xs text-muted-foreground/50">Bu işlem 10-20 saniye sürebilir</p>
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
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /><span className="text-xs tracking-wide text-muted-foreground">Adım 3 / 3</span></div>
        <div className="flex flex-1 flex-col items-center px-6 pb-24 pt-6">
          <div className="w-full max-w-2xl">
            <button type="button" onClick={() => setStep("domain")} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Farklı bir adres gir</button>

            {/* Header */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 dark:border-emerald-800/30 dark:bg-emerald-900/10">
              <CheckIcon className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">{domain} analiz edildi</p>
                <p className="text-xs text-muted-foreground">Sonuçları inceleyin, düzenleyin ve onaylayın</p>
              </div>
            </div>

            {/* Firma adı + sektör */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-muted-foreground">Firma</label><input type="text" value={approvedName} onChange={(e) => setApprovedName(e.target.value)} className={`mt-1.5 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Sektör</label><input type="text" value={approvedSector} onChange={(e) => setApprovedSector(e.target.value)} className={`mt-1.5 ${inputClass}`} /></div>
            </div>

            <div className="mt-8 space-y-6">
              {/* Faaliyet Alanları */}
              <EditableChipSection title="Faaliyet Alanları" subtitle="Sorular bu alanlara göre üretilecek" items={approvedCategories} onRemove={removeCategory} inputValue={newCategoryInput} onInputChange={setNewCategoryInput} onAdd={addCategory} placeholder="Yeni alan ekle..." chipClass={chipClass} inputClass={inputClass} />

              {/* Rakipler */}
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold tracking-[-0.01em]">Rakipler ({approvedCompetitors.length})</h2><p className="mt-0.5 text-xs text-muted-foreground">Bu markalarla kıyaslanacaksınız</p></div></div>
                <div className="mt-4 space-y-2.5">
                  {approvedCompetitors.map((comp, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium">{comp.name}</span>
                      {comp.domain && <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><ExternalLinkIcon className="size-3" />{comp.domain}</span>}
                      <button type="button" onClick={() => removeCompetitor(i)} className="rounded-full p-1 text-muted-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors"><XIcon className="size-3" /></button>
                    </div>
                  ))}
                  {approvedCompetitors.length === 0 && <p className="text-xs text-muted-foreground/50">Rakip bulunamadı</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <input type="text" value={newCompetitorName} onChange={(e) => setNewCompetitorName(e.target.value)} placeholder="Rakip adı" className="flex-1 rounded-xl border border-border/60 bg-white px-3.5 py-2.5 text-sm focus:border-foreground focus:ring-2 focus:ring-foreground/5 focus:outline-none transition-all" />
                  <input type="text" value={newCompetitorDomain} onChange={(e) => setNewCompetitorDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())} placeholder="domain.com" className="w-36 rounded-xl border border-border/60 bg-white px-3.5 py-2.5 text-sm focus:border-foreground focus:ring-2 focus:ring-foreground/5 focus:outline-none transition-all" />
                  <button type="button" onClick={addCompetitor} className="flex items-center gap-1.5 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"><PlusIcon className="size-3.5" />Ekle</button>
                </div>
              </div>

              {/* Hizmet Bölgeleri */}
              {approvedRegions.length > 0 && (
                <EditableChipSection title="Hizmet Bölgeleri" subtitle="Konum bazlı sorularda kullanılacak" items={approvedRegions} onRemove={removeRegion} inputValue={newRegionInput} onInputChange={setNewRegionInput} onAdd={addRegion} placeholder="Yeni bölge ekle..." chipClass={chipClass} inputClass={inputClass} />
              )}

              {/* Güçlü/Zayıf */}
              <StrengthsWeaknesses strengths={firmaAnalysis?.strengths ?? []} weaknesses={firmaAnalysis?.weaknesses ?? []} />
            </div>

            {/* Soru bilgisi + Submit */}
            <div className="mt-8 rounded-2xl border border-border/50 bg-muted/10 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Her faaliyet alanı için <span className="font-semibold text-foreground">10 soru</span> oluşturulacak.
                {" "}Toplam: <span className="font-semibold text-foreground">{Math.min(promptCount, 50)} soru</span>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground/60">Tüm sorular firma önerisi alma odaklı.</p>
            </div>

            <button type="button" onClick={handleFirmaApprovalSubmit} disabled={isPending} className="mt-8 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">{isPending ? "Hazırlanıyor..." : "Onayla ve Başla"}</button>
            <p className="mt-4 text-center text-xs text-muted-foreground/50">Düzenlemeleriniz yapay zeka sorularının kalitesini doğrudan etkiler</p>
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
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /><span className="text-xs tracking-wide text-muted-foreground">Adım 3 / 3</span></div>
        <div className="flex flex-1 flex-col items-center px-6 pb-24 pt-6">
          <div className="w-full max-w-2xl">
            <button type="button" onClick={() => setStep("kisisel-info")} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeftIcon className="size-4" />Geri</button>

            {/* Header */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/60 bg-emerald-50/30 p-5 dark:border-emerald-800/30 dark:bg-emerald-900/10">
              <CheckIcon className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold">{approvedKisiselName || "Profiliniz"} analiz edildi</p>
                <p className="text-xs text-muted-foreground">Sonuçları inceleyin, düzenleyin ve onaylayın</p>
              </div>
            </div>

            {/* Ad + Meslek + Şehir */}
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <div><label className="text-xs font-medium text-muted-foreground">Ad Soyad</label><input type="text" value={approvedKisiselName} onChange={(e) => setApprovedKisiselName(e.target.value)} className={`mt-1.5 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Meslek</label><input type="text" value={approvedProfession} onChange={(e) => setApprovedProfession(e.target.value)} className={`mt-1.5 ${inputClass}`} /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Şehir</label><input type="text" value={approvedCity} onChange={(e) => setApprovedCity(e.target.value)} className={`mt-1.5 ${inputClass}`} /></div>
            </div>

            <div className="mt-8 space-y-6">
              {/* Uzmanlık Alanları */}
              <EditableChipSection title="Uzmanlık Alanları" subtitle="Sorular bu alanlara göre üretilecek" items={approvedSpecialties} onRemove={removeSpecialty} inputValue={newSpecialtyInput} onInputChange={setNewSpecialtyInput} onAdd={addSpecialty} placeholder="Yeni uzmanlık ekle..." chipClass={chipClass} inputClass={inputClass} />

              {/* Senin yerine önerilen kişiler */}
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold tracking-[-0.01em]">Senin Yerine Önerilen Kişiler ({approvedKisiselCompetitors.length})</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Bu kişilerle kıyaslanacaksınız</p>
                <div className="mt-4 space-y-2.5">
                  {approvedKisiselCompetitors.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-2.5">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                      <span className="flex-1 text-sm">{name}</span>
                      <button type="button" onClick={() => removeKisiselComp(i)} className="rounded-full p-1 text-muted-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors"><XIcon className="size-3" /></button>
                    </div>
                  ))}
                  {approvedKisiselCompetitors.length === 0 && <p className="text-xs text-muted-foreground/50">Henüz kimse bulunamadı</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <input type="text" value={newKisiselCompInput} onChange={(e) => setNewKisiselCompInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKisiselComp())} placeholder="Kişi adı ekle..." className="flex-1 rounded-xl border border-border/60 bg-white px-3.5 py-2.5 text-sm focus:border-foreground focus:ring-2 focus:ring-foreground/5 focus:outline-none transition-all" />
                  <button type="button" onClick={addKisiselComp} className="flex items-center gap-1.5 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"><PlusIcon className="size-3.5" />Ekle</button>
                </div>
              </div>

              {/* Güçlü/Zayıf */}
              <StrengthsWeaknesses strengths={kisiselAnalysis?.strengths ?? []} weaknesses={kisiselAnalysis?.weaknesses ?? []} />
            </div>

            <button type="button" onClick={handleKisiselApprovalSubmit} disabled={isPending} className="mt-10 w-full rounded-xl bg-foreground py-4 text-base font-semibold text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50">{isPending ? "Hazırlanıyor..." : "Onayla ve Başla"}</button>
            <p className="mt-4 text-center text-xs text-muted-foreground/50">Düzenlemeleriniz yapay zeka sorularının kalitesini doğrudan etkiler</p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // GEÇİŞ: Brand oluşturuluyor
  // ═══════════════════════════════════════════════════════
  if (step === "loading") {
    const steps = [
      { label: brandType === "firma" ? "Sektörünüz analiz ediliyor" : "Dijital iziniz araştırılıyor", done: loadingStep > 1, active: loadingStep === 1 },
      { label: "Akıllı sorular üretiliyor", done: loadingStep > 2, active: loadingStep === 2 },
      { label: "Sayfanız hazırlanıyor", done: loadingStep >= 3, active: loadingStep === 3 },
    ];
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10"><GH7Logo size="default" /></div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-border/50 bg-white shadow-sm"><Loader2Icon className="size-8 animate-spin text-foreground" /></div>
            <h1 className="mt-10 font-inter text-3xl font-light tracking-[-0.04em] md:text-4xl">Hazırlanıyor</h1>
            <p className="mt-4 text-base text-muted-foreground">Yapay zeka görünürlük altyapısı kuruluyor</p>
            <div className="mx-auto mt-12 max-w-xs space-y-5 text-left">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-3.5 transition-opacity duration-500 ${s.done || s.active ? "opacity-100" : "opacity-30"}`}>
                  <div className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${s.done ? "bg-foreground text-background" : s.active ? "border-2 border-foreground" : "border border-border/50"}`}>
                    {s.done ? <CheckIcon className="size-3.5" /> : s.active ? <Loader2Icon className="size-3.5 animate-spin" /> : <span className="text-[10px] text-muted-foreground">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${s.done ? "text-muted-foreground line-through" : s.active ? "font-medium" : ""}`}>{s.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-12 text-xs text-muted-foreground/50">Bu işlem 10-30 saniye sürebilir</p>
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
    <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={chipClass}>
            <CheckIcon className="size-3 text-emerald-500" />{item}
            <button type="button" onClick={() => onRemove(i)} className="ml-0.5 rounded-full p-0.5 text-muted-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors"><XIcon className="size-3" /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground/50">Henüz bulunamadı</span>}
      </div>
      <div className="mt-4 flex gap-2">
        <input type="text" value={inputValue} onChange={(e) => onInputChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())} placeholder={placeholder} className="flex-1 rounded-xl border border-border/60 bg-white px-3.5 py-2.5 text-sm focus:border-foreground focus:ring-2 focus:ring-foreground/5 focus:outline-none transition-all" />
        <button type="button" onClick={onAdd} className="flex items-center gap-1.5 rounded-xl border border-border/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50"><PlusIcon className="size-3.5" />Ekle</button>
      </div>
    </div>
  );
}

// ─── Reusable: Strengths & Weaknesses ────────────────────
function StrengthsWeaknesses({ strengths, weaknesses }: { strengths: string[]; weaknesses: string[] }) {
  if (strengths.length === 0 && weaknesses.length === 0) return null;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {strengths.length > 0 && (
        <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/20 p-5 dark:border-emerald-800/30 dark:bg-emerald-900/10">
          <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Güçlü Yönler</h3>
          <ul className="mt-3 space-y-1.5">{strengths.map((s, i) => (<li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/80"><CheckIcon className="mt-0.5 size-3 shrink-0" />{s}</li>))}</ul>
        </div>
      )}
      {weaknesses.length > 0 && (
        <div className="rounded-2xl border border-amber-200/50 bg-amber-50/20 p-5 dark:border-amber-800/30 dark:bg-amber-900/10">
          <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400">Geliştirilebilir Alanlar</h3>
          <ul className="mt-3 space-y-1.5">{weaknesses.map((w, i) => (<li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-amber-700/80 dark:text-amber-300/80"><span className="mt-0.5 shrink-0">&#x2022;</span>{w}</li>))}</ul>
        </div>
      )}
    </div>
  );
}
