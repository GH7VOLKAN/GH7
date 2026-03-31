"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 0 | 1 | 1.5 | 2 | 3;
type AnalysisType = "firma" | "kisisel";

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
  // kisisel fields
  fullName: string;
  profession: string;
  linkedinUrl: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SECTORS = [
  "Isıtma ve Tesisat",
  "İnşaat ve Mimarlık",
  "Sağlık ve Klinik",
  "Hukuk ve Danışmanlık",
  "Restoran ve Yiyecek",
  "Otel ve Konaklama",
  "E-ticaret",
  "Güzellik ve Bakım",
  "Eğitim",
  "Otomotiv",
  "Teknoloji",
  "Gayrimenkul",
  "Finans ve Sigorta",
  "Lojistik ve Taşımacılık",
  "Tarım ve Hayvancılık",
  "Enerji",
  "Diğer",
];

const ALL_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Mersin",
  "Diyarbakır",
  "Kayseri",
  "Eskişehir",
  "Samsun",
  "Denizli",
  "Malatya",
  "Trabzon",
  "Erzurum",
  "Balıkesir",
  "Manisa",
  "Sakarya",
];

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
  { text: "Firmanız araştırılıyor...", duration: 1200, icon: Globe },
  { text: "Ürünleriniz taranıyor...", duration: 1000, icon: Package },
  { text: "ChatGPT'ye soruyoruz...", duration: 1000, icon: MessageSquare },
  { text: "Gemini'den yanıt alınıyor...", duration: 1000, icon: MessageSquare },
  { text: "Perplexity kontrol ediliyor...", duration: 1000, icon: MessageSquare },
  { text: "Claude'a danışıyoruz...", duration: 1000, icon: MessageSquare },
  { text: "Google AI Overview taranıyor...", duration: 1000, icon: MessageSquare },
  { text: "Ürün bazlı rakipleriniz tespit ediliyor...", duration: 800, icon: BarChart3 },
  { text: "Raporunuz hazırlanıyor...", duration: 800, icon: FileText },
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

