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
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background Mesh & Orbs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.35]" />
        
        {/* Animated breathing orbs */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-60 blur-[120px] animate-breathe-orb"
          style={{
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[40%] -right-[15%] w-[70%] h-[70%] rounded-full opacity-50 blur-[130px] animate-slow-drift"
          style={{
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <Navbar />
      
      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
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
