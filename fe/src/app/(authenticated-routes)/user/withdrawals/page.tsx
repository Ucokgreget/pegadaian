"use client";

import { motion } from "motion/react";
import {
  HelpCircle,
  Wallet,
  ArrowUpRight,
  Clock,
  Info,
  FileText,
  MessageSquare,
  AlertCircle
} from "lucide-react";

export default function WithdrawalsPage() {
  return (
    <div className="w-full bg-transparent text-foreground min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Withdraw Saldo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola penarikan saldo revenue Anda
            </p>
          </div>
          <button className="flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-4 w-4" />
            Tutorial
          </button>
        </div>

        {/* Bank & E-Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Bank & E-Wallet Tersimpan</h2>
              <p className="text-sm text-muted-foreground">Data rekening untuk penarikan saldo</p>
            </div>
            <button className="rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors">
              Tambah Rekening
            </button>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-5 w-full sm:w-fit min-w-[300px]">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
              <h3 className="font-semibold text-foreground">Bank Syariah Indonesia (BSI)</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                Primary
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">No. Rekening:</span>
                <span className="font-medium text-foreground text-right">7242531487</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Nama Pemilik:</span>
                <span className="font-medium text-foreground text-right">Muhammad Luqman Al-Fauzan</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3 Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Total Revenue</h3>
                <p className="text-sm text-muted-foreground">Total penjualan</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">Rp 0</p>
              <div className="mt-2 flex items-center text-sm font-medium text-emerald-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>Dari semua penjualan</span>
              </div>
            </div>
          </motion.div>

          {/* Bisa Ditarik */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bisa Ditarik</h3>
                <p className="text-sm text-muted-foreground">Saldo tersedia</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground mb-3">Rp 0</p>
              <button disabled className="w-full rounded-lg bg-blue-500/5 px-4 py-2 text-sm font-medium text-blue-500/50 border border-blue-500/10 cursor-not-allowed transition-colors">
                Saldo Kurang
              </button>
            </div>
          </motion.div>

          {/* Sedang Diproses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sedang Diproses</h3>
                <p className="text-sm text-muted-foreground">Withdraw pending</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground mb-3">Rp 0</p>
              <button className="w-full rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                Lihat Riwayat
              </button>
            </div>
          </motion.div>
        </div>

        {/* Informasi Withdraw Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <Info className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-foreground">Informasi Withdraw</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Terms and Conditions */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-500">
                <FileText className="h-5 w-5" />
                <h3 className="font-semibold text-foreground">Syarat & Ketentuan</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground ml-2">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>Minimum withdraw: <strong className="text-foreground">Rp 50.000</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>Maksimum withdraw: <strong className="text-foreground">Rp 10.000.000</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>Biaya admin: <strong className="text-foreground">Rp 7.500</strong> (semua nominal)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>Withdraw hanya bisa dilakukan dari revenue penjualan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>Pastikan data bank yang dimasukkan benar dan aktif</span>
                </li>
              </ul>
            </div>

            {/* Withdraw Process */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-amber-500">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold text-foreground">Proses Withdraw</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-500 ring-1 ring-amber-500/20">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Submit Request</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Ajukan permintaan withdraw dengan data lengkap</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-500 ring-1 ring-blue-500/20">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Admin Review</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Tim admin akan review dalam 1x24 jam</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500 ring-1 ring-emerald-500/20">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Transfer</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Dana ditransfer ke rekening Anda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Box */}
          <div className="mt-8 flex items-start gap-4 rounded-xl bg-blue-500/5 p-4 border border-blue-500/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-500">Butuh Bantuan?</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Jika ada kendala dengan withdraw, silakan hubungi tim support kami melalui:
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Widget Live Chat Pojok Kanan Bawah
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
