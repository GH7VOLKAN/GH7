"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const SERVICES = [
  "İçerik optimizasyonu — AI\u2019ın referans almak isteyeceği formatta",
  "Schema markup — yapılandırılmış veri ile AI botlarını yönlendirme",
  "Entity building — markanızı AI\u2019ların \u201Cgüvenilir kaynak\u201D olarak tanıtma",
  "Citation stratejisi — sektörel referans ağı oluşturma",
  "llms.txt dosyası — AI botlarına sitenizi tanıtan teknik dosya",
  "İl bazlı optimizasyon — hedef şehirlerinize özel sinyal çalışması",
  "Çoklu dil optimizasyonu — export müşterileri için yabancı dil içerik",
  "Otomatik blog üretimi — Opus ile her analiz sonrası SEO uyumlu içerik",
];

export function AgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[100px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Sadece Takip Değil
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Biz göstermiyoruz.
          <br />
          Biz düzeltiyoruz.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px]">
          Diğer araçlar &ldquo;şunu optimize et&rdquo; der ve sizi yalnız bırakır. GH7&apos;de &ldquo;Ajansınıza Gönderin&rdquo; butonuna basarsınız, GEO ajansımız çalışmaya başlar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10 items-start">
          <ul className="list-none p-0">
            {SERVICES.map((item) => (
              <li
                key={item}
                className="text-[14px] text-zinc-600 py-3 border-b border-zinc-100 flex items-start gap-2.5 leading-[1.5]"
              >
                <span className="text-zinc-300 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Visual placeholder */}
          <div className="border border-zinc-200 rounded-[14px] bg-[#FAFAFA] flex items-center justify-center text-zinc-300 text-[12px] font-medium min-h-[340px]">
            Ajans Hizmeti Akış Görseli
          </div>
        </div>
      </div>
    </section>
  );
}
