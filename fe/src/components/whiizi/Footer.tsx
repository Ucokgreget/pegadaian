"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";

export function Footer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For text reveal animation
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, margin: "-100px" });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <footer className="relative bg-slate-50 pt-24 pb-10 overflow-hidden">
      {/* Mega CTA Section (Spotlight) */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] bg-foreground overflow-hidden px-8 py-20 sm:px-16 sm:py-24 text-center shadow-2xl"
        >
          {/* Spotlight Effect Glow (Tracks Mouse) */}
          <motion.div
            className="absolute pointer-events-none rounded-full blur-[80px] w-[500px] h-[500px]"
            animate={{
              x: mousePosition.x - 250,
              y: mousePosition.y - 250,
              opacity: isHovering ? 0.15 : 0,
            }}
            transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,1) 0%, rgba(16,185,129,0) 70%)",
            }}
          />

          {/* Static Background decorative glows */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-[80%] h-[150%] rounded-full bg-primary/10 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl" ref={titleRef}>
            <motion.h2 
              className="text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold tracking-tight text-white leading-[1.05]"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            >
              Siap Meningkatkan Penjualan Anda?
            </motion.h2>
            <motion.p 
              className="mt-6 text-[1.15rem] text-slate-300/90 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              Bergabunglah dengan ribuan seller digital yang sudah menikmati kemudahan otomatisasi dari Sijaka.id. Setup hanya 5 menit.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            >
              <Link href="/register" className="group w-full sm:w-auto">
                <button className="relative flex w-full items-center justify-center gap-3 rounded-full bg-primary px-10 py-5 text-[16px] font-bold text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-[0_20px_40px_-8px_rgba(16,185,129,0.7)]">
                  Mulai Gratis Sekarang
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-web.png"
                alt="Sijaka Logo"
                width={140}
                height={40}
                className="h-9 w-auto"
                unoptimized
              />
            </Link>
            <p className="mt-5 text-[0.95rem] text-muted-foreground leading-relaxed max-w-sm">
              Sijaka.id adalah platform otomatisasi WhatsApp untuk seller digital di Indonesia. Jualan cerdas, cepat, dan 100% otomatis tanpa campur tangan manusia.
            </p>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground tracking-wide">Navigasi</h4>
            <a href="#fitur" className="text-muted-foreground hover:text-primary transition-colors font-medium">Fitur</a>
            <a href="#cara-kerja" className="text-muted-foreground hover:text-primary transition-colors font-medium">Cara Kerja</a>
            <a href="#harga" className="text-muted-foreground hover:text-primary transition-colors font-medium">Harga</a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">FAQ</a>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground tracking-wide">Legal</h4>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors font-medium">Syarat & Ketentuan</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium">Kebijakan Privasi</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors font-medium">Hubungi Kami</Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border/80 pt-8 text-[0.85rem] text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Sijaka.id. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
