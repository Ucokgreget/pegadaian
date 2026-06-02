"use client";

import { motion } from "motion/react";

const steps = [
  {
    step: "Langkah 1",
    title: "Daftar & Hubungkan",
    description:
      "Daftar akun Sijaka.id dan hubungkan nomor WhatsApp Business melalui Meta Business Suite. Proses yang aman dan resmi dalam hitungan menit.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20"
  },
  {
    step: "Langkah 2",
    title: "Setup Produk & Harga",
    description:
      "Unggah katalog produk digital Anda, atur detail harga, kelola stok, dan susun pesan otomatis sesuai dengan sapaan khas brand Anda.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20"
  },
  {
    step: "Langkah 3",
    title: "Interaksi & Pesanan",
    description:
      "Pelanggan menghubungi Anda via WhatsApp. Bot seketika merespons dengan pintar, menampilkan katalog, dan menjawab pertanyaan dengan konteks yang tepat.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    ring: "ring-indigo-500/20"
  },
  {
    step: "Langkah 4",
    title: "Selesai Otomatis",
    description:
      "Pelanggan membayar secara otomatis via Payment Gateway, dan sistem langsung mengirimkan detail akun/file digital tanpa perlu ada sentuhan admin manusia.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20"
  },
];

export function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="relative py-24 sm:py-32 bg-slate-50/50">
      {/* Top Border */}
      <div className="absolute top-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Side: Sticky Text */}
          <div className="lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="sticky top-32"
            >
              <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
                Cara Kerja
              </p>
              <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-foreground leading-[1.15]">
                Dari chat pertama hingga terkirim, <span className="text-primary">semuanya otomatis.</span>
              </h2>
              <p className="mt-5 text-[1.05rem] text-muted-foreground leading-relaxed">
                Cukup sekali pengaturan, selanjutnya biarkan bot Sijaka.id yang bekerja menangani semua order dari pelanggan di WhatsApp. Anda bisa fokus pada pengembangan bisnis.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Scrollable Steps */}
          <div className="lg:w-2/3">
            <div className="relative border-l-2 border-border/60 pl-8 md:pl-12 ml-4 md:ml-0 flex flex-col gap-14">
              {steps.map((step, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  key={step.title}
                  className="relative flex flex-col gap-3 group"
                >
                  {/* Decorative dot on the timeline */}
                  <div className={`absolute -left-[2.2rem] md:-left-[3.15rem] top-1 h-4 w-4 rounded-full border-4 border-background bg-border transition-colors duration-300 group-hover:${step.bg.replace('/10', '')}`} />
                  
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${step.color} ${step.bg} ring-1 ${step.ring}`}>
                    {step.step}
                  </span>
                  
                  <h3 className="mt-2 text-2xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-[1.05rem] text-muted-foreground leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
