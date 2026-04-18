"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DEMO_PERSONAL_KEYWORDS,
  PERSONAL_PROFESSIONS,
} from "@/data/demo-personal";
import {
  Globe,
  MessageSquare,
  MessageCircle,
  BarChart3,
  FileText,
  CheckCircle,
  X,
  Shield,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Package,
  Plus,
} from "lucide-react";
import {
  generateWhatsAppShareLink,
  generatePdfShareMessage,
} from "@/lib/whatsapp";
import { GH7Logo } from "@/components/gh7-logo";
import { AIPlatformIcon } from "@/components/ui/ai-platform-badge";
import type { AIPlatform } from "@/components/ui/ai-platform-badge";
import { CityMultiselect } from "@/components/ui/city-multiselect";
import { normalizeTurkish } from "@/lib/utils/turkish";
import { Audit43Report } from "@/components/analiz/audit-43-report";
import { PersonalAnalysisBox } from "@/components/analiz/personal-analysis-box";
import { ServicePackagesCTA } from "@/components/analiz/service-packages-cta";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 0 | 1 | 1.5 | 2 | 3;
// Legacy "kisisel" kod için backward compat: "kisi" === "kisisel" semantik olarak
type AnalysisType = "firma" | "kisi" | "kisisel" | "eticaret" | "yurtdisi";

// kisisel → kisi migration helper
function isPersonalType(t: AnalysisType): boolean {
  return t === "kisi" || t === "kisisel";
}

