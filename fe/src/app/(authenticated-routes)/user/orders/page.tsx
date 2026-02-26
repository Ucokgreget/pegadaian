"use client";

import {
  HelpCircle,
  Download,
  RefreshCw,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Search,
  FileText,
  ChevronDown
} from "lucide-react";
import { motion } from "motion/react";

export default function OrdersPage() {
  return (
    <div className="w-full bg-transparent text-foreground min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Transaction Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor semua transaksi dan pembayaran
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
              Tutorial
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600/20 px-4 py-2 text-sm font-medium transition-colors border border-indigo-500/20">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 text-sm font-medium transition-colors border border-emerald-500/20">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Top Stats - 3 Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <DollarSign className="h-6 w-6" />
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
                <span>+0.0% bulan ini</span>
              </div>
            </div>
          </motion.div>

          {/* Bisa Ditarik */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <ArrowUpRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Bisa Ditarik</h3>
                <p className="text-sm text-muted-foreground">Revenue tersedia</p>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-bold text-foreground">Rp 0</p>
              <button className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-500 hover:bg-blue-500/20 transition-colors">
                <ArrowUpRight className="h-4 w-4" />
                Tarik Revenue
              </button>
            </div>
          </motion.div>

          {/* Sedang Diproses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm border border-border flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sedang Diproses</h3>
                <p className="text-sm text-muted-foreground">Transaksi pending</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">Rp 0</p>
              <div className="mt-2 text-sm font-medium text-amber-500">
                0 transaksi menunggu pembayaran
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats - 4 Cards */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl bg-card p-5 shadow-sm border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Completed</h3>
                <p className="text-xs text-muted-foreground">Transaksi selesai</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="mt-1 text-xs font-medium text-emerald-500">Success Rate: 0.0%</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl bg-card p-5 shadow-sm border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Pending</h3>
                <p className="text-xs text-muted-foreground">Menunggu bayar</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="mt-1 text-xs font-medium text-amber-500">Rp 0</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl bg-card p-5 shadow-sm border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Failed</h3>
                <p className="text-xs text-muted-foreground">Transaksi gagal</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="mt-1 text-xs font-medium text-rose-500">Failed + Cancelled</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="rounded-2xl bg-card p-5 shadow-sm border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Avg Order</h3>
                <p className="text-xs text-muted-foreground">Rata-rata nilai</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">Rp 0</p>
              <p className="mt-1 text-xs font-medium text-blue-500">Per transaction</p>
            </div>
          </motion.div>
        </div>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card shadow-sm border border-border"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <select className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-4 py-2 pr-10 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all">
              <option value="30d">30 Hari</option>
              <option value="7d">7 Hari</option>
              <option value="today">Hari Ini</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </motion.div>

        {/* Transaction History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="rounded-2xl bg-card shadow-sm border border-border overflow-hidden flex flex-col min-h-[400px]"
        >
          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
                <p className="text-sm text-muted-foreground">Menampilkan 1-0 dari 0 transaksi</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Tampilkan:</span>
              <div className="relative">
                <select className="h-8 appearance-none rounded-md border border-border bg-background px-2 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <span>per halaman</span>
            </div>
          </div>

          {/* Table Content - Headers */}
          <div className="overflow-x-auto border-b border-border">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Transaction</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Payment</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
              <CreditCard className="h-8 w-8 opacity-75" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Tidak ada transaksi ditemukan
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Belum ada transaksi. Transaksi akan muncul setelah ada order dari bot.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
