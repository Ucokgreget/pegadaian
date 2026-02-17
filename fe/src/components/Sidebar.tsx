"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import {
  LayoutDashboard,
  Bot,
  Package,
  Layers,
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
    href: "/user/variants",
    icon: Layers,
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
    href: "/user/subscription/history",
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
        className="md:hidden fixed top-3 left-4 z-50 p-2 bg-background border border-border rounded-md text-muted-foreground hover:text-foreground shadow-lg focus:outline-none"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
          <span className="text-xl font-bold text-sidebar-foreground tracking-tight">
            Zaptify<span className="text-sidebar-primary">.</span>
          </span>
          <div className="flex md:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
            <ul className="space-y-1">
              {menuItems.map((item, index) => {
                if (item.isHeader) {
                  return (
                    <li
                      key={index}
                      className="mt-6 mb-2 px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider"
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
                      className={`flex items-center p-2 rounded-lg group transition-colors duration-200 ${isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                    >
                      {Icon && (
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 transition duration-75 ${isActive
                            ? "text-sidebar-primary"
                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
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

          <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Theme</div>
            <ThemeToggle />
          </div>
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

