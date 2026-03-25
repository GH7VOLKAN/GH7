"use client";

import { useFadeIn } from "@/hooks/use-fade-in";

const FAQS = [
  {
    q: "GEO nedir, neden SEO'dan farklıdır?",
    a: "GEO (Generative Engine Optimization), içeriğinizi yapay zeka motorlarının güvenilir kaynak olarak referans alması için optimize etme disiplinidir. SEO, Google'da sıralama hedefler; GEO ise ChatGPT, Gemini gibi AI'ların sizi doğrudan önermesini hedefler. Princeton Üniversitesi'nin 2024 araştırması, GEO'nun AI görünürlüğünü %40'a kadar artırabildiğini göstermiştir.",
  },
  {
    q: "Hangi AI platformlarını takip ediyorsunuz?",
    a: "ChatGPT (OpenAI), Gemini (Google), Google AI Overview, Perplexity, Claude (Anthropic) ve Microsoft Copilot. Her platform farklı kaynaklara güvenir ve farklı sıralama mantığı kullanır — GH7 hepsini ayrı ayrı analiz eder.",
  },
  {
    q: "İl bazlı takip nasıl çalışıyor?",
    a: "Türkiye'nin 81 ilinde, o ile özel sorgular göndererek AI'nin kimi önerdiğini ölçüyoruz. Örneğin \"Ankara'da en iyi ısıtma firması\" ve \"Balıkesir'de en iyi ısıtma firması\" farklı sonuçlar verir. GH7 bu farkı gösterir, böylece hangi illerde güçlü hangi illerde görünmez olduğunuzu bilirsiniz.",
  },
  {
    q: "Ajans hizmeti (RaaS) ne anlama geliyor?",
    a: "Results as a Service — sadece veri göstermiyoruz, sonuç alıyoruz. Business paketinde GEO ajansımız sizin için içerik optimizasyonu, schema markup, entity building ve citation stratejisi çalışır. Siz dashboard'dan takip edersiniz, biz iyileştiririz.",
  },
  {
    q: "Ne kadar sürede sonuç görürüm?",
    a: "İlk analiz 60 saniye. İyileştirme çalışmalarının etkisi genellikle 2-4 haftada AI yanıtlarında görülmeye başlar. AI modelleri güvenilir buldukları kaynakları tekrar tekrar önerir — erken başlamak kalıcı avantaj sağlar.",
  },
  {
    q: "Neden şimdi başlamalıyım?",
    a: "Gartner'a göre geleneksel arama trafiği 2026'ya kadar %25 düşecek. AI aramaları hızla artıyor. Şu an AI'da referans kaynağı olan firmalar, bu pozisyonu koruyor ve güçlendiriyor. Geç kalanlar ise çok daha fazla çaba harcamak zorunda kalacak. Erken yatırım, kalıcı avantaj demek.",
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
