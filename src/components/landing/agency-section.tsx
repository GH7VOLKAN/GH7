"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const SERVICES = [
  "İçerik optimizasyonu — AI'nin referans almak isteyeceği formatta içerik üretimi",
  "Schema markup — Yapılandırılmış veri ile AI botlarının sitenizi anlamasını sağlama",
  "Entity building — Markanızı AI'ların \"güvenilir kaynak\" olarak tanımasını sağlama",
  "Citation stratejisi — Sektörel platformlarda referans ağı oluşturma",
  "llms.txt dosyası — AI botlarına sitenizi tanıtan teknik dosya hazırlama",
  "İl bazlı optimizasyon — Hedef şehirlerinize özel içerik ve sinyal çalışması",
  "Aylık performans raporu — Ne yapıldı, ne değişti, sıradaki adımlar",
];

const CASE_STATS = [
  { value: "%26", label: "Ses payı" },
  { value: "1.4", label: "Ort. AI sırası" },
  { value: "%100", label: "Kapsam" },
  { value: "1M+", label: "Aylık ziyaretçi" },
];

export function AgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-[#09090B] text-white py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-4">
          Sadece Takip Değil
        </div>
        <h2
          className="font-extrabold text-white leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Biz göstermiyoruz.
          <br />
          Biz düzeltiyoruz.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px]">
          Diğer araçlar &quot;şunu optimize et&quot; der ve sizi yalnız bırakır. GH7&apos;de &quot;Ajansınıza Gönderin&quot; butonuna basarsınız, GEO ajansımız sizin için çalışmaya başlar.
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
              &quot;3 ayda ChatGPT&apos;de sektörümüzün 1 numaralı önerisi olduk. AI aramalarında %26 ses payına sahibiz.&quot;
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
