"use client";

import { useState } from "react";
import Link from "next/link";
import { SiziArayalimPopup } from "./sizi-arayalim-popup";

export function PageBottomCTA() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div className="border-t border-gray-100 mt-16 pt-8 pb-8">
        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
          <p className="text-center text-sm text-gray-500 mb-6">
            Haftalık otomatik takip ile değişimleri kaçırmayın.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sol: Pro */}
            <div className="border border-gray-200 bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900">Kendim takip edeceğim</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>Haftalık otomatik tarama</li>
                <li>Trend ve ilerleme takibi</li>
                <li>Rakip değişim bildirimi</li>
                <li>İlerleme doğrulama</li>
              </ul>
              <p className="mt-4 text-lg font-bold text-gray-900">₺2.495/ay</p>
              <Link
                href="/panel/abonelik"
                className="mt-4 block w-full bg-gray-900 text-white text-center rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Haftalık Takibi Başlat →
              </Link>
            </div>

            {/* Sağ: Sizi Arayalım */}
            <div className="border border-gray-200 bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900">Siz çözün</h3>
              <p className="mt-3 text-sm text-gray-500">
                1 ayda en az 2 yapay zeka sizi önermeye başlasın.
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                Hedefe ulaşınca öde. Ulaşamazsan 0₺.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="mt-4 w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Sizi Arayalım
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                veya 0850 XXX XX XX
              </p>
            </div>
          </div>
        </div>
      </div>

      <SiziArayalimPopup open={showPopup} onOpenChange={setShowPopup} />
    </>
  );
}
