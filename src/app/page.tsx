import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CapabilitiesSection } from "@/components/landing/capabilities-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="pt-20">
        <HeroSection />
        <StatsSection />
        <CapabilitiesSection />
        <BenefitsSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
