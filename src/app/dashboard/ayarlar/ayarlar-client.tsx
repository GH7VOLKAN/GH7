"use client";

import { useState, useTransition, useRef } from "react";
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
import { HeroSection } from "@/components/kinde/hero-section";
import {
  FadeIn,
  Stagger,
  AnimBar,
  PageSection,
  SectionTitle,
} from "@/components/kinde/animations";
import {
  UserIcon,
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
  ArrowRightIcon,
  ChevronDownIcon,
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
  { feature: "Tarama", free: "1 kez", pro: "Haftada 3x", business: "Haftada 3x", agency: "Her gün" },
  { feature: "Rakip Analizi", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Site Kontrolü", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Aksiyon Planı", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Haftalık Gelişim", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Bildirimler", free: "—", pro: "✓", business: "✓", agency: "✓" },
  { feature: "Gelişmiş Erişim", free: "—", pro: "—", business: "—", agency: "✓" },
];

const PLAN_PRICES = {
  pro: { monthly: 2495, yearly: 23950 },
  business: { monthly: 7495, yearly: 71950 },
  agency: { monthly: 19995, yearly: 191950 },
};

const NAV_ITEMS = [
  { id: "profil", label: "Profil", icon: UserIcon },
  { id: "markalar", label: "Markalar", icon: BuildingIcon },
  { id: "plan", label: "Plan", icon: CreditCardIcon },
  { id: "bildirimler", label: "Bildirimler", icon: BellIcon },
  { id: "tarama", label: "Tarama", icon: RadarIcon },
];

