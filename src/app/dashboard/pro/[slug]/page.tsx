/**
 * /dashboard/pro/[slug] — Generic Pro sayfası + WhatsApp CTA
 *
 * 4 marka için tek template: audit, tracker, radar, advisor.
 * iyzico entegrasyonu yok (henüz) — WhatsApp ile IBAN ödeme.
 */

import { notFound } from "next/navigation";
import s from "./pro.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

type ProBrandInfo = {
  brand: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
};

const PRO_BRANDS: Record<string, ProBrandInfo> = {
  audit: {
    brand: "GH7 AUDIT",
    title: "43 maddelik görünürlük denetimi",
    subtitle: "Sitenin AI tarafından okunabilirliğini arttır",
    description:
      "GH7 AUDIT sitendeki her sayfayı 43 ayrı maddeden geçirir — schema markup, içerik yapısı, yüklenme hızı, link kalitesi, meta taglar ve daha fazlası. Her madde için spesifik iyileştirme talimatı ve öncelik sırası.",
    features: [
      "43 teknik madde AI tarafından değerlendirilir",
      "Her madde için adım adım iyileştirme rehberi",
      "Öncelik sırası (kritik / orta / düşük)",
      "Aylık tekrar denetim ile ilerleme takibi",
    ],
  },
  tracker: {
    brand: "GH7 TRACKER",
    title: "Haftalık otomatik takip",
    subtitle: "Skorun sürekli izlenir, düşüş anında haber verilir",
    description:
      "GH7 TRACKER her Pazartesi sabah skorunu yeniden ölçer. Trend çizgin güncellenir, değişim olursa SMS ve e-posta ile bildirim gelir. Hangi sorgularda yükseldin, hangilerinde düştün — hepsi grafikle.",
    features: [
      "Haftalık otomatik tarama (Pazartesi sabahları)",
      "Trend grafiği (skor, rakip karşılaştırma)",
      "Değişim bildirimleri (SMS + e-posta)",
      "Sorgu bazlı detay (hangi sorguda kazandın/kaybettin)",
    ],
  },
  radar: {
    brand: "GH7 RADAR",
    title: "Rakip takip ve karşılaştırma",
    subtitle: "3 rakibini her hafta senin skorunla yan yana gör",
    description:
      "GH7 RADAR seçtiğin 3 rakibi sürekli izler. Onlar senin geçtiklerinde veya yeni sorguda öne çıktıklarında bildirim gelir. Karşılaştırma tablosu, değişim grafiği, rakip bazlı raporlar.",
    features: [
      "3 rakip sürekli takip (Pro), 10 rakip (Pro+)",
      "Yan yana skor karşılaştırma",
      "Rakip önce geçtiğinde anlık bildirim",
      "Rakip içeriği analizi (ne yapıyorlar?)",
    ],
  },
  advisor: {
    brand: "GH7 ADVISOR",
    title: "Haftalık trend ve aksiyon raporu",
    subtitle: "Opus ile hazırlanmış sektöre özel öncelik listesi",
    description:
      "GH7 ADVISOR senin sektöründe AI arama davranışı nasıl değişiyor izler. Opus seviyesinde yapay zeka, verilerinden sektör trendlerini, öne çıkan fırsatları ve haftanın öncelik adımlarını hazırlar.",
    features: [
      "Haftalık kişisel rapor (Opus yazımı)",
      "Sektör trend analizi (algoritma değişiklikleri)",
      "Önceki haftanın aksiyon takibi",
      "Gelecek haftanın öncelik listesi",
    ],
  },
};

export default async function ProBrandPage({ params }: Props) {
  const { slug } = await params;
  const info = PRO_BRANDS[slug];

  if (!info) notFound();

  const whatsappUrl = `https://wa.me/905326629792?text=GH7%20${encodeURIComponent(
    info.brand,
  )}%20Pro%20üyelik%20istiyorum`;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className={s.brandTag}>
          <span className={s.brandName}>{info.brand}</span>
          <span className={s.proBadge}>Pro</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{info.title}</h1>
        <p className="text-muted-foreground">{info.subtitle}</p>
      </div>

        <div className={s.descriptionCard}>
          <p className={s.description}>{info.description}</p>
        </div>

        <div className={s.featuresCard}>
          <h2 className={s.featuresTitle}>Neler var?</h2>
          <ul className={s.featuresList}>
            {info.features.map((feature, idx) => (
              <li key={idx} className={s.featureItem}>
                <span className={s.featureDot}>→</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.pricingCard}>
          <div className={s.pricingRow}>
            <div className={s.priceBlock}>
              <div className={s.priceTierName}>GH7 Pro</div>
              <div className={s.priceAmount}>
                699₺<span className={s.priceUnit}>/ay</span>
              </div>
              <div className={s.priceAnnual}>8.388₺ yıllık tek ödeme</div>
              <div className={s.priceFeature}>1 marka · Tüm 6 özellik</div>
            </div>
            <div className={`${s.priceBlock} ${s.priceBlockFeatured}`}>
              <div className={s.priceFeaturedBadge}>ÖNERİLEN</div>
              <div className={s.priceTierName}>GH7 Pro+</div>
              <div className={s.priceAmount}>
                1.699₺<span className={s.priceUnit}>/ay</span>
              </div>
              <div className={s.priceAnnual}>20.388₺ yıllık tek ödeme</div>
              <div className={s.priceFeature}>5 marka · Tüm 6 özellik</div>
            </div>
          </div>
        </div>

        <div className={s.ctaCard}>
          <h3 className={s.ctaTitle}>Pro&apos;ya geçmek için WhatsApp&apos;tan yaz</h3>
          <p className={s.ctaText}>
            Ödeme sistemi henüz iyzico ile entegre değil. Şimdilik
            WhatsApp&apos;tan konuşalım, ödeme IBAN ile alınır, hesabın 5
            dakikada aktifleşir.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={s.whatsappBtn}
          >
            WhatsApp ile Pro&apos;ya Geç →
          </a>
      </div>
    </div>
  );
}
