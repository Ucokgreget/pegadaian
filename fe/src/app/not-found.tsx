"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-emerald-500/40 via-emerald-500/5 to-slate-900 blur-xl" />
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.9)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-sm font-bold text-slate-950">
              W
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight sm:text-base">
                Whiizi
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400">
                WhatsApp Automation
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-emerald-300">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-emerald-500/30" />
              <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-slate-950">
                404
              </span>
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.2em]">
              Halaman tidak ditemukan
            </p>
          </div>

          <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Ups, link WhatsApp ini sepertinya salah jalur.
          </h1>

          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
            Tenang, bot dan automasi WhatsApp Anda tetap berjalan seperti biasa.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              onClick={() =>
                typeof window !== "undefined" ? window.history.back() : null
              }
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              Kembali ke halaman sebelumnya
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400">
            <p className="font-medium text-slate-200">Tips:</p>
            <p className="mt-1">
              Pastikan URL yang Anda akses sudah benar, atau gunakan menu di
              beranda untuk kembali ke fitur automasi WhatsApp Whiizi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
