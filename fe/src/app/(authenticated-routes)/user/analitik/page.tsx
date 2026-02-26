"use client";

import { motion } from "motion/react";
import {
  HelpCircle,
  Download,
  Filter,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ChevronDown,
  Activity,
  ArrowUpRight,
  LineChart
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="w-full bg-transparent text-foreground min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analisis mendalam performa toko digital Anda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="h-10 appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all">
                <option value="7d">7 Hari Terakhir</option>
                <option value="30d">30 Hari Terakhir</option>
                <option value="90d">90 Hari Terakhir</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4" />
              Tutorial
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-4 py-2 text-sm font-medium transition-colors border border-blue-500/20">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-4 py-2 text-sm font-medium transition-colors border border-emerald-500/20">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Top Stats - 4 Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span>+0.0%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <p className="mt-1 text-3xl font-bold text-foreground">Rp 0</p>
              <p className="mt-1 text-xs text-muted-foreground">vs periode sebelumnya</p>
            </div>
          </motion.div>

          {/* Total Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <span>+0.0%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
              <p className="mt-1 text-3xl font-bold text-foreground">0</p>
              <p className="mt-1 text-xs text-muted-foreground">7 hari terakhir</p>
            </div>
          </motion.div>

          {/* Total Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <span>+0.0%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Customers</h3>
              <p className="mt-1 text-3xl font-bold text-foreground">0</p>
              <p className="mt-1 text-xs text-muted-foreground">Customer unik</p>
            </div>
          </motion.div>

          {/* Average Order Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Activity className="h-6 w-6" />
              </div>
              <div className="flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <span>AOV</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
              <p className="mt-1 text-3xl font-bold text-foreground">Rp 0</p>
              <p className="mt-1 text-xs text-muted-foreground">Rata-rata per order</p>
            </div>
          </motion.div>
        </div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[300px] flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground">Tren pendapatan 7 hari terakhir</p>
            </div>
            <div className="flex items-center gap-2 bg-background p-1 rounded-xl border border-border">
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-500/10 text-blue-500 transition-colors">Revenue</button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">Orders</button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">Customers</button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Belum ada data untuk periode ini</p>
          </div>
        </motion.div>

        {/* Grid: Top Products & Bot Performance */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[250px] flex flex-col"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Products</h2>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Belum ada data produk</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[250px] flex flex-col"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Bot Performance</h2>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Belum ada data bot</p>
            </div>
          </motion.div>
        </div>

        {/* Customer Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Customer Insights</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Customer Growth */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Customer Growth</p>
                <div className="flex items-center text-emerald-500 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +0.0%
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">+0.0%</p>
            </div>

            {/* Avg Order Value (repeat) */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <div className="flex items-center text-emerald-500 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +0.0%
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">Rp 0</p>
            </div>

            {/* Orders Growth */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Orders Growth</p>
                <div className="flex items-center text-emerald-500 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +0.0%
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">+0.0%</p>
            </div>

            {/* Revenue Growth */}
            <div className="rounded-xl border border-border bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <div className="flex items-center text-emerald-500 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  +0.0%
                </div>
              </div>
              <p className="text-xl font-bold text-foreground">+0.0%</p>
            </div>
          </div>
        </motion.div>

        {/* Real-time Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="rounded-2xl bg-card p-6 shadow-sm border border-border min-h-[300px] flex flex-col"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Real-time Activity</h2>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <LineChart className="h-12 w-12 text-muted-foreground mb-4 opacity-50" strokeWidth={1.5} />
            <h3 className="text-base font-medium text-muted-foreground mb-1">
              Belum ada aktivitas dalam 24 jam terakhir
            </h3>
            <p className="text-sm text-muted-foreground/75 max-w-sm">
              Aktivitas akan muncul saat ada interaksi dengan bot atau transaksi
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
