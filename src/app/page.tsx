import Nav from "@/components/landing-v6/Nav";
import HeroSection from "@/components/landing-v6/HeroSection";
import FearSection from "@/components/landing-v6/FearSection";
import KapiSection from "@/components/landing-v6/KapiSection";
import CozumSection from "@/components/landing-v6/CozumSection";
import CaseStudySection from "@/components/landing-v6/CaseStudySection";
import PlatformStrip from "@/components/landing-v6/PlatformStrip";
import ResearchSection from "@/components/landing-v6/ResearchSection";
import FaqSection from "@/components/landing-v6/FaqSection";
import FinalCta from "@/components/landing-v6/FinalCta";
import Footer from "@/components/landing-v6/Footer";
import RevealWrapper from "@/components/landing-v6/RevealWrapper";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <FearSection />
        <KapiSection />
        <CozumSection />
        <CaseStudySection />
        <PlatformStrip />
        <ResearchSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
      <RevealWrapper />
    </>
  );
}
