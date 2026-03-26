"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PACKAGES = [
  {
    title: "Schema Markup",
    desc: "Tüm sayfalarınıza AI uyumlu yapılandırılmış veri. Yapay zekaların sizi doğru tanıma olasılığını artırın.",
  },
  {
    title: "İçerik Optimizasyonu",
    desc: "10 sayfanızın AI referans alacak formatta yeniden yazımı. Hem SEO hem GEO uyumlu.",
  },
  {
    title: "Export Dil Paketi",
    desc: "5 sayfanızın hedef dilde GEO uyumlu çevirisi. Uluslararası pazarlarda AI görünürlüğü.",
  },
];

export function AgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#F9FAFB] border-t border-b border-[#E5E7EB] py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
          Kendiniz Yapamıyor Musunuz?
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-10"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          GEO ajans paketleri tek tıkla.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E7EB] rounded-[14px] overflow-hidden">
          {PACKAGES.map((pkg) => (
            <div key={pkg.title} className="bg-white p-8">
              <div className="text-[15px] font-bold text-[#09090B] mb-2">
                {pkg.title}
              </div>
              <div className="text-[13px] text-[#6B7280] leading-[1.6] mb-4">
                {pkg.desc}
              </div>
              <a
                href="#"
                className="text-[13px] font-semibold text-[#09090B] no-underline hover:underline"
              >
                Detay &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
