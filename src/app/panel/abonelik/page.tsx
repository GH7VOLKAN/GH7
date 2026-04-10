"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { PageHero } from "@/components/panel/page-hero";

const PLANS = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "tek seferlik",
    description: "Tam analiz — 5 platform, 10 sorgu, blur yok",
    popular: false,
    features: [
      "5 AI platformu taraması",
      "10 sorgu analizi",
      "Rakip karşılaştırma",
      "Ses payı, pozisyon, algı skoru",
      "AI yanıtları tam metin",
      "Kritik sorunlar listesi",
    ],
    cta: "Mevcut Planınız",
    ctaDisabled: true,
  },
  {
    name: "Pro",
    price: "₺2.450",
    period: "/ay",
    description: "Haftalık takip + çözüm üretimi + rakip istihbarat",
    popular: true,
    features: [
      "Ücretsiz'deki her şey",
      "20 sorgu, haftalık otomatik tarama",
      "Haftalık aksiyon listesi",
      "İçerik taslakları (Opus)",
      "Rakip istihbarat raporu",
      "Yaptım → doğrulandı kontrolü",
      "Trend grafikleri + korelasyon",
      "PDF rapor + WhatsApp özet",
      "E-posta bildirimleri",
    ],
    cta: "Pro'ya Geç",
    ctaDisabled: false,
  },
];

export default function AbonelikPage() {
  return (
    <>
      <PageHero
        title="Abonelik"
        description="Planınızı yönetin ve Pro'ya geçin."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 relative ${
                plan.popular
                  ? "border-gray-900 ring-1 ring-gray-900"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Önerilen
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckIcon className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.ctaDisabled ? (
                  <span className="block w-full text-center py-3 rounded-lg bg-gray-100 text-gray-400 text-sm font-semibold">
                    {plan.cta}
                  </span>
                ) : (
                  <Link
                    href="/api/payment/checkout?plan=pro"
                    className="block w-full text-center py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {plan.cta} →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          İstediğiniz zaman iptal edebilirsiniz. Sorularınız için info@gh7.ai
        </div>
      </div>
    </>
  );
}
