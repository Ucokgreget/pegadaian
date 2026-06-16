"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../../../ui/theme-toggle";
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
  ChevronLeft,
  Menu,
  X,
  ReceiptIcon,
  Book,
  ClipboardList,
  QrCode,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { title } from "process";

// ─── Menu config ──────────────────────────────────────────────────────────────

const menuItems = [
  // { isHeader: true, title: "Dashboard" },
  // { title: "Overview", href: "/user", icon: LayoutDashboard },
  { isHeader: true, title: "Toko" },
  { title: "Bot Settings", href: "/user/chatbot", icon: Bot },
  { title: "Knowledge Setting", href: "/user/knowledge", icon: Book },
  { title: "Products", href: "/user/products", icon: Package },
  { title: "Variants Products", href: "/user/variants", icon: Layers },
  {
    title: "Form Checkout",
    href: "/user/checkout-fields",
    icon: ClipboardList,
  },
  { isHeader: true, title: "Transaksi" },
  { title: "Orders", href: "/user/orders", icon: ShoppingCart },
  { title: "Metode Pembayaran", href: "/user/payment-method", icon: QrCode },
  { title: "Withdrawals", href: "/user/withdrawals", icon: Wallet },
  { isHeader: true, title: "Marketing" },
  { title: "Customers", href: "/user/customers", icon: Users },
  // { title: "Broadcast", href: "/user/wa-blast", icon: Megaphone },
  { title: "Analytics", href: "/user/analitik", icon: BarChart },
  { isHeader: true, title: "Akun" },
  {
    title: "Subscription",
    href: "/user/subscription/history",
    icon: CreditCard,
  },
  // {
  //   title: "Invoice",
  //   href: "/user/invoice",
  //   icon: ReceiptIcon,
  // },
];

// ─── WhatsApp SVG (fallback logo) ─────────────────────────────────────────────

function WhatsAppSVG() {
  return (
    <svg
      className="w-[18px] h-[18px] fill-white"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Compose sidebar class names
  const sidebarClass = [
    "fixed top-0 left-0 z-40 h-screen bg-background border-r border-border shadow-[4px_0_16px_rgba(0,0,0,0.06),1px_0_0_rgba(34,197,94,0.06)] flex flex-col overflow-hidden font-jakarta transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] before:absolute before:inset-x-0 before:top-0 before:h-[180px] before:bg-[radial-gradient(ellipse_100%_100%_at_50%_0%,rgba(34,197,94,0.07)_0%,transparent_70%)] before:pointer-events-none before:z-0 md:translate-x-0",
    collapsed ? "w-[68px]" : "w-[256px]",
    mobileOpen
      ? "translate-x-0 !w-[256px]"
      : "max-md:-translate-x-full max-md:!w-[256px]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 flex md:hidden w-10 h-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:text-green-500 hover:border-green-500/20 hover:bg-green-500/10"
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Sidebar ── */}
      <aside className={sidebarClass}>
        {/* Header / Logo */}
        <div className="relative z-10 flex items-center justify-between h-16 px-4 border-b border-border shrink-0 gap-2">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <Image
              src="/logo-web.png"
              alt="Sijaka.id"
              width={1000}
              height={1000}
              className={`h-auto w-full rounded-md object-contain shrink-0 transition-all duration-300 ease-in-out ${collapsed ? "max-w-[36px] object-cover object-left opacity-80" : "max-w-[200px] opacity-100"}`}
              onError={(e) => {
                // Hide broken image, show fallback via CSS sibling
                (e.target as HTMLImageElement).style.display = "none";
                const next = (e.target as HTMLImageElement)
                  .nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "flex";
              }}
            />
            {/* Fallback icon — hidden by default, shown if image fails */}
            <div
              className={`rounded-[10px] bg-gradient-to-br from-green-500 to-green-600 items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(34,197,94,0.3)] transition-all duration-300 ${collapsed ? "w-9 h-9" : "w-9 h-9"}`}
              style={{ display: "none" }}
            >
              <WhatsAppSVG />
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            className="shrink-0 w-7 h-7 rounded-lg border border-border bg-background text-muted-foreground hidden md:flex items-center justify-center cursor-pointer transition-all duration-200 hover:text-green-500 hover:border-green-500/20 hover:bg-green-500/10"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/80">
          <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
            {menuItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={index}>
                    <div
                      className={`px-2.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "opacity-0 max-h-0 m-0" : "opacity-100 max-h-8 mt-5 mb-1.5"} ${index === 0 ? "!mt-0" : ""}`}
                    >
                      {item.title}
                    </div>
                  </li>
                );
              }

              const isActive =
                pathname === item.href ||
                (item.href !== "/user" &&
                  pathname?.startsWith(item.href ?? ""));
              const Icon = item.icon!;

              return (
                <li key={index} className="relative group/item">
                  <Link
                    href={item.href ?? "#"}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-muted-foreground transition-all duration-200 whitespace-nowrap overflow-hidden relative group/link hover:bg-green-500/10 hover:text-foreground ${isActive ? "bg-green-500/10 text-foreground before:absolute before:left-0 before:top-[20%] before:bottom-[20%] before:w-[3px] before:rounded-r-[3px] before:bg-green-500" : ""}`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 group-hover/link:text-green-500 ${isActive ? "text-green-500" : ""}`}
                    />
                    <span
                      className={`text-[0.8375rem] font-medium flex-1 overflow-hidden transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"}`}
                    >
                      {item.title}
                    </span>
                    {isActive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}
                      />
                    )}
                  </Link>

                  {/* Tooltip shown only when collapsed */}
                  {collapsed && (
                    <div className="absolute left-[calc(68px+8px)] top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none opacity-0 transition-opacity duration-150 z-[100] shadow-[0_4px_12px_rgba(0,0,0,0.15)] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-foreground group-hover/item:opacity-100">
                      {item.title}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — theme toggle */}
        <div className="relative z-10 border-t border-border py-3 px-4 flex items-center justify-between shrink-0 gap-2 overflow-hidden">
          <span
            className={`text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[80px] opacity-100"}`}
          >
            Tema
          </span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[4px] animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
