/**
 * /dashboard/[slug] — Coming-soon marka sayfaları (Brief F Adım 2.3)
 *
 * Destekleyen slug'lar: audit, tracker, radar, advisor.
 * Başka slug → notFound.
 *
 * Not: /dashboard/insight, /dashboard/studio, /dashboard/pro statik
 * route'lar var, Next.js bu dinamik [slug]'dan önce onları seçer.
 */

import { notFound } from "next/navigation";
import { ComingSoonView } from "./_components/coming-soon-view";

const BRANDS = {
  audit: {
    label: "GH7 Audit",
    titleLine1: "43 Maddelik",
    titleLine2: "Denetim",
    intro:
      "Sitenin AI tarafından okunabilirliğini madde madde denetleyen GH7 Audit şu an geliştirme aşamasında.",
    features: [
      "Schema ve yapılandırılmış veri kontrolü",
      "Meta tag ve başlık analizi",
      "İçerik AI-okunabilirlik puanı",
      "Sayfa hızı ve core web vitals",
      "Link yapısı ve iç bağlantı kalitesi",
      "Görsel alt-text ve accessibility",
      "Robot.txt ve sitemap düzgünlüğü",
      "HTTPS, güvenlik ve performans",
      "Mobile uyumluluk detay skoru",
      "Her madde için adım adım iyileştirme talimatı",
    ],
    launchDate: "Mayıs 2026",
  },
  tracker: {
    label: "GH7 Tracker",
    titleLine1: "Haftalık",
    titleLine2: "Otomatik Takip",
    intro:
      "Her Pazartesi sabah skorun yeniden ölçülür. Trend grafiği, değişim bildirimi, karşılaştırmalı tarih aralığı.",
    features: [
      "Her Pazartesi 08:00'de otomatik tarama",
      "Trend grafiği (30 / 90 / 365 gün)",
      "Skor değişiminde SMS ve e-posta bildirim",
      "Hangi sorguda kazandın, hangisinde kaybettin",
      "Hafta hafta karşılaştırma",
      "Düşüş erken uyarı sistemi",
      "Rakiple yan yana trend çizgisi",
      "CSV ve PDF rapor dışa aktarma",
      "Özel tarih aralığı seçimi",
      "Scan geçmişi detay sayfası",
    ],
    launchDate: "Mayıs 2026",
  },
  radar: {
    label: "GH7 Radar",
    titleLine1: "Rakip Takip",
    titleLine2: "ve Karşılaştırma",
    intro:
      "Seçtiğin 3 rakibi sürekli izleyen, senin önüne geçtiklerinde anında uyaran rakip istihbarat sistemi.",
    features: [
      "3 rakip (Pro) veya 10 rakip (Pro+) takibi",
      "Rakip skoru yanında kendi skorun",
      "Rakip önce geçtiğinde anlık bildirim",
      "Hangi sorgularda rakip öne çıktı",
      "Rakip profilini görüntüleme",
      "Yeni rakip önerisi (analiz dışı)",
      "Rakip trend grafiği",
      "Rakip değiştirme ve ekleme",
      "Rakip performans özeti (haftalık)",
      "Pazar sıralaması görünümü",
    ],
    launchDate: "Haziran 2026",
  },
  advisor: {
    label: "GH7 Advisor",
    titleLine1: "Opus Haftalık",
    titleLine2: "Rapor",
    intro:
      "Anthropic Claude Opus seviyesinde yapay zeka ile hazırlanan, senin sektörüne özel haftalık strateji raporu.",
    features: [
      "Haftalık kişisel rapor (Opus yazımı)",
      "Sektör bazlı AI arama trendi analizi",
      "Önceki haftanın aksiyon takibi",
      "Gelecek haftanın öncelik listesi",
      "Algoritma değişiklikleri erken uyarı",
      "İçerik fırsatları (hangi konu trendde)",
      "Rakiplerle kıyaslamalı yorumlama",
      "Sektör lideri becerilerini adapte öneriler",
      "Bi-weekly 30dk strateji görüşmesi",
      "E-posta ile haftalık özet (Pazartesi)",
    ],
    launchDate: "Haziran 2026",
  },
} as const;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DashboardSlugPage({ params }: Props) {
  const { slug } = await params;
  const info = BRANDS[slug as keyof typeof BRANDS];
  if (!info) notFound();
  return <ComingSoonView info={info} />;
}
