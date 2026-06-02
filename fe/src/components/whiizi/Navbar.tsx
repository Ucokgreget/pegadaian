"use client";

import { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // Check if scrolled past top to add glassmorphism
    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }

    // Hide on scroll down, show on scroll up (unless at the very top)
    if (latest > 100 && latest > previous) {
      setHidden(true);
      setMobileOpen(false); // Auto close mobile menu when hiding
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "pt-4 px-4" : "pt-4 px-4"
      }`}
    >
      <div 
        className={`mx-auto max-w-7xl transition-all duration-500 rounded-full border ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-border/60 py-3 px-6"
            : "bg-transparent border-transparent py-4 px-6"
        }`}
      >
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="relative z-10 shrink-0">
              <Image
                src="/logo-web.png"
                alt="Sijaka Logo"
                width={140}
                height={40}
                className="h-8 w-auto"
                unoptimized
              />
            </Link>
          </div>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex lg:gap-10">
            <ScrollLink
              to="fitur"
              smooth={true}
              duration={500}
              offset={-120}
              className="text-[14px] font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              Fitur
            </ScrollLink>
            <ScrollLink
              to="cara-kerja"
              smooth={true}
              duration={500}
              offset={-120}
              className="text-[14px] font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              Cara Kerja
            </ScrollLink>
            <ScrollLink
              to="harga"
              smooth={true}
              duration={500}
              offset={-120}
              className="text-[14px] font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              Harga
            </ScrollLink>
            <ScrollLink
              to="faq"
              smooth={true}
              duration={500}
              offset={-120}
              className="text-[14px] font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer"
            >
              FAQ
            </ScrollLink>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full px-7 py-2.5 font-bold text-[13px] tracking-wide transition-all duration-300 bg-foreground text-white hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-px"
            >
              Masuk
            </Link>
          </div>

          <button
            type="button"
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden text-foreground hover:bg-accent"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="flex flex-col gap-1.5">
              <span
                className={`h-[2px] w-5 rounded bg-current transition-transform ${
                  mobileOpen ? "translate-y-[8px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-4 rounded bg-current transition-opacity ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-[2px] w-5 rounded bg-current transition-transform ${
                  mobileOpen ? "-translate-y-[8px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 rounded-2xl border border-border bg-white/95 backdrop-blur-xl shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-6 py-6">
              <ScrollLink
                to="fitur"
                smooth={true}
                duration={500}
                offset={-100}
                className="text-[15px] font-bold text-foreground hover:text-primary py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                Fitur
              </ScrollLink>
              <ScrollLink
                to="cara-kerja"
                smooth={true}
                duration={500}
                offset={-100}
                className="text-[15px] font-bold text-foreground hover:text-primary py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                Cara Kerja
              </ScrollLink>
              <ScrollLink
                to="harga"
                smooth={true}
                duration={500}
                offset={-100}
                className="text-[15px] font-bold text-foreground hover:text-primary py-3 border-b border-border/50"
                onClick={() => setMobileOpen(false)}
              >
                Harga
              </ScrollLink>
              <ScrollLink
                to="faq"
                smooth={true}
                duration={500}
                offset={-100}
                className="text-[15px] font-bold text-foreground hover:text-primary py-3"
                onClick={() => setMobileOpen(false)}
              >
                FAQ
              </ScrollLink>
              <div className="mt-4 pt-2">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center rounded-full bg-foreground px-4 py-3.5 text-[14px] font-bold text-white shadow-md transition hover:bg-foreground/90"
                  onClick={() => setMobileOpen(false)}
                >
                  Masuk / Daftar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
