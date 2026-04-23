import { BrandCard } from "./brand-card";
import { PLANS, isPaidPlan } from "@/lib/constants/plan";
import s from "../dashboard.module.css";

type Props = {
  score: number;
  scoreTotal: number;
  plan: string;
};

export function BrandCardGrid({ score, scoreTotal, plan }: Props) {
  const unlocked = isPaidPlan(plan);

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
      href: unlocked ? "/dashboard/audit" : "/dashboard/pro/audit",
      locked: !unlocked,
      buttonLabel: unlocked ? "Denetimi Gör →" : "Pro ile Aç →",
    },
    {
      slug: "tracker",
      brand: "TRACKER",
      subtitle: "Haftalık otomatik takip",
      description:
        "Her Pazartesi sabah skorun yeniden ölçülür, değişim ve trend çizgin güncellenir.",
      href: unlocked ? "/dashboard/tracker" : "/dashboard/pro/tracker",
      locked: !unlocked,
      buttonLabel: unlocked ? "Takibi Aç →" : "Pro ile Aç →",
    },
    {
      slug: "radar",
      brand: "RADAR",
      subtitle: "Rakip takip ve karşılaştırma",
      description:
        "Seçtiğin 3 rakibin skoru senin skorunla yan yana. Onlar seni geçtiğinde bildirim gelir.",
      href: unlocked ? "/dashboard/radar" : "/dashboard/pro/radar",
      locked: !unlocked,
      buttonLabel: unlocked ? "Rakipleri Gör →" : "Pro ile Aç →",
    },
    {
      slug: "advisor",
      brand: "ADVISOR",
      subtitle: "Haftalık trend ve aksiyon raporu",
      description:
        "AI arama davranışı değişiyor. Senin sektöründe öne çıkan fırsatları ve önceki adımları Opus yorumluyor.",
      href: unlocked ? "/dashboard/advisor" : "/dashboard/pro/advisor",
      locked: !unlocked,
      buttonLabel: unlocked ? "Raporu Oku →" : "Pro ile Aç →",
    },
    {
      slug: "studio",
      brand: "STUDIO",
      subtitle: "Ayarlar ve kontrol",
      description:
        plan === PLANS.FREE
          ? "Profil bilgilerini ve e-posta aboneliğini yönet."
          : plan === PLANS.PRO
            ? "Profil, newsletter ve aynı marka için yeni analiz başlat."
            : "Profil, newsletter, 5 markaya kadar yeni analiz ve yönetim.",
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
