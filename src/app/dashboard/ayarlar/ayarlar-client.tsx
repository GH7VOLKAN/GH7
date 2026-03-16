"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  updateBrand,
  updateBrandType,
  updateScanSchedule,
  updateNotificationPreferences,
  deleteBrand,
  setDefaultBrand,
  activateTestPlan,
  regenerateApiKey,
  updateWebhookUrl,
} from "@/lib/actions";
import { PlanSelector } from "@/components/payment/plan-selector";
import { CheckoutModal } from "@/components/payment/checkout-modal";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  PaletteIcon,
  BuildingIcon,
  CreditCardIcon,
  BellIcon,
  RadarIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  CheckIcon,
  GlobeIcon,
  ZapIcon,
  ShieldCheckIcon,
  CrownIcon,
  LockIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  XIcon,
  KeyRoundIcon,
  CopyIcon,
  RefreshCwIcon,
  EyeIcon,
  EyeOffIcon,
  ActivityIcon,
  LinkIcon,
} from "lucide-react";

type BrandType = "firma" | "kisisel";

interface BrandItem {
  id: string;
  name: string;
  domain: string;
  sector: string | null;
  type: string;
  isDefault: boolean;
  promptCount: number;
  competitorCount: number;
  lastScanAt: string | null;
}

interface PaymentItem {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  period: string;
  createdAt: string;
}

interface AyarlarClientProps {
  brandId: string;
  brandName: string;
  brandDomain: string;
  brandSector: string;
  brandType: BrandType;
  autoScan: boolean;
  scanInterval: string;
  phone: string;
  smsEnabled: boolean;
  emailScanComplete: boolean;
  emailScoreChange: boolean;
  emailWeeklyReport: boolean;
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  plan: string;
  planLabel: string;
  planEndDate: string | null;
  planStartDate: string | null;
  daysRemaining: number | null;
  isInGracePeriod: boolean;
  isExpired: boolean;
  brands: BrandItem[];
  paymentHistory: PaymentItem[];
  limits: {
    maxPrompts: number;
    maxBrands: number;
    maxCompetitors: number;
    scanFrequency: string;
    smsEnabled: boolean;
  };
  usage: {
    totalPrompts: number;
    totalBrands: number;
    totalCompetitors: number;
  };
  apiKey: string | null;
  webhookUrl: string | null;
}

