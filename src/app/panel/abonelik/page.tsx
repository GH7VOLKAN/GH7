"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, ArrowRight } from "lucide-react";

type PlanName = "Free" | "Pro" | "Business" | "Ajans";

interface Plan {
  name: PlanName;
  price: string;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "₺0",
    period: "/ay",
    description: "Başlangıç için ideal",
    features: [
      "1 marka",
      "5 arama takibi",
      "1 platform (AI Overview)",
      "3 il takibi",
      "Haftalık rapor",
      "Temel GEO skoru",
    ],
  },
  {
    name: "Pro",
    price: "₺2.495",
    period: "/ay",
    description: "Büyüyen markalar için",
    popular: true,
    features: [
      "1 marka",
      "50 arama takibi",
      "5 platform",
      "81 il takibi",
      "Günlük rapor + PDF",
      "Rakip analizi",
      "İyileştirme önerileri",
      "Keyword keşif",
      "API erişimi",
      "WhatsApp bildirimleri",
    ],
  },
  {
    name: "Business",
    price: "₺4.995",
    period: "/ay",
    description: "Pro + aksiyon araçları",
    features: [
      "3 proje (karma kombinasyon)",
      "Sınırsız sorgu + ürün + pazar",
      "6 AI platformu + 10 il + günlük analiz",
      "Haftalık aksiyon listesi",
      "Opus içerik üretimi (hazır blog taslağı)",
      "Rakip istihbarat",
      "Korelasyon motoru",
      "API erişimi",
    ],
  },
  {
    name: "Ajans",
    price: "₺19.995",
    period: "/ay",
    description: "Ajanslar ve danışmanlar için",
    features: [
      "25 marka",
      "Sınırsız arama",
      "6 platform",
      "81 il takibi",
      "White-label raporlama",
      "RaaS gelir paylaşımı",
      "Müşteri yönetim paneli",
      "Toplu tarama",
      "SLA destekleri",
      "Özel entegrasyonlar",
    ],
  },
];

// Map plan names to the API plan slugs
const PLAN_API_SLUG: Record<string, string> = {
  Pro: "pro",
  Business: "business",
  Ajans: "agency",
};

export default function AbonelikPage() {
  // In a real app, currentPlan would come from user profile/session
  const [currentPlan] = useState<PlanName>("Free");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  function canUpgrade(planName: PlanName): boolean {
    const order: PlanName[] = ["Free", "Pro", "Business", "Ajans"];
    return order.indexOf(planName) > order.indexOf(currentPlan);
  }

  function getButtonLabel(planName: PlanName): string {
    if (planName === currentPlan) return "Mevcut Plan";
    if (planName === "Ajans") return "İletişime Geçin";
    if (currentPlan === "Free") return `${planName}'ya Geç`;
    return `${planName}'a Yükselt`;
  }

  async function handleCheckout(planName: PlanName) {
    const slug = PLAN_API_SLUG[planName];
    if (!slug) return;

    setCheckoutLoading(planName);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: slug, period: "monthly" }),
      });
      const data = await res.json();
      if (data.checkoutFormContent) {
        // Iyzico returns an HTML form — render it in a new page/iframe
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(data.checkoutFormContent);
          w.document.close();
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert("Ödeme başlatılamadı. Lütfen tekrar deneyin.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Abonelik</h1>
        <p className="text-sm text-gray-500 mt-1">
          Planınızı yönetin ve ihtiyaçlarınıza en uygun paketi seçin
        </p>
      </div>

      {/* Current Plan */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Mevcut planınız</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {currentPlan}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentPlan === "Free" && "5 arama · 1 platform · 3 il"}
              {currentPlan === "Pro" && "50 arama · 5 platform · 81 il"}
              {currentPlan === "Business" &&
                "Sınırsız sorgu · 6 platform · 10 il"}
              {currentPlan === "Ajans" && "25 marka · Sınırsız arama · 81 il"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {currentPlan !== "Free" && (
              <button
                onClick={() => {
                  window.location.href = "mailto:info@gh7.ai?subject=Abonelik%20İptal";
                }}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                İptal Et
              </button>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const isUpgrade = canUpgrade(plan.name);

          return (
            <div
              key={plan.name}
              className={`border rounded-xl p-6 relative hover:shadow-sm transition-shadow ${
                plan.popular
                  ? "border-gray-900 ring-1 ring-gray-900"
                  : isCurrent
                    ? "border-green-300 bg-green-50/30"
                    : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Popüler
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Aktif
                </span>
              )}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed"
                >
                  Mevcut Plan
                </button>
              ) : plan.name === "Ajans" ? (
                <button
                  onClick={() => {
                    window.location.href = "mailto:info@gh7.ai";
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  İletişime Geçin
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={checkoutLoading === plan.name}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {checkoutLoading === plan.name
                    ? "Yükleniyor..."
                    : getButtonLabel(plan.name)}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Mevcut planınızda dahil
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Ajans Paketleri Link */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              Tek seferlik hizmetler
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Aylık abonelik yerine tek seferlik GEO hizmet paketleri
            </p>
          </div>
          <Link
            href="/panel/ajans-paketleri"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Paketlere Git
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
        <h3 className="font-medium text-gray-900 mb-4">
          Sık Sorulan Sorular
        </h3>
        <div className="space-y-4">
          {[
            {
              q: "Plan değiştirdiğimde ne olur?",
              a: "Yeni plan anında aktif olur. Mevcut dönem sonuna kadar kalan süre kıst hesaplanır.",
            },
            {
              q: "İptal edebilir miyim?",
              a: "Evet, istediğiniz zaman iptal edebilirsiniz. Mevcut dönem sonuna kadar erişiminiz devam eder.",
            },
            {
              q: "Ajans planı nasıl çalışır?",
              a: "Ajans planı ile müşterilerinizin GEO performansını tek panelden yönetirsiniz. RaaS gelir paylaşımı ile ek gelir elde edersiniz.",
            },
          ].map((faq) => (
            <div key={faq.q}>
              <p className="text-sm font-medium text-gray-900">{faq.q}</p>
              <p className="text-sm text-gray-500 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
