import { PhonePreview } from "../PhonePreview/PhonePreview";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative grid gap-12 items-center mb-20 overflow-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16 lg:mb-28 font-sans before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(34,197,94,0.08)_0%,transparent_70%),radial-gradient(ellipse_40%_60%_at_80%_20%,rgba(16,185,129,0.06)_0%,transparent_60%)] before:pointer-events-none before:z-0">
      {/* Left: Copy */}
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 py-[0.35rem] px-[0.85rem] text-[0.75rem] font-semibold text-primary tracking-[0.02em] animate-in fade-in slide-in-from-top-4 duration-600 backdrop-blur-[6px]">
          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(34,197,94,0.25)] animate-pulse shrink-0" />
          Automasi WhatsApp untuk e-commerce digital
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-balance animate-in fade-in slide-in-from-top-4 duration-600 delay-100 fill-mode-both">
          <span className="block bg-gradient-to-br from-[#22c55e] via-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">
            Pusing Ngurus Orderan Manual?
          </span>
          <span className="block text-foreground mt-[0.15em]">
            Ubah Bisnis dengan
            <br />
            Automasi WhatsApp.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-[1.1rem] max-w-[30rem] text-[clamp(0.875rem,1.5vw,1rem)] leading-[1.7] text-muted-foreground font-normal animate-in fade-in slide-in-from-top-4 duration-600 delay-200 fill-mode-both">
          Automasi seluruh alur bisnis e-commerce dengan bot WhatsApp pintar.
          Tingkatkan penjualan hingga{" "}
          <strong style={{ color: "#22c55e", fontWeight: 700 }}>300%</strong>{" "}
          dengan strategi automasi yang terbukti berhasil.
        </p>

        {/* CTA */}
        <div className="mt-7 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-600 delay-300 fill-mode-both">
          <Link href="/register">
            <button className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-emerald-600 py-[0.7rem] px-[1.4rem] text-[0.875rem] font-bold text-white border-none cursor-pointer shadow-[0_4px_16px_rgba(34,197,94,0.35),0_1px_3px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-250 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.45),0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-0 group">
              <span className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                Mulai Gratis Sekarang
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                  viewBox="0 0 16 16"
                  fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              </span>
            </button>
          </Link>

          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-primary/30 bg-primary/5 py-[0.7rem] px-[1.4rem] text-[0.875rem] font-semibold text-foreground cursor-pointer backdrop-blur-[6px] transition-all duration-250 hover:border-primary hover:text-primary hover:bg-primary/10 hover:-translate-y-px">
            <svg
              className="w-[15px] h-[15px] opacity-70"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6.5 5.5l4 2.5-4 2.5V5.5z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
            Lihat Demo Chat
          </button>
        </div>

        {/* Stats */}
        <div className="mt-7 flex flex-wrap items-center gap-y-1 gap-x-5 animate-in fade-in slide-in-from-top-4 duration-600 delay-400 fill-mode-both">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-[0.8125rem] font-medium text-muted-foreground">
              <span className="font-bold text-foreground">10.000+</span> Toko Digital
              Aktif
            </span>
          </div>

          <span className="w-px h-[1.2rem] bg-primary/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-[0.8125rem] font-medium text-muted-foreground">
              <span className="font-bold text-foreground">99,9%</span> Uptime
            </span>
          </div>

          <span className="w-px h-[1.2rem] bg-primary/20 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="text-[0.8125rem] font-medium text-muted-foreground">
              Support <span className="font-bold text-foreground">24/7</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Phone */}
      <PhonePreview />
    </section>
  );
}
