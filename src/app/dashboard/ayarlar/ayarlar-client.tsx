"use client";

import { useState, useTransition, useRef, useCallback } from "react";
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
  addCompetitor,
  removeCompetitor,
} from "@/lib/actions";
import { PlanSelector } from "@/components/payment/plan-selector";
import { CheckoutModal } from "@/components/payment/checkout-modal";
import { FadeIn, PageSection, SectionTitle } from "@/components/kinde/animations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  UserIcon,
  BuildingIcon,
  CreditCardIcon,
  BellIcon,
  CameraIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  GlobeIcon,
  ZapIcon,
  ShieldCheckIcon,
  CrownIcon,
  XIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
  Loader2Icon,
  SaveIcon,
  MailIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  RadarIcon,
  KeyRoundIcon,
  CopyIcon,
  RefreshCwIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  StarIcon,
  ActivityIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────

type BrandType = "firma" | "kisisel";

interface CompetitorItem {
  id: string;
  name: string;
  domain: string;
}

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
  brandCity: string;
  brandType: BrandType;
  businessCategories: string[];
  serviceRegions: string[];
  competitors: CompetitorItem[];
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

// ─── Plan badge colors ──────────────────────────────────

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof UserIcon }> = {
  free: { label: "FREE", color: "text-muted-foreground", bg: "bg-muted", icon: UserIcon },
  pro: { label: "PRO", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950", icon: ZapIcon },
  business: { label: "BUSINESS", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-950", icon: ShieldCheckIcon },
  agency: { label: "AGENCY", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950", icon: CrownIcon },
};

// ─── Section nav items ──────────────────────────────────

const NAV_ITEMS = [
  { id: "profil", label: "Profil", icon: UserIcon },
  { id: "marka", label: "Marka Bilgileri", icon: BuildingIcon },
  { id: "rakipler", label: "Rakipler", icon: RadarIcon },
  { id: "hesap", label: "Hesap", icon: CreditCardIcon },
  { id: "tehlike", label: "Tehlikeli B\u00F6lge", icon: AlertTriangleIcon },
];

// ─── Tag/Chip input component ───────────────────────────

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  disabled,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const tag = input.trim().replace(/,/g, "");
      if (tag && !tags.includes(tag)) {
        onAdd(tag);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-transparent p-2 min-h-[42px] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5 transition-colors"
            >
              <XIcon className="size-3" />
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function AyarlarClient({
  brandId,
  brandName,
  brandDomain,
  brandSector,
  brandCity,
  brandType: initialBrandType,
  businessCategories: initialCategories,
  serviceRegions: initialRegions,
  competitors: initialCompetitors,
  autoScan: initialAutoScan,
  scanInterval: initialInterval,
  phone: initialPhone,
  smsEnabled: initialSmsEnabled,
  emailScanComplete: initialEmailScanComplete,
  emailScoreChange: initialEmailScoreChange,
  emailWeeklyReport: initialEmailWeeklyReport,
  userName,
  userEmail,
  avatarUrl: initialAvatarUrl,
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

  // ── Brand info state ──
  const [name, setName] = useState(brandName);
  const [domain, setDomain] = useState(brandDomain);
  const [sector, setSector] = useState(brandSector);
  const [city, setCity] = useState(brandCity);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [regions, setRegions] = useState<string[]>(initialRegions);

  // ── Competitor state ──
  const [competitors, setCompetitors] = useState<CompetitorItem[]>(initialCompetitors);
  const [newCompName, setNewCompName] = useState("");
  const [newCompDomain, setNewCompDomain] = useState("");

  // ── Notification state ──
  const [phone, setPhone] = useState(initialPhone);
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled);
  const [emailScanComplete, setEmailScanComplete] = useState(initialEmailScanComplete);
  const [emailScoreChange, setEmailScoreChange] = useState(initialEmailScoreChange);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(initialEmailWeeklyReport);

  // ── Avatar state ──
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Integration state ──
  const [currentApiKey, setCurrentApiKey] = useState(initialApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");

  // ── UI state ──
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeSection, setActiveSection] = useState("profil");
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // ── Derived ──
  const isFree = plan === "free";
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const PlanIcon = planConfig.icon;
  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "?";

  // Section refs
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function scrollToSection(id: string) {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showToast(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  const formattedEndDate = planEndDate
    ? new Date(planEndDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // ── Avatar upload handler ──
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("L\u00FCtfen bir resim dosyas\u0131 se\u00E7in", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Dosya boyutu 5MB'dan k\u00FC\u00E7\u00FCk olmal\u0131", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Y\u00FCkleme ba\u015Far\u0131s\u0131z");
      }

      const data = await res.json();
      setAvatarUrl(data.avatarUrl);
      showToast("Profil foto\u011Fraf\u0131 g\u00FCncellendi");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Hata olu\u015Ftu", "error");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  // ── Brand save handler ──
  async function handleSaveBrand() {
    setSavingBrand(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          name: name.trim(),
          domain: domain.trim(),
          sector: sector.trim(),
          city: city.trim(),
          businessCategories: categories,
          serviceRegions: regions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "G\u00FCncelleme ba\u015Far\u0131s\u0131z");
      }

      showToast("Marka bilgileri g\u00FCncellendi");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Hata olu\u015Ftu", "error");
    } finally {
      setSavingBrand(false);
    }
  }

  // ── Notification save handler ──
  async function handleSaveNotifications() {
    setSavingNotifications(true);
    try {
      await updateNotificationPreferences({
        phone,
        smsEnabled,
        emailScanComplete,
        emailScoreChange,
        emailWeeklyReport,
      });
      showToast("Bildirim tercihleri g\u00FCncellendi");
    } catch {
      showToast("Hata olu\u015Ftu", "error");
    } finally {
      setSavingNotifications(false);
    }
  }

  // ── Competitor handlers ──
  async function handleAddCompetitor() {
    if (!newCompName.trim()) {
      showToast("Rakip ad\u0131 gerekli", "error");
      return;
    }
    if (competitors.length >= 10) {
      showToast("En fazla 10 rakip ekleyebilirsiniz", "error");
      return;
    }

    setAddingCompetitor(true);
    try {
      await addCompetitor(brandId, {
        name: newCompName.trim(),
        domain: newCompDomain.trim(),
      });
      setCompetitors((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newCompName.trim(), domain: newCompDomain.trim() },
      ]);
      setNewCompName("");
      setNewCompDomain("");
      showToast("Rakip eklendi");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Hata olu\u015Ftu", "error");
    } finally {
      setAddingCompetitor(false);
    }
  }

  async function handleRemoveCompetitor(id: string) {
    try {
      await removeCompetitor(brandId, id);
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
      showToast("Rakip kald\u0131r\u0131ld\u0131");
      router.refresh();
    } catch {
      showToast("Hata olu\u015Ftu", "error");
    }
  }

  // ── Checkout handler ──
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
        showToast("\u00D6deme formu olu\u015Fturulamad\u0131", "error");
      }
    } catch {
      showToast("Bir hata olu\u015Ftu", "error");
    }
  }

  // ── Delete account (placeholder) ──
  async function handleDeleteAccount() {
    setDeletingAccount(true);
    try {
      // TODO: Implement actual account deletion API
      showToast("Hesap silme i\u015Flemi hen\u00FCz aktif de\u011Fil", "error");
    } finally {
      setDeletingAccount(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-0 pb-12">
      {/* ── Toast ── */}
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300 ${
            message.type === "error"
              ? "bg-destructive text-destructive-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="size-4" />
          ) : (
            <AlertTriangleIcon className="size-4" />
          )}
          {message.text}
        </div>
      )}

      {/* ── Payment feedback ── */}
      {paymentStatus === "success" && (
        <Card className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="flex items-center gap-2">
            <CheckIcon className="size-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              \u00D6deme ba\u015Far\u0131l\u0131! Plan\u0131n\u0131z aktif edildi.
            </span>
          </CardContent>
        </Card>
      )}
      {paymentStatus === "failed" && (
        <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent>
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">
              \u00D6deme ba\u015Far\u0131s\u0131z oldu. L\u00FCtfen tekrar deneyin.
            </span>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 1: PROFILE HEADER
          ═══════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center py-10 gap-4">
        {/* Avatar with upload */}
        <div className="relative group">
          <div className="size-24 rounded-2xl overflow-hidden ring-2 ring-border/50 shadow-md">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center bg-gradient-to-br from-foreground/90 to-foreground text-background text-2xl font-bold">
                {initials}
              </div>
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {uploadingAvatar ? (
              <Loader2Icon className="size-5 text-white animate-spin" />
            ) : (
              <CameraIcon className="size-5 text-white" />
            )}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Name & Email */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {userName || "Hesab\u0131m"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
            <MailIcon className="size-3.5" />
            {userEmail}
          </p>
        </div>

        {/* Plan badge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`${planConfig.bg} ${planConfig.color} gap-1 px-3 py-1 text-xs font-bold`}
          >
            <PlanIcon className="size-3" />
            {planConfig.label}
          </Badge>
          {!isFree && daysRemaining !== null && !isExpired && (
            <span className={`text-xs ${daysRemaining <= 7 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
              {daysRemaining} g\u00FCn kald\u0131
            </span>
          )}
          {isInGracePeriod && (
            <Badge variant="destructive" className="text-xs">
              S\u00FCresi doldu
            </Badge>
          )}
        </div>
      </div>

      {/* ── Section Nav (sticky pills) ── */}
      <div className="sticky top-12 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: BRAND INFORMATION
          ═══════════════════════════════════════════════════ */}
      <div ref={(el) => { sectionRefs.current.profil = el; }} className="scroll-mt-28" />
      <div ref={(el) => { sectionRefs.current.marka = el; }} className="scroll-mt-28">
        <PageSection className="mt-8">
          <SectionTitle title="Marka Bilgileri" subtitle="Firman\u0131z\u0131n temel bilgilerini g\u00FCncelleyin" />

          <Card>
            <CardContent className="space-y-5 pt-2">
              {/* Firma Adi */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-name" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Firma Ad\u0131
                </Label>
                <Input
                  id="brand-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Firma ad\u0131n\u0131z"
                />
              </div>

              {/* Domain */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-domain" className="text-xs text-muted-foreground uppercase tracking-wider">
                  Domain
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="brand-domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="ornek.com"
                    className="flex-1"
                  />
                  {domain && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(`https://${domain.replace(/^https?:\/\//, "")}`, "_blank")}
                    >
                      <ExternalLinkIcon className="size-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Sector & City row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="brand-sector" className="text-xs text-muted-foreground uppercase tracking-wider">
                    Sekt\u00F6r
                  </Label>
                  <Input
                    id="brand-sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="\u00D6rn: Teknoloji, Sa\u011Fl\u0131k"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand-city" className="text-xs text-muted-foreground uppercase tracking-wider">
                    \u015Eehir
                  </Label>
                  <Input
                    id="brand-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="\u00D6rn: \u0130stanbul"
                  />
                </div>
              </div>

              {/* Faaliyet Alanlari */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Faaliyet Alanlar\u0131
                </Label>
                <TagInput
                  tags={categories}
                  onAdd={(tag) => setCategories((prev) => [...prev, tag])}
                  onRemove={(tag) => setCategories((prev) => prev.filter((t) => t !== tag))}
                  placeholder="Eklemek i\u00E7in yaz\u0131p Enter'a bas\u0131n"
                />
              </div>

              {/* Hizmet Bolgeleri */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Hizmet B\u00F6lgeleri
                </Label>
                <TagInput
                  tags={regions}
                  onAdd={(tag) => setRegions((prev) => [...prev, tag])}
                  onRemove={(tag) => setRegions((prev) => prev.filter((t) => t !== tag))}
                  placeholder="Eklemek i\u00E7in yaz\u0131p Enter'a bas\u0131n"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={handleSaveBrand}
                disabled={savingBrand}
                className="gap-1.5"
              >
                {savingBrand ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                Kaydet
              </Button>
            </CardFooter>
          </Card>
        </PageSection>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: COMPETITORS MANAGEMENT
          ═══════════════════════════════════════════════════ */}
      <div ref={(el) => { sectionRefs.current.rakipler = el; }} className="scroll-mt-28">
        <PageSection className="mt-8">
          <SectionTitle
            title="Rakipler"
            subtitle={`Rakiplerinizi y\u00F6netin (${competitors.length}/10)`}
          />

          <Card>
            <CardContent className="space-y-3 pt-2">
              {/* Competitor list */}
              {competitors.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Hen\u00FCz rakip eklenmemi\u015F
                </p>
              )}
              {competitors.slice(0, 10).map((comp) => (
                <div
                  key={comp.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {comp.name}
                    </p>
                    {comp.domain && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <GlobeIcon className="size-3 shrink-0" />
                        {comp.domain}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveCompetitor(comp.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}

              {/* Add competitor form */}
              {competitors.length < 10 && (
                <>
                  <Separator className="my-2" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newCompName}
                      onChange={(e) => setNewCompName(e.target.value)}
                      placeholder="Rakip ad\u0131"
                      className="flex-1"
                    />
                    <Input
                      value={newCompDomain}
                      onChange={(e) => setNewCompDomain(e.target.value)}
                      placeholder="domain.com"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddCompetitor}
                      disabled={addingCompetitor || !newCompName.trim()}
                      className="gap-1.5 shrink-0"
                    >
                      {addingCompetitor ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <PlusIcon className="size-4" />
                      )}
                      Ekle
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </PageSection>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 4: ACCOUNT SETTINGS
          ═══════════════════════════════════════════════════ */}
      <div ref={(el) => { sectionRefs.current.hesap = el; }} className="scroll-mt-28">
        <PageSection className="mt-8">
          <SectionTitle title="Hesap Ayarlar\u0131" subtitle="Bildirimler, plan ve fatura bilgileri" />

          {/* Notification Preferences */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellIcon className="size-4" />
                Bildirim Tercihleri
              </CardTitle>
              <CardDescription>
                Hangi bildirimleri almak istedi\u011Finizi se\u00E7in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weekly report */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Haftal\u0131k rapor e-posta</Label>
                  <p className="text-xs text-muted-foreground">
                    Her hafta performans \u00F6zetinizi al\u0131n
                  </p>
                </div>
                <Switch
                  checked={emailWeeklyReport}
                  onCheckedChange={setEmailWeeklyReport}
                />
              </div>

              <Separator />

              {/* New competitor notification */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Yeni rakip bildirimi</Label>
                  <p className="text-xs text-muted-foreground">
                    Yeni bir rakip tespit edildi\u011Finde haber verin
                  </p>
                </div>
                <Switch
                  checked={emailScoreChange}
                  onCheckedChange={setEmailScoreChange}
                />
              </div>

              <Separator />

              {/* Opportunity notification */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">F\u0131rsat bildirimi</Label>
                  <p className="text-xs text-muted-foreground">
                    Tarama tamamland\u0131\u011F\u0131nda sonu\u00E7lar\u0131 g\u00F6nderin
                  </p>
                </div>
                <Switch
                  checked={emailScanComplete}
                  onCheckedChange={setEmailScanComplete}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                variant="outline"
                className="gap-1.5"
              >
                {savingNotifications ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                Kaydet
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Information */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCardIcon className="size-4" />
                Plan Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${planConfig.bg} ${planConfig.color} gap-1 text-xs font-bold`}
                    >
                      <PlanIcon className="size-3" />
                      {planLabel}
                    </Badge>
                    {isInGracePeriod && (
                      <Badge variant="destructive" className="text-xs">S\u00FCresi doldu</Badge>
                    )}
                  </div>
                  {formattedEndDate && (
                    <p className="text-xs text-muted-foreground">
                      Yenileme: {formattedEndDate}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => router.push("/dashboard/paketler")}
                  variant="outline"
                  className="gap-1.5"
                >
                  Plan De\u011Fi\u015Ftir
                  <ArrowRightIcon className="size-4" />
                </Button>
              </div>

              {/* Payment History */}
              {paymentHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Fatura Ge\u00E7mi\u015Fi
                  </h4>
                  <div className="space-y-2">
                    {paymentHistory.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${
                              p.status === "success"
                                ? "bg-green-500"
                                : p.status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                          />
                          <span className="text-sm capitalize">{p.plan}</span>
                          <span className="text-xs text-muted-foreground">
                            ({p.period === "yearly" ? "Y\u0131ll\u0131k" : "Ayl\u0131k"})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {(p.amount / 100).toLocaleString("tr-TR")} {p.currency}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SunIcon className="size-4" />
                G\u00F6r\u00FCn\u00FCm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", label: "A\u00E7\u0131k", icon: SunIcon },
                  { value: "dark", label: "Koyu", icon: MoonIcon },
                  { value: "system", label: "Sistem", icon: MonitorIcon },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 border transition-all cursor-pointer ${
                      theme === value
                        ? "border-foreground/30 bg-muted shadow-sm"
                        : "border-border/50 hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`size-5 ${theme === value ? "text-foreground" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${theme === value ? "text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 5: DANGER ZONE
          ═══════════════════════════════════════════════════ */}
      <div ref={(el) => { sectionRefs.current.tehlike = el; }} className="scroll-mt-28">
        <PageSection className="mt-8">
          <SectionTitle title="Tehlikeli B\u00F6lge" subtitle="Geri al\u0131namaz i\u015Flemler" />

          <Card className="border-destructive/30">
            <CardContent className="space-y-4 pt-2">
              {/* Reset Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    T\u00FCm Verileri S\u0131f\u0131rla
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tarama sonu\u00E7lar\u0131, rakip analizleri ve istatistikler silinir
                  </p>
                </div>
                <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="destructive" size="sm" className="gap-1.5 shrink-0" />
                    }
                  >
                    <TrashIcon className="size-3.5" />
                    S\u0131f\u0131rla
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Verileri S\u0131f\u0131rla</DialogTitle>
                      <DialogDescription>
                        Bu i\u015Flem geri al\u0131namaz. T\u00FCm tarama sonu\u00E7lar\u0131n\u0131z, rakip analizleriniz ve
                        istatistikleriniz silinecektir.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline" />}
                      >
                        Vazge\u00E7
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          showToast("S\u0131f\u0131rlama i\u015Flemi hen\u00FCz aktif de\u011Fil", "error");
                          setResetConfirmOpen(false);
                        }}
                      >
                        Evet, S\u0131f\u0131rla
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Delete Account */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-destructive">
                    Hesab\u0131 Sil
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Hesab\u0131n\u0131z ve t\u00FCm verileriniz kal\u0131c\u0131 olarak silinir
                  </p>
                </div>
                <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                  <DialogTrigger
                    render={
                      <Button variant="destructive" size="sm" className="gap-1.5 shrink-0" />
                    }
                  >
                    <AlertTriangleIcon className="size-3.5" />
                    Hesab\u0131 Sil
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hesab\u0131 Sil</DialogTitle>
                      <DialogDescription>
                        Bu i\u015Flem geri al\u0131namaz. Hesab\u0131n\u0131z, t\u00FCm markalar\u0131n\u0131z ve
                        verileriniz kal\u0131c\u0131 olarak silinecektir.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline" />}
                      >
                        Vazge\u00E7
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="gap-1.5"
                      >
                        {deletingAccount && <Loader2Icon className="size-4 animate-spin" />}
                        Evet, Hesab\u0131 Sil
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>

      {/* ── Checkout modal ── */}
      {checkoutHtml && (
        <CheckoutModal
          html={checkoutHtml}
          onClose={() => setCheckoutHtml(null)}
        />
      )}

      {/* ── Plan selector modal ── */}
      {showPlanSelector && (
        <PlanSelector
          currentPlan={plan}
          onSelect={handleCheckout}
        />
      )}
    </div>
  );
}
