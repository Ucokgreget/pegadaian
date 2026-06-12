import { PhonePreview } from "../PhonePreview/PhonePreview";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative grid gap-12 items-center mb-20 overflow-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:mb-28 pt-8 md:pt-16">
      {/* Left: Copy */}
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 py-2 pr-4 pl-3 text-[11px] font-semibold text-primary uppercase tracking-[0.18em] animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-sm">
          <Image
            src="/logo-sijaka-png-transparent.png"
            alt="Sijaka"
            width={24}
            height={24}
            className="w-4 h-4 object-contain"
            unoptimized
          />
          <span className="w-px h-3 bg-primary/20" aria-hidden="true" />
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          Partner Bisnis 24/7
        </div>

        {/* Heading */}
        <h1 className="mt-8 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both text-foreground">
          <span className="block text-foreground">
            Pusing Ngurus
          </span>
          <span className="block mt-[0.1em] overflow-hidden">
            <span className="block bg-gradient-to-r from-emerald-600 via-primary to-teal-500 bg-clip-text text-transparent italic pe-2 pb-2">
              Orderan Manual?
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-[50ch] text-[clamp(0.95rem,1.5vw,1.1rem)] leading-[1.65] text-muted-foreground font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
          Automasi seluruh alur bisnis e-commerce dengan bot WhatsApp pintar.
          Tingkatkan penjualan hingga{" "}
          <strong className="text-primary font-bold">300%</strong>{" "}
          dengan strategi automasi yang terbukti berhasil.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 fill-mode-both">
          <Link href="/register" className="group">
            <button className="relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-[14px] font-bold text-white shadow-[0_12px_24px_-8px_rgba(16,185,129,0.45)] transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-[0_20px_32px_-12px_rgba(16,185,129,0.6)] active:translate-y-0">
              Mulai Gratis Sekarang
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </Link>

          <button
            type="button"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-white px-8 py-4 text-[14px] font-semibold text-foreground transition-all duration-300 hover:border-primary/30 hover:bg-accent hover:text-primary hover:-translate-y-0.5"
          >
            Lihat Demo Chat
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center gap-y-4 gap-x-8 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-extrabold text-foreground tracking-tight">10.000+</span>
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Toko Aktif</span>
          </div>
          
          <div className="w-px h-10 bg-border/80 hidden sm:block" />
          
          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-extrabold text-foreground tracking-tight">99.9%</span>
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Uptime</span>
          </div>

          <div className="w-px h-10 bg-border/80 hidden sm:block" />

          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-extrabold text-foreground tracking-tight">24/7</span>
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest">Support</span>
          </div>
        </div>
      </div>

      {/* Right: Phone */}
      <div className="relative mx-auto w-full max-w-[320px] lg:max-w-none animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
        {/* Decorative background glow for phone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
        <PhonePreview />
      </div>
    </section>
  );
}
