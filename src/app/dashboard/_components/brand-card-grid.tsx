import { BrandCard } from "./brand-card";
import s from "../dashboard.module.css";

type Props = {
  score: number;
  scoreTotal: number;
  isPro: boolean;
};

export function BrandCardGrid({ score, scoreTotal, isPro }: Props) {
  const cards = [
    {
      slug: "insight",
      brand: "INSIGHT",
      subtitle: "AI görünürlük skorun",
      description:
        "ChatGPT, Claude, Gemini, Perplexity ve Google AIO'da kaç kere anıldığını gör.",
      metric: `${score} / ${scoreTotal}`,
      metricLabel: "Son tarama",
      href: "/dashboard/insight",
      locked: false,
      buttonLabel: "Detayları Gör →",
    },
    {
      slug: "audit",
      brand: "AUDIT",
      subtitle: "43 maddelik görünürlük denetimi",
      description:
        "Sitenin AI tarafından okunabilirliği, schema, içerik, hız — her madde için spesifik iyileştirme talimatı.",
      href: isPro ? "/dashboard/audit" : "/dashboard/pro/audit",
      locked: !isPro,
      buttonLabel: isPro ? "Denetimi Gör →" : "Pro ile Aç →",
    },
    {
      slug: "tracker",
      brand: "TRACKER",
      subtitle: "Haftalık otomatik takip",
      description:
        "Her Pazartesi sabah skorun yeniden ölçülür, değişim ve trend çizgin güncellenir.",
      href: isPro ? "/dashboard/tracker" : "/dashboard/pro/tracker",
      locked: !isPro,
      buttonLabel: isPro ? "Takibi Aç →" : "Pro ile Aç →",
    },
    {
      slug: "radar",
      brand: "RADAR",
      subtitle: "Rakip takip ve karşılaştırma",
      description:
        "Seçtiğin 3 rakibin skoru senin skorunla yan yana. Onlar seni geçtiğinde bildirim gelir.",
      href: isPro ? "/dashboard/radar" : "/dashboard/pro/radar",
      locked: !isPro,
      buttonLabel: isPro ? "Rakipleri Gör →" : "Pro ile Aç →",
    },
    {
      slug: "advisor",
      brand: "ADVISOR",
      subtitle: "Haftalık trend ve aksiyon raporu",
      description:
        "AI arama davranışı değişiyor. Senin sektöründe öne çıkan fırsatları ve önceki adımları Opus yorumluyor.",
      href: isPro ? "/dashboard/advisor" : "/dashboard/pro/advisor",
      locked: !isPro,
      buttonLabel: isPro ? "Raporu Oku →" : "Pro ile Aç →",
    },
    {
      slug: "studio",
      brand: "STUDIO",
      subtitle: "Ayarlar ve kontrol",
      description: isPro
        ? "Ürün, sektör, şehir, sorgu listesi, rakip listesi — tam kontrol."
        : "Profil bilgilerini, e-posta aboneliğini ve rakip listeni düzenle.",
      href: "/dashboard/studio",
      locked: false,
      buttonLabel: "Ayarlar →",
    },
  ];

  return (
    <section className={s.grid}>
      {cards.map((card) => (
        <BrandCard key={card.slug} {...card} />
      ))}
    </section>
  );
}
