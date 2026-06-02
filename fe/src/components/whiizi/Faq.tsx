"use client";

import { useState } from "react";

const faqItems = [
  {
    question: "Apakah perlu coding untuk menggunakannya?",
    answer:
      "Sama sekali tidak. Sijaka.id dirancang untuk siapapun. Kami menyediakan antarmuka visual (dashboard) yang sangat sederhana untuk mengatur balasan dan produk Anda.",
  },
  {
    question: "Apakah nomor WhatsApp saya aman dari blokir?",
    answer:
      "Sangat aman. Kami menggunakan integrasi WhatsApp API Resmi (Cloud API) yang disetujui langsung oleh Meta (Facebook). Tidak ada risiko nomor diblokir selama Anda mematuhi kebijakan Meta.",
  },
  {
    question: "Bisakah dipakai untuk banyak produk digital sekaligus?",
    answer:
      "Bisa. Anda dapat menambahkan ratusan produk ke dalam katalog. Bot akan secara cerdas mengenali pesanan pelanggan dan mengarahkan mereka ke produk yang tepat.",
  },
  {
    question: "Apakah proses pembayarannya benar-benar otomatis?",
    answer:
      "Ya. Kami menyediakan integrasi Payment Gateway resmi. Ketika pelanggan transfer atau bayar via QRIS, sistem langsung mengecek mutasi dalam hitungan detik dan mengirimkan pesanan tanpa jeda waktu.",
  },
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-slate-50/50">
      {/* Top Border */}
      <div className="absolute top-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Side: Sticky Intro */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
                FAQ
              </p>
              <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-foreground leading-[1.15]">
                Pertanyaan yang sering <span className="text-primary">ditanyakan.</span>
              </h2>
              <p className="mt-5 text-[1.05rem] text-muted-foreground leading-relaxed">
                Menghapus keraguan Anda. Berikut adalah beberapa hal yang paling sering ditanyakan oleh ratusan seller digital sebelum menggunakan layanan kami.
              </p>
            </div>
          </div>

          {/* Right Side: Accordion */}
          <div className="lg:w-2/3">
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => {
                const isOpen = openFaq === item.question;
                return (
                  <div
                    key={item.question}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 bg-white ${
                      isOpen 
                        ? "border-primary/40 shadow-lg shadow-primary/5" 
                        : "border-border hover:border-border/80 shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer outline-none"
                      onClick={() =>
                        setOpenFaq((current) =>
                          current === item.question ? null : item.question,
                        )
                      }
                    >
                      <span className={`text-[1.1rem] font-bold transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                        {item.question}
                      </span>
                      <span className={`ml-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen 
                          ? "border-primary bg-primary text-white rotate-180" 
                          : "border-border text-muted-foreground"
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isOpen ? "M20 12H4" : "M12 4v16m8-8H4"} />
                        </svg>
                      </span>
                    </button>
                    
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-6 pt-0 text-[1rem] leading-[1.65] text-muted-foreground font-medium">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
