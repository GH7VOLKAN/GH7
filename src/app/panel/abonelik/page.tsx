"use client";

import { CheckIcon } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₺0",
    period: "/ay",
    description: "Başlangıç için ideal",
    current: true,
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
    price: "₺999",
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
    price: "₺2.999",
    period: "/ay",
    description: "Kurumsal markalar için",
    features: [
      "5 marka",
      "200 arama takibi",
      "6 platform",
      "81 il takibi",
      "Saatlik tarama",
      "Gelişmiş rakip analizi",
      "Ajans entegrasyonu",
      "Özel raporlama",
      "Öncelikli destek",
      "Webhook & API",
    ],
  },
  {
    name: "Ajans",
    price: "₺7.999",
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

export default function AbonelikPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Abonelik</h1>
        <p className="text-sm text-gray-500 mt-1">
          Planınızı yönetin ve ihtiyaçlarınıza en uygun paketi seçin
        </p>
      </div>

      {/* Current Plan */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Mevcut planınız</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">Free</p>
            <p className="text-xs text-gray-500 mt-1">5 arama · 1 platform · 3 il</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
            Aktif
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-xl p-6 relative ${
              plan.popular
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
                Popüler
              </span>
            )}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500">{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.current ? (
              <button
                disabled
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                Mevcut Plan
              </button>
            ) : (
              <button
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.name === "Ajans" ? "İletişime Geçin" : "Planı Seç"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-4">Sık Sorulan Sorular</h3>
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
