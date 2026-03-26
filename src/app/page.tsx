import { NavSection } from "@/components/landing/nav-section";
import { HeroSectionV5 } from "@/components/landing/hero-section-v5";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { IsitmaxProofSection } from "@/components/landing/isitmax-proof-section";
import { ResearchSection } from "@/components/landing/research-section";
import { HonestySection } from "@/components/landing/honesty-section";
import { GeoSection } from "@/components/landing/geo-section";
import { TurkeyMapSection } from "@/components/landing/turkey-map-section";
import { AgencySection } from "@/components/landing/agency-section";
import { UrgencySection } from "@/components/landing/urgency-section";
import { PricingSectionV5 } from "@/components/landing/pricing-section-v5";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <NavSection />
      <HeroSectionV5 />
      <PlatformsSection />
      <IsitmaxProofSection />
      <ResearchSection />
      <HonestySection />
      <GeoSection />
      <TurkeyMapSection />
      <AgencySection />
      <UrgencySection />
      <PricingSectionV5 />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}
