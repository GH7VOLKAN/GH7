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
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Navbar />
      <HeroSection />
      <SocialProof />

      <div id="ozellikler">
        <FeatureSection
          eyebrow="Yapay Zeka Taraması"
          title="4 yapay zekada nasıl göründüğünü hemen öğren"
          description="ChatGPT, Claude, Gemini ve Perplexity — hepsi aynı anda taranır. Seni tanıyorlar mı, ne söylüyorlar? Sonucu anında gör."
          ctaText="Şimdi dene"
          ctaHref="#hero"
          visual={<FeatureVisualScore />}
        />

        <FeatureSection
          eyebrow="Rakip Karşılaştırma"
          title="Senin yerine kimi öneriyorlar?"
          description="Yapay zekaya sorulduğunda senin yerine başka firma mı çıkıyor? Kimin önde olduğunu gör, aradaki farkı öğren."
          ctaText="Keşfet"
          ctaHref="/login"
          visual={<FeatureVisualCompetitors />}
          reversed
        />

        <FeatureSection
          eyebrow="Haftalık Takip"
          title="Her hafta otomatik kontrol"
          description="Yapay zekalar seni bu hafta daha çok mu tanıyor, daha az mı? Her hafta otomatik taranır, değişimleri görürsün."
          ctaText="Takibe başla"
          ctaHref="/login"
          visual={<FeatureVisualTracking />}
        />

        <FeatureSection
          eyebrow="Gelişim Planı"
          title="Ne yapman gerektiğini adım adım gösterir"
          description="Neyi değiştirirsen yapay zekalarda daha çok görünürsün? Sana özel bir yapılacaklar listesi. Uygula, sonuçları takip et."
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
