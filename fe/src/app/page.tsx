// TIDAK ada "use client" — ini server component
import { Navbar } from "@/components/whiizi/Navbar";
import { HeroSection } from "@/components/whiizi/HeroSection/HeroSection";
import { FeaturesSection } from "@/components/whiizi/FeaturesSection";
import { HowItWorksSection } from "@/components/whiizi/HowItWorksSection";
import { TestimonialsSection } from "@/components/whiizi/TestimonialsSection";
import { PricingSection } from "@/components/whiizi/PricingSection/PricingSection";
import { FaqSection } from "@/components/whiizi/Faq";
import { Footer } from "@/components/whiizi/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
