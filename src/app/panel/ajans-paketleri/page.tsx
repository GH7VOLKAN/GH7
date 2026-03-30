"use client";

import Link from "next/link";
import { PageBottomCTA } from "@/components/panel/page-bottom-cta";
import { PageHero } from "@/components/panel/page-hero";
import { AJANS_PAKETLERI } from "@/data/ajans-paketleri";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR").format(price);
}

export default function AjansPaketleriPage() {
  return (
    <>
    <PageHero
      title="Ajans Paketleri"
      description="Tek seferlik GEO optimizasyon hizmetleri"
      stats={[
        { label: "Paket Sayısı", value: String(AJANS_PAKETLERI.length) },
        { label: "En Düşük Fiyat", value: "₺990" },
        { label: "En Popüler", value: "İçerik Opt." },
      ]}
    />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          GEO Ajans Paketleri
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Tek seferlik hizmetler — aylık abonelik yok
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {AJANS_PAKETLERI.map((pkg) => (
          <div
            key={pkg.id}
            className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col"
          >
            <h3 className="text-sm font-bold text-gray-900">{pkg.title}</h3>
            <p className="text-sm text-gray-500 mt-2 flex-1">
              {pkg.shortDesc}
            </p>
            <div className="mt-4">
              <p className="text-lg font-bold text-gray-900">
                &#8378;{formatPrice(pkg.price)}
              </p>
              <Link
                href={`/panel/ajans-paketleri/${pkg.id}`}
                className="mt-3 block w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center"
              >
                Paketi İncele
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Package CTA */}
      <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 text-center mb-12">
        <h3 className="text-lg font-bold text-gray-900">
          Özel paket mi istiyorsunuz?
        </h3>
        <p className="text-sm text-gray-500 mt-2">
          İhtiyacınıza özel bir paket oluşturalım. Bizi arayın.
        </p>
        <p className="text-lg font-bold text-gray-900 mt-3">
          0850 XXX XX XX
        </p>
      </div>

      <PageBottomCTA />
    </div>
    </>
  );
}
