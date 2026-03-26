import Link from "next/link";
import {
  TIER_LABELS,
  ROUTE_DESCRIPTIONS,
  type SubscriptionTier,
} from "@/lib/subscription";

interface UpgradePageProps {
  searchParams: Promise<{ from?: string; required?: string }>;
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const from = params.from ?? "/panel/genel";
  const required = (params.required ?? "pro") as SubscriptionTier;

  const tierLabel = TIER_LABELS[required] ?? "Pro";
  const featureDescription =
    ROUTE_DESCRIPTIONS[from] ?? "Bu gelişmiş özellik";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
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
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bu özellik {tierLabel} planında kullanılabilir
        </h1>
        <p className="text-sm text-gray-500 mb-8">{featureDescription}</p>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Pro Card */}
          <div
            className={`border rounded-xl p-6 text-left ${
              required === "pro"
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-bold text-gray-900">Pro</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">
                &#8378;2.495
              </span>
              <span className="text-sm text-gray-500">/ay</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                50 arama takibi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                Haftalık ve aylık raporlar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                Trend analizi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                PDF export
              </li>
            </ul>
          </div>

          {/* Business Card */}
          <div
            className={`border rounded-xl p-6 text-left ${
              required === "business"
                ? "border-gray-900 ring-1 ring-gray-900"
                : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-bold text-gray-900">Business</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">
                &#8378;4.995
              </span>
              <span className="text-sm text-gray-500">/ay</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                Pro planın tüm özellikleri
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                Aksiyon planları
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                Rakip istihbaratı
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">&#10003;</span>
                3 marka takibi
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/panel/abonelik"
            className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors text-center"
          >
            Şimdi Yükselt
          </Link>
          <Link
            href={from}
            className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Geri Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
