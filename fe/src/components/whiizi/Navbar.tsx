"use client";

import { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "../ui/theme-toggle";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/logo-sijaka-png-transparent.png"
              alt="Sijaka.id Logo"
              width={1080}
              height={1080}
              className="w-auto h-12 rounded-xl"
              unoptimized
            />
          </Link>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <ScrollLink
            to="fitur"
            smooth={true}
            duration={500}
            offset={-70}
            className="text-sm text-foreground hover:text-primary cursor-pointer"
          >
            Fitur
          </ScrollLink>
          <ScrollLink
            to="cara-kerja"
            smooth={true}
            duration={500}
            offset={-70}
            className="text-sm text-foreground hover:text-primary cursor-pointer"
          >
            Cara Kerja
          </ScrollLink>
          <ScrollLink
            to="harga"
            smooth={true}
            duration={500}
            offset={-70}
            className="text-sm text-foreground hover:text-primary cursor-pointer"
          >
            Harga
          </ScrollLink>
          <ScrollLink
            to="faq"
            smooth={true}
            duration={500}
            offset={-70}
            className="text-sm text-foreground hover:text-primary cursor-pointer"
          >
            FAQ
          </ScrollLink>
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Login
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border p-2 text-foreground md:hidden vur"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-0.5 w-5 rounded bg-foreground transition ${
                mobileOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-4 rounded bg-muted-foreground transition ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded bg-foreground transition ${
                mobileOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <ScrollLink
              to="fitur"
              smooth={true}
              duration={500}
              offset={-70}
              className="rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Fitur
            </ScrollLink>
            <ScrollLink
              to="cara-kerja"
              smooth={true}
              duration={500}
              offset={-70}
              className="rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Cara Kerja
            </ScrollLink>
            <ScrollLink
              to="harga"
              smooth={true}
              duration={500}
              offset={-70}
              className="rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              Harga
            </ScrollLink>
            <ScrollLink
              to="faq"
              smooth={true}
              duration={500}
              offset={-70}
              className="rounded-lg px-2 py-2 text-sm text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
            >
              FAQ
            </ScrollLink>
            <ThemeToggle />
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
