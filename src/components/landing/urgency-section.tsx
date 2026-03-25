"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const CARDS = [
  {
    icon: "🏁",
    title: "İlk giren kazanır",
    desc: "AI modelleri güvendiği kaynakları tekrar tekrar önerir. Şimdi referans kaynağı olan firma, gelecekte de önerilmeye devam eder. Rakibiniz bugün başladıysa, yarın sizi geçer.",
  },
  {
    icon: "🛡",
    title: "AI itibar yönetimi",
    desc: "ChatGPT markanız hakkında ne söylüyor? Yanlış bilgi mi veriyor, rakibinizi mi öneriyor? Bilmiyorsanız kontrol edemezsiniz. GH7 markanızın AI itibarını görünür kılar.",
  },
  {
    icon: "📈",
    title: "Yatırımın geri dönüşü",
    desc: "Ödediğinizin çok daha fazlasını alırsınız. AI'da 1. sırada görünmek, Google reklamına para vermeden organik müşteri kazanmak demek. Her il, her arama bir fırsat.",
  },
];

export function UrgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Neden Şimdi
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Erken başlayanlar
          <br />
          avantajı koruyacak
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px] mx-auto">
          AI görünürlüğü bir kez kazanıldığında güçlenerek devam eder. Geç kalanlar, pazar payını geri almak için çok daha fazla çaba harcayacak.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-2xl overflow-hidden mt-12">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white p-7 sm:p-10 text-left">
              <div className="text-[28px] mb-4">{card.icon}</div>
              <div className="text-[16px] font-bold mb-2" style={{ letterSpacing: "-0.01em" }}>
                {card.title}
              </div>
              <div className="text-[13px] text-zinc-500 leading-[1.6]">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