// ─── Plan comparison data ───
const PLAN_COMPARISON = [
  { feature: "Takip Edilen Soru", free: "5", pro: "50", business: "200", agency: "500" },
  { feature: "Marka", free: "1", pro: "3", business: "10", agency: "50" },
  { feature: "Rakip", free: "—", pro: "10", business: "25", agency: "50" },
  { feature: "Tarama", free: "1 kez", pro: "Haftada 3x", business: "Haftada 3x", agency: "Her gun" },
  { feature: "Rakip Analizi", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Site Kontrolu", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Aksiyon Plani", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Haftalik Gelisim", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Bildirimler", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Gelismis Erisim", free: "—", pro: "—", business: "—", agency: "✓" },
];

const PLAN_PRICES = {
  pro: { monthly: 2495, yearly: 23950 },
  business: { monthly: 7495, yearly: 71950 },
  agency: { monthly: 19995, yearly: 191950 },
};

export function AyarlarClient({
  brandId,
  brandName,
  brandDomain,
  brandSector,
  brandType: initialBrandType,
  autoScan: initialAutoScan,
  scanInterval: initialInterval,
  phone: initialPhone,
  smsEnabled: initialSmsEnabled,
  emailScanComplete: initialEmailScanComplete,
  emailScoreChange: initialEmailScoreChange,
  emailWeeklyReport: initialEmailWeeklyReport,
  userName,
  userEmail,
  avatarUrl,
  plan,
  planLabel,
  planEndDate,
  planStartDate,
  daysRemaining,
  isInGracePeriod,
  isExpired,
  brands,
  paymentHistory,
  limits,
  usage,
  apiKey: initialApiKey,
  webhookUrl: initialWebhookUrl,
}: AyarlarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const { theme, setTheme } = useTheme();

  // General tab state
  const [brandType, setBrandType] = useState<BrandType>(initialBrandType);

  // Brand tab state
  const [name, setName] = useState(brandName);
  const [domain, setDomain] = useState(brandDomain);
  const [sector, setSector] = useState(brandSector);

  // Scan tab state
  const [autoScan, setAutoScan] = useState(initialAutoScan);
  const [scanInterval, setScanInterval] = useState(initialInterval);

  // Notifications tab state
  const [phone, setPhone] = useState(initialPhone);
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled);

  // Integration tab state (agency only)
  const [currentApiKey, setCurrentApiKey] = useState(initialApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [webhookEnabled, setWebhookEnabled] = useState(!!initialWebhookUrl);
  const [emailScanComplete, setEmailScanComplete] = useState(initialEmailScanComplete);
  const [emailScoreChange, setEmailScoreChange] = useState(initialEmailScoreChange);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(initialEmailWeeklyReport);

  // UI state
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [testPlanLoading, setTestPlanLoading] = useState<string | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<string | null>(null);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", domain: "", sector: "", type: "firma" as BrandType });

  const isFree = plan === "free";
  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";

  function showToast(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleCheckout(selectedPlan: string, period: string) {
    try {
      const res = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, period }),
      });
      const data = await res.json();
      if (data.checkoutFormContent) {
        setCheckoutHtml(data.checkoutFormContent);
        setShowPlanSelector(false);
      } else {
        showToast("Ödeme formu oluşturulamadı");
      }
    } catch {
      showToast("Bir hata oluştu");
    }
  }

  async function handleTestActivation(testPlan: string) {
    setTestPlanLoading(testPlan);
    try {
      await activateTestPlan(testPlan);
      showToast(`${testPlan.toUpperCase()} planı aktif edildi! Sayfa yenileniyor...`);
      // Full page reload to ensure all server components re-render with new plan
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
      console.error("[test-plan] error:", err);
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      showToast(`Hata: ${msg}`);
      setTestPlanLoading(null);
    }
  }

  async function handleDeleteBrand(id: string) {
    if (!confirm("Bu markayı silmek istediğinize emin misiniz?")) return;
    setDeletingBrand(id);
    try {
      await deleteBrand(id);
      showToast("Marka silindi");
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setDeletingBrand(null);
    }
  }

  async function handleSetDefault(id: string) {
    startTransition(async () => {
      try {
        await setDefaultBrand(id);
        showToast("Varsayılan marka değiştirildi");
        router.refresh();
      } catch {
        showToast("Hata oluştu");
      }
    });
  }

  async function handleCreateBrand() {
    if (!newBrand.name.trim() || !newBrand.domain.trim()) {
      showToast("Ad ve domain gerekli");
      return;
    }
    startTransition(async () => {
      try {
        const { createBrand } = await import("@/lib/actions");
        await createBrand({
          name: newBrand.name,
          domain: newBrand.domain,
          sector: newBrand.sector,
          type: newBrand.type,
        });
        showToast("Marka oluşturuldu");
        setShowNewBrand(false);
        setNewBrand({ name: "", domain: "", sector: "", type: "firma" });
        router.refresh();
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "Hata oluştu");
      }
    });
  }

  const formattedEndDate = planEndDate
    ? new Date(planEndDate).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedStartDate = planStartDate
    ? new Date(planStartDate).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="px-4 lg:px-6">
      {/* Toast */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-lg">
          {message}
        </div>
      )}

      {/* Payment status feedback */}
      {paymentStatus === "success" && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckIcon className="mr-2 inline size-4" /> Ödeme başarılı! Planınız aktif edildi.
        </div>
      )}
      {paymentStatus === "failed" && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Ödeme başarısız oldu. Lütfen tekrar deneyin.
        </div>
      )}

      {/* Header */}
      <div className="mb-6 rounded-[14px] border border-border bg-card p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Ayarlar
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-[-0.04em]">
          Hesap Ayarları
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="genel" className="space-y-6">
        <TabsList className={`grid w-full ${plan === "agency" ? "grid-cols-6" : "grid-cols-5"} h-auto p-1`}>
          <TabsTrigger value="genel" className="gap-1.5 text-xs sm:text-sm">
            <UserIcon className="size-3.5" />
            <span className="hidden sm:inline">Genel</span>
          </TabsTrigger>
          <TabsTrigger value="markalar" className="gap-1.5 text-xs sm:text-sm">
            <BuildingIcon className="size-3.5" />
            <span className="hidden sm:inline">Markalar</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1.5 text-xs sm:text-sm">
            <CreditCardIcon className="size-3.5" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="bildirimler" className="gap-1.5 text-xs sm:text-sm">
            <BellIcon className="size-3.5" />
            <span className="hidden sm:inline">Bildirimler</span>
          </TabsTrigger>
          <TabsTrigger value="tarama" className="gap-1.5 text-xs sm:text-sm">
            <RadarIcon className="size-3.5" />
            <span className="hidden sm:inline">Tarama</span>
          </TabsTrigger>
          {plan === "agency" && (
            <TabsTrigger value="entegrasyon" className="gap-1.5 text-xs sm:text-sm">
              <KeyRoundIcon className="size-3.5" />
              <span className="hidden sm:inline">Entegrasyon</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* ─── TAB 1: GENEL ─── */}
        <TabsContent value="genel" className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profil</CardTitle>
              <CardDescription>Hesap bilgileriniz ve görünüm tercihleri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar & Info */}
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="size-16 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-xl bg-foreground text-xl font-bold text-background">
                    {initial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{userName || "—"}</p>
                  <p className="truncate text-sm text-muted-foreground">{userEmail || "—"}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {planLabel}
                    </Badge>
                    {!isFree && daysRemaining !== null && (
                      <span className="text-[10px] text-muted-foreground">
                        {daysRemaining} gün kaldı
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Theme */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tema</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Açık", icon: SunIcon },
                    { value: "dark", label: "Koyu", icon: MoonIcon },
                    { value: "system", label: "Sistem", icon: MonitorIcon },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] p-4 transition-all ${
                        theme === value
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <Icon className="size-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Account Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Hesap Türü</label>
                <p className="text-xs text-muted-foreground">
                  Takip tipinizi secin.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        value: "firma" as BrandType,
                        title: "Firma",
                        desc: "Kurumsal marka takibi, rakip analizi, site kontrolu.",
                        icon: BuildingIcon,
                      },
                      {
                        value: "kisisel" as BrandType,
                        title: "Kişisel",
                        desc: "Kişisel tanınırlık, dijital iz takibi, senin yerine kim.",
                        icon: UserIcon,
                      },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setBrandType(option.value);
                          startTransition(async () => {
                            try {
                              await updateBrandType(brandId, option.value);
                              showToast("Hesap türü güncellendi");
                              router.refresh();
                            } catch {
                              showToast("Hata oluştu");
                            }
                          });
                        }}
                        disabled={isPending}
                        className={`flex items-start gap-3 rounded-xl border-[1.5px] p-4 text-left transition-all ${
                          brandType === option.value
                            ? "border-foreground bg-foreground/5"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-bold">{option.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{option.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: MARKALAR ─── */}
        <TabsContent value="markalar" className="space-y-6">
          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Marka Yönetimi</CardTitle>
              <CardDescription>
                Markalarınızı yönetin, yeni marka ekleyin veya varsayılanı değiştirin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {usage.totalBrands} / {limits.maxBrands} Marka
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Planınızda {limits.maxBrands} marka kullanabilirsiniz
                  </p>
                </div>
                <button
                  onClick={() => setShowNewBrand(true)}
                  disabled={usage.totalBrands >= limits.maxBrands}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-bold text-background transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlusIcon className="size-3.5" />
                  Yeni Marka
                </button>
              </div>
              <Progress
                value={(usage.totalBrands / limits.maxBrands) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* New Brand Form */}
          {showNewBrand && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Yeni Marka Ekle</CardTitle>
                  <button onClick={() => setShowNewBrand(false)} className="rounded-lg p-1 hover:bg-muted">
                    <XIcon className="size-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Marka Adı *</label>
                    <input
                      type="text"
                      value={newBrand.name}
                      onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      placeholder="ISITMAX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Domain *</label>
                    <input
                      type="text"
                      value={newBrand.domain}
                      onChange={(e) => setNewBrand({ ...newBrand, domain: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      placeholder="isitmax.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Sektör</label>
                    <input
                      type="text"
                      value={newBrand.sector}
                      onChange={(e) => setNewBrand({ ...newBrand, sector: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                      placeholder="Elektrikli Yerden Isıtma"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tür</label>
                    <select
                      value={newBrand.type}
                      onChange={(e) => setNewBrand({ ...newBrand, type: e.target.value as BrandType })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                    >
                      <option value="firma">Firma</option>
                      <option value="kisisel">Kişisel</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleCreateBrand}
                  disabled={isPending}
                  className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isPending ? "Oluşturuluyor..." : "Marka Oluştur"}
                </button>
              </CardContent>
            </Card>
          )}

          {/* Brand List */}
          <div className="grid gap-4 sm:grid-cols-2">
            {brands.map((b) => (
              <Card key={b.id} className={b.isDefault ? "border-foreground/30" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold">{b.name}</h3>
                        {b.isDefault && (
                          <Badge variant="secondary" className="shrink-0 text-[10px]">
                            <StarIcon className="mr-0.5 size-2.5" /> Varsayılan
                          </Badge>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <GlobeIcon className="size-3" />
                        {b.domain}
                      </p>
                      {b.sector && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{b.sector}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{b.promptCount} prompt</span>
                        <span>{b.competitorCount} rakip</span>
                        {b.lastScanAt && (
                          <span>
                            Son tarama:{" "}
                            {new Date(b.lastScanAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      {!b.isDefault && (
                        <button
                          onClick={() => handleSetDefault(b.id)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Varsayılan yap"
                        >
                          <StarIcon className="size-3.5" />
                        </button>
                      )}
                      {brands.length > 1 && (
                        <button
                          onClick={() => handleDeleteBrand(b.id)}
                          disabled={deletingBrand === b.id}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          title="Sil"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Brand Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktif Marka Bilgileri</CardTitle>
              <CardDescription>
                &quot;{brandName}&quot; markasının temel bilgilerini güncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Marka Adı</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Domain</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sektör</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await updateBrand(brandId, { name, domain, sector });
                      showToast("Marka bilgileri güncellendi");
                    } catch {
                      showToast("Hata oluştu");
                    }
                  });
                }}
                disabled={isPending}
                className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 3: PLAN & FATURALANDIRMA ─── */}
        <TabsContent value="plan" className="space-y-6">
          {/* Current Plan Hero */}
          <Card className={!isFree ? "border-foreground/20 bg-gradient-to-br from-foreground/[0.03] to-transparent" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex size-12 items-center justify-center rounded-xl ${
                    plan === "agency" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    : plan === "business" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : plan === "pro" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {plan === "agency" ? <CrownIcon className="size-6" />
                    : plan === "business" ? <ShieldCheckIcon className="size-6" />
                    : plan === "pro" ? <ZapIcon className="size-6" />
                    : <UserIcon className="size-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">{planLabel}</h2>
                      {isInGracePeriod && (
                        <Badge variant="destructive" className="text-[10px]">Süresi Doldu</Badge>
                      )}
                      {!isFree && !isExpired && (
                        <Badge variant="secondary" className="text-[10px]">Aktif</Badge>
                      )}
                    </div>
                    {formattedStartDate && (
                      <p className="text-xs text-muted-foreground">
                        {formattedStartDate} — {formattedEndDate}
                      </p>
                    )}
                    {daysRemaining !== null && !isExpired && (
                      <p className={`text-xs font-medium ${daysRemaining <= 7 ? "text-red-500" : "text-muted-foreground"}`}>
                        {daysRemaining} gün kaldı
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowPlanSelector(true)}
                  className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02]"
                >
                  {isFree ? "Planı Yükselt" : "Planı Değiştir"}
                </button>
              </div>

              {isInGracePeriod && (
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Planınızın süresi doldu. {daysRemaining} gün içinde yenilenmezse ücretsiz plana düşeceksiniz.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Metrics */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Soru",
                used: usage.totalPrompts,
                max: limits.maxPrompts,
                icon: ZapIcon,
              },
              {
                label: "Marka",
                used: usage.totalBrands,
                max: limits.maxBrands,
                icon: BuildingIcon,
              },
              {
                label: "Rakip",
                used: usage.totalCompetitors,
                max: limits.maxCompetitors,
                icon: UserIcon,
              },
            ].map(({ label, used, max, icon: Icon }) => {
              const percent = max > 0 ? Math.min(100, (used / max) * 100) : 0;
              const isNearLimit = percent >= 80;
              return (
                <Card key={label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className={`text-sm font-bold ${isNearLimit ? "text-amber-600 dark:text-amber-400" : ""}`}>
                        {used}/{max}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className={`mt-2 h-1.5 ${isNearLimit ? "[&>div]:bg-amber-500" : ""}`}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plan Karşılaştırma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4 text-left text-xs font-medium text-muted-foreground">Özellik</th>
                      {(["free", "pro", "business", "agency"] as const).map((p) => (
                        <th
                          key={p}
                          className={`px-3 py-3 text-center text-xs font-medium ${
                            p === plan ? "bg-foreground/5 font-bold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {p === "free" ? "Ücretsiz" : p === "pro" ? "Pro" : p === "business" ? "Business" : "Ajans"}
                          {p === plan && (
                            <Badge variant="secondary" className="ml-1 text-[8px]">Mevcut</Badge>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_COMPARISON.map((row) => (
                      <tr key={row.feature} className="border-b border-border/50">
                        <td className="py-2.5 pr-4 text-xs font-medium">{row.feature}</td>
                        {(["free", "pro", "business", "agency"] as const).map((p) => (
                          <td
                            key={p}
                            className={`px-3 py-2.5 text-center text-xs ${
                              p === plan ? "bg-foreground/5 font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {row[p] === "✓" ? (
                              <CheckIcon className="mx-auto size-4 text-green-500" />
                            ) : row[p] === "—" ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              row[p]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Pricing row */}
                    <tr className="border-t-2 border-border">
                      <td className="py-3 pr-4 text-xs font-bold">Aylık Fiyat</td>
                      <td className="px-3 py-3 text-center text-xs text-muted-foreground">₺0</td>
                      <td className={`px-3 py-3 text-center text-xs font-bold ${plan === "pro" ? "bg-foreground/5" : ""}`}>₺{PLAN_PRICES.pro.monthly}</td>
                      <td className={`px-3 py-3 text-center text-xs font-bold ${plan === "business" ? "bg-foreground/5" : ""}`}>₺{PLAN_PRICES.business.monthly.toLocaleString("tr-TR")}</td>
                      <td className={`px-3 py-3 text-center text-xs font-bold ${plan === "agency" ? "bg-foreground/5" : ""}`}>₺{PLAN_PRICES.agency.monthly.toLocaleString("tr-TR")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Test activation buttons */}
              <Separator className="my-4" />
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Test Amaçlı Plan Değiştir (ödemesiz)
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["pro", "business", "agency"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleTestActivation(p)}
                      disabled={testPlanLoading !== null || plan === p}
                      className={`rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted disabled:opacity-50 ${
                        plan === p ? "bg-foreground/10" : ""
                      }`}
                    >
                      {testPlanLoading === p
                        ? "Aktif ediliyor..."
                        : plan === p
                          ? `${p.charAt(0).toUpperCase() + p.slice(1)} (Mevcut)`
                          : `${p.charAt(0).toUpperCase() + p.slice(1)} Test Et`}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ödeme Geçmişi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="py-2 text-left font-medium">Tarih</th>
                        <th className="py-2 text-left font-medium">Plan</th>
                        <th className="py-2 text-left font-medium">Dönem</th>
                        <th className="py-2 text-right font-medium">Tutar</th>
                        <th className="py-2 text-right font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p) => (
                        <tr key={p.id} className="border-b border-border/50">
                          <td className="py-2 text-xs">
                            {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="py-2 text-xs font-medium capitalize">{p.plan}</td>
                          <td className="py-2 text-xs text-muted-foreground">
                            {p.period === "monthly" ? "Aylık" : "Yıllık"}
                          </td>
                          <td className="py-2 text-right text-xs font-medium">
                            {p.amount.toLocaleString("tr-TR")}₺
                          </td>
                          <td className="py-2 text-right">
                            <Badge
                              variant={p.status === "success" ? "secondary" : "destructive"}
                              className="text-[10px]"
                            >
                              {p.status === "success" ? "Başarılı" : "Başarısız"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── TAB 4: BİLDİRİMLER ─── */}
        <TabsContent value="bildirimler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bildirim Tercihleri</CardTitle>
              <CardDescription>
                Hangi durumlarda size haber verelim, siz seçin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* E-posta bildirimleri */}
              <div className="space-y-4">
                <p className="text-sm font-medium">E-posta Bildirimleri</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Tarama sonuçlarını gönderin</p>
                    <p className="text-xs text-muted-foreground">
                      Her tarama bittiğinde sonuçları e-posta ile alın
                    </p>
                  </div>
                  <Switch
                    checked={emailScanComplete}
                    onCheckedChange={setEmailScanComplete}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Puan değişimlerinde bilgi verin</p>
                    <p className="text-xs text-muted-foreground">
                      Puanınız yükseldiğinde veya düştüğünde haberdar olun
                    </p>
                  </div>
                  <Switch
                    checked={emailScoreChange}
                    onCheckedChange={setEmailScoreChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm">Haftalık raporu gönderin</p>
                      {isFree && (
                        <Badge variant="outline" className="text-[10px]">
                          <LockIcon className="mr-0.5 size-2.5" /> Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Her hafta ilerlemenizi özetleyen bir e-posta alın
                    </p>
                  </div>
                  <Switch
                    checked={emailWeeklyReport}
                    onCheckedChange={setEmailWeeklyReport}
                    disabled={isFree}
                  />
                </div>
              </div>

              <Separator />

              {/* SMS bildirimleri */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">SMS Bildirimleri</p>
                      {isFree && (
                        <Badge variant="outline" className="text-[10px]">
                          <LockIcon className="mr-0.5 size-2.5" /> Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tarama sonuçlarını telefonunuza da gönderin
                    </p>
                  </div>
                  <Switch
                    checked={smsEnabled}
                    onCheckedChange={setSmsEnabled}
                    disabled={isFree}
                  />
                </div>

                {smsEnabled && !isFree && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 5XX XXX XX XX"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <button
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await updateNotificationPreferences({
                        phone,
                        smsEnabled,
                        emailScanComplete,
                        emailScoreChange,
                        emailWeeklyReport,
                      });
                      showToast("Bildirim tercihleri güncellendi");
                    } catch {
                      showToast("Hata oluştu");
                    }
                  });
                }}
                disabled={isPending}
                className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 5: TARAMA ─── */}
        <TabsContent value="tarama" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarama Ayarları</CardTitle>
              <CardDescription>
                Otomatik tarama zamanlamasını yapılandırın.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Otomatik Tarama</p>
                  <p className="text-xs text-muted-foreground">
                    Taramalar belirtilen sıklıkta otomatik çalışır
                  </p>
                </div>
                <Switch
                  checked={autoScan}
                  onCheckedChange={setAutoScan}
                />
              </div>

              {autoScan && (
                <>
                  <Separator />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Tarama Sıklığı
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {[
                        {
                          value: "thrice_weekly",
                          label: "Haftada 3x",
                          desc: "Pzt, Car, Cum taranir",
                          available: true,
                        },
                        {
                          value: "daily",
                          label: "Her gun",
                          desc: "Her gun taranir",
                          available: limits.scanFrequency === "daily",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => opt.available && setScanInterval(opt.value)}
                          disabled={!opt.available}
                          className={`rounded-xl border-[1.5px] p-4 text-left transition-all ${
                            scanInterval === opt.value && opt.available
                              ? "border-foreground bg-foreground/5"
                              : opt.available
                                ? "border-border hover:border-foreground/30"
                                : "cursor-not-allowed border-border opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">{opt.label}</p>
                            {!opt.available && (
                              <Badge variant="outline" className="text-[10px]">
                                <LockIcon className="mr-0.5 size-2.5" /> Ajans
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <button
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await updateScanSchedule(brandId, { autoScan, scanInterval });
                      showToast("Tarama ayarları güncellendi");
                    } catch {
                      showToast("Hata oluştu");
                    }
                  });
                }}
                disabled={isPending}
                className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 6: ENTEGRASYON (Agency only) ─── */}
        {plan === "agency" && (
          <TabsContent value="entegrasyon" className="space-y-6">
            {/* Erişim Anahtarı */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRoundIcon className="size-4" />
                  Erişim Anahtarı
                </CardTitle>
                <CardDescription>
                  GH7 verilerinize programatik erişim sağlayın. Bu anahtarı güvenli bir yerde saklayın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentApiKey ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-2.5 font-mono text-sm">
                        {showApiKey
                          ? currentApiKey
                          : `gh7_${"•".repeat(20)}...${currentApiKey.slice(-4)}`}
                      </div>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={showApiKey ? "Gizle" : "Göster"}
                      >
                        {showApiKey ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentApiKey);
                          showToast("Anahtar panoya kopyalandı");
                        }}
                        className="rounded-lg border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Kopyala"
                      >
                        <CopyIcon className="size-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm("Mevcut anahtar geçersiz olacak. Yeni anahtar oluşturmak istediğinize emin misiniz?")) return;
                        startTransition(async () => {
                          try {
                            const result = await regenerateApiKey(brandId);
                            setCurrentApiKey(result.apiKey);
                            setShowApiKey(true);
                            showToast("Yeni erişim anahtarı oluşturuldu");
                          } catch {
                            showToast("Hata oluştu");
                          }
                        });
                      }}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      <RefreshCwIcon className="size-3.5" />
                      {isPending ? "Oluşturuluyor..." : "Yeniden Oluştur"}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Henüz bir erişim anahtarınız yok. Oluşturmak için aşağıdaki butona tıklayın.
                    </p>
                    <button
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            const result = await regenerateApiKey(brandId);
                            setCurrentApiKey(result.apiKey);
                            setShowApiKey(true);
                            showToast("Erişim anahtarı oluşturuldu");
                          } catch {
                            showToast("Hata oluştu");
                          }
                        });
                      }}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      <KeyRoundIcon className="size-3.5" />
                      {isPending ? "Oluşturuluyor..." : "Erişim Anahtarı Oluştur"}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LinkIcon className="size-4" />
                  Webhook
                </CardTitle>
                <CardDescription>
                  Tarama sonuçlarının otomatik olarak gönderileceği URL&apos;yi belirleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Webhook Bildirimleri</p>
                    <p className="text-xs text-muted-foreground">
                      Tarama tamamlandığında sonuçlar bu adrese POST edilir
                    </p>
                  </div>
                  <Switch
                    checked={webhookEnabled}
                    onCheckedChange={(checked) => {
                      setWebhookEnabled(checked);
                      if (!checked) {
                        startTransition(async () => {
                          try {
                            await updateWebhookUrl(brandId, "");
                            setWebhookUrl("");
                            showToast("Webhook devre dışı bırakıldı");
                          } catch {
                            showToast("Hata oluştu");
                          }
                        });
                      }
                    }}
                  />
                </div>

                {webhookEnabled && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://example.com/webhook/gh7"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:border-foreground focus:outline-none"
                      />
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        URL https:// ile başlamalıdır
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            await updateWebhookUrl(brandId, webhookUrl);
                            showToast("Webhook URL kaydedildi");
                          } catch (err: unknown) {
                            showToast(err instanceof Error ? err.message : "Hata oluştu");
                          }
                        });
                      }}
                      disabled={isPending}
                      className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {isPending ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Kullanım İstatistikleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ActivityIcon className="size-4" />
                  Kullanım İstatistikleri
                </CardTitle>
                <CardDescription>
                  Bu ayki entegrasyon kullanım bilgileriniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs font-medium text-muted-foreground">Aylık İstek Sayısı</p>
                    <p className="mt-1 text-2xl font-bold">0</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Bu ay yapılan toplam istek</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs font-medium text-muted-foreground">Kalan Kota</p>
                    <p className="mt-1 text-2xl font-bold">10.000</p>
                    <Progress value={0} className="mt-2 h-1.5" />
                    <p className="mt-1 text-[10px] text-muted-foreground">Aylık 10.000 istek hakkınız var</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Plan Selector Modal */}
      {showPlanSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl">
            <button
              onClick={() => setShowPlanSelector(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <XIcon className="size-5" />
            </button>
            <PlanSelector
              currentPlan={plan}
              onSelect={(selectedPlan, period) => handleCheckout(selectedPlan, period)}
            />
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutHtml && (
        <CheckoutModal
          html={checkoutHtml}
          onClose={() => setCheckoutHtml(null)}
        />
      )}
    </div>
  );
}