/* Product-based competitor rankings for Layer 3 */
const PRODUCT_RANKINGS = [
  {
    product: "Yerden Isıtma Kablosu",
    rankings: [
      { name: "Warmup", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "aynı" },
      { name: "ISITMAX", queryCount: 2, totalQueries: 5, trend: "up" as const, trendNote: "geçen hafta 3.ydü" },
      { name: "Giacomini", queryCount: 2, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
    ],
  },
  {
    product: "Heat Trace Boru Isıtma",
    rankings: [
      { name: "ISITMAX", queryCount: 4, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "Danfoss", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "nVent Raychem", queryCount: 1, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Çatı Kar Buz Eritme",
    rankings: [
      { name: "ISITMAX", queryCount: 3, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "Warmup", queryCount: 2, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
      { name: "Ensto", queryCount: 1, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Varil Isıtma Ceketi",
    rankings: [
      { name: "RezistansMarket", queryCount: 3, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "ISITMAX", queryCount: 2, totalQueries: 5, trend: "up" as const, trendNote: "geçen hafta 4.ydü" },
      { name: "Danfoss", queryCount: 2, totalQueries: 5, trend: "same" as const, trendNote: "" },
    ],
  },
  {
    product: "Sera Isıtma Kablosu",
    rankings: [
      { name: "ISITMAX", queryCount: 4, totalQueries: 5, trend: "leader" as const, trendNote: "LİDER" },
      { name: "EnerSerji", queryCount: 2, totalQueries: 5, trend: "same" as const, trendNote: "" },
      { name: "Warmup", queryCount: 1, totalQueries: 5, trend: "down" as const, trendNote: "düştü" },
    ],
  },
];

const DEMO_PLATFORM_RESPONSES = [
  {
    provider: "ChatGPT",
    keyword: "villa banyosu için elektrikli yerden ısıtma",
    response:
      "Villa banyoları için elektrikli yerden ısıtma sistemleri, özellikle karbon film ve ısıtma kabloları olarak iki ana kategoriye ayrılır. Isıtmax gibi yerli üreticiler, seramik ve doğal taş altına uygun, uzun ömürlü çözümler sunmaktadır...",
    sources: ["isitmax.com", "enerserji.com.tr", "warmup.com.tr"],
    brandMentioned: true,
  },
  {
    provider: "Gemini",
    keyword: "endüstriyel varil ısıtma çeketi fiyat",
    response:
      "Endüstriyel varil ısıtma çeketleri, kimya ve gıda sektörlerinde sıvı sıcaklığı korumak için kullanılır. Türkiye pazarında Isıtmax, RezistansMarket ve Danfoss gibi markalar öne çıkıyor...",
    sources: ["isitmax.com", "rezistansmarket.com", "danfoss.com.tr"],
    brandMentioned: true,
  },
  {
    provider: "AI Overview",
    keyword: "yüzey altı boru ısıtma kablosu seçenekleri",
    response:
      "Yüzey altı boru ısıtma kabloları; donmayı önlemek (heat trace), sıcaklığı korumak veya akışkanlığı sağlamak için kendinden regüleli veya sabit güçlü kablolar olarak ayrılır...",
    sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"],
    brandMentioned: true,
  },
  {
    provider: "Perplexity",
    keyword: "serada enerji verimli ısıtma sistemi",
    response:
      "Seralarda enerji verimli ısıtma için toprak altı ısıtma kabloları, hava üfleyicili sistemler ve hibrit çözümler tercih edilmektedir. Isıtmax'ın sera ısıtma kabloları enerji verimli seçenekler arasında yer almaktadır...",
    sources: ["isitmax.com", "tarim.gov.tr", "seracilik.org"],
    brandMentioned: true,
  },
  {
    provider: "Claude",
    keyword: "çatıda kar buz eritme kablo çözümleri",
    response:
      "Çatı ve oluk sistemlerinde kar ve buz birikmesini önlemek için self-regulating (kendinden ayarlı) ısıtma kabloları kullanılır. Bu kablolar ortam sıcaklığına göre güç tüketimini otomatik ayarlar...",
    sources: ["warmup.com.tr", "isitmax.com", "heattrace.com.tr"],
    brandMentioned: true,
  },
];

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

  /* ---- auto-fill from URL params (landing page redirect) ---- */
  useEffect(() => {
    const type = searchParams.get("type");
    const domain = searchParams.get("domain");
    const name = searchParams.get("name");

    if (type === "firma" && domain) {
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
    } else if (type === "kisi" && name) {
      setFormData((prev) => ({
        ...prev,
        analysisType: "kisisel",
        heroInput: name,
        fullName: name,
        keywords: [...DEMO_PERSONAL_KEYWORDS],
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
        body: JSON.stringify({ phone: fullPhone }),
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
      setStep(1);
    } catch {
      setOtpError("Doğrulama sırasında bir hata oluştu.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleStep1Next = () => {
    if (formData.analysisType === "firma") {
      if (
        !formData.brandName ||
        !formData.sector ||
        formData.cities.length === 0
      )
        return;
      setProducts([...DEMO_FIRMA_PRODUCTS]);
      setServices([...DEMO_FIRMA_SERVICES]);
    } else {
      if (!formData.fullName || !formData.profession || formData.cities.length === 0)
        return;
      setProducts([...DEMO_PERSONAL_PRODUCTS]);
      setServices([]);
    }
    setStep(1.5);
  };

  const handleStep1_5Next = () => {
    setStep(2);
  };

  const handleStartAnalysis = () => {
    setStep(3);
    setLoading(true);
    setLoadingStepIndex(0);
  };

  const toggleCity = (city: string) => {
    setFormData((prev) => {
      if (prev.cities.includes(city)) {
        return { ...prev, cities: prev.cities.filter((c) => c !== city) };
      }
      if (prev.cities.length >= 3) return prev;
      return { ...prev, cities: [...prev.cities, city] };
    });
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
  const displayName = isFirma ? formData.brandName : formData.fullName;

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

      {/* Dual selection cards */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "firma",
              heroInput: "",
            }))
          }
          className={`flex-1 border rounded-xl p-5 text-center transition-colors ${
            formData.analysisType === "firma"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#127970;</span>
          <span className="text-sm font-medium text-gray-900">
            Firmamı Test Et
          </span>
        </button>
        <button
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              analysisType: "kisisel",
              heroInput: "",
              keywords: [...DEMO_PERSONAL_KEYWORDS],
            }))
          }
          className={`flex-1 border rounded-xl p-5 text-center transition-colors ${
            formData.analysisType === "kisisel"
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-2xl block mb-2">&#128100;</span>
          <span className="text-sm font-medium text-gray-900">
            Kendi Adımı Test Et
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
            placeholder={isFirma ? "firmanız.com" : "Ad Soyad"}
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
          {isFirma ? "Marka Bilgileri" : "Kişisel Bilgiler"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isFirma
            ? "AI aramasını kişiselleştirmek için marka bilgilerinizi girin."
            : "AI aramasını kişiselleştirmek için bilgilerinizi girin."}
        </p>

        <div className="space-y-4">
          {isFirma ? (
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

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sektör
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Sektör seçin</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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

          {/* Cities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isFirma ? "Hizmet Verilen İller" : "Faaliyet gösterilen iller"}{" "}
              <span className="text-gray-400 font-normal">(maks. 3)</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_CITIES.map((city) => {
                const isSelected = formData.cities.includes(city);
                const isDisabled = !isSelected && formData.cities.length >= 3;
                return (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-gray-900 text-white"
                        : isDisabled
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next */}
          <button
            onClick={handleStep1Next}
            disabled={
              isFirma
                ? !formData.brandName ||
                  !formData.sector ||
                  formData.cities.length === 0
                : !formData.fullName ||
                  !formData.profession ||
                  formData.cities.length === 0
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
                  <AIPlatformIcon platform={p.key} size={14} />
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
                    : isActive
                    ? "bg-gray-900"
                    : "bg-gray-100"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
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

  const renderResults = () => {
    /* Platform key mapping for AIPlatformIcon */
    const platformKeyMap: Record<string, AIPlatform> = {
      ChatGPT: "chatgpt",
      Gemini: "gemini",
      "AI Overview": "google_aio",
      Perplexity: "perplexity",
      Claude: "claude",
    };

    /* ---------- LAYER 3 DATA: Product-based rankings ---------- */
    const brandName = displayName || "ISITMAX";

    /* ---------- LAYER 4 DATA: Digital footprint ---------- */
    const digitalSources = [
      { icon: "🌐", name: "Website", status: "active" as const, detail: "isitmax.com" },
      { icon: "in", name: "LinkedIn", status: "active" as const, detail: "Şirket sayfası aktif" },
      { icon: "G", name: "Google Business", status: "active" as const, detail: "Profil doğrulanmış" },
      { icon: "📋", name: "Rehberler", status: "missing" as const, detail: "Sektör rehberlerinde yok" },
      { icon: "📰", name: "Haberler", status: "active" as const, detail: "3 haber kaynağı" },
      { icon: "📱", name: "Sosyal Medya", status: "missing" as const, detail: "Aktif profil bulunamadı" },
    ];
    const activeSources = digitalSources.filter((s) => s.status === "active").length;

    /* ---------- LAYER 5 DATA: Site audit ---------- */
    const siteAuditChecks = [
      { name: "Schema Markup", status: "ok" as const, description: "Yapılandırılmış veri mevcut", score: null },
      { name: "robots.txt", status: "ok" as const, description: "AI botlarına erişim açık", score: null },
      { name: "llms.txt", status: "missing" as const, description: "AI için özel talimat dosyası eksik", score: null },
      { name: "SSL Sertifikası", status: "ok" as const, description: "HTTPS aktif ve geçerli", score: null },
      { name: "Sitemap.xml", status: "ok" as const, description: "XML sitemap mevcut", score: null },
      { name: "Meta Tags", status: "warning" as const, description: "Bazı sayfalarda açıklama eksik", score: null },
      { name: "PageSpeed", status: "ok" as const, description: "Sayfa hızı iyi seviyede", score: 85 },
    ];
    const auditScore = Math.round(
      (siteAuditChecks.filter((c) => c.status === "ok").length / siteAuditChecks.length) * 100
    );

    const statusIcon = (status: "ok" | "warning" | "missing") => {
      if (status === "ok") return <span className="text-green-500 text-lg">✅</span>;
      if (status === "warning") return <span className="text-yellow-500 text-lg">⚠️</span>;
      return <span className="text-red-500 text-lg">❌</span>;
    };

    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <StepIndicator currentStep={3} />

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {displayName} Analiz Sonuçları
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            5 platform üzerinden analiz tamamlandı
          </p>
        </div>

        {/* ================================================================ */}
        {/* LAYER 1 — AI Sizi Nasıl Görüyor                                  */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            AI Sizi Nasıl Görüyor
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Her platformun markanız hakkındaki gerçek yanıtları
          </p>

          <div className="space-y-5">
            {DEMO_PLATFORM_RESPONSES.map((resp, idx) => {
              const pKey = platformKeyMap[resp.provider] ?? "chatgpt";
              const mentioned = resp.brandMentioned;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  {/* Platform header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <AIPlatformIcon platform={pKey} size={28} />
                      <span className="text-base font-semibold text-gray-900">
                        {resp.provider}
                      </span>
                    </div>
                    {mentioned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                        Bahsediliyor ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                        Bahsedilmiyor ✗
                      </span>
                    )}
                  </div>

                  {/* Keyword / prompt */}
                  <p className="text-xs text-gray-400 mb-3 italic">
                    Soru: &quot;{resp.keyword}&quot;
                  </p>

                  {/* Full AI response */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {resp.response}
                  </p>

                  {/* Sources */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Kaynaklar:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resp.sources.map((src, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            src.includes(
                              formData.domain.split(".")[0]?.toLowerCase() ?? ""
                            ) || src === "isitmax.com"
                              ? "bg-green-50 text-green-700 font-medium"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 2 — Opus Analizi                                           */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Opus Analizi — Kişiselleştirilmiş Değerlendirme
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Tüm platform yanıtları analiz edildi
          </p>

          <div className="border border-gray-200 rounded-xl p-6 space-y-6">
            {/* Güçlü Yanlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Güçlü Yanlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                {displayName || "Isıtmax"}, 5 AI platformunun 4&apos;ünde doğrudan bahsediliyor. Özellikle &quot;yerden ısıtma&quot; ve &quot;sera ısıtma&quot; sorgularında güçlü bir kaynak otoritesi oluşturulmuş. Web sitesi düzenli olarak referans gösterilmekte ve marka adı yanıtlarda doğal biçimde geçmektedir. Sektörde AI görünürlüğü açısından lider konumdasınız.
              </p>
            </div>

            {/* Zayıf Yanlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Zayıf Yanlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                Claude platformunda marka bahsedilme oranı düşük; yanıtlarda rakipler daha ön plana çıkıyor. Endüstriyel ürün kategorisinde (varil ısıtma, heat trace) içerik derinliği yetersiz kalıyor. Blog ve teknik doküman sayısı rakiplere kıyasla az olduğundan, AI modelleri bazı sorgularda alternatif kaynakları tercih ediyor.
              </p>
            </div>

            {/* Fırsatlar */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Fırsatlar</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                &quot;Akıllı termostat entegrasyonu&quot; ve &quot;enerji verimli bina ısıtma&quot; gibi yükselen sorgularda henüz güçlü bir rakip yok. Bu alanlarda kapsamlı teknik içerik üretilmesi, AI yanıtlarında birinci kaynak olma şansı yaratır. Ayrıca llms.txt dosyası eklenerek AI botlarına özel talimatlar verilebilir.
              </p>
            </div>

            {/* Riskler */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">Riskler</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed pl-9">
                Warmup ve Viessmann gibi uluslararası markalar AI içerik stratejilerine yatırım yapıyor. Önlem alınmazsa, 3-6 ay içinde mevcut sıralama avantajı kaybedilebilir. Ayrıca Google AI Overview algoritma güncellemeleri, kaynak önceliklerini değiştirebilir — düzenli takip kritik önem taşımaktadır.
              </p>
            </div>

            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Bu analiz Claude Opus tarafından üretilmiştir
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 3 — Ürün Bazlı Rekabet Sıralaması                          */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Ürün Bazlı Rekabet Sıralaması
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Her ürün kategorisinde AI platformlarındaki sıralamanız
          </p>

          {/* Product ranking tables */}
          <div className="space-y-6 mb-8">
            {PRODUCT_RANKINGS.map((productRanking, pi) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={pi} className="border border-gray-200 rounded-xl p-6">
                  <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    {productRanking.product}
                  </p>
                  <div className="space-y-3">
                    {productRanking.rankings.map((rank, ri) => {
                      const isUser = rank.name === brandName || rank.name === "ISITMAX";
                      const trendIcon =
                        rank.trend === "up" ? "↑" :
                        rank.trend === "down" ? "↓" :
                        rank.trend === "leader" ? "" :
                        "→";
                      return (
                        <div
                          key={ri}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isUser ? "bg-gray-900 text-white" : "bg-gray-50"
                          }`}
                        >
                          <span className="text-lg w-8 text-center">{medals[ri]}</span>
                          <span className="text-sm w-5 text-center font-medium">
                            {ri + 1}.
                          </span>
                          <span className={`text-sm font-medium flex-1 ${isUser ? "text-white" : "text-gray-900"}`}>
                            {rank.name}
                          </span>
                          <span className={`text-xs ${isUser ? "text-gray-300" : "text-gray-500"}`}>
                            {rank.queryCount}/{rank.totalQueries} sorguda
                          </span>
                          {rank.trend === "leader" ? (
                            <span className="text-xs font-medium bg-green-500 text-white px-2 py-0.5 rounded-full">
                              ✅ LİDER
                            </span>
                          ) : rank.trendNote ? (
                            <span className={`text-xs ${
                              rank.trend === "up" ? "text-green-600" :
                              rank.trend === "down" ? "text-red-500" :
                              isUser ? "text-gray-400" : "text-gray-400"
                            }`}>
                              {trendIcon} {rank.trendNote}
                            </span>
                          ) : null}
                          <button
                            disabled
                            className={`text-xs underline cursor-not-allowed ${isUser ? "text-gray-500" : "text-gray-300"}`}
                            title="Yakında"
                          >
                            Neden Önde?
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Genel Rekabet Özeti */}
          <div className="border border-gray-200 rounded-xl p-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">Genel Rekabet Özeti</p>
            <p className="text-xs text-gray-500 mb-4">
              Tüm ürün kategorilerindeki toplam performans
            </p>
            <div className="space-y-3">
              {(() => {
                /* Aggregate scores across all product rankings */
                const scoreMap: Record<string, number> = {};
                PRODUCT_RANKINGS.forEach((pr) => {
                  pr.rankings.forEach((r, ri) => {
                    const points = ri === 0 ? 3 : ri === 1 ? 2 : 1;
                    scoreMap[r.name] = (scoreMap[r.name] || 0) + points;
                  });
                });
                const sorted = Object.entries(scoreMap).sort((a, b) => b[1] - a[1]);
                const maxScore = sorted[0]?.[1] || 1;
                return sorted.map(([name, score], i) => {
                  const isUser = name === brandName || name === "ISITMAX";
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-sm w-36 truncate ${isUser ? "font-bold text-gray-900" : "text-gray-700"}`}>
                        {name}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(score / maxScore) * 100}%`,
                            backgroundColor: isUser ? "#18181B" : "#9CA3AF",
                          }}
                        />
                      </div>
                      <span className={`text-sm w-12 text-right ${isUser ? "font-bold text-gray-900" : "text-gray-500"}`}>
                        {score} puan
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 4 — Dijital İziniz                                         */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Dijital İziniz
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Markanızın internet genelindeki varlığı
          </p>

          <div className="border border-gray-200 rounded-xl p-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-gray-900">
                Doluluk: {activeSources}/6 kaynak aktif
              </p>
              <div className="flex-1 max-w-[200px] ml-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-500"
                  style={{ width: `${(activeSources / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Source grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {digitalSources.map((source) => {
                const isActive = source.status === "active";
                return (
                  <div
                    key={source.name}
                    className={`flex flex-col items-center gap-2 p-4 border rounded-xl text-center ${
                      isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isActive ? "bg-green-100" : "bg-gray-200"
                      }`}
                    >
                      <span className={isActive ? "" : "opacity-40"}>
                        {source.icon}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {source.name}
                    </span>
                    <span className={`text-xs ${isActive ? "text-gray-500" : "text-gray-400"}`}>
                      {source.detail}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isActive ? "Aktif" : "Eksik"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-gray-500 mt-6 text-center">
              {6 - activeSources} kaynağı aktif edin, AI sıralama puanınız yükselsin
            </p>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* LAYER 5 — Teknik Durum                                           */}
        {/* ================================================================ */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Teknik Durum
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Sitenizin AI botları için hazırlık durumu
          </p>

          <div className="border border-gray-200 rounded-xl p-6">
            {/* Overall score gauge */}
            <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={auditScore >= 70 ? "#22C55E" : auditScore >= 40 ? "#EAB308" : "#EF4444"}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (auditScore / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{auditScore}</span>
                  <span className="text-[10px] text-gray-400">/100</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Site Hazırlık Skoru</p>
                <p className="text-xs text-gray-500">AI botlarına uyumluluk</p>
              </div>
            </div>

            {/* Audit check grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteAuditChecks.map((check) => (
                <div
                  key={check.name}
                  className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl"
                >
                  <div className="shrink-0 mt-0.5">{statusIcon(check.status)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {check.name}
                      {check.score !== null && (
                        <span className="ml-2 text-xs text-gray-400">{check.score}/100</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100 my-12" />

        {/* ================================================================ */}
        {/* BOTTOM CTA                                                       */}
        {/* ================================================================ */}
        <section className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Bu anlık bir fotoğraf. Yapay zeka yanıtları her hafta değişiyor.
          </p>

          {/* Pro & Business cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-8 text-left max-w-[640px] mx-auto">
            {/* Pro */}
            <div className="border-2 border-gray-900 rounded-xl p-5 relative">
              <div className="absolute -top-2.5 left-4 bg-gray-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                Popüler
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Pro</p>
              <p className="text-xl font-bold text-gray-900 mb-1">₺2.495<span className="text-sm font-normal text-gray-400">/ay</span></p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Haftalık otomatik takip, sıralama savaşı, değişim bildirimi, trend grafikleri
              </p>
            </div>

            {/* Business */}
            <div className="border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Business</p>
              <p className="text-xl font-bold text-gray-900 mb-1">₺4.995<span className="text-sm font-normal text-gray-400">/ay</span></p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pro&apos;daki her şey + haftalık aksiyon listesi, Opus içerik üretimi, rakip istihbarat, korelasyon motoru
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/panel/abonelik"
              className="bg-gray-900 text-white rounded-lg px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              Haftalık Takibi Başlat &rarr; Pro
            </Link>
            <button
              onClick={() => {
                const message = generatePdfShareMessage(
                  displayName || "Marka",
                  window.location.href,
                );
                const url = generateWhatsAppShareLink({ text: message });
                window.open(url, "_blank", "noopener");
              }}
              className="flex items-center justify-center gap-2 border border-green-600 text-green-600 rounded-lg px-8 py-3 font-medium hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Raporu WhatsApp&apos;a Gönder
            </button>
            <button
              onClick={() => setShowCallPopup(true)}
              className="border border-gray-300 rounded-lg px-8 py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              Sizi Arayalım
            </button>
          </div>
        </section>
      </div>
    );
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
