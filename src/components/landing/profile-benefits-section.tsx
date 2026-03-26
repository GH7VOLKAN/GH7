"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const PROFILES = [
  {
    emoji: "🏢",
    title: "Firma / Marka",
    desc: "Ürün, hizmet ve projelerinizin AI\u2019daki görünürlüğünü takip edin.",
    items: [
      "Ürün/hizmet bazlı sıralama savaşı",
      "Rakiplerin neden önde olduğunu görün",
      "\u201CSende yok onda var\u201D kıyaslaması",
      "İl bazlı görünürlük haritası",
      "Haftalık değişim bildirimi",
    ],
  },
  {
    emoji: "👤",
    title: "Kişi / Uzman",
    desc: "Adınız AI\u2019da nasıl geçiyor? Meslektaşlarınızla kıyaslayın.",
    items: [
      "Kişisel marka analizi",
      "Meslektaş sıralama tablosu",
      "Dijital iz taraması (web, akademik, sosyal)",
      "AI\u2019ın sizi nasıl tanımladığı",
      "Kişisel gelişim planı",
    ],
  },
  {
    emoji: "🛒",
    title: "E-Ticaret",
    desc: "AI ürünlerinizi öneriyor mu? Satış linklerinizi veriyor mu?",
    items: [
      "Ürün bazlı AI mention takibi",
      "Satış linki analizi (Trendyol vs Hepsiburada)",
      "Rakip ürün kıyaslaması",
      "30 ürüne kadar eş zamanlı takip",
      "Ürün bazlı sıralama bildirimi",
    ],
  },
  {
    emoji: "🌍",
    title: "Export",
    desc: "Yabancı müşteriler sizi buluyor mu? Hedef dilde analiz.",
    items: [
      "Hedef ülke dilinde sorgu (EN, DE, AR, RU)",
      "Türkiye rakipleri + global rakipler",
      "Dil bazlı sıralama savaşı",
      "Sağlık turizmi, ihracat, otel, eğitim",
      "\u201CHangi dilde görünmüyorsunuz\u201D analizi",
    ],
  },
];

export function ProfileBenefitsSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[100px] px-5 sm:px-10" id="profil">
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          4 Profil · 1 Platform
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Her profilin derdi farklı.
          <br />
          Her profilin çözümü GH7&apos;de.
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[500px] mx-auto">
          Firma, kişi, e-ticaret veya ihracat — yapay zeka görünürlüğünüzü tek platformdan takip edin ve iyileştirin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-[14px] overflow-hidden mt-10">
          {PROFILES.map((profile) => (
            <div key={profile.title} className="bg-white p-8 sm:p-6 text-left">
              <div className="w-9 h-9 border-[1.5px] border-zinc-200 rounded-[9px] flex items-center justify-center text-[16px] mb-4">
                {profile.emoji}
              </div>
              <div className="text-[15px] font-bold mb-1.5" style={{ letterSpacing: "-0.01em" }}>
                {profile.title}
              </div>
              <div className="text-[12px] text-zinc-500 leading-[1.6] mb-4">
                {profile.desc}
              </div>
              <ul className="list-none p-0">
                {profile.items.map((item) => (
                  <li key={item} className="text-[12px] text-zinc-600 py-[3px] flex gap-1.5 leading-[1.4]">
                    <span className="text-zinc-300 text-[10px] shrink-0 mt-0.5">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
