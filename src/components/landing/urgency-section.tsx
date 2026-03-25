"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const CARDS = [
  {
    icon: "🏁",
    title: "Ilk giren kazanir",
    desc: "AI modelleri guvendigi kaynaklari tekrar tekrar onerir. Simdi referans kaynagi olan firma, gelecekte de onerilmeye devam eder. Rakibiniz bugun basladiysa, yarin sizi gecer.",
  },
  {
    icon: "🛡",
    title: "AI itibar yonetimi",
    desc: "ChatGPT markaniz hakkinda ne soyluyor? Yanlis bilgi mi veriyor, rakibinizi mi oneriyor? Bilmiyorsaniz kontrol edemezsiniz. GH7 markanizin AI itibarini gorunur kilar.",
  },
  {
    icon: "📈",
    title: "Yatirimin geri donusu",
    desc: "Odediginizin cok daha fazlasini alirsiniz. AI'da 1. sirada gorunmek, Google reklamina para vermeden organik musteri kazanmak demek. Her il, her arama bir firsat.",
  },
];

export function UrgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section py-[72px] sm:py-[120px] px-5 sm:px-10">
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          Neden Simdi
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Erken baslayanlar
          <br />
          avantaji koruyacak
        </h2>
        <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-[520px] mx-auto">
          AI gorunurlugu bir kez kazanildiginda guclenerek devam eder. Gec kalanlar, pazar payini geri almak icin cok daha fazla caba harcayacak.
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
