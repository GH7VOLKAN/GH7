"use client";

import Link from "next/link";
import { PLAN_PRICES } from "@/lib/iyzico/plans";

/**
 * Sayfa sonunda sade tek Pro CTA.
 * Eski "Sizi Arayalım" + "Kendim takip edeceğim" kartları kaldırıldı.
 * Eski ₺2.495 fiyatı kaldırıldı.
 */
export function PageBottomCTA() {
  return (
    <div className="border-t border-gray-100 mt-16 pt-8 pb-8">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-lg font-bold text-gray-900">
          Haftalık otomatik takip, tam sorgu yanıtları ve aksiyon planı.
        </p>
        <Link
          href="/panel/abonelik"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Pro&apos;ya Geç · ₺{PLAN_PRICES.pro.monthly}/ay
        </Link>
      </div>
    </div>
  );
}
