import { NavSection } from "@/components/landing/nav-section";
import { HeroSectionV3 } from "@/components/landing/hero-section-v3";
import { ResearchSection } from "@/components/landing/research-section";
import { ProfileBenefitsSection } from "@/components/landing/profile-benefits-section";
import { HonestySection } from "@/components/landing/honesty-section";
import { IsitmaxProofSection } from "@/components/landing/isitmax-proof-section";
import { PlatformsSection } from "@/components/landing/platforms-section";
import { TurkeyMapSection } from "@/components/landing/turkey-map-section";
import { AgencySection } from "@/components/landing/agency-section";
import { UrgencySection } from "@/components/landing/urgency-section";
import { PricingSectionV3 } from "@/components/landing/pricing-section-v3";
import { BlogSection } from "@/components/landing/blog-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <NavSection />
      <HeroSectionV3 />
      <ResearchSection />
      <ProfileBenefitsSection />
      <HonestySection />
      <IsitmaxProofSection />
      <PlatformsSection />
      <TurkeyMapSection />
      <AgencySection />
      <UrgencySection />
      <PricingSectionV3 />
      <BlogSection />
      <FaqSection />
      <FinalCtaSection />
      <FooterSection />
    </main>
  );
}
