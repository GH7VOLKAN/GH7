import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ShockSection } from "@/components/landing/shock-section";
import { DataSection } from "@/components/landing/data-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { OldVsNewSection } from "@/components/landing/old-vs-new-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { TrustSection } from "@/components/landing/trust-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div id="hero" className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ShockSection />
      <DataSection />
      <BeforeAfterSection />
      <OldVsNewSection />
      <HowItWorks />
      <PricingSection />
      <TrustSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
