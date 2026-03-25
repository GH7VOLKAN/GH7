"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DEMO_METRICS,
  DEMO_AI_RESPONSES,
  DEMO_PLATFORM_DISTRIBUTION,
  DEMO_COMPETITORS,
  getScoreColor,
} from "@/data/demo-data";
import {
  DEMO_PERSONAL_KEYWORDS,
  DEMO_PERSONAL_COMPETITORS,
  PERSONAL_PROFESSIONS,
} from "@/data/demo-personal";
import {
  Globe,
  MessageSquare,
  BarChart3,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { TurkeyMap } from "@/components/panel/turkey-map";
import { GH7Logo } from "@/components/gh7-logo";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 0 | 1 | 2 | 3;
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
  "Isitma Sistemleri",
  "Insaat",
  "Saglik",
  "Hukuk",
  "Restoran",
  "Otel",
  "E-ticaret",
  "Diger",
];

const ALL_CITIES = [
  "Istanbul",
  "Ankara",
  "Izmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Mersin",
  "Diyarbakir",
  "Kayseri",
  "Eskisehir",
  "Samsun",
  "Denizli",
  "Malatya",
  "Trabzon",
  "Erzurum",
  "Balikesir",
  "Manisa",
  "Sakarya",
];

const DEFAULT_KEYWORDS = [
  "villa banyosu icin elektrikli yerden isitma sistemleri",
  "yuzey alti boru isitma kablosu secenekleri",
  "endustriyel varil isitma ceketi fiyat karsilastirmasi",
  "serada enerji verimli isitma sistemi onerileri",
  "catida kar buz eritme kablo cozumleri",
  "karbon film yerden isitma avantajlari",
  "elektrikli yerden isitma termostat secimi",
  "boru donma onleme isitma kablosu",
  "sera toprak alti isitma projeleri",
  "endustriyel heat trace kablo sistemleri",
];

const LOADING_STEPS = [
  { text: "Markaniz arastiriliyor...", duration: 1200, icon: Globe },
  { text: "ChatGPT'ye soruyoruz...", duration: 1000, icon: MessageSquare },
  { text: "Gemini'den yanit aliniyor...", duration: 1000, icon: MessageSquare },
  { text: "Perplexity kontrol ediliyor...", duration: 1000, icon: MessageSquare },
  { text: "Claude'a danisiyoruz...", duration: 1000, icon: MessageSquare },
  { text: "Google AI Overview taraniyor...", duration: 1000, icon: MessageSquare },
  { text: "Rakipleriniz tespit ediliyor...", duration: 800, icon: BarChart3 },
  { text: "Raporunuz hazirlaniyor...", duration: 800, icon: FileText },
];

const PLATFORM_SCORES = [
  { name: "ChatGPT", score: 68, color: "#10A37F" },
  { name: "Gemini", score: 72, color: "#8B5CF6" },
  { name: "AI Overview", score: 74, color: "#4285F4" },
  { name: "Perplexity", score: 65, color: "#22D3EE" },
  { name: "Claude", score: 58, color: "#D97706" },
];

const METRIC_CARDS = [
  {
    label: "Ses Payi",
    value: `%${DEMO_METRICS.shareOfVoice}`,
    change: DEMO_METRICS.changes.shareOfVoice,
    description: "AI yanitlarinda pazar payi",
  },
  {
    label: "Kapsam",
    value: `%${DEMO_METRICS.coverage}`,
    change: DEMO_METRICS.changes.coverage,
    description: "Aramalarda gorunme orani",
  },
  {
    label: "Ort. Sira",
    value: DEMO_METRICS.avgPosition.toFixed(1),
    change: DEMO_METRICS.changes.avgPosition,
    description: "Kaynaklarda siralama",
  },
  {
    label: "Algi Skoru",
    value: DEMO_METRICS.sentiment.toFixed(2),
    change: DEMO_METRICS.changes.sentiment,
    description: "Marka algi skoru",
  },
];

const EXTRA_COMPETITORS = [
  { name: "EnerSerji", share: 6, color: "#6B7280" },
  { name: "FirmaMNet", share: 5, color: "#9CA3AF" },
  { name: "HeatTrace TR", share: 4, color: "#D1D5DB" },
  { name: "SenRezistans", share: 3, color: "#E5E7EB" },
];

