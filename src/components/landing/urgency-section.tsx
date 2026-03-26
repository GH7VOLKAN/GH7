"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const CARDS = [
  {
    emoji: "⏱",
    title: "İlk giren kazanır",
    desc: "AI güvendiği kaynakları tekrar önerir. Şimdi referans olan firma, gelecekte de önerilmeye devam eder. Rakibiniz bugün başladıysa, yarın sizi geçer.",
  },
  {
    emoji: "🛡",
    title: "AI itibar yönetimi",
    desc: "ChatGPT markanız hakkında ne söylüyor? Yanlış bilgi mi veriyor, rakibinizi mi öneriyor? Bilmiyorsanız kontrol edemezsiniz.",
  },
  {
    emoji: "📊",
    title: "Ödediğinizin fazlası",
    desc: "AI\u2019da 1. sırada görünmek = Google reklamına para vermeden organik müşteri. Her il, her dil, her arama bir fırsat.",
  },
];

export function UrgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section bg-[#FAFAFA] border-t border-b border-zinc-100 py-[72px] sm:py-[100px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.14em] mb-3.5">
          Neden Şimdi
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-3.5"
          style={{ fontSize: "clamp(28px, 4.2vw, 46px)", letterSpacing: "-0.035em" }}
        >
          Erken başlayanlar
          <br />
          avantajı koruyacak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-[14px] overflow-hidden mt-10">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white p-8 text-left">
              <div className="w-8 h-8 border-[1.5px] border-zinc-200 rounded-lg flex items-center justify-center text-[14px] mb-3.5">
                {card.emoji}
              </div>
              <div className="text-[15px] font-bold mb-1.5" style={{ letterSpacing: "-0.01em" }}>
                {card.title}
              </div>
              <div className="text-[12px] text-zinc-500 leading-[1.6]">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
