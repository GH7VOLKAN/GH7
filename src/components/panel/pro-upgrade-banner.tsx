/**
 * ProUpgradeBanner — Sadece free kullanıcıya gösterilen küçük, elegant banner.
 *
 * Sidebar altında veya sayfa sonunda render edilir.
 * Spotify tarzı: var ama baskı yapmıyor, rahatsız etmiyor.
 */

import Link from "next/link";
import { Sparkles } from "lucide-react";
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
      <div className="mx-2 mb-2 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-gray-700" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Pro
          </span>
        </div>
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
      <div className="flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Sparkles className="size-5 text-gray-700" />
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold text-gray-900">
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
