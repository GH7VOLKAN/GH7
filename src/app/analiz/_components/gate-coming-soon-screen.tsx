"use client";

/**
 * Analiz sayfasında kapı coming-soon ekranı (Brief H-ext Aşama 2).
 *
 * Kullanıcı ?type=kisi|eticaret|yurtdisi ile girdiğinde gösterilir.
 * Sadece FIRMA kapısı aktif olana kadar.
 */

import Link from "next/link";
import { getGateInfo } from "@/lib/gates/config";

type Props = {
  gate: "kisi" | "eticaret" | "yurtdisi";
};

export function GateComingSoonScreen({ gate }: Props) {
  const info = getGateInfo(gate);
  const label = info?.label ?? gate;
  const launchDate = info?.launchDate ?? "yakında";
  const description =
    info?.description ?? "Bu kapı yakında açılacak.";

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717A] mb-6">
        GH7 · {label} Kapısı
      </div>
      <h1
        className="font-bold text-[#09090B] mb-8 leading-[1.05]"
        style={{ fontSize: "clamp(40px, 6vw, 64px)", letterSpacing: "-0.03em" }}
      >
        {label}
        <br />
        Kapısı Yakında
      </h1>
      <p className="mb-8 text-base leading-relaxed text-[#71717A]">
        {description}
      </p>
      <p className="mb-12 text-sm text-[#71717A]">
        Planlanan lansman:{" "}
        <span className="font-medium text-[#09090B]">{launchDate}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/analiz?type=firma"
          className="inline-flex items-center gap-2 rounded-lg bg-[#09090B] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Firma Kapısı ile Devam Et →
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[#E4E4E7] bg-white px-6 py-3 text-sm font-medium text-[#09090B] transition-colors hover:border-[#A1A1AA]"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
