"use client";

import { useFadeIn } from "@/hooks/use-fade-in";
import Link from "next/link";

type CellValue = string | boolean;

interface FeatureRow {
  label: string;
  free: CellValue;
  pro: CellValue;
  business: CellValue;
}

interface FeatureGroup {
  group: string;
  rows: FeatureRow[];
}

const FEATURES: FeatureGroup[] = [
  {
    group: "Kapsam",
    rows: [
      { label: "Proje sayısı", free: "1", pro: "1", business: "3" },
      { label: "AI platformu", free: "6", pro: "5", business: "6" },
      { label: "İl", free: "1", pro: "3", business: "10" },
      { label: "Sorgu sayısı", free: "10", pro: "50", business: "Sınırsız" },
    ],
  },
  {
    group: "İzleme",
    rows: [
      { label: "Analiz sıklığı", free: "Tek seferlik", pro: "Haftalık", business: "Günlük" },
      { label: "Sıralama savaşı", free: false, pro: true, business: true },
      { label: "Bildirimler", free: false, pro: true, business: true },
      { label: "Trend grafiği", free: false, pro: true, business: true },
      { label: "PDF / WhatsApp rapor", free: false, pro: true, business: true },
      { label: "API erişimi", free: false, pro: false, business: true },
    ],
  },
  {
    group: "Aksiyon & Araçlar",
    rows: [
      { label: "Haftalık aksiyon listesi", free: false, pro: false, business: true },
      { label: "Opus içerik üretimi", free: false, pro: false, business: true },
      { label: "Rakip istihbarat", free: false, pro: false, business: true },
      { label: "Tamamladım doğrulama", free: false, pro: false, business: true },
      { label: "Korelasyon motoru", free: false, pro: false, business: true },
    ],
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-[#22C55E] text-[14px]">&#10003;</span>
    ) : (
      <span className="text-[#D1D5DB]">&mdash;</span>
    );
  }
  return <span className="text-[13px] text-[#09090B] font-medium">{value}</span>;
}

export function PricingSectionV5() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      id="pricing"
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
            Fiyatlandırma
          </div>
          <h2
            className="font-extrabold leading-[1.1] mb-3.5"
            style={{
              fontSize: "clamp(28px, 4.2vw, 46px)",
              letterSpacing: "-0.035em",
            }}
          >
            Net fiyat. Gizli maliyet yok.
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="border border-[#E5E7EB] rounded-[14px] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-4 bg-[#F9FAFB]">
            <div className="p-5" />
            <div className="p-5 text-center border-l border-[#E5E7EB]">
              <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                Ücretsiz
              </div>
              <div className="text-[28px] font-extrabold" style={{ letterSpacing: "-0.03em" }}>
                &#8378;0
              </div>
            </div>
            <div className="p-5 text-center border-l border-[#E5E7EB] bg-[#09090B] text-white">
              <div className="text-[12px] font-bold text-white/60 uppercase tracking-[0.08em] mb-1">
                Pro
              </div>
              <div className="text-[28px] font-extrabold" style={{ letterSpacing: "-0.03em" }}>
                &#8378;2.495
              </div>
              <div className="text-[11px] text-white/50">/ay</div>
            </div>
            <div className="p-5 text-center border-l border-[#E5E7EB]">
              <div className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                Business
              </div>
              <div className="text-[28px] font-extrabold" style={{ letterSpacing: "-0.03em" }}>
                &#8378;4.995
              </div>
              <div className="text-[11px] text-[#9CA3AF]">/ay</div>
            </div>
          </div>

          {/* Feature groups */}
          {FEATURES.map((group) => (
            <div key={group.group}>
              {/* Group header */}
              <div className="grid grid-cols-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="p-4 col-span-4">
                  <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">
                    {group.group}
                  </span>
                </div>
              </div>
              {/* Rows */}
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-4 border-t border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="p-4 text-[13px] text-[#6B7280]">
                    {row.label}
                  </div>
                  <div className="p-4 text-center border-l border-[#F3F4F6]">
                    <CellContent value={row.free} />
                  </div>
                  <div className="p-4 text-center border-l border-[#F3F4F6]">
                    <CellContent value={row.pro} />
                  </div>
                  <div className="p-4 text-center border-l border-[#F3F4F6]">
                    <CellContent value={row.business} />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <div className="p-5" />
            <div className="p-5 text-center border-l border-[#E5E7EB]">
              <Link
                href="/analiz"
                className="inline-block w-full py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-[13px] font-semibold text-[#09090B] no-underline hover:border-[#D1D5DB] transition-colors"
              >
                Ücretsiz Başla
              </Link>
            </div>
            <div className="p-5 text-center border-l border-[#E5E7EB]">
              <Link
                href="/analiz"
                className="inline-block w-full py-2.5 bg-[#09090B] rounded-lg text-[13px] font-semibold text-white no-underline"
              >
                Pro&apos;ya Başlayın
              </Link>
            </div>
            <div className="p-5 text-center border-l border-[#E5E7EB]">
              <Link
                href="/analiz"
                className="inline-block w-full py-2.5 bg-[#09090B] rounded-lg text-[13px] font-semibold text-white no-underline"
              >
                Business&apos;a Başlayın
              </Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[13px] text-[#9CA3AF] mt-6 text-center">
          Ajans GEO Paketleri: Tek seferlik hizmetler &rarr;{" "}
          <a
            href="#"
            className="text-[#6B7280] underline underline-offset-2 hover:text-[#09090B]"
          >
            Paketlere Git
          </a>
        </p>
      </div>
    </section>
  );
}