const DEMO_PLATFORM_RESPONSES = [
  {
    provider: "ChatGPT",
    keyword: "villa banyosu icin elektrikli yerden isitma",
    response:
      "Villa banyolari icin elektrikli yerden isitma sistemleri, ozellikle karbon film ve isitma kablolari olarak iki ana kategoriye ayrilir. Isitmax gibi yerli uretciler, seramik ve dogal tas altina uygun, uzun omurlu cozumler sunmaktadir...",
    sources: ["isitmax.com", "enerserji.com.tr", "warmup.com.tr"],
    brandMentioned: true,
  },
  {
    provider: "Gemini",
    keyword: "endustriyel varil isitma ceketi fiyat",
    response:
      "Endustriyel varil isitma ceketleri, kimya ve gida sektorlerinde sivi sicakligi korumak icin kullanilir. Turkiye pazarinda Isitmax, RezistansMarket ve Danfoss gibi markalar one cikiyor...",
    sources: ["isitmax.com", "rezistansmarket.com", "danfoss.com.tr"],
    brandMentioned: true,
  },
  {
    provider: "AI Overview",
    keyword: "yuzey alti boru isitma kablosu secenekleri",
    response:
      "Yuzey alti boru isitma kablolari; donmayi onlemek (heat trace), sicakligi korumak veya akiskanligi saglamak icin kendinden reguleli veya sabit guclu kablolar olarak ayrilir...",
    sources: ["firmamnet.com", "heattrace.com.tr", "isitmax.com", "senrezistans.com"],
    brandMentioned: true,
  },
  {
    provider: "Perplexity",
    keyword: "serada enerji verimli isitma sistemi",
    response:
      "Seralarda enerji verimli isitma icin toprak alti isitma kablolari, hava ufleyicili sistemler ve hibrit cozumler tercih edilmektedir. Isitmax'in sera isitma kablolari enerji verimli secenekler arasinda yer almaktadir...",
    sources: ["isitmax.com", "tarim.gov.tr", "seracilik.org"],
    brandMentioned: true,
  },
  {
    provider: "Claude",
    keyword: "catida kar buz eritme kablo cozumleri",
    response:
      "Cati ve oluk sistemlerinde kar ve buz birikmesini onlemek icin self-regulating (kendinden ayarli) isitma kablolari kullanilir. Bu kablolar ortam sicakligina gore guc tuketimini otomatik ayarlar...",
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
    { num: 0, label: "Dogrulama" },
    { num: 1, label: "Marka" },
    { num: 2, label: "Arama" },
    { num: 3, label: "Sonuc" },
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
                s.num + 1
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1 hidden sm:block">
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-1 mt-[-12px] sm:mt-[-12px] ${
                s.num < currentStep ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500">GEO Score</span>
        </div>
      </div>
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
          En kisa surede sizi arayalim
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
              <option value="">Saat secin</option>
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
              {["Fiyat bilgisi", "Teknik detay", "Ajans hizmeti"].map((t) => (
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
            Arayin Beni &rarr;
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

export default function AnalizPage() {
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

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [showCallPopup, setShowCallPopup] = useState(false);

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

  const handleSendOtp = async () => {
    if (!formData.email || formData.phone.length < 6) return;
    setOtpLoading(true);
    setOtpError(null);
    try {
      const phone = formData.phone.replace(/\s/g, "");
      const fullPhone = phone.startsWith("90") ? phone : `90${phone}`;
      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error ?? "SMS gonderilemedi. Lutfen tekrar deneyin.");
        return;
      }
      setOtpToken(data.token ?? null);
      setOtpSent(true);
    } catch {
      setOtpError("Bir hata olustu. Lutfen tekrar deneyin.");
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
      const phone = formData.phone.replace(/\s/g, "");
      const fullPhone = phone.startsWith("90") ? phone : `90${phone}`;
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
          data.error ?? "Kod dogrulanamadi. Lutfen tekrar deneyin."
        );
        return;
      }
      setStep(1);
    } catch {
      setOtpError("Dogrulama sirasinda bir hata olustu.");
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
    } else {
      if (!formData.fullName || !formData.profession || formData.cities.length === 0)
        return;
    }
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

  const allCompetitors = isFirma
    ? [...DEMO_COMPETITORS, ...EXTRA_COMPETITORS]
    : DEMO_PERSONAL_COMPETITORS.map((c, i) => ({
        ...c,
        color: ["#18181B", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB"][i] ?? "#F3F4F6",
      }));

  /* ---- render helpers ---- */

  const renderHero = () => (
    <div className="flex flex-col items-center text-center px-4 pt-12 sm:pt-20 pb-16">
      <Logo />

      <h1 className="mt-10 text-4xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
        Yapay Zeka Seni Taniyor mu?
      </h1>

      <p className="mt-4 text-lg text-gray-500 max-w-lg">
        ChatGPT, Gemini ve AI Overview&apos;da gorunurlugunuzu 60 saniyede
        ogrenin
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
            Firmami Test Et
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
            Kendi Adimi Test Et
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
            placeholder={isFirma ? "firmaniz.com" : "Ad Soyad"}
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
          Ucretsiz Analiz Et
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-400">
        5 dakikadan kisa &middot; Kredi karti gerekmez
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
          Dogrulama
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Analiz sonuclarinizi gonderebilmemiz icin bilgilerinizi dogrulayin.
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
              {otpLoading ? "Gonderiliyor..." : "SMS Kodu Gonder"}
            </button>
          )}

          {/* OTP Input */}
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dogrulama Kodu
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
              Analiz sonuclarimin WhatsApp ile gonderilmesini kabul ediyorum
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
              {otpLoading ? "Dogrulaniyor..." : "Dogrula ve Devam Et"}
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
          {isFirma ? "Marka Bilgileri" : "Kisisel Bilgiler"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isFirma
            ? "AI aramasini kisislestirmek icin marka bilgilerinizi girin."
            : "AI aramasini kisislestirmek icin bilgilerinizi girin."}
        </p>

        <div className="space-y-4">
          {isFirma ? (
            <>
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka Adi
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
                  Sektor
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Sektor secin</option>
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
                  Uzmanlik alani
                </label>
                <select
                  value={formData.profession}
                  onChange={(e) => updateField("profession", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Uzmanlik secin</option>
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
              {isFirma ? "Hizmet Verilen Iller" : "Faaliyet gosterilen iller"}{" "}
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

  const renderStep2 = () => {
    const platforms = [
      { name: "ChatGPT" },
      { name: "Gemini" },
      { name: "AI Overview" },
      { name: "Perplexity" },
      { name: "Claude" },
    ];

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={2} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Arama Onayi
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            AI otomatik 10 arama onerdi. Dilediginizi duzenleyebilirsiniz.
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
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Analizi Baslat &rarr;
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
    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <StepIndicator currentStep={3} />

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {displayName} Analiz Sonuclari
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            5 platform uzerinden analiz tamamlandi
          </p>
        </div>

        {/* GEO Score */}
        <div className="flex justify-center mb-10">
          <div className="border border-gray-200 rounded-xl p-8 inline-flex flex-col items-center">
            <ScoreGauge score={DEMO_METRICS.geoScore} />
            <p className="text-sm text-gray-500 mt-3">
              Genel AI Gorunurluk Skoru
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map((m) => (
            <div
              key={m.label}
              className="border border-gray-200 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.change > 0 ? (
                  <span className="text-xs text-green-600">+{m.change}</span>
                ) : m.change < 0 ? (
                  <span className="text-xs text-red-500">{m.change}</span>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
                <span className="text-xs text-gray-400">{m.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 5 Platform Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {PLATFORM_SCORES.map((p) => (
            <div
              key={p.name}
              className="border border-gray-200 rounded-xl p-4 text-center"
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ backgroundColor: `${p.color}20` }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: p.color }}
                >
                  {p.name.charAt(0)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{p.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {p.score}
              </p>
              <p className="text-xs text-gray-400">GEO Score</p>
            </div>
          ))}
        </div>

        {/* Turkey Map */}
        <div className="mb-8 border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Secilen Illerde Gorunurluk
          </h3>
          <TurkeyMap
            cityData={Object.fromEntries([
              ...formData.cities.map((city) => [
                city,
                { score: 75, status: "strong" },
              ]),
              ...ALL_CITIES.filter((c) => !formData.cities.includes(c)).map(
                (city) => [city, { score: 0, status: "not-tracked" }]
              ),
            ])}
            className="max-h-[250px]"
          />
        </div>

        {/* Competitor Detection */}
        <div className="border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {isFirma ? "Rakip Tespiti" : "Meslektaslarinizla Kiyaslama"}
          </h3>
          <div className="space-y-3">
            {allCompetitors.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-40 truncate">
                  {c.name}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.share * 2}%`,
                      backgroundColor:
                        "color" in c ? (c as { color: string }).color : "#6B7280",
                      maxWidth: "100%",
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">
                  %{c.share}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Example AI Responses — one per platform */}
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-medium text-gray-900">
            Platform Yanitlari
          </h3>
          {DEMO_PLATFORM_RESPONSES.map((resp, idx) => {
            const platformColor =
              PLATFORM_SCORES.find((p) => p.name === resp.provider)?.color ??
              "#6B7280";
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${platformColor}20` }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: platformColor }}
                    >
                      {resp.provider.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {resp.provider}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  &quot;{resp.keyword}&quot;
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {resp.response}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {resp.sources.map((src, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-full ${
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
                {resp.brandMentioned && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs text-green-700 font-medium">
                      {isFirma
                        ? "Markaniz bu yanitta referans gosterildi"
                        : "Isminiz bu yanitta gecti"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Kisisel extra sections */}
        {!isFirma && (
          <>
            {/* AI sizi nasil tanimliyor */}
            <div className="border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                AI sizi nasil tanimliyor
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {formData.fullName}, {formData.profession} alaninda faaliyet
                gosteren bir uzman olarak tanimlanmaktadir.{" "}
                {formData.cities.length > 0 &&
                  `${formData.cities.join(", ")} bolgesinde aktif olarak gorunmektedir.`}{" "}
                AI platformlari genel olarak olumlu bir profil cizmekte,
                ancak dijital icerik uretimi arttirilarak gorunurluk
                iyilestirilebilir.
              </p>
            </div>

            {/* Dijital iz analizi */}
            <div className="border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Dijital iz analizi
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "LinkedIn",
                    found: !!formData.linkedinUrl,
                  },
                  { label: "Web Sitesi", found: false },
                  { label: "Haberler", found: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.found ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {item.found ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <span
                      className={`text-xs font-medium ${
                        item.found ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {item.found ? "Bulundu" : "Bulunamadi"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Platform Traffic Bar */}
        <div className="border border-gray-200 rounded-xl p-6 mb-8">
          <p className="text-sm font-medium text-gray-900 mb-4">
            Platform Trafik Dagilimi
          </p>
          <div className="flex h-6 rounded-full overflow-hidden">
            {DEMO_PLATFORM_DISTRIBUTION.map((p) => (
              <div
                key={p.name}
                style={{ width: `${p.share}%`, backgroundColor: p.color }}
                className="relative group"
                title={`${p.name}: %${p.share}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {DEMO_PLATFORM_DISTRIBUTION.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-xs text-gray-500">
                  {p.name} %{p.share}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro CTA */}
        <div className="border border-gray-200 rounded-xl p-8 text-center mt-12">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Bu anlik bir fotograf.
          </p>
          <p className="text-sm text-gray-500 mb-1">
            Yapay zeka yanitlari her hafta degisiyor.
          </p>
          <p className="text-sm text-gray-500 mb-1">
            Haftalik otomatik takip ile degisimleri kacirmayin.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Rakipleriniz ilerlerse aninda haberiniz olsun.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/giris"
              className="bg-gray-900 text-white rounded-lg px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              Haftalik Takibi Baslat &rarr; Pro &#8378;2.495/ay
            </Link>
            <button
              onClick={() => setShowCallPopup(true)}
              className="border border-gray-300 rounded-lg px-8 py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              Sizi Arayalim
            </button>
          </div>
          <button className="mt-4 text-sm text-gray-500 hover:text-gray-700">
            Raporu WhatsApp&apos;a gonder
          </button>
        </div>
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
