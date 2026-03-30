"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, XIcon } from "lucide-react";
import { AJANS_PAKETLERI } from "@/data/ajans-paketleri";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR").format(price);
}

export default function PaketDetayPage() {
  const params = useParams();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paket = AJANS_PAKETLERI.find((p) => p.id === params.paketId);

  if (!paket) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">Paket bulunamadı</h1>
        <Link
          href="/panel/ajans-paketleri"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-gray-900 underline"
        >
          Paketlere Dön
        </Link>
      </div>
    );
  }

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/ajans-paket-satin-al", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paketId: paket!.id, notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bir hata oluştu.");
        return;
      }
      setSuccess(true);
      setShowConfirm(false);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/panel/ajans-paketleri"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri Dön
      </Link>

      {/* Title + Price */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{paket.title}</h1>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          &#8378;{formatPrice(paket.price)}
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Süre: {paket.duration}</span>
        </div>
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none mb-8">
        <p className="text-gray-600 leading-relaxed">{paket.longDesc}</p>
        <p className="text-gray-600 leading-relaxed mt-3">
          Bu paket, GEO (Generative Engine Optimization) stratejinizin temel
          yapı taşlarından biridir. AI motorlarının markanızı daha iyi
          tanımasını ve önerme oranınızın artmasını sağlar.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          Çalışma tamamlandığında detaylı bir teslim raporu sunulur. Raporda
          yapılan değişiklikler, öncesi-sonrası karşılaştırması ve gelecek
          adımlar için öneriler yer alır.
        </p>
      </div>

      {/* Checklist */}
      <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Ne Yapılacak?
        </h2>
        <ul className="space-y-3">
          {paket.checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Buy button */}
      <div className="mb-8">
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full px-6 py-3.5 bg-gray-900 text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Satın Al &mdash; &#8378;{formatPrice(paket.price)}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-6 mb-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-green-800">
            Talebiniz alındı. 24 saat içinde sizinle iletişime geçeceğiz.
          </p>
        </div>
      )}

      {/* FAQ */}
      {paket.faq.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {paket.faq.map((item, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-gray-900">{item.q}</p>
                <p className="text-sm text-gray-500 mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Satın Alma Onayı
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">{paket.title}</span> paketini
              satın almak üzeresiniz.
            </p>
            <p className="text-2xl font-bold text-gray-900 mb-4">
              &#8378;{formatPrice(paket.price)}
            </p>
            <p className="text-sm text-gray-500 mb-6">Onaylıyor musunuz?</p>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Gönderiliyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
