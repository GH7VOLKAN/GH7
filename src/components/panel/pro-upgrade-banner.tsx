/**
 * ProUpgradeBanner — Free kullanıcıya gösterilen sade banner.
 * Kinde estetiği: ikon yok, gradient yok, siyah buton.
 */

import Link from "next/link";
import { PLAN_PRICES } from "@/lib/iyzico/plans";
import { isPro } from "@/lib/plans";

interface Props {
  plan: string;
  variant?: "sidebar" | "page";
}

export function ProUpgradeBanner({ plan, variant = "sidebar" }: Props) {
  if (isPro(plan)) return null;

  if (variant === "sidebar") {
    return (
      <div className="mx-2 mb-2 rounded-xl border border-gray-200 bg-white p-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-900">
          Pro
        </span>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
          Haftalık takip, detaylı rakip analizi ve hizmet paketlerine erişin.
        </p>
        <Link
          href="/panel/abonelik"
          className="mt-2.5 block w-full rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs font-semibold text-white hover:bg-gray-800"
        >
          Pro&apos;ya Geç · ₺{PLAN_PRICES.pro.monthly}/ay
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
      <h3 className="text-base font-semibold text-gray-900">
        Pro ile daha fazlasına erişin
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-600">
        Haftalık trend takibi, tüm sorgu detayları, il bazlı analiz, 43 madde
        eylem planı ve hizmet paketleri.
      </p>
      <Link
        href="/panel/abonelik"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Pro&apos;ya Geç · ₺{PLAN_PRICES.pro.monthly}/ay
      </Link>
    </div>
  );
}
