"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Package,
  Layers,
  ClipboardList,
  ShoppingCart,
  Wallet,
  Users,
  Megaphone,
  BarChart,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

// Menu configuration
const menuItems = [
  { isHeader: true, title: "Dashboard" },
  {
    title: "Overview",
    href: "/user",
    icon: LayoutDashboard,
  },
  { isHeader: true, title: "Toko" },
  {
    title: "Bot Settings",
    href: "/user/chatbot",
    icon: Bot,
  },
  {
    title: "Products",
    href: "/user/products",
    icon: Package,
  },
  {
    title: "Variants Products",
    href: "/user/products/variants",
    icon: Layers,
  },
  {
    title: "Kelola Stok",
    href: "/user/stok",
    icon: ClipboardList,
  },
  { isHeader: true, title: "Transaksi" },
  {
    title: "Orders",
    href: "/user/orders",
    icon: ShoppingCart,
  },
  {
    title: "Withdrawals",
    href: "/user/withdrawals",
    icon: Wallet,
  },
  { isHeader: true, title: "Marketing" },
  {
    title: "Customers",
    href: "/user/customers",
    icon: Users,
  },
  {
    title: "Broadcast",
    href: "/user/wa-blast",
    icon: Megaphone,
  },
  {
    title: "Analytics",
    href: "/user/analitik",
    icon: BarChart,
  },
  { isHeader: true, title: "Akun" },
  {
    title: "Subscription",
    href: "/user/subscription",
    icon: CreditCard,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-md text-slate-300 hover:text-white shadow-lg focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">
            Whiizi<span className="text-emerald-500">.</span>
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)] py-4 px-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li
                    key={index}
                    className="mt-6 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {item.title}
                  </li>
                );
              }

              const isActive =
                pathname === item.href ||
                (item.href !== "/user" &&
                  pathname?.startsWith(item.href || ""));
              const Icon = item.icon;

              return (
                <li key={index}>
                  <Link
                    href={item.href || "#"}
                    onClick={() => setIsOpen(false)} // Close on mobile click
                    className={`flex items-center p-2 rounded-lg group transition-colors duration-200 ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 transition duration-75 ${
                          isActive
                            ? "text-emerald-500"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                    )}
                    <span className="ml-3 text-sm font-medium">
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
