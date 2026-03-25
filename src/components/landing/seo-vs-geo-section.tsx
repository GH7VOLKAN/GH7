"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const SEO_ITEMS = [
  "Anahtar kelime + backlink odaklı",
  "10 mavi link arasında sıralama",
  "Tıklama oranı (CTR) ile başarı ölçümü",
  "Algoritma güncellemelerine bağımlı",
  "Yalnızca Google ekosistemi",
];

const GEO_ITEMS = [
  "Otorite, güvenilirlik ve entity sinyalleri",
  "AI'nin doğrudan referans verdiği kaynak olma",
  "Marka mention + citation ile başarı ölçümü",
  "6 farklı AI platformunda görünürlük",
  "İl bazlı, sektöre özel optimizasyon",
  "Sonuç odaklı ajans hizmeti (RaaS)",
];

export function SeoVsGeoSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10" id="geo">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Yeni Dönem
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          SEO yetmez.
          <br />
          GEO şart.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          SEO sizi Google&apos;da sıralar. GEO ise yapay zekanın sizi güvenilir kaynak olarak önermesini sağlar. İkisi farklı disiplinler.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_64px_1fr] gap-4 md:gap-0 mt-12 items-start">
          {/* Old SEO */}
          <div className="border border-zinc-200 rounded-[14px] p-9 opacity-50 h-full">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400 mb-4">
              Geleneksel SEO
            </div>
            <div className="text-[20px] font-bold mb-3" style={{ letterSpacing: "-0.01em" }}>
              Google sıralaması
            </div>
            <ul className="list-none p-0">
              {SEO_ITEMS.map((item) => (
                <li key={item} className="text-[13px] text-zinc-500 py-1.5 flex items-start gap-2 leading-[1.5]">
                  <span className="text-zinc-300 text-[11px] mt-0.5 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-2xl text-zinc-300 pt-20">
            →
          </div>

          {/* New GEO */}
          <div className="border-2 border-[#09090B] rounded-[14px] p-9 h-full">
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#09090B] mb-4">
              GEO — Yeni Standart
            </div>
            <div className="text-[20px] font-bold mb-3" style={{ letterSpacing: "-0.01em" }}>
              AI tarafından önerilme
            </div>
            <ul className="list-none p-0">
              {GEO_ITEMS.map((item) => (
                <li key={item} className="text-[13px] text-zinc-500 py-1.5 flex items-start gap-2 leading-[1.5]">
                  <span className="text-[#09090B] text-[11px] mt-0.5 shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
