"use client";

import { useState } from "react";
import { Navbar } from "@/components/whiizi/Navbar";
import { HeroSection } from "@/components/whiizi/HeroSection";
import { FeaturesSection } from "@/components/whiizi/FeaturesSection";
import { HowItWorksSection } from "@/components/whiizi/HowItWorksSection";
import { TestimonialsSection } from "@/components/whiizi/TestimonialsSection";
import { PricingSection } from "@/components/whiizi/PricingSection";
import { Footer } from "@/components/whiizi/Footer";

export const dynamic = "force-dynamic"

const faqItems = [
  {
    question: "Apakah perlu coding?",
    answer:
      "Tidak perlu. Semua sudah disiapkan dengan interface yang sederhana.",
  },
  {
    question: "Apakah aman?",
    answer:
      "Ya, integrasi menggunakan enkripsi end-to-end standar WhatsApp API melalui Meta Business Suite.",
  },
  {
    question: "Bisakah dipakai untuk banyak produk?",
    answer:
      "Bisa. Anda dapat mengelola banyak produk digital sekaligus dalam satu dashboard.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<string | null>(
    faqItems[0]?.question ?? null
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero + Preview */}
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <HeroSection />

        {/* Reusable Sections */}
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />

        {/* FAQ */}
        <section
          id="faq"
          className="mt-4 border-t border-border bg-card/10 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                FAQ
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Pertanyaan yang sering ditanyakan.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Jika Anda masih ragu, berikut beberapa hal yang paling sering
                ditanyakan oleh para seller sebelum mulai menggunakan Whiizi.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {faqItems.map((item) => {
                const isOpen = openFaq === item.question;
                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-2xl border border-border bg-card/50"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5 sm:py-4"
                      onClick={() =>
                        setOpenFaq((current) =>
                          current === item.question ? null : item.question
                        )
                      }
                    >
                      <span className="text-sm font-medium text-foreground sm:text-base">
                        {item.question}
                      </span>
                      <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground sm:px-5 sm:py-4">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
