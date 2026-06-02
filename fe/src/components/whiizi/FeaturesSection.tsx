"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

const features: { 
  title: string; 
  description: string; 
  icon: ReactNode; 
  className?: string;
  badge?: string;
}[] = [
  {
    title: "Smart AI WhatsApp Bot",
    description:
      "Ubah setiap obrolan menjadi penjualan. Bot kami mengerti konteks, menghitung total, hingga mengarahkan customer untuk checkout tanpa admin manusia sama sekali.",
    className: "sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden",
    badge: "Fitur Utama",
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H11L11 22L21 10H13L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Automation 24/7",
    description:
      "Tidur lebih nyenyak. Transaksi tetap berjalan meski Anda sedang tidak memegang HP. Bot aktif tanpa henti.",
    className: "sm:col-span-1 lg:col-span-1",
    icon: (
      <svg className="h-6 w-6 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Payment Gateway",
    description:
      "Terima pembayaran via QRIS, Virtual Account, hingga e-wallet secara instan dan aman.",
    className: "sm:col-span-1 lg:col-span-1",
    icon: (
      <svg className="h-6 w-6 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6 9H10M6 13H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Auto Delivery System",
    description:
      "Setelah pembayaran berhasil dikonfirmasi, sistem secara otomatis mengirim file digital atau informasi akun pesanan langsung ke chat customer.",
    className: "sm:col-span-2 lg:col-span-2",
    badge: "Otomatisasi Penuh",
    icon: (
      <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10L20 12L10 20H4L9 12L4 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export function FeaturesSection() {
  return (
    <section id="fitur" className="relative py-24 sm:py-32">
      {/* Decorative top border */}
      <div className="absolute top-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center mx-auto"
        >
          <p className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-primary">
            Fitur Canggih
          </p>
          <h2 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tight text-foreground leading-[1.15]">
            Semua yang Anda butuhkan untuk <span className="text-primary">meng-automasi</span> toko digital.
          </h2>
          <p className="mt-4 text-[clamp(0.95rem,1.5vw,1.1rem)] text-muted-foreground leading-relaxed">
            Sijaka.id membantu Anda mengelola pesanan, pembayaran, hingga pengiriman
            produk secara otomatis langsung dari WhatsApp. Tanpa perlu coding sama sekali.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              variants={itemVariants}
              key={feature.title}
              className={`group flex flex-col gap-5 rounded-[1.5rem] border border-border bg-white p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${feature.className || ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-border shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  {feature.icon}
                </div>
                {feature.badge && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                    {feature.badge}
                  </span>
                )}
              </div>
              
              <div className="mt-2">
                <h3 className="text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
                  {feature.description}
                </p>
              </div>

              {/* Decorative background glow for large cards */}
              {(feature.className?.includes('col-span-2')) && (
                <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
