"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DEMO_METRICS,
  DEMO_AI_RESPONSES,
  DEMO_PLATFORM_DISTRIBUTION,
  getScoreColor,
} from "@/data/demo-data";
import { Globe, MessageSquare, BarChart3, FileText, CheckCircle } from "lucide-react";
import { TurkeyMap } from "@/components/panel/turkey-map";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Step = 0 | 1 | 2 | 3;

interface FormData {
  domain: string;
  email: string;
  phone: string;
  otp: string;
  kvkkAccepted: boolean;
  brandName: string;
  websiteUrl: string;
  sector: string;
  cities: string[];
  keywords: string[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SECTORS = [
  "Isıtma Sistemleri",
  "İnşaat",
  "Sağlık",
  "Hukuk",
  "Restoran",
  "Otel",
  "E-ticaret",
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
  "Diyarbakir",
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
  "villa banyosu için elektrikli yerden isitma sistemleri",
  "yuzey alti boru isitma kablosu secenekleri",
  "endustriyel varil isitma ceketi fiyat karşılaştırmasi",
  "serada enerji verimli isitma sistemi onerileri",
  "catida kar buz eritme kablo cozumleri",
];

const LOADING_STEPS = [
  { text: "Markanız araştırılıyor...", duration: 2000, icon: Globe },
  { text: "AI Overview'e soruyoruz...", duration: 2000, icon: MessageSquare },
  { text: "Rakipleriniz tespit ediliyor...", duration: 2000, icon: BarChart3 },
  { text: "Raporunuz hazırlanıyor...", duration: 1000, icon: FileText },
];

const METRIC_CARDS = [
  {
    label: "Share of Voice",
    value: `%${DEMO_METRICS.shareOfVoice}`,
    change: DEMO_METRICS.changes.shareOfVoice,
    description: "AI yanıtlarında pazar payı",
  },
  {
    label: "Coverage",
    value: `%${DEMO_METRICS.coverage}`,
    change: DEMO_METRICS.changes.coverage,
    description: "Aramalarda görünme oranı",
  },
  {
    label: "Ort. Pozisyon",
    value: DEMO_METRICS.avgPosition.toFixed(1),
    change: DEMO_METRICS.changes.avgPosition,
    description: "Kaynaklarda sıralama",
  },
  {
    label: "Sentiment",
    value: DEMO_METRICS.sentiment.toFixed(2),
    change: DEMO_METRICS.changes.sentiment,
    description: "Marka algı skoru",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-bold">G7</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">GH7.ai</span>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 0, label: "Doğrulama" },
    { num: 1, label: "Marka" },
    { num: 2, label: "Arama" },
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

function MiniMap({ selectedCities }: { selectedCities: string[] }) {
  const cityPositions: Record<string, { x: number; y: number }> = {
    Istanbul: { x: 28, y: 22 },
    Ankara: { x: 48, y: 32 },
    Izmir: { x: 18, y: 42 },
    Bursa: { x: 28, y: 30 },
    Antalya: { x: 35, y: 55 },
    Adana: { x: 55, y: 52 },
    Konya: { x: 45, y: 45 },
    Gaziantep: { x: 62, y: 50 },
    Trabzon: { x: 70, y: 18 },
    Erzurum: { x: 78, y: 25 },
    Balikesir: { x: 20, y: 28 },
    Samsun: { x: 58, y: 16 },
    Diyarbakir: { x: 72, y: 40 },
    Mersin: { x: 50, y: 55 },
    Eskisehir: { x: 38, y: 32 },
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Seçilen İllerde Görünürlük
      </h3>
      <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden">
        {/* Simple Turkey outline approximation */}
        <div className="absolute inset-2 border-2 border-gray-200 rounded-lg" />
        {Object.entries(cityPositions).map(([city, pos]) => {
          const isSelected = selectedCities.includes(city);
          return (
            <div
              key={city}
              className="absolute flex flex-col items-center"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isSelected
                    ? "bg-gray-900 ring-2 ring-gray-900/20"
                    : "bg-gray-300"
                }`}
              />
              {isSelected && (
                <span className="text-[10px] font-medium text-gray-700 mt-0.5 whitespace-nowrap">
                  {city}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LockedSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative border border-gray-200 rounded-xl p-6 overflow-hidden">
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700 text-center px-4">
          {title}
        </p>
        <Link
          href="/giris"
          className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Pro ile ac
        </Link>
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
    domain: "",
    email: "",
    phone: "+90",
    otp: "",
    kvkkAccepted: false,
    brandName: "",
    websiteUrl: "",
    sector: "",
    cities: [],
    keywords: [...DEFAULT_KEYWORDS],
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);

  /* ---- helpers ---- */
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDomainSubmit = () => {
    if (!formData.domain.trim()) return;
    const domain = formData.domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const brandGuess = domain.split(".")[0];
    setFormData((prev) => ({
      ...prev,
      domain,
      brandName: brandGuess.charAt(0).toUpperCase() + brandGuess.slice(1),
      websiteUrl: `https://${domain}`,
    }));
    setStep(0);
  };

  const handleSendOtp = () => {
    if (!formData.email || formData.phone.length < 6) return;
    setOtpSent(true);
  };

  const handleVerify = () => {
    if (!formData.otp || formData.otp.length < 6 || !formData.kvkkAccepted) return;
    setStep(1);
  };

  const handleStep1Next = () => {
    if (!formData.brandName || !formData.sector || formData.cities.length === 0) return;
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
    const domain = formData.domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (domain.includes(".")) {
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    } else {
      setFaviconUrl(null);
    }
  }, [formData.domain]);

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

  /* ---- render helpers ---- */

  const renderHero = () => (
    <div className="flex flex-col items-center text-center px-4 pt-12 sm:pt-20 pb-16">
      <Logo />

      <h1 className="mt-10 text-4xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
        Yapay Zeka Seni Tanıyor mu?
      </h1>

      <p className="mt-4 text-lg text-gray-500 max-w-lg">
        ChatGPT, Gemini ve AI Overview&apos;da markanızın görünürlüğünü 60 saniyede öğrenin
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
          {faviconUrl && (
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
            placeholder="ornek.com"
            value={formData.domain}
            onChange={(e) => updateField("domain", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDomainSubmit()}
            className="flex-1 text-base focus:outline-none bg-transparent"
          />
        </div>
        <button
          onClick={handleDomainSubmit}
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
          <span className="font-semibold text-gray-700">1.000+</span> firma analiz
          edildi
        </span>
      </div>
    </div>
  );

  const renderStep0 = () => (
    <div className="max-w-md mx-auto px-4">
      <StepIndicator currentStep={0} />

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Doğrulama</h2>
        <p className="text-sm text-gray-500 mb-6">
          Analiz sonuçlarınızi gönderebilmemiz için bilgilerinizi doğrulayın.
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
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              SMS Kodu Gönder
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
                  updateField("otp", e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
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
              Analiz sonuçlarimin WhatsApp ile gönderilmesini kabul ediyorum
            </span>
          </label>

          {/* Verify */}
          {otpSent && (
            <button
              onClick={handleVerify}
              disabled={
                !formData.otp ||
                formData.otp.length < 6 ||
                !formData.kvkkAccepted
              }
              className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Doğrula ve Devam Et
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
          Marka Bilgileri
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          AI aramasini kisisellestirmek için marka bilgilerinizi girin.
        </p>

        <div className="space-y-4">
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

          {/* Cities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hizmet Verilen İller{" "}
              <span className="text-gray-400 font-normal">(maks. 3)</span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_CITIES.map((city) => {
                const isSelected = formData.cities.includes(city);
                const isDisabled =
                  !isSelected && formData.cities.length >= 3;
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
              !formData.brandName ||
              !formData.sector ||
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
      { name: "AI Overview", locked: false },
      { name: "ChatGPT", locked: true },
      { name: "Gemini", locked: true },
      { name: "Perplexity", locked: true },
      { name: "Claude", locked: true },
      { name: "Copilot", locked: true },
    ];

    return (
      <div className="max-w-md mx-auto px-4">
        <StepIndicator currentStep={2} />

        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Arama Onayı
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            AI otomatik 5 arama önerdi. Dilediginizi düzenleyebilirsiniz.
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

          {/* Platforms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    p.locked
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  {p.name}
                  {p.locked && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  )}
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
    const exampleResponse = DEMO_AI_RESPONSES[0];

    return (
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <StepIndicator currentStep={3} />

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {formData.brandName} Analiz Sonuçları
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            AI Overview üzerinden analiz tamamlandı
          </p>
        </div>

        {/* GEO Score */}
        <div className="flex justify-center mb-10">
          <div className="border border-gray-200 rounded-xl p-8 inline-flex flex-col items-center">
            <ScoreGauge score={DEMO_METRICS.geoScore} />
            <p className="text-sm text-gray-500 mt-3">
              Genel AI Görünürlük Skoru
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
                  <span className="text-xs text-green-600">
                    +{m.change}
                  </span>
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

        {/* Map */}
        <div className="mb-8 border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Seçilen İllerde Görünürlük
          </h3>
          <TurkeyMap
            cityData={Object.fromEntries([
              ...formData.cities.map((city) => [city, { score: 75, status: "strong" }]),
              ...ALL_CITIES.filter((c) => !formData.cities.includes(c)).map((city) => [
                city,
                { score: 0, status: "not-tracked" },
              ]),
            ])}
            className="max-h-[250px]"
          />
        </div>

        {/* Example AI Response */}
        <div className="border border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">G</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {exampleResponse.provider}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            &quot;{exampleResponse.keyword}&quot;
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {exampleResponse.response}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {exampleResponse.sources.map((src, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  src.includes(formData.domain.split(".")[0].toLowerCase()) ||
                  src === "isitmax.com"
                    ? "bg-green-50 text-green-700 font-medium"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {src}
              </span>
            ))}
          </div>
          {exampleResponse.brandMentioned && (
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
                Markanız bu yantta referans gösterildi
              </span>
            </div>
          )}
        </div>

        {/* Locked: Other platforms */}
        <div className="mb-8">
          <LockedSection title="ChatGPT, Gemini, Perplexity, Claude, Copilot sonuçlarınız">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["ChatGPT", "Gemini", "Perplexity", "Claude", "Copilot"].map(
                (p) => (
                  <div key={p} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">{p}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {Math.floor(Math.random() * 40 + 30)}
                    </p>
                    <p className="text-xs text-gray-400">GEO Score</p>
                  </div>
                )
              )}
            </div>
          </LockedSection>
        </div>

        {/* Locked: Full map */}
        <div className="mb-8">
          <LockedSection title="Tüm 81 ilde görünürlüğünüz">
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-9 gap-1">
                {Array.from({ length: 81 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      i % 5 === 0
                        ? "bg-green-400"
                        : i % 3 === 0
                        ? "bg-yellow-400"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </LockedSection>
        </div>

        {/* Platform Traffic Bar */}
        <div className="border border-gray-200 rounded-xl p-6 mb-8">
          <p className="text-sm font-medium text-gray-900 mb-4">
            Google AI Overview sonuçlarınızı gördünüz &mdash; ama kullanıcıların
            %35&apos;i diğer AI platformlarını kullanıyor
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

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/giris"
            className="bg-gray-900 text-white rounded-lg px-8 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Takibi başlat &rarr;
          </Link>
          <button className="border border-gray-300 text-gray-700 rounded-lg px-8 py-3 text-base font-medium hover:bg-gray-50 transition-colors">
            Raporu WhatsApp&apos;a gönder
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
    </div>
  );
}