const NAV_ITEMS_AGENCY = [
  ...NAV_ITEMS,
  { id: "entegrasyon", label: "Entegrasyon", icon: KeyRoundIcon },
];

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

  // General state
  const [brandType, setBrandType] = useState<BrandType>(initialBrandType);
  const [name, setName] = useState(brandName);
  const [domain, setDomain] = useState(brandDomain);
  const [sector, setSector] = useState(brandSector);

  // Scan state
  const [autoScan, setAutoScan] = useState(initialAutoScan);
  const [scanInterval, setScanInterval] = useState(initialInterval);

  // Notification state
  const [phone, setPhone] = useState(initialPhone);
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled);
  const [emailScanComplete, setEmailScanComplete] = useState(initialEmailScanComplete);
  const [emailScoreChange, setEmailScoreChange] = useState(initialEmailScoreChange);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(initialEmailWeeklyReport);

  // Integration state
  const [currentApiKey, setCurrentApiKey] = useState(initialApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [webhookEnabled, setWebhookEnabled] = useState(!!initialWebhookUrl);

  // UI state
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [testPlanLoading, setTestPlanLoading] = useState<string | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<string | null>(null);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", domain: "", sector: "", type: "firma" as BrandType });
  const [activeSection, setActiveSection] = useState("profil");
  const [showPlanTable, setShowPlanTable] = useState(false);

  const isFree = plan === "free";
  const initial = userName?.charAt(0)?.toUpperCase() ?? "?";
  const navItems = plan === "agency" ? NAV_ITEMS_AGENCY : NAV_ITEMS;

  // Section refs for scroll
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function scrollToSection(id: string) {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: unknown) {
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
    ? new Date(planEndDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const formattedStartDate = planStartDate
    ? new Date(planStartDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const planIcon = plan === "agency" ? CrownIcon : plan === "business" ? ShieldCheckIcon : plan === "pro" ? ZapIcon : UserIcon;
  const PlanIcon = planIcon;

  return (
    <div className="flex flex-col gap-0">
      {/* Toast */}
      {message && (
        <div
          className="fixed bottom-6 right-6 z-50"
          style={{
            background: "var(--foreground)",
            color: "var(--background)",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {message}
        </div>
      )}

      {/* Payment feedback */}
      {paymentStatus === "success" && (
        <div
          className="kinde-card"
          style={{ padding: "16px 20px", borderColor: "#22c55e30", background: "#f0fdf4", marginBottom: 12 }}
        >
          <div className="flex items-center gap-2">
            <CheckIcon style={{ width: 16, height: 16, color: "#22c55e" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
              Ödeme başarılı! Planınız aktif edildi.
            </span>
          </div>
        </div>
      )}
      {paymentStatus === "failed" && (
        <div
          className="kinde-card"
          style={{ padding: "16px 20px", borderColor: "#ef444430", background: "#fef2f2", marginBottom: 12 }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#991b1b" }}>
            Ödeme başarısız oldu. Lütfen tekrar deneyin.
          </span>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              referrerPolicy="no-referrer"
              style={{ width: 72, height: 72, borderRadius: 20, objectFit: "cover" }}
            />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "#111",
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
          )}
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-1.5px",
            color: "var(--foreground)",
            lineHeight: 1.1,
          }}
        >
          {userName || "Hesabım"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 8 }}>
          {userEmail}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 100,
              background: isFree ? "#f5f5f5" : "#111",
              color: isFree ? "#666" : "#fff",
            }}
          >
            <PlanIcon style={{ width: 12, height: 12 }} />
            {planLabel}
          </span>
          {!isFree && daysRemaining !== null && !isExpired && (
            <span style={{ fontSize: 11, color: daysRemaining <= 7 ? "#ef4444" : "var(--muted-foreground)" }}>
              {daysRemaining} gün kaldı
            </span>
          )}
          {isInGracePeriod && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 100,
                background: "#fef2f2",
                color: "#ef4444",
              }}
            >
              Süresi doldu
            </span>
          )}
        </div>
      </div>

      {/* ── SECTION NAV (horizontal pills) ────────── */}
      <div style={{ position: "sticky", top: 48, zIndex: 20, background: "var(--background)" }}>
        <div
          className="flex gap-1 overflow-x-auto no-scrollbar"
          style={{ padding: "8px 0 12px", borderBottom: "1px solid #eee" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? "#111" : "transparent",
                  color: isActive ? "#fff" : "var(--muted-foreground)",
                  border: isActive ? "none" : "1px solid #eee",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 1: PROFİL ─────────────────────── */}
      <div ref={(el) => { sectionRefs.current.profil = el; }} style={{ scrollMarginTop: 120 }}>
        <PageSection className="mt-8">
          <SectionTitle title="Profil" subtitle="Görünüm ve hesap türü tercihleri" />

          {/* Theme Picker */}
          <div className="kinde-card p-6" style={{ cursor: "default" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 }}>
              Tema
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Açık", icon: SunIcon },
                { value: "dark", label: "Koyu", icon: MoonIcon },
                { value: "system", label: "Sistem", icon: MonitorIcon },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className="flex flex-col items-center gap-2"
                  style={{
                    padding: "20px 12px",
                    borderRadius: 16,
                    border: theme === value ? "2px solid #111" : "1px solid #eee",
                    background: theme === value ? "#fafafa" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon style={{ width: 22, height: 22, color: theme === value ? "#111" : "#999" }} />
                  <span style={{ fontSize: 12, fontWeight: theme === value ? 700 : 500, color: theme === value ? "#111" : "#999" }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Type */}
          <div className="kinde-card p-6 mt-3" style={{ cursor: "default" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
              Hesap Türü
            </p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4, marginBottom: 16 }}>
              Takip tipinize göre arayüz ve içerik kişiselleştirilir
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "firma" as BrandType, title: "Firma", desc: "Kurumsal marka takibi, rakip analizi, site kontrolü", icon: BuildingIcon },
                { value: "kisisel" as BrandType, title: "Kişisel", desc: "Kişisel tanınırlık, dijital iz takibi", icon: UserIcon },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = brandType === option.value;
                return (
                  <button
                    key={option.value}
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
                    className="flex items-start gap-3 text-left"
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: isSelected ? "2px solid #111" : "1px solid #eee",
                      background: isSelected ? "#fafafa" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isSelected ? "#11111110" : "#f5f5f5",
                      }}
                    >
                      <Icon style={{ width: 18, height: 18, color: isSelected ? "#111" : "#999" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{option.title}</p>
                      <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, lineHeight: 1.4 }}>
                        {option.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </PageSection>
      </div>

      {/* ── SECTION 2: MARKALAR ───────────────────── */}
      <div ref={(el) => { sectionRefs.current.markalar = el; }} style={{ scrollMarginTop: 120 }}>
        <PageSection className="mt-12">
          <SectionTitle title="Markalar" subtitle="Markalarınızı yönetin ve yenilerini ekleyin" />

          {/* Usage bar */}
          <div className="kinde-card p-5" style={{ cursor: "default" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)" }}>
                  {usage.totalBrands}
                </span>
                <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                  {" "}/ {limits.maxBrands} marka
                </span>
              </div>
              <button
                onClick={() => setShowNewBrand(true)}
                disabled={usage.totalBrands >= limits.maxBrands}
                className="flex items-center gap-1.5"
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  background: "#111",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: usage.totalBrands >= limits.maxBrands ? "not-allowed" : "pointer",
                  opacity: usage.totalBrands >= limits.maxBrands ? 0.5 : 1,
                  transition: "transform 0.15s",
                }}
              >
                <PlusIcon style={{ width: 14, height: 14 }} />
                Yeni Marka
              </button>
            </div>
            <AnimBar
              percent={(usage.totalBrands / limits.maxBrands) * 100}
              color="#111"
              height={6}
            />
          </div>

          {/* New Brand Form */}
          {showNewBrand && (
            <FadeIn className="mt-3">
              <div className="kinde-card p-6" style={{ cursor: "default" }}>
                <div className="flex items-center justify-between mb-5">
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Yeni Marka Ekle</p>
                  <button
                    onClick={() => setShowNewBrand(false)}
                    style={{ padding: 6, borderRadius: 8, cursor: "pointer", color: "#999" }}
                  >
                    <XIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField label="Marka Adı *" value={newBrand.name} onChange={(v) => setNewBrand({ ...newBrand, name: v })} placeholder="ISITMAX" />
                  <InputField label="Domain *" value={newBrand.domain} onChange={(v) => setNewBrand({ ...newBrand, domain: v })} placeholder="isitmax.com" />
                  <InputField label="Sektör" value={newBrand.sector} onChange={(v) => setNewBrand({ ...newBrand, sector: v })} placeholder="Elektrikli Yerden Isıtma" />
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Tür
                    </label>
                    <select
                      value={newBrand.type}
                      onChange={(e) => setNewBrand({ ...newBrand, type: e.target.value as BrandType })}
                      style={{
                        width: "100%",
                        marginTop: 6,
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid #eee",
                        background: "var(--background)",
                        fontSize: 13,
                        color: "var(--foreground)",
                        outline: "none",
                      }}
                    >
                      <option value="firma">Firma</option>
                      <option value="kisisel">Kişisel</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleCreateBrand}
                  disabled={isPending}
                  style={{
                    marginTop: 20,
                    padding: "10px 28px",
                    borderRadius: 100,
                    background: "#111",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: isPending ? 0.5 : 1,
                    transition: "transform 0.15s",
                  }}
                >
                  {isPending ? "Oluşturuluyor..." : "Marka Oluştur"}
                </button>
              </div>
            </FadeIn>
          )}

          {/* Brand Cards */}
          <Stagger className="grid gap-3 sm:grid-cols-2 mt-3" staggerMs={80}>
            {brands.map((b) => (
              <div
                key={b.id}
                className="kinde-card p-5"
                style={{
                  cursor: "default",
                  borderColor: b.isDefault ? "#11111130" : undefined,
                  borderWidth: b.isDefault ? 2 : 1,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{b.name}</p>
                      {b.isDefault && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 100,
                            background: "#f5f5f5",
                            color: "#666",
                          }}
                        >
                          <StarIcon style={{ width: 10, height: 10 }} /> Varsayılan
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                      <GlobeIcon style={{ width: 12, height: 12 }} />
                      {b.domain}
                    </p>
                    {b.sector && (
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{b.sector}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      <span>{b.promptCount} soru</span>
                      <span>{b.competitorCount} rakip</span>
                      {b.lastScanAt && (
                        <span>
                          Son: {new Date(b.lastScanAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!b.isDefault && (
                      <IconButton onClick={() => handleSetDefault(b.id)} disabled={isPending} title="Varsayılan yap">
                        <StarIcon style={{ width: 14, height: 14 }} />
                      </IconButton>
                    )}
                    {brands.length > 1 && (
                      <IconButton onClick={() => handleDeleteBrand(b.id)} disabled={deletingBrand === b.id} title="Sil" danger>
                        <TrashIcon style={{ width: 14, height: 14 }} />
                      </IconButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Stagger>

          {/* Active Brand Edit */}
          <div className="kinde-card p-6 mt-3" style={{ cursor: "default" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
              Aktif Marka Bilgileri
            </p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4, marginBottom: 16 }}>
              &quot;{brandName}&quot; markasının temel bilgilerini güncelleyin
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Marka Adı" value={name} onChange={setName} />
              <InputField label="Domain" value={domain} onChange={setDomain} />
            </div>
            <div className="mt-4">
              <InputField label="Sektör" value={sector} onChange={setSector} />
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
              style={{
                marginTop: 20,
                padding: "10px 28px",
                borderRadius: 100,
                background: "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </PageSection>
      </div>

      {/* ── SECTION 3: PLAN & FATURALANDIRMA ──────── */}
      <div ref={(el) => { sectionRefs.current.plan = el; }} style={{ scrollMarginTop: 120 }}>
        <PageSection className="mt-12">
          <SectionTitle title="Plan & Faturalandırma" subtitle="Abonelik yönetimi ve kullanım limitleri" />

          {/* Current Plan Card */}
          <div
            className="kinde-card p-6"
            style={{
              cursor: "default",
              borderColor: !isFree ? "#11111120" : undefined,
              background: !isFree ? "linear-gradient(135deg, #fafafa 0%, #fff 100%)" : undefined,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: plan === "agency" ? "#fef3c7" : plan === "business" ? "#f3e8ff" : plan === "pro" ? "#dbeafe" : "#f5f5f5",
                  }}
                >
                  <PlanIcon
                    style={{
                      width: 24,
                      height: 24,
                      color: plan === "agency" ? "#b45309" : plan === "business" ? "#7c3aed" : plan === "pro" ? "#2563eb" : "#999",
                    }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>
                    {planLabel}
                  </p>
                  {formattedStartDate && (
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                      {formattedStartDate} — {formattedEndDate}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowPlanSelector(true)}
                className="flex items-center gap-2"
                style={{
                  padding: "10px 24px",
                  borderRadius: 100,
                  background: "#111",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "transform 0.15s",
                }}
              >
                {isFree ? "Planı Yükselt" : "Planı Değiştir"}
                <ArrowRightIcon style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {isInGracePeriod && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "#fefce8",
                  border: "1px solid #fde68a",
                  fontSize: 12,
                  color: "#92400e",
                }}
              >
                Planınızın süresi doldu. {daysRemaining} gün içinde yenilenmezse ücretsiz plana düşeceksiniz.
              </div>
            )}
          </div>

          {/* Usage Metrics — 3 cards */}
          <Stagger className="grid grid-cols-3 gap-3 mt-3" staggerMs={80}>
            {[
              { label: "Soru", used: usage.totalPrompts, max: limits.maxPrompts, icon: ZapIcon },
              { label: "Marka", used: usage.totalBrands, max: limits.maxBrands, icon: BuildingIcon },
              { label: "Rakip", used: usage.totalCompetitors, max: limits.maxCompetitors, icon: UserIcon },
            ].map(({ label, used, max, icon: Icon }) => {
              const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
              const isNear = pct >= 80;
              return (
                <div key={label} className="kinde-card p-4" style={{ cursor: "default" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon style={{ width: 14, height: 14, color: "var(--muted-foreground)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                      {label}
                    </span>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: isNear ? "#f59e0b" : "var(--foreground)" }}>
                    {used}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)" }}>/{max}</span>
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <AnimBar percent={pct} color={isNear ? "#f59e0b" : "#111"} height={4} />
                  </div>
                </div>
              );
            })}
          </Stagger>

          {/* Plan Comparison (collapsible) */}
          <div className="kinde-card mt-3 overflow-hidden" style={{ cursor: "default" }}>
            <button
              onClick={() => setShowPlanTable(!showPlanTable)}
              className="flex items-center justify-between w-full p-5"
              style={{ cursor: "pointer" }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>
                Plan Karşılaştırma
              </p>
              <ChevronDownIcon
                style={{
                  width: 18,
                  height: 18,
                  color: "var(--muted-foreground)",
                  transform: showPlanTable ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.3s ease",
                }}
              />
            </button>
            <div
              style={{
                maxHeight: showPlanTable ? 800 : 0,
                overflow: "hidden",
                transition: "max-height 0.4s ease",
              }}
            >
              <div style={{ padding: "0 20px 20px", overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <th style={{ padding: "10px 8px 10px 0", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)" }}>
                        Özellik
                      </th>
                      {(["free", "pro", "business", "agency"] as const).map((p) => (
                        <th
                          key={p}
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: p === plan ? 800 : 600,
                            color: p === plan ? "var(--foreground)" : "var(--muted-foreground)",
                            background: p === plan ? "#fafafa" : "transparent",
                            borderRadius: p === plan ? "8px 8px 0 0" : undefined,
                          }}
                        >
                          {p === "free" ? "Ücretsiz" : p === "pro" ? "Pro" : p === "business" ? "Business" : "Ajans"}
                          {p === plan && (
                            <span
                              style={{
                                display: "block",
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#22c55e",
                                marginTop: 2,
                              }}
                            >
                              Mevcut
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_COMPARISON.map((row) => (
                      <tr key={row.feature} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "8px 8px 8px 0", fontWeight: 500, color: "var(--foreground)" }}>
                          {row.feature}
                        </td>
                        {(["free", "pro", "business", "agency"] as const).map((p) => (
                          <td
                            key={p}
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              fontWeight: p === plan ? 600 : 400,
                              color: p === plan ? "var(--foreground)" : "var(--muted-foreground)",
                              background: p === plan ? "#fafafa" : "transparent",
                            }}
                          >
                            {row[p] === "✓" ? (
                              <CheckIcon style={{ width: 14, height: 14, color: "#22c55e", margin: "0 auto" }} />
                            ) : row[p] === "—" ? (
                              <span style={{ opacity: 0.3 }}>—</span>
                            ) : (
                              row[p]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Pricing row */}
                    <tr style={{ borderTop: "2px solid #eee" }}>
                      <td style={{ padding: "10px 8px 10px 0", fontWeight: 700, color: "var(--foreground)" }}>
                        Aylık
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--muted-foreground)" }}>₺0</td>
                      {(["pro", "business", "agency"] as const).map((p) => (
                        <td
                          key={p}
                          style={{
                            padding: "10px 8px",
                            textAlign: "center",
                            fontWeight: 700,
                            color: p === plan ? "var(--foreground)" : "var(--muted-foreground)",
                            background: p === plan ? "#fafafa" : "transparent",
                          }}
                        >
                          ₺{PLAN_PRICES[p].monthly.toLocaleString("tr-TR")}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Test activation */}
          <div className="kinde-card p-5 mt-3" style={{ cursor: "default" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 12 }}>
              Test Amaçlı Plan Değiştir (ödemesiz)
            </p>
            <div className="flex flex-wrap gap-2">
              {(["pro", "business", "agency"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleTestActivation(p)}
                  disabled={testPlanLoading !== null || plan === p}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 100,
                    border: plan === p ? "2px solid #111" : "1px solid #eee",
                    background: plan === p ? "#fafafa" : "transparent",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground)",
                    cursor: plan === p ? "default" : "pointer",
                    opacity: testPlanLoading !== null ? 0.5 : 1,
                  }}
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

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div className="kinde-card p-5 mt-3" style={{ cursor: "default" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 }}>
                Ödeme Geçmişi
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee" }}>
                      <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)" }}>Tarih</th>
                      <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)" }}>Plan</th>
                      <th style={{ padding: "8px 0", textAlign: "left", fontWeight: 600, color: "var(--muted-foreground)" }}>Dönem</th>
                      <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: "var(--muted-foreground)" }}>Tutar</th>
                      <th style={{ padding: "8px 0", textAlign: "right", fontWeight: 600, color: "var(--muted-foreground)" }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 0" }}>
                          {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td style={{ padding: "10px 0", fontWeight: 600, textTransform: "capitalize" }}>
                          {p.plan}
                        </td>
                        <td style={{ padding: "10px 0", color: "var(--muted-foreground)" }}>
                          {p.period === "monthly" ? "Aylık" : "Yıllık"}
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 600 }}>
                          {p.amount.toLocaleString("tr-TR")}₺
                        </td>
                        <td style={{ padding: "10px 0", textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 100,
                              background: p.status === "success" ? "#f0fdf4" : "#fef2f2",
                              color: p.status === "success" ? "#166534" : "#991b1b",
                            }}
                          >
                            {p.status === "success" ? "Başarılı" : "Başarısız"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </PageSection>
      </div>

      {/* ── SECTION 4: BİLDİRİMLER ───────────────── */}
      <div ref={(el) => { sectionRefs.current.bildirimler = el; }} style={{ scrollMarginTop: 120 }}>
        <PageSection className="mt-12">
          <SectionTitle title="Bildirimler" subtitle="Hangi durumlarda size haber verelim, siz seçin" />

          <div className="kinde-card p-6" style={{ cursor: "default" }}>
            {/* Email notifications */}
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", marginBottom: 16 }}>
              E-posta Bildirimleri
            </p>

            <ToggleRow
              title="Tarama sonuçlarını gönderin"
              desc="Her tarama bittiğinde sonuçları e-posta ile alın"
              checked={emailScanComplete}
              onChange={setEmailScanComplete}
            />
            <ToggleRow
              title="Puan değişimlerinde bilgi verin"
              desc="Puanınız yükseldiğinde veya düştüğünde haberdar olun"
              checked={emailScoreChange}
              onChange={setEmailScoreChange}
            />
            <ToggleRow
              title="Haftalık raporu gönderin"
              desc="Her hafta ilerlemenizi özetleyen bir e-posta alın"
              checked={emailWeeklyReport}
              onChange={setEmailWeeklyReport}
              locked={isFree}
              lockedLabel="Pro"
            />

            <div style={{ height: 1, background: "#eee", margin: "20px 0" }} />

            {/* SMS */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>SMS Bildirimleri</p>
                  {isFree && <LockedBadge label="Pro" />}
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                  Tarama sonuçlarını telefonunuza da gönderin
                </p>
              </div>
              <ToggleSwitch checked={smsEnabled} onChange={setSmsEnabled} disabled={isFree} />
            </div>

            {smsEnabled && !isFree && (
              <div style={{ marginTop: 12 }}>
                <InputField label="Telefon Numarası" value={phone} onChange={setPhone} placeholder="+90 5XX XXX XX XX" />
              </div>
            )}

            <div style={{ height: 1, background: "#eee", margin: "20px 0" }} />

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
              style={{
                padding: "10px 28px",
                borderRadius: 100,
                background: "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </PageSection>
      </div>

      {/* ── SECTION 5: TARAMA AYARLARI ────────────── */}
      <div ref={(el) => { sectionRefs.current.tarama = el; }} style={{ scrollMarginTop: 120 }}>
        <PageSection className="mt-12">
          <SectionTitle title="Tarama Ayarları" subtitle="Otomatik tarama zamanlamasını yapılandırın" />

          <div className="kinde-card p-6" style={{ cursor: "default" }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Otomatik Tarama</p>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
                  Taramalar belirtilen sıklıkta otomatik çalışır
                </p>
              </div>
              <ToggleSwitch checked={autoScan} onChange={setAutoScan} />
            </div>

            {autoScan && (
              <>
                <div style={{ height: 1, background: "#eee", margin: "20px 0" }} />
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                  Tarama Sıklığı
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "thrice_weekly", label: "Haftada 3x", desc: "Pzt, Çar, Cum taranır", available: true },
                    { value: "daily", label: "Her gün", desc: "Her gün taranır", available: limits.scanFrequency === "daily" },
                  ].map((opt) => {
                    const isSelected = scanInterval === opt.value && opt.available;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => opt.available && setScanInterval(opt.value)}
                        disabled={!opt.available}
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          border: isSelected ? "2px solid #111" : "1px solid #eee",
                          background: isSelected ? "#fafafa" : "transparent",
                          textAlign: "left",
                          cursor: opt.available ? "pointer" : "not-allowed",
                          opacity: opt.available ? 1 : 0.5,
                          transition: "all 0.2s",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{opt.label}</p>
                          {!opt.available && <LockedBadge label="Ajans" />}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ height: 1, background: "#eee", margin: "20px 0" }} />

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
              style={{
                padding: "10px 28px",
                borderRadius: 100,
                background: "#111",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </PageSection>
      </div>

      {/* ── SECTION 6: ENTEGRASYON (Agency only) ──── */}
      {plan === "agency" && (
        <div ref={(el) => { sectionRefs.current.entegrasyon = el; }} style={{ scrollMarginTop: 120 }}>
          <PageSection className="mt-12">
            <SectionTitle title="Entegrasyon" subtitle="API erişimi ve webhook yapılandırması" />

            {/* API Key */}
            <div className="kinde-card p-6" style={{ cursor: "default" }}>
              <div className="flex items-center gap-2 mb-1">
                <KeyRoundIcon style={{ width: 16, height: 16, color: "var(--foreground)" }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Erişim Anahtarı</p>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>
                GH7 verilerinize programatik erişim sağlayın
              </p>

              {currentApiKey ? (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 min-w-0"
                      style={{
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: "#f5f5f5",
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "var(--foreground)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {showApiKey ? currentApiKey : `gh7_${"•".repeat(20)}...${currentApiKey.slice(-4)}`}
                    </div>
                    <IconButton onClick={() => setShowApiKey(!showApiKey)} title={showApiKey ? "Gizle" : "Göster"}>
                      {showApiKey ? <EyeOffIcon style={{ width: 14, height: 14 }} /> : <EyeIcon style={{ width: 14, height: 14 }} />}
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        navigator.clipboard.writeText(currentApiKey);
                        showToast("Anahtar panoya kopyalandı");
                      }}
                      title="Kopyala"
                    >
                      <CopyIcon style={{ width: 14, height: 14 }} />
                    </IconButton>
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
                    className="flex items-center gap-1.5 mt-4"
                    style={{
                      padding: "7px 16px",
                      borderRadius: 100,
                      border: "1px solid #eee",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--muted-foreground)",
                      cursor: "pointer",
                    }}
                  >
                    <RefreshCwIcon style={{ width: 12, height: 12 }} />
                    {isPending ? "Oluşturuluyor..." : "Yeniden Oluştur"}
                  </button>
                </>
              ) : (
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
                  className="flex items-center gap-2"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 100,
                    background: "#111",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  <KeyRoundIcon style={{ width: 14, height: 14 }} />
                  {isPending ? "Oluşturuluyor..." : "Erişim Anahtarı Oluştur"}
                </button>
              )}
            </div>

            {/* Webhook */}
            <div className="kinde-card p-6 mt-3" style={{ cursor: "default" }}>
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon style={{ width: 16, height: 16, color: "var(--foreground)" }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Webhook</p>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>
                Tarama sonuçlarının otomatik olarak gönderileceği URL
              </p>

              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Webhook Bildirimleri</p>
                <ToggleSwitch
                  checked={webhookEnabled}
                  onChange={(checked) => {
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
                  <InputField
                    label="Webhook URL"
                    value={webhookUrl}
                    onChange={setWebhookUrl}
                    placeholder="https://example.com/webhook/gh7"
                    mono
                  />
                  <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 4 }}>
                    URL https:// ile başlamalıdır
                  </p>
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
                    style={{
                      marginTop: 16,
                      padding: "10px 28px",
                      borderRadius: 100,
                      background: "#111",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity: isPending ? 0.5 : 1,
                    }}
                  >
                    {isPending ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </>
              )}
            </div>

            {/* Usage Stats */}
            <Stagger className="grid gap-3 sm:grid-cols-2 mt-3" staggerMs={80}>
              <div className="kinde-card p-5" style={{ cursor: "default" }}>
                <div className="flex items-center gap-2 mb-2">
                  <ActivityIcon style={{ width: 14, height: 14, color: "var(--muted-foreground)" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                    Aylık İstek
                  </span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>0</p>
                <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>Bu ay yapılan toplam istek</p>
              </div>
              <div className="kinde-card p-5" style={{ cursor: "default" }}>
                <div className="flex items-center gap-2 mb-2">
                  <ZapIcon style={{ width: 14, height: 14, color: "var(--muted-foreground)" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                    Kalan Kota
                  </span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--foreground)" }}>10.000</p>
                <AnimBar percent={0} color="#111" height={4} />
                <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 8 }}>Aylık 10.000 istek hakkınız var</p>
              </div>
            </Stagger>
          </PageSection>
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 40 }} />

      {/* ── Plan Selector Modal ──────────────────── */}
      {showPlanSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{
              maxHeight: "90vh",
              width: "100%",
              maxWidth: 900,
              overflowY: "auto",
              borderRadius: 24,
              background: "var(--background)",
              padding: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            }}
          >
            <button
              onClick={() => setShowPlanSelector(false)}
              style={{
                position: "absolute",
                right: 16,
                top: 16,
                padding: 8,
                borderRadius: 10,
                cursor: "pointer",
                color: "var(--muted-foreground)",
              }}
            >
              <XIcon style={{ width: 20, height: 20 }} />
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

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ── Reusable sub-components ─────────────────────── */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          marginTop: 6,
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #eee",
          background: "var(--background)",
          fontSize: 13,
          fontFamily: mono ? "monospace" : "inherit",
          color: "var(--foreground)",
          outline: "none",
        }}
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? "#111" : "#e5e5e5",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.2s",
        flexShrink: 0,
        border: "none",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          background: "#fff",
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
  locked,
  lockedLabel,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
  lockedLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "12px 0" }}>
      <div>
        <div className="flex items-center gap-2">
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{title}</p>
          {locked && lockedLabel && <LockedBadge label={lockedLabel} />}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{desc}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={locked} />
    </div>
  );
}

function LockedBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 100,
        border: "1px solid #eee",
        color: "var(--muted-foreground)",
      }}
    >
      <LockIcon style={{ width: 9, height: 9 }} /> {label}
    </span>
  );
}

function IconButton({
  onClick,
  disabled,
  title,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: 8,
        borderRadius: 10,
        border: "1px solid #eee",
        background: "transparent",
        color: danger ? "#ef4444" : "var(--muted-foreground)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
