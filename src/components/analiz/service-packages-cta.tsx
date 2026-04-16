"use client";

import Link from "next/link";
import { Wrench, TrendingUp, Crown } from "lucide-react";

interface Props {
  userType: "firma" | "kisi" | "eticaret" | "yurtdisi";
  currentScore: number;
}

const PACKAGES = [
  {
    tier: "temel",
    label: "Temel",
    price: 4999,
    icon: Wrench,
    color: "border-gray-200",
    bgColor: "bg-white",
    description: "Temel GEO altyapısı",
  },
  {
    tier: "buyume",
    label: "Büyüme",
    price: 9999,
    icon: TrendingUp,
    color: "border-blue-300 ring-2 ring-blue-100",
    bgColor: "bg-blue-50/30",
    description: "İçerik + Entity sinyalleri",
    popular: true,
  },
  {
    tier: "hakimiyet",
    label: "Hakimiyet",
    price: 19999,
    icon: Crown,
    color: "border-amber-300",
    bgColor: "bg-amber-50/30",
    description: "Sektörel lider konumu",
  },
];

const TIER_BOOST: Record<string, number> = {
  temel: 15,
  buyume: 30,
  hakimiyet: 55,
};

export function ServicePackagesCTA({ userType, currentScore }: Props) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-amber-50/30 to-white">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Kırmızıları biz yeşile çevirelim
        </h3>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          Audit'te tespit edilen sorunları uzman ekibimiz sizin yerinize çözsün.
          Önce gör, sonra öde.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          const boost = TIER_BOOST[pkg.tier];
          const projectedScore = Math.min(100, currentScore + boost);

          return (
            <div
              key={pkg.tier}
              className={`relative border ${pkg.color} ${pkg.bgColor} rounded-xl p-5`}
            >
              {pkg.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  EN POPÜLER
                </span>
              )}
              <Icon className="w-6 h-6 text-gray-700 mb-3" />
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {pkg.label}
              </h4>
              <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>
              <div className="text-2xl font-bold text-gray-900 mb-3">
                ₺{pkg.price.toLocaleString("tr-TR")}
              </div>
              <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Mevcut skor:</span>
                  <span className="font-semibold">{currentScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-green-700">
                  <span>Sonra:</span>
                  <span className="font-bold">↑ {projectedScore}/100 (+{boost})</span>
                </div>
              </div>
              <Link
                href={`/panel/hizmetler?userType=${userType}&tier=${pkg.tier}`}
                className="block w-full text-center bg-gray-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Detayları Gör
              </Link>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        💳 Önce iş yapılır, sonuç görüldükten sonra ödenir. 72 saat itiraz hakkı.
      </p>
    </div>
  );
}
