import Link from "next/link";

export function PageBottomCTA() {
  return (
    <div className="border-t border-gray-100 mt-16 pt-8 pb-8">
      <div className="bg-gray-50 rounded-xl p-6 md:p-8 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Bu anlık bir fotoğraf. Yapay zeka yanıtları her hafta değişiyor.
        </p>
        <p className="text-base font-semibold text-gray-900 mb-6">
          Haftalık takip + çözüm üretimi ile değişimleri kaçırmayın.
        </p>
        <Link
          href="/panel/abonelik"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Pro&apos;ya Geç — ₺2.450/ay →
        </Link>
        <p className="mt-3 text-xs text-gray-400">
          20 sorgu · 5 platform · Haftalık tarama · Çözüm üretimi · İptal her zaman mümkün
        </p>
      </div>
    </div>
  );
}
