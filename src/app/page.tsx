import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProof } from "@/components/landing/social-proof";
import { FeatureSection } from "@/components/landing/feature-section";
import { FeatureVisualScore } from "@/components/landing/feature-visual-score";
import { FeatureVisualCompetitors } from "@/components/landing/feature-visual-competitors";
import { FeatureVisualTracking } from "@/components/landing/feature-visual-tracking";
import { FeatureVisualActions } from "@/components/landing/feature-visual-actions";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProof />

      <div id="ozellikler">
        <FeatureSection
          eyebrow="AI Görünürlük Skoru"
          title="Her platformda nasıl göründüğünü tek bir skorla öğren"
          description="ChatGPT, Claude, Gemini ve Perplexity seni ne kadar tanıyor? 4 platformdaki görünürlüğünü tek bir skor ile ölç, haftalık değişimi izle."
          ctaText="Şimdi test et"
          ctaHref="#hero"
          visual={<FeatureVisualScore />}
        />

        <FeatureSection
          eyebrow="Rakip Analizi"
          title="Senin yerine kim öneriliyor?"
          description="AI platformları seni değil, rakiplerini mi öneriyor? Kimin önde olduğunu gör, aradaki farkı kapat."
          ctaText="Pro ile keşfet"
          ctaHref="/login"
          visual={<FeatureVisualCompetitors />}
          reversed
        />

        <FeatureSection
          eyebrow="Haftalık Takip"
          title="AI görünürlüğündeki değişimi izle"
          description="Her hafta otomatik tarama. Skorun yükseliyor mu, düşüyor mu? Trend raporlarıyla her şey kontrol altında."
          ctaText="Takibi başlat"
          ctaHref="/login"
          visual={<FeatureVisualTracking />}
        />

        <FeatureSection
          eyebrow="Aksiyon Planı"
          title="Kişiselleştirilmiş adımlarla AI'da görünür ol"
          description="Neyi, nerede, nasıl değiştirmen gerektiğini adım adım gösteren kişiselleştirilmiş plan. Takip et, uygula, sonuçları gör."
          ctaText="Planını al"
          ctaHref="/login"
          visual={<FeatureVisualActions />}
          reversed
        />
      </div>

      <HowItWorks />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
