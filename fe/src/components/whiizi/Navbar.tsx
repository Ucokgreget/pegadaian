"use client";

import { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500">
            <span className="text-sm font-bold text-slate-950">Z</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight sm:text-base">
              Zaptify
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">
              WhatsApp Automation
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#fitur"
            className="text-sm text-slate-300 hover:text-emerald-300"
          >
            Fitur
          </a>
          <a
            href="#cara-kerja"
            className="text-sm text-slate-300 hover:text-emerald-300"
          >
            Cara Kerja
          </a>
          <a
            href="#harga"
            className="text-sm text-slate-300 hover:text-emerald-300"
          >
            Harga
          </a>
          <a
            href="#faq"
            className="text-sm text-slate-300 hover:text-emerald-300"
          >
            FAQ
          </a>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-emerald-300"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Mulai Gratis
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-800 p-2 text-slate-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-0.5 w-5 rounded bg-slate-100 transition ${
                mobileOpen ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-4 rounded bg-slate-400 transition ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-5 rounded bg-slate-100 transition ${
                mobileOpen ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <a
              href="#fitur"
              className="rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Fitur
            </a>
            <a
              href="#cara-kerja"
              className="rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Cara Kerja
            </a>
            <a
              href="#harga"
              className="rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Harga
            </a>
            <a
              href="#faq"
              className="rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              FAQ
            </a>
            <Link
              href="/login"
              className="rounded-lg px-2 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              onClick={() => setMobileOpen(false)}
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
