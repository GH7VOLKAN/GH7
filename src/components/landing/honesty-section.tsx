"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PACKAGES = [
  {
    name: "Deneme Dersi",
    price: "0",
    description: "Tek seferlik GEO analiz raporu",
  },
  {
    name: "Salon Üyeliği",
    price: "2.495",
    description: "Aylık optimizasyon + raporlama",
  },
  {
    name: "Personal Trainer",
    price: "7.495",
    description: "Tam kapsamlı GEO ajans hizmeti",
  },
];

export function HonestySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[680px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Dürüstlük
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-6"
          style={{ fontSize: "clamp(28px, 4vw, 42px)", letterSpacing: "-0.035em" }}
        >
          Bunu kendiniz de yapabilirsiniz.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] mb-8">
          Ama...
        </p>

        <div className="space-y-2 mb-8">
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            50 farklı soruyla,
          </p>
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            5 farklı platformda,
          </p>
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            3 farklı ilde,
          </p>
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            her hafta düzenli olarak test edip,
          </p>
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            sonuçları analiz edip,
          </p>
          <p className="text-[15px] text-zinc-500 leading-[1.7]">
            içerikleri optimize etmeniz gerekir.
          </p>
        </div>

        <p
          className="font-extrabold leading-[1.2] mb-4"
          style={{ fontSize: "clamp(20px, 3vw, 26px)", letterSpacing: "-0.02em" }}
        >
          Bunu kimse sürdüremez.
        </p>
        <p className="text-[15px] text-zinc-500 leading-[1.7] mb-12">
          GH7 bunu sizin yerinize yapar.
        </p>

        {/* Spor salonu analojisi — 3 paket */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className="border border-zinc-200 rounded-[14px] p-6 text-center"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-3">
                {pkg.name}
              </div>
              <div
                className="text-[28px] font-extrabold tracking-tight mb-1"
                style={{ letterSpacing: "-0.03em" }}
              >
                &#8378;{pkg.price}
              </div>
              <div className="text-[12px] text-zinc-500 leading-[1.5]">
                {pkg.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
