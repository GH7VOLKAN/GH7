"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const SERVICES = [
  "Icerik optimizasyonu — AI'nin referans almak isteyecegi formatta icerik uretimi",
  "Schema markup — Yapilandirilmis veri ile AI botlarinin sitenizi anlamasini saglama",
  "Entity building — Markanizi AI'larin \"guvenilir kaynak\" olarak tanimasini saglama",
  "Citation stratejisi — Sektorel platformlarda referans agi olusturma",
  "llms.txt dosyasi — AI botlarina sitenizi tanitan teknik dosya hazirlama",
  "Il bazli optimizasyon — Hedef sehirlerinize ozel icerik ve sinyal calismasi",
  "Aylik performans raporu — Ne yapildi, ne degisti, siradaki adimlar",
];

const CASE_STATS = [
  { value: "%26", label: "Ses payi" },
  { value: "1.4", label: "Ort. AI sirasi" },
  { value: "%100", label: "Kapsam" },
  { value: "1M+", label: "Aylik ziyaretci" },
];

export function AgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-[#09090B] text-white py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-4">
          Sadece Takip Degil
        </div>
        <h2
          className="font-extrabold text-white leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Biz gostermiyoruz.
          <br />
          Biz duzeltiyoruz.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Diger araclar &quot;sunu optimize et&quot; der ve sizi yalniz birakir. GH7&apos;de &quot;Ajansiniza Gonderin&quot; butonuna basarsiniz, GEO ajansimiz sizin icin calismaya baslar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-12 items-center">
          {/* Service list */}
          <ul className="list-none p-0">
            {SERVICES.map((item) => (
              <li
                key={item}
                className="text-[15px] text-white/60 py-3 border-b border-zinc-800 flex items-start gap-3 leading-[1.5]"
              >
                <span className="text-green-500 font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Case study */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10">
            <div className="text-[18px] font-medium leading-[1.5] text-white/80 mb-5 italic">
              &quot;3 ayda ChatGPT&apos;de sektorumuzun 1 numarali onerisi olduk. AI aramalarinda %26 ses payina sahibiz.&quot;
            </div>
            <div className="text-[13px] text-zinc-600">
              ISITMAX A.S. · isitmax.com
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-800">
              {CASE_STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-[28px] font-extrabold text-green-500">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
