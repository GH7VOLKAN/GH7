import Link from "next/link";
import { ROUTE_DESCRIPTIONS } from "@/lib/subscription";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; required?: string }>;
}) {
  const { from, required } = await searchParams;
  const description = from ? ROUTE_DESCRIPTIONS[from] : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🔒</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Bu özellik Pro planında
        </h1>

        <p className="text-gray-500 mb-2">
          {description ?? "Bu özelliğe erişmek için Pro planına geçmeniz gerekiyor."}
        </p>

        <div className="border border-gray-900 rounded-xl p-6 mt-8 text-left">
          <h3 className="text-lg font-bold text-gray-900">Pro</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold text-gray-900">₺2.450</span>
            <span className="text-sm text-gray-500">/ay</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>20 sorgu, haftalık otomatik tarama</li>
            <li>Haftalık aksiyon listesi + çözüm üretimi</li>
            <li>Rakip istihbarat raporu</li>
            <li>İçerik taslakları (Opus)</li>
            <li>Korelasyon motoru</li>
            <li>PDF rapor + WhatsApp özet</li>
          </ul>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/panel/abonelik"
            className="block w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Pro&apos;ya Geç →
          </Link>
          {from && (
            <Link
              href={from}
              className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Geri dön
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