interface FormData {
  analysisType: AnalysisType;
  domain: string;
  heroInput: string;
  email: string;
  phone: string;
  otp: string;
  kvkkAccepted: boolean;
  brandName: string;
  websiteUrl: string;
  sector: string;
  cities: string[];
  keywords: string[];
  // kisisel/kisi fields
  fullName: string;
  profession: string;
  linkedinUrl: string;
  expertise: string; // YENİ: uzmanlık alanı (kisi için zorunlu)
  socialMedia: string; // YENİ: sosyal medya handle (kisi için ops)
  // E-ticaret fields
  ecommerceMode: "website" | "marketplace" | "brand";
  marketplaceUrl: string;
  brandOrProductName: string;
  category: string;
  // Yurtdışı fields
  targetMarkets: string;
  siteLanguage: string;
  // Ortak opsiyonel
  competitor: string; // Bilinen rakip (hint)
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_KEYWORDS = [
  "yerden ısıtma yaptıracağım firma önerir misin",
  "Türkiye'de en iyi yerden ısıtma firması hangisi",
  "heat trace boru ısıtma kablosu nereden alabilirim",
  "endüstriyel varil ısıtma ceketi en iyi marka",
  "çatı kar eritme sistemi kuracağım firma öner",
  "sera ısıtma sistemi hangi firma yapıyor",
  "yerden ısıtma mı radyatör mü daha ekonomik",
  "elektrikli yerden ısıtma en güvenilir marka",
  "boru donma önleme kablosu teklif nereden alırım",
  "karbon film yerden ısıtma mı kablolu mu tercih etmeliyim",
];

const LOADING_STEPS = [
  { text: "Firmanız araştırılıyor...", duration: 1200, icon: Globe, platform: null as AIPlatform | null },
  { text: "Ürünleriniz taranıyor...", duration: 1000, icon: Package, platform: null as AIPlatform | null },
  { text: "ChatGPT'ye soruyoruz...", duration: 1000, icon: MessageSquare, platform: "chatgpt" as AIPlatform | null },
  { text: "Gemini'den yanıt alınıyor...", duration: 1000, icon: MessageSquare, platform: "gemini" as AIPlatform | null },
  { text: "Perplexity kontrol ediliyor...", duration: 1000, icon: MessageSquare, platform: "perplexity" as AIPlatform | null },
  { text: "Claude'a danışıyoruz...", duration: 1000, icon: MessageSquare, platform: "claude" as AIPlatform | null },
  { text: "Google AI Overview taranıyor...", duration: 1000, icon: MessageSquare, platform: "google_aio" as AIPlatform | null },
  { text: "Ürün bazlı rakipleriniz tespit ediliyor...", duration: 800, icon: BarChart3, platform: null as AIPlatform | null },
  { text: "Raporunuz hazırlanıyor...", duration: 800, icon: FileText, platform: null as AIPlatform | null },
];


interface ProductItem {
  name: string;
  checked: boolean;
  autoDetected: boolean;
}

const DEMO_FIRMA_PRODUCTS: ProductItem[] = [
  { name: "Yerden ısıtma kablosu (elektrikli)", checked: true, autoDetected: true },
  { name: "Heat trace boru ısıtma kablosu", checked: true, autoDetected: true },
  { name: "Çatı kar buz eritme sistemi", checked: true, autoDetected: true },
  { name: "Varil ısıtma ceketi", checked: true, autoDetected: true },
  { name: "Sera ısıtma kablosu", checked: true, autoDetected: true },
  { name: "Karbon film ısıtıcı", checked: false, autoDetected: true },
];

const DEMO_FIRMA_SERVICES: ProductItem[] = [
  { name: "Proje tasarımı", checked: true, autoDetected: true },
  { name: "Teknik destek", checked: true, autoDetected: true },
];

const DEMO_PERSONAL_PRODUCTS: ProductItem[] = [
  { name: "Diz protezi ameliyatı", checked: true, autoDetected: true },
  { name: "Artroskopi", checked: true, autoDetected: true },
  { name: "Spor yaralanmaları", checked: true, autoDetected: true },
  { name: "Omuz cerrahisi", checked: false, autoDetected: true },
];


/* ------------------------------------------------------------------ */
/*  Highlight utility                                                  */
/* ------------------------------------------------------------------ */

function highlightResponse(
  text: string,
  brandName: string,
  competitors: string[]
): React.ReactNode[] {
  if (!text || !brandName) return [text];

  // Build list of names to highlight: brand + competitors
  const entries: { name: string; type: "brand" | "competitor" }[] = [
    { name: brandName, type: "brand" },
    ...competitors
      .filter((c) => c.toLowerCase() !== brandName.toLowerCase())
      .map((c) => ({ name: c, type: "competitor" as const })),
  ];

  // Sort by length (longest first) to avoid partial matches
  entries.sort((a, b) => b.name.length - a.name.length);

  // Build regex that matches any of the names (Turkish-aware, case-insensitive)
  const escapedNames = entries.map((e) =>
    e.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (escapedNames.length === 0) return [text];

  const pattern = new RegExp(`(${escapedNames.join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const normalized = normalizeTurkish(part);
    const match = entries.find(
      (e) => normalizeTurkish(e.name) === normalized
    );
    if (match) {
      const className =
        match.type === "brand"
          ? "bg-green-100 text-green-800 px-0.5 rounded font-medium"
          : "bg-orange-100 text-orange-800 px-0.5 rounded";
      return (
        <mark key={i} className={className}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <GH7Logo size="default" />
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 0, label: "Doğrulama" },
    { num: 1, label: "Bilgiler" },
    { num: 1.5, label: "Ürün/Hizmet" },
    { num: 2, label: "Aramalar" },
    { num: 3, label: "Sonuç" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s.num < currentStep
                  ? "bg-gray-900 text-white"
                  : s.num === currentStep
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s.num < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1 hidden sm:block whitespace-nowrap">
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-14 h-0.5 mx-1 mt-[-12px] sm:mt-[-12px] ${
                s.num < currentStep ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SiziArayalimPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("+90 ");
  const [timeSlot, setTimeSlot] = useState("");
  const [topic, setTopic] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          En kısa sürede sizi arayalım
        </h3>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uygun saatiniz
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="">Saat seçin</option>
              <option value="09:00-12:00">09:00-12:00</option>
              <option value="12:00-15:00">12:00-15:00</option>
              <option value="15:00-18:00">15:00-18:00</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hangi konuda?
            </label>
            <div className="space-y-2">
              {["Fiyat bilgisi", "Teknik detay", "Ajans Paketleri"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="topic"
                    value={t}
                    checked={topic === t}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Arayın Beni &rarr;
          </button>

          <p className="text-center text-sm text-gray-400">
            veya 0850 XXX XX XX
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

function AnalizPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null); // null = hero
  const [formData, setFormData] = useState<FormData>({
    analysisType: "firma",
    domain: "",
    heroInput: "",
    email: "",
    phone: "+90",
    otp: "",
    kvkkAccepted: false,
    brandName: "",
    websiteUrl: "",
    sector: "",
    cities: [],
    keywords: [...DEFAULT_KEYWORDS],
    fullName: "",
    profession: "",
    linkedinUrl: "",
    expertise: "",
    socialMedia: "",
    ecommerceMode: "website",
    marketplaceUrl: "",
    brandOrProductName: "",
    category: "",
    targetMarkets: "",
    siteLanguage: "",
    competitor: "",
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [services, setServices] = useState<ProductItem[]>([]);
  const [newProductInput, setNewProductInput] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [expandedQueries, setExpandedQueries] = useState<Set<number>>(new Set([0]));
  const [websiteAnalyzing, setWebsiteAnalyzing] = useState(false);
  const [queriesGenerating, setQueriesGenerating] = useState(false);
  // 43-item audit state
  const [audit43, setAudit43] = useState<{
    overallScore: number;
    competitorScore?: number;
    competitorName?: string;
    categoryScores: Record<string, number>;
    items: Array<{ key: string; label: string; category: string; status: "pass" | "partial" | "fail"; score: 0 | 5 | 10; value?: string | number; recommendation?: string }>;
    estimatedMonthlyLoss: number;
    estimatedYearlyLoss: number;
    personalAnalysis?: string;
  } | null>(null);
  const [audit43Loading, setAudit43Loading] = useState(false);
  // Perplexity discovery sonucu (Step 1 sonrası dolar)
  const [discovery, setDiscovery] = useState<
    import("@/lib/ai/discovery-types").DiscoveryResult | null
  >(null);

  /* ---- auto-fill from URL params (landing page redirect) ---- */
  useEffect(() => {
    const rawType = searchParams.get("type");
    const domain = searchParams.get("domain");
    const name = searchParams.get("name");
    const input = searchParams.get("input"); // eticaret için generic

    // Landing tipi → Analiz tipi map
    const typeMap: Record<string, AnalysisType> = {
      firma: "firma",
      kisi: "kisi",
      kisisel: "kisi", // legacy
      eticaret: "eticaret",
      export: "yurtdisi", // landing "export" → "yurtdisi"
      yurtdisi: "yurtdisi",
    };
    const analyzedType: AnalysisType | null = rawType
      ? (typeMap[rawType] ?? null)
      : null;

    if (analyzedType === "firma" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const brandGuess = cleanDomain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        analysisType: "firma",
        heroInput: cleanDomain,
        domain: cleanDomain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${cleanDomain}`,
      }));
      setStep(0);
    } else if (analyzedType === "kisi" && name) {
      setFormData((prev) => ({
        ...prev,
        analysisType: "kisi",
        heroInput: name,
        fullName: name,
        keywords: [...DEMO_PERSONAL_KEYWORDS],
      }));
      setStep(0);
    } else if (analyzedType === "eticaret" && (input || domain)) {
      const val = input ?? domain ?? "";
      // URL mı yoksa marka adı mı?
      const isUrl = /^https?:\/\//.test(val) || val.includes(".");
      setFormData((prev) => ({
        ...prev,
        analysisType: "eticaret",
        heroInput: val,
        ecommerceMode: isUrl
          ? val.includes("trendyol") ||
            val.includes("hepsiburada") ||
            val.includes("n11") ||
            val.includes("amazon")
            ? "marketplace"
            : "website"
          : "brand",
        domain: isUrl ? val.replace(/^https?:\/\//, "").replace(/\/$/, "") : "",
        marketplaceUrl: isUrl && val.includes("trendyol") ? val : "",
        brandOrProductName: !isUrl ? val : "",
      }));
      setStep(0);
    } else if (analyzedType === "yurtdisi" && domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
      const brandGuess = cleanDomain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        analysisType: "yurtdisi",
        heroInput: cleanDomain,
        domain: cleanDomain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${cleanDomain}`,
      }));
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- helpers ---- */
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleHeroSubmit = () => {
    if (!formData.heroInput.trim()) return;

    if (formData.analysisType === "firma") {
      const domain = formData.heroInput
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const brandGuess = domain.split(".")[0];
      setFormData((prev) => ({
        ...prev,
        domain,
        brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
        websiteUrl: `https://${domain}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.heroInput.trim(),
        keywords: [...DEMO_PERSONAL_KEYWORDS],
      }));
    }
    setStep(0);
  };

  // Telefon numarasını normalize et: her formattan 905XXXXXXXXX formatına çevir
  function normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, ""); // Sadece rakamlar
    if (digits.startsWith("90") && digits.length === 12) return digits; // Zaten doğru
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1); // 05XX → 5XX
    if (digits.length === 10 && digits.startsWith("5")) return "90" + digits; // 5XX → 905XX
    if (digits.startsWith("90") && digits.length > 12) return digits.slice(0, 12); // Fazla hane kes
    return "90" + digits; // Fallback
  }

  const handleSendOtp = async () => {
    if (!formData.email || formData.phone.length < 6) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const fullPhone = normalizePhone(formData.phone);
      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // mode: "register" → /analiz kayıt akışı, Profile yoksa oluşturulur
        body: JSON.stringify({ phone: fullPhone, mode: "register" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "SMS gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }
      setOtpToken(data.token ?? null);
      setOtpSent(true);
    } catch {
      setOtpError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!formData.otp || formData.otp.length < 6 || !formData.kvkkAccepted)
      return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const fullPhone = normalizePhone(formData.phone);
      const res = await fetch("/api/auth/verify-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          code: formData.otp,
          token: otpToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(
          data.error ?? "Kod doğrulanamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      // PR B: Bu telefon/e-posta ile daha önce ücretsiz analiz yapıldı mı?
      // Varsa yeni analiz BAŞLATMA — direkt dashboard'a gönder.
      try {
        const canStartRes = await fetch("/api/analiz/can-start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            email: formData.email,
          }),
        });
        const canStartData = await canStartRes.json();
        if (canStartData?.canStart === false) {
          // Zaten analiz yaptırmış → dashboard'a yönlendir
          router.replace(canStartData.redirectTo ?? "/panel/genel");
          return;
        }
      } catch (err) {
        // can-start kontrolü başarısız olursa mevcut akışa devam
        // (fail-open: kullanıcı deneyimini bozmama)
        console.warn("[analiz] can-start check failed:", err);
      }

      setStep(1);
    } catch {
      setOtpError("Doğrulama sırasında bir hata oluştu.");
    } finally {
      setOtpLoading(false);
    }
  };

  const buildDiscoveryInput = (): import("@/lib/ai/discovery-types").DiscoveryInput => {
    const companyType =
      formData.analysisType === "kisisel" ? "kisi" : formData.analysisType;
    const base = {
      companyType,
      location: formData.cities[0],
      competitor: formData.competitor || undefined,
    } as import("@/lib/ai/discovery-types").DiscoveryInput;

    if (companyType === "firma") {
      return {
        ...base,
        url: formData.domain || formData.websiteUrl,
        brandName: formData.brandName,
      };
    }
    if (companyType === "kisi") {
      return {
        ...base,
        fullName: formData.fullName,
        expertise: formData.expertise || formData.profession,
        socialMedia: formData.socialMedia || undefined,
        url: formData.linkedinUrl || undefined,
      };
    }
    if (companyType === "eticaret") {
      return {
        ...base,
        ecommerceMode: formData.ecommerceMode,
        url: formData.ecommerceMode === "website" ? formData.domain : undefined,
        marketplaceUrl:
          formData.ecommerceMode === "marketplace"
            ? formData.marketplaceUrl
            : undefined,
        brandOrProductName:
          formData.ecommerceMode === "brand"
            ? formData.brandOrProductName
            : undefined,
        category: formData.category || undefined,
      };
    }
    if (companyType === "yurtdisi") {
      return {
        ...base,
        url: formData.domain || formData.websiteUrl,
        brandName: formData.brandName,
        targetMarkets: formData.targetMarkets || undefined,
        siteLanguage: formData.siteLanguage || undefined,
      };
    }
    return base;
  };

  const handleStep1Next = async () => {
    // Tipe göre validation
    if (formData.analysisType === "firma") {
      if (!formData.brandName || formData.cities.length === 0) return;
    } else if (isKisi) {
      if (
        !formData.fullName ||
        !(formData.expertise || formData.profession) ||
        formData.cities.length === 0
      )
        return;
    } else if (formData.analysisType === "eticaret") {
      const hasInput =
        (formData.ecommerceMode === "website" && formData.domain) ||
        (formData.ecommerceMode === "marketplace" && formData.marketplaceUrl) ||
        (formData.ecommerceMode === "brand" && formData.brandOrProductName);
      if (!hasInput) return;
    } else if (formData.analysisType === "yurtdisi") {
      if (!formData.domain || !formData.targetMarkets) return;
    }

    setProducts([]);
    setServices([]);
    setStep(1.5);

    // Yeni unified discovery API
    setWebsiteAnalyzing(true);
    let gotApiResponse = false;
    try {
      const input = buildDiscoveryInput();
      const res = await fetch("/api/analiz/run-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const data = await res.json();
        gotApiResponse = true;
        setDiscovery(data);
        if (Array.isArray(data.products)) {
          setProducts(
            data.products.map((name: string) => ({
              name,
              checked: true,
              autoDetected: true,
            }))
          );
        }
        if (Array.isArray(data.services)) {
          setServices(
            data.services.map((name: string) => ({
              name,
              checked: true,
              autoDetected: true,
            }))
          );
        }
      }
    } catch (err) {
      console.warn("[analiz] Discovery failed:", err);
    } finally {
      setWebsiteAnalyzing(false);
    }

    // Fallback: API yanıt vermedi veya boş döndü
    if (!gotApiResponse) {
      if (formData.analysisType === "firma") {
        setProducts([...DEMO_FIRMA_PRODUCTS]);
        setServices([...DEMO_FIRMA_SERVICES]);
      } else if (isKisi) {
        setProducts([...DEMO_PERSONAL_PRODUCTS]);
        setServices([]);
      }
    }
  };

  const handleStep1_5Next = async () => {
    setStep(2);

    // Gerçek sorgu üretimi (background)
    const selectedProducts = products.filter((p) => p.checked).map((p) => p.name);
    const selectedServices = services.filter((s) => s.checked).map((s) => s.name);

    if (selectedProducts.length === 0 && selectedServices.length === 0) return;

    setQueriesGenerating(true);
    try {
      const res = await fetch("/api/analiz/generate-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: selectedProducts,
          services: selectedServices,
          cities: formData.cities,
          // Discovery varsa targetQueries kullanılır (Haiku atlanır)
          discovery: discovery,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.queries) && data.queries.length >= 5) {
          setFormData((prev) => ({ ...prev, keywords: data.queries.slice(0, 10) }));
        }
      }
    } catch (err) {
      console.warn("[analiz] Query generation failed, using fallback:", err);
    } finally {
      setQueriesGenerating(false);
    }
  };

  const handleStartAnalysis = async () => {
    setStep(3);
    setLoading(true);
    setLoadingStepIndex(0);

    // Kick off 43-item audit in background (URL olan tüm tipler için)
    const auditUserType: "firma" | "kisi" | "eticaret" | "yurtdisi" =
      isKisi
        ? "kisi"
        : formData.analysisType === "eticaret"
          ? "eticaret"
          : formData.analysisType === "yurtdisi"
            ? "yurtdisi"
            : "firma";
    const auditUrl =
      formData.domain || formData.websiteUrl || formData.marketplaceUrl || "";
    const auditBrandName =
      displayName || formData.brandName || formData.fullName;

    if (auditUrl && auditBrandName) {
      setAudit43Loading(true);
      const source = searchParams.get("utm_source") ?? undefined;
      try {
        const res = await fetch("/api/analiz/run-audit-43", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: auditUrl,
            brandName: auditBrandName,
            userType: auditUserType,
            location: formData.cities[0],
            keywords: formData.keywords,
            source,
            competitorUrl: formData.competitor || undefined,
            discoveredCompetitors: discovery?.competitors?.slice(0, 5) ?? [],
            // Perplexity discovery sonucu — Brand'ı zenginleştirmek ve
            // Prompt tablosuna targetQueries yazmak için API'ye gönderilir.
            discoveryResult: discovery
              ? {
                  sector: discovery.sector,
                  description: discovery.description,
                  products: discovery.products,
                  services: discovery.services,
                  expertise: discovery.expertise,
                  targetQueries: discovery.targetQueries,
                  location: discovery.location,
                  targetCountries: discovery.targetCountries,
                  siteLanguages: discovery.siteLanguages,
                  priceSegment: discovery.priceSegment,
                  category: discovery.category,
                }
              : undefined,
          }),
        });
        if (res.ok) {
          // Başarılı → dashboard'a redirect
          router.replace("/panel/genel?newAudit=1");
          return;
        } else {
          // API hata → yine dashboard'a redirect (hata query param'la)
          // DEMO_QUERY_RESPONSES'li eski result sayfası ASLA gösterilmez.
          console.warn("[analiz] Audit API returned non-ok:", res.status);
          router.replace("/panel/genel?newAudit=1&auditError=1");
          return;
        }
      } catch (err) {
        console.warn("[analiz] 43-item audit failed:", err);
        // Network/exception → yine redirect (dashboard "veri yok" gösterir)
        router.replace("/panel/genel?newAudit=1&auditError=1");
        return;
      } finally {
        setAudit43Loading(false);
      }
    }
  };

  const updateKeyword = (index: number, value: string) => {
    setFormData((prev) => {
      const keywords = [...prev.keywords];
      keywords[index] = value;
      return { ...prev, keywords };
    });
  };

  /* ---- favicon ---- */
  useEffect(() => {
    if (formData.analysisType !== "firma") {
      setFaviconUrl(null);
      return;
    }
    const domain = formData.heroInput
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (domain.includes(".")) {
      setFaviconUrl(
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      );
    } else {
      setFaviconUrl(null);
    }
  }, [formData.heroInput, formData.analysisType]);

  /* ---- loading animation ---- */
  useEffect(() => {
    if (!loading) return;

    if (loadingStepIndex >= LOADING_STEPS.length) {
      setLoading(false);
      setAnalysisComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setLoadingStepIndex((prev) => prev + 1);
    }, LOADING_STEPS[loadingStepIndex].duration);

    return () => clearTimeout(timeout);
  }, [loading, loadingStepIndex]);

  /* ---- derived ---- */
  const isFirma = formData.analysisType === "firma";
  const isKisi = isPersonalType(formData.analysisType);
  const isEticaret = formData.analysisType === "eticaret";
  const isYurtdisi = formData.analysisType === "yurtdisi";
  const hasUrl = isFirma || isYurtdisi; // URL zorunlu tipler
  const displayName = isKisi
    ? formData.fullName
    : isEticaret
      ? formData.brandOrProductName || formData.brandName || formData.heroInput
      : formData.brandName;

  /* ---- render helpers ---- */

  const renderHero = () => (
    <div className="flex flex-col items-center text-center px-4 pt-12 sm:pt-20 pb-16">
      <Logo />

      <h1 className="mt-10 text-4xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
        Yapay Zeka Seni Tanıyor mu?
      </h1>

      <p className="mt-4 text-lg text-gray-500 max-w-lg">
        ChatGPT, Gemini ve AI Overview&apos;da görünürlüğünüzü 60 saniyede
        öğrenin
      </p>

      {/* 4 kapı seçimi — firma / kişi / e-ticaret / yurtdışı */}
      <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-2xl sm:grid-cols-4">
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "firma",
              heroInput: "",
            }))
          }
          className={`border rounded-xl p-4 text-center transition-colors ${
            formData.analysisType === "firma"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#127970;</span>
          <span className="text-sm font-medium text-gray-900 block">Firma</span>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            Şirket/kurum
          </span>
        </button>
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "kisi",
              heroInput: "",
              keywords: [...DEMO_PERSONAL_KEYWORDS],
            }))
          }
          className={`border rounded-xl p-4 text-center transition-colors ${
            formData.analysisType === "kisi" || formData.analysisType === "kisisel"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#128100;</span>
          <span className="text-sm font-medium text-gray-900 block">Kişi</span>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            Kişisel marka
          </span>
        </button>
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "eticaret",
              heroInput: "",
            }))
          }
          className={`border rounded-xl p-4 text-center transition-colors ${
            formData.analysisType === "eticaret"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#128722;</span>
          <span className="text-sm font-medium text-gray-900 block">
            E-ticaret
          </span>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            Marka/ürün
          </span>
        </button>
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "yurtdisi",
              heroInput: "",
            }))
          }
          className={`border rounded-xl p-4 text-center transition-colors ${
            formData.analysisType === "yurtdisi"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#127760;</span>
          <span className="text-sm font-medium text-gray-900 block">
            Yurtdışı
          </span>
          <span className="text-[11px] text-gray-500 block mt-0.5">
            İhracat/export
          </span>
        </button>
      </div>

      {/* Input */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
          {isFirma && faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              width={24}
              height={24}
              className="shrink-0 rounded"
              onError={() => setFaviconUrl(null)}
            />
          )}
          <input
            type="text"
            placeholder={
              formData.analysisType === "firma"
                ? "firmanız.com"
                : formData.analysisType === "kisi" ||
                    formData.analysisType === "kisisel"
                  ? "Ad Soyad"
                  : formData.analysisType === "eticaret"
                    ? "marka adı veya ürün URL'si"
                    : "siteniz.com (hedef: ihracat pazarı)"
            }
            value={formData.heroInput}
            onChange={(e) => updateField("heroInput", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleHeroSubmit()}
            className="flex-1 text-base focus:outline-none bg-transparent"
          />
        </div>
        <button
          onClick={handleHeroSubmit}
          className="bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
        >
          Ücretsiz Analiz Et
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-400">
        5 dakikadan kısa &middot; Kredi kartı gerekmez
      </p>

      <div className="mt-8 flex items-center gap-3">
        <div className="flex -space-x-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">1.000+</span> firma
          analiz edildi
        </span>
      </div>
    </div>
  );

  const renderStep0 = () => (
    <div className="max-w-md mx-auto px-4">
      <StepIndicator currentStep={0} />

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Doğrulama
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Analiz sonuçlarınızı gönderebilmemiz için bilgilerinizi doğrulayın.
        </p>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              placeholder="isim@firma.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              type="tel"
              placeholder="+90 5XX XXX XX XX"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Send OTP */}
          {!otpSent && (
            <button
              onClick={handleSendOtp}
              disabled={otpLoading}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {otpLoading ? "Gönderiliyor..." : "SMS Kodu Gönder"}
            </button>
          )}

          {/* OTP Input */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 haneli kod"
                value={formData.otp}
                onChange={(e) =>
                  updateField(
                    "otp",
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          {/* Error */}
          {otpError && (
            <p className="text-sm text-red-600">{otpError}</p>
          )}

          {/* KVKK */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.kvkkAccepted}
              onChange={(e) => updateField("kvkkAccepted", e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              Analiz sonuçlarımın WhatsApp ile gönderilmesini kabul ediyorum
            </span>
          </label>

          {/* Verify */}
          {otpSent && (
            <button
              onClick={handleVerify}
              disabled={
                !formData.otp ||
                formData.otp.length < 6 ||
                !formData.kvkkAccepted ||
                otpLoading
              }
              className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {otpLoading ? "Doğrulanıyor..." : "Doğrula ve Devam Et"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-md mx-auto px-4">
      <StepIndicator currentStep={1} />

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {isFirma
            ? "Marka Bilgileri"
            : isKisi
              ? "Kişisel Bilgiler"
              : isEticaret
                ? "E-Ticaret Bilgileri"
                : isYurtdisi
                  ? "Yurtdışı İhracat Bilgileri"
                  : "Bilgileriniz"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isEticaret
            ? "Marketplace URL, kendi site URL'iniz veya sadece marka/ürün adı girebilirsiniz."
            : isYurtdisi
              ? "Hedef pazarlarınıza özel analiz için bilgilerinizi girin."
              : "AI aramasını kişiselleştirmek için bilgilerinizi girin."}
        </p>

        <div className="space-y-4">
          {isEticaret ? (
            <>
              {/* E-ticaret: 3 radio mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giriş Tipi
                </label>
                <div className="space-y-2">
                  {[
                    { key: "website", label: "Kendi e-ticaret sitem var" },
                    {
                      key: "marketplace",
                      label: "Trendyol / Hepsiburada / Amazon sayfam var",
                    },
                    { key: "brand", label: "Sadece marka veya ürün adı gireceğim" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center gap-3 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="ecommerceMode"
                        value={opt.key}
                        checked={formData.ecommerceMode === opt.key}
                        onChange={() =>
                          updateField(
                            "ecommerceMode",
                            opt.key as typeof formData.ecommerceMode
                          )
                        }
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* E-ticaret: Conditional input */}
              {formData.ecommerceMode === "website" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    placeholder="ornek.com"
                    value={formData.domain}
                    onChange={(e) => updateField("domain", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}
              {formData.ecommerceMode === "marketplace" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marketplace Mağaza/Ürün URL
                  </label>
                  <input
                    type="text"
                    placeholder="trendyol.com/magaza/marka-adi veya ürün linki"
                    value={formData.marketplaceUrl}
                    onChange={(e) => updateField("marketplaceUrl", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}
              {formData.ecommerceMode === "brand" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marka / Ürün Adı
                  </label>
                  <input
                    type="text"
                    placeholder="marka adı veya ürün adı"
                    value={formData.brandOrProductName}
                    onChange={(e) =>
                      updateField("brandOrProductName", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              )}

              {/* E-ticaret: Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="örn: kozmetik, ev tekstili, gıda"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </>
          ) : isYurtdisi ? (
            <>
              {/* Yurtdışı: Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Adı
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Yurtdışı: Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="ornek.com"
                  value={formData.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              {/* Yurtdışı: Target Markets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Pazarlar
                </label>
                <input
                  type="text"
                  placeholder="örn: ABD, Almanya, Suudi Arabistan"
                  value={formData.targetMarkets}
                  onChange={(e) => updateField("targetMarkets", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Virgülle ayırarak 1-5 ülke yazın
                </p>
              </div>

              {/* Yurtdışı: Site Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ana Site Dili{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="örn: İngilizce, Almanca, Arapça"
                  value={formData.siteLanguage}
                  onChange={(e) => updateField("siteLanguage", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </>
          ) : isFirma ? (
            <>
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka Adı
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500"
                />
              </div>

            </>
          ) : (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uzmanlık alanı
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Uzmanlık seçin</option>
                  {PERSONAL_PROFESSIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website veya LinkedIn URL{" "}
                  <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="url"
                  placeholder="linkedin.com/in/isim"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateField("linkedinUrl", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Cities - searchable dropdown (yurtdisi için opsiyonel) */}
          {!isYurtdisi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isFirma
                  ? "Hizmet Verilen İller"
                  : isKisi
                    ? "Faaliyet Gösterilen İller"
                    : "Konum"}
              </label>
              <CityMultiselect
                selected={formData.cities}
                onChange={(cities) =>
                  setFormData((prev) => ({ ...prev, cities }))
                }
                max={3}
              />
            </div>
          )}

          {/* Competitor hint (tüm tipler) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bildiğiniz bir rakip{" "}
              <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="text"
              placeholder="marka adı veya URL"
              value={formData.competitor}
              onChange={(e) => updateField("competitor", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Next */}
          <button
            onClick={handleStep1Next}
            disabled={
              isFirma
                ? !formData.brandName || formData.cities.length === 0
                : isKisi
                  ? !formData.fullName ||
                    !formData.profession ||
                    formData.cities.length === 0
                  : isEticaret
                    ? (formData.ecommerceMode === "website" && !formData.domain) ||
                      (formData.ecommerceMode === "marketplace" &&
                        !formData.marketplaceUrl) ||
                      (formData.ecommerceMode === "brand" &&
                        !formData.brandOrProductName)
                    : isYurtdisi
                      ? !formData.domain || !formData.targetMarkets
                      : true
            }
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Devam &rarr;
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep1_5 = () => {
    const toggleProduct = (index: number) => {
      setProducts((prev) => prev.map((p, i) => i === index ? { ...p, checked: !p.checked } : p));
    };
    const toggleService = (index: number) => {
      setServices((prev) => prev.map((s, i) => i === index ? { ...s, checked: !s.checked } : s));
    };
    const addProduct = () => {
      if (!newProductInput.trim()) return;
      setProducts((prev) => [...prev, { name: newProductInput.trim(), checked: true, autoDetected: false }]);
      setNewProductInput("");
      setShowAddProduct(false);
    };

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={1.5} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {isFirma
              ? `${displayName || "Firma"} — Ne Satıyorsunuz?`
              : `${displayName || "Ad Soyad"} — Uzmanlık Alanlarınız?`}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isFirma
              ? "Web sitenizden tespit ettiğimiz ürün ve hizmetlerinizi onaylayın."
              : "Profilinizden tespit ettiğimiz uzmanlık alanlarınızı onaylayın."}
          </p>

          {websiteAnalyzing && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-blue-700">Web siteniz analiz ediliyor... (birkaç saniye)</span>
            </div>
          )}

          {/* Products / Specialties */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              {isFirma ? (
                <><Package className="w-4 h-4 text-gray-500" /> Ürünleriniz:</>
              ) : (
                <><span className="text-base">🏥</span> Uzmanlıklarınız:</>
              )}
            </p>
            <div className="space-y-2">
              {products.length === 0 && !websiteAnalyzing && (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 text-center">
                  {isFirma
                    ? "Web sitenizde satılan ürün tespit edilmedi. Aşağıdan manuel ekleyebilirsiniz."
                    : "Uzmanlık alanı tespit edilmedi. Aşağıdan manuel ekleyebilirsiniz."}
                </div>
              )}
              {products.map((product, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={product.checked}
                    onChange={() => toggleProduct(i)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className={`text-sm ${product.checked ? "text-gray-900" : "text-gray-500"}`}>
                    {product.name}
                  </span>
                  {!product.checked && product.autoDetected && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full ml-auto">
                      tespit edildi ama onayınız gerekli
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Services (firma only) */}
          {isFirma && services.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-base">🔧</span> Hizmetleriniz:
              </p>
              <div className="space-y-2">
                {services.map((service, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={service.checked}
                      onChange={() => toggleService(i)}
                      className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className={`text-sm ${service.checked ? "text-gray-900" : "text-gray-500"}`}>
                      {service.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add product inline */}
          {showAddProduct ? (
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder={isFirma ? "Ürün/hizmet adı" : "Uzmanlık alanı"}
                value={newProductInput}
                onChange={(e) => setNewProductInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProduct()}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addProduct}
                className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Ekle
              </button>
              <button
                onClick={() => { setShowAddProduct(false); setNewProductInput(""); }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isFirma ? "Ürün/Hizmet Ekle" : "Uzmanlık Ekle"}
            </button>
          )}

          <button
            onClick={handleStep1_5Next}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Bu doğru, devam &rarr;
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const platforms = [
      { name: "ChatGPT", key: "chatgpt" as AIPlatform },
      { name: "Gemini", key: "gemini" as AIPlatform },
      { name: "AI Overview", key: "google_aio" as AIPlatform },
      { name: "Perplexity", key: "perplexity" as AIPlatform },
      { name: "Claude", key: "claude" as AIPlatform },
    ];

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={2} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Arama Onayı
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            AI otomatik 10 arama önerdi. Dilediğinizi düzenleyebilirsiniz.
          </p>

          {queriesGenerating && (
            <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-blue-700">Ürünlerinize özel arama sorguları oluşturuluyor...</span>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {formData.keywords.map((kw, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={kw}
                  onChange={(e) => updateKeyword(i, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          {/* Platforms — ALL active */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white"
                >
                  <AIPlatformIcon platform={p.key} size={14} colored />
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Analizi Başlat &rarr;
          </button>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="max-w-md mx-auto px-4 flex flex-col items-center pt-20">
      <div className="space-y-4 w-full">
        {LOADING_STEPS.map((ls, i) => {
          const Icon = ls.icon;
          const isCompleted = i < loadingStepIndex;
          const isActive = i === loadingStepIndex;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 transition-all duration-300 ${
                isCompleted
                  ? "opacity-60"
                  : isActive
                  ? "opacity-100"
                  : "opacity-30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-green-100"
                    : isActive && ls.platform
                    ? "bg-gray-100 ring-2 ring-gray-300"
                    : isActive
                    ? "bg-gray-900"
                    : "bg-gray-100"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : ls.platform ? (
                  <AIPlatformIcon platform={ls.platform} size={20} colored />
                ) : isActive ? (
                  <Icon className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Icon className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive
                    ? "text-gray-900 font-medium"
                    : isCompleted
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                {ls.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRedirecting = () => (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 mb-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Analiziniz hazır
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Dashboard&apos;a yönlendiriliyorsunuz…
        </p>
        <a
          href="/panel/genel"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Dashboard&apos;a Git →
        </a>
      </div>
    </div>
  );

  const renderResults = () => {
    // DEMO_QUERY_RESPONSES (hardcoded ISITMAX) gösterimini tamamen devre dışı
    // bıraktık. Kullanıcı her audit sonrası /panel/genel'e redirect edilir.
    // Bu güvenlik ağı — redirect gecikirse loading animation sonunda kullanıcı
    // "yönlendiriliyorsunuz" ekranı görür, hiçbir zaman ISITMAX demo görmez.
    return renderRedirecting();
  };

  /* ---- main render ---- */

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar for non-hero steps */}
      {step !== null && (
        <div className="flex items-center justify-center py-6">
          <Logo />
        </div>
      )}

      {step === null && renderHero()}
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 1.5 && renderStep1_5()}
      {step === 2 && renderStep2()}
      {step === 3 && !analysisComplete && loading && renderLoading()}
      {step === 3 && analysisComplete && renderResults()}

      {/* Sizi Arayalim Popup */}
      <SiziArayalimPopup
        open={showCallPopup}
        onClose={() => setShowCallPopup(false)}
      />
    </div>
  );
}

export default function AnalizPage() {
  return (
    <Suspense fallback={null}>
      <AnalizPageInner />
    </Suspense>
  );
}
