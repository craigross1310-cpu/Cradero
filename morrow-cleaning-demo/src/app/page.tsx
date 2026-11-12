import { Hero } from "@/components/home/hero";
import { TrustMarquee } from "@/components/home/trust-marquee";
import { Services } from "@/components/home/services";
import { HowItWorks } from "@/components/home/how-it-works";
import { QuoteCalculator } from "@/components/calculator/quote-calculator";
import { WhyChoose } from "@/components/home/why-choose";
import { BeforeAfter } from "@/components/home/before-after";
import { Reviews } from "@/components/home/reviews";
import { FAQ } from "@/components/home/faq";
import { FinalCTA } from "@/components/home/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Services />
      <HowItWorks />
      <QuoteCalculator />
      <WhyChoose />
      <BeforeAfter />
      <Reviews />
      <FAQ />
      <FinalCTA />
    </>
  );
}
