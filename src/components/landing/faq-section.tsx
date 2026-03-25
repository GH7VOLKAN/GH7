"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const FAQS = [
  {
    q: "GEO nedir, neden SEO'dan farklidir?",
    a: "GEO (Generative Engine Optimization), iceriginizi yapay zeka motorlarinin guvenilir kaynak olarak referans almasi icin optimize etme disiplinidir. SEO, Google'da siralama hedefler; GEO ise ChatGPT, Gemini gibi AI'larin sizi dogrudan onermesini hedefler. Princeton Universitesi'nin 2024 arastirmasi, GEO'nun AI gorunurlugunu %40'a kadar artirabildigini gostermistir.",
  },
  {
    q: "Hangi AI platformlarini takip ediyorsunuz?",
    a: "ChatGPT (OpenAI), Gemini (Google), Google AI Overview, Perplexity, Claude (Anthropic) ve Microsoft Copilot. Her platform farkli kaynaklara guvenir ve farkli siralama mantigi kullanir — GH7 hepsini ayri ayri analiz eder.",
  },
  {
    q: "Il bazli takip nasil calisiyor?",
    a: "Turkiye'nin 81 ilinde, o ile ozel sorgular gondererek AI'nin kimi onerdigini olcuyoruz. Ornegin \"Ankara'da en iyi isitma firmasi\" ve \"Balikesir'de en iyi isitma firmasi\" farkli sonuclar verir. GH7 bu farki gosterir, boylece hangi illerde guclu hangi illerde gorunmez oldugunuzu bilirsiniz.",
  },
  {
    q: "Ajans hizmeti (RaaS) ne anlama geliyor?",
    a: "Results as a Service — sadece veri gostermiyoruz, sonuc aliyoruz. Business paketinde GEO ajansimiz sizin icin icerik optimizasyonu, schema markup, entity building ve citation stratejisi calisir. Siz dashboard'dan takip edersiniz, biz iyilestiririz.",
  },
  {
    q: "Ne kadar surede sonuc gorurm?",
    a: "Ilk analiz 60 saniye. Iyilestirme calismalarinin etkisi genellikle 2-4 haftada AI yanitlarinda gorulmeye baslar. AI modelleri guvenilir bulduklari kaynaklari tekrar tekrar onerir — erken baslamak kalici avantaj saglar.",
  },
  {
    q: "Neden simdi baslamaliyim?",
    a: "Gartner'a gore geleneksel arama trafigi 2026'ya kadar %25 dusecek. AI aramalari hizla artiyor. Su an AI'da referans kaynagi olan firmalar, bu pozisyonu koruyor ve guclendiriyor. Gec kalanlar ise cok daha fazla caba harcamak zorunda kalacak. Erken yatirim, kalici avantaj demek.",
  },
];

export function FaqSection() {
  const ref = useFadeIn<HTMLElement>();

  return (
    <section ref={ref} className="fi-section bg-zinc-50 py-[72px] sm:py-[120px] px-5 sm:px-10" id="sss">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-[12px] font-semibold text-zinc-400 uppercase tracking-[0.12em] mb-4">
          SSS
        </div>
        <h2
          className="font-extrabold leading-[1.08] mb-4"
          style={{ fontSize: "clamp(30px, 4.5vw, 48px)", letterSpacing: "-0.035em" }}
        >
          Merak edilenler
        </h2>

        <div className="max-w-[640px] mt-12">
          {FAQS.map((faq) => (
            <details key={faq.q} className="border-b border-zinc-100 group">
              <summary className="py-5 text-[15px] font-semibold cursor-pointer list-none flex justify-between items-center">
                {faq.q}
                <span className="text-[18px] text-zinc-400 group-open:hidden">+</span>
                <span className="text-[18px] text-zinc-400 hidden group-open:inline">−</span>
              </summary>
              <p className="text-[14px] text-zinc-500 leading-[1.7] pb-5">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
