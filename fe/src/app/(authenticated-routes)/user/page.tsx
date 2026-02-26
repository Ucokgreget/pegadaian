"use client";

import { Wallet, ShoppingCart, TrendingUp, Users } from "lucide-react";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { BotStatusCard } from "@/components/dashboard/BotStatusCard";
import { UsageLimitCard } from "@/components/dashboard/UsageLimitCard";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";

// Dummy Mock Data
const dashboardData = {
  totalRevenue: 3131021000,
  revenueChange: 0.4,
  totalOrders: 18221,
  ordersChange: 11,
  activeCustomers: 862,
  customerChange: -8,
  responseRate: 98,
  subscription: {
    planName: "Premium",
    price: 300000,
    renewalDate: "Oct 24, 2026",
    isActive: true,
  },
  botStatus: true,
  lastActive: "Just now",
  usage: {
    monthlyLimit: 10000,
    used: 8450,
  },
  revenueHistory: [
    { date: "Mon", revenue: 400000, orders: 120 },
    { date: "Tue", revenue: 300000, orders: 98 },
    { date: "Wed", revenue: 550000, orders: 154 },
    { date: "Thu", revenue: 450000, orders: 132 },
    { date: "Fri", revenue: 700000, orders: 198 },
    { date: "Sat", revenue: 650000, orders: 180 },
    { date: "Sun", revenue: 800000, orders: 240 },
  ],
  transactions: [
    { id: "INV-3042", customerName: "Danny Liu", amount: 374310, status: "Success", date: "Today, 14:32" },
    { id: "INV-3041", customerName: "Bella Deviant", amount: 304230, status: "Success", date: "Today, 12:15" },
    { id: "INV-3040", customerName: "Darrel Steward", amount: 285490, status: "Pending", date: "Yesterday, 09:44" },
    { id: "INV-3039", customerName: "Guy Hawkins", amount: 154200, status: "Failed", date: "Yesterday, 08:21" },
    { id: "INV-3038", customerName: "Natanyel Donovan", amount: 420500, status: "Success", date: "Feb 23, 16:50" },
  ] as any,
};

export default function UserDashboard() {
  return (
    <div className="w-full bg-transparent text-foreground min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header Section for Dashboard Content */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pantau ringkasan performa dan metrik utama Anda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6 mt-6">
          {/* Top Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Revenue" value={`Rp ${(dashboardData.totalRevenue / 1000000).toFixed(1)}M`} change={dashboardData.revenueChange} icon={Wallet} delay={0.1} />
            <StatsCard title="Total Pesanan" value={dashboardData.totalOrders.toLocaleString()} change={dashboardData.ordersChange} icon={ShoppingCart} delay={0.2} />
            <StatsCard title="Active Customers" value={dashboardData.activeCustomers.toLocaleString()} change={dashboardData.customerChange} subtext="Last 30 days" icon={Users} delay={0.3} />
            <StatsCard title="Bot Response Rate" value={`${dashboardData.responseRate}%`} change={2} icon={TrendingUp} delay={0.4} />
          </div>

          {/* Middle Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={dashboardData.revenueHistory} />
            </div>
            <div className="lg:col-span-1">
              <SubscriptionCard planName={dashboardData.subscription.planName} price={dashboardData.subscription.price} renewalDate={dashboardData.subscription.renewalDate} isActive={dashboardData.subscription.isActive} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <BotStatusCard isActive={dashboardData.botStatus} lastActive={dashboardData.lastActive} />
              <UsageLimitCard monthlyLimit={dashboardData.usage.monthlyLimit} used={dashboardData.usage.used} />
            </div>
            <div className="lg:col-span-2">
              <RecentTransactionsTable transactions={dashboardData.transactions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
