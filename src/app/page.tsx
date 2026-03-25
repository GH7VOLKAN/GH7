import { NavSection } from "@/components/landing/nav-section";
import { HeroSectionV3 } from "@/components/landing/hero-section-v3";
import { ResearchSection } from "@/components/landing/research-section";
import { HonestySection } from "@/components/landing/honesty-section";
import { SeoVsGeoSection } from "@/components/landing/seo-vs-geo-section";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { TurkeyMapSection } from "@/components/landing/turkey-map-section";
import { AgencySection } from "@/components/landing/agency-section";
import { UrgencySection } from "@/components/landing/urgency-section";
import { PricingSectionV3 } from "@/components/landing/pricing-section-v3";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <NavSection />
      <HeroSectionV3 />
      <ResearchSection />
      <HonestySection />
      <SeoVsGeoSection />
      <PlatformsSection />
      <TurkeyMapSection />
      <AgencySection />
      <UrgencySection />
      <PricingSectionV3 />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}
