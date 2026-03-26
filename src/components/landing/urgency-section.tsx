"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const CARDS = [
  {
    title: "İlk giren kazanır",
    desc: "AI güvendiği kaynakları tekrar önerir. Şimdi referans olan firma, gelecekte de önerilmeye devam eder.",
  },
  {
    title: "AI itibar yönetimi",
    desc: "ChatGPT markanız hakkında ne söylüyor? Yanlış bilgi mi veriyor, rakibinizi mi öneriyor?",
  },
  {
    title: "Yatırımın geri dönüşü",
    desc: "AI\u2019da 1. sırada görünmek = Google reklamına para vermeden organik müşteri.",
  },
];

export function UrgencySection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section
      ref={ref}
      className="fi-section py-[80px] sm:py-[120px] px-5 sm:px-10"
    >
      <div className="max-w-[1120px] mx-auto text-center">
        <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.14em] mb-3.5">
          Neden Şimdi
        </div>
        <h2
          className="font-extrabold leading-[1.1] mb-10"
          style={{
            fontSize: "clamp(28px, 4.2vw, 46px)",
            letterSpacing: "-0.035em",
          }}
        >
          Erken başlayanlar
          <br />
          avantajı koruyacak
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E7EB] border border-[#E5E7EB] rounded-[14px] overflow-hidden">
          {CARDS.map((card) => (
            <div key={card.title} className="bg-white p-8 text-left">
              <div
                className="text-[15px] font-bold mb-2"
                style={{ letterSpacing: "-0.01em" }}
              >
                {card.title}
              </div>
              <div className="text-[13px] text-[#6B7280] leading-[1.6]">
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
