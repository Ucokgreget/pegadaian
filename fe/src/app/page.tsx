"use client";

import { useState } from "react";
import { Navbar } from "@/components/whiizi/Navbar";
import { HeroSection } from "@/components/whiizi/HeroSection";
import { FeaturesSection } from "@/components/whiizi/FeaturesSection";
import { HowItWorksSection } from "@/components/whiizi/HowItWorksSection";
import { TestimonialsSection } from "@/components/whiizi/TestimonialsSection";
import { PricingSection } from "@/components/whiizi/PricingSection";
import { Footer } from "@/components/whiizi/Footer";

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
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
          className="mt-4 border-t border-slate-800 bg-slate-950/60 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                FAQ
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                Pertanyaan yang sering ditanyakan.
              </h2>
              <p className="mt-3 text-sm text-slate-400 sm:text-base">
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
                    className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40"
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
                      <span className="text-sm font-medium text-slate-50 sm:text-base">
                        {item.question}
                      </span>
                      <span className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 text-xs text-slate-300">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-slate-800/70 px-4 py-3 text-sm text-slate-300 sm:px-5 sm:py-4">
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
