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
} from "lucide-react";
import s from "./Sidebar.module.css";
import { useSidebar } from "./SidebarContext";

// ─── Menu config ──────────────────────────────────────────────────────────────

const menuItems = [
  { isHeader: true, title: "Dashboard" },
  { title: "Overview", href: "/user", icon: LayoutDashboard },
  { isHeader: true, title: "Toko" },
  { title: "Bot Settings", href: "/user/chatbot", icon: Bot },
  { title: "Products", href: "/user/products", icon: Package },
  { title: "Variants Products", href: "/user/variants", icon: Layers },
  { isHeader: true, title: "Transaksi" },
  { title: "Orders", href: "/user/orders", icon: ShoppingCart },
  { title: "Withdrawals", href: "/user/withdrawals", icon: Wallet },
  { isHeader: true, title: "Marketing" },
  { title: "Customers", href: "/user/customers", icon: Users },
  { title: "Broadcast", href: "/user/wa-blast", icon: Megaphone },
  { title: "Analytics", href: "/user/analitik", icon: BarChart },
  { isHeader: true, title: "Akun" },
  {
    title: "Subscription",
    href: "/user/subscription/history",
    icon: CreditCard,
  },
  {
    title: "Invoice",
    href: "/user/invoice",
    icon: ReceiptIcon,
  },
];

// ─── WhatsApp SVG (fallback logo) ─────────────────────────────────────────────

function WhatsAppSVG() {
  return (
    <svg
      className={s.logoFallbackSvg}
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
    s.sidebar,
    collapsed ? s.collapsed : "",
    mobileOpen ? s.mobileOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className={s.mobileToggle}
        aria-label="Toggle Sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ── Sidebar ── */}
      <aside className={sidebarClass}>
        {/* Header / Logo */}
        <div className={s.header}>
          <div className={s.logoWrap}>
            <Image
              src="https://cdn.aceimg.com/92020e260.png"
              alt="Sijaka.id"
              width={1080}
              height={1080}
              className={s.logoImg}
              onError={(e) => {
                // Hide broken image, show fallback via CSS sibling
                (e.target as HTMLImageElement).style.display = "none";
                const next = (e.target as HTMLImageElement)
                  .nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "flex";
              }}
            />
            {/* Fallback icon — hidden by default, shown if image fails */}
            <div className={s.logoFallback} style={{ display: "none" }}>
              <WhatsAppSVG />
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            className={s.collapseBtn}
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={s.collapseBtnIcon} />
          </button>
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          <ul className={s.navList}>
            {menuItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={index}>
                    <div className={s.sectionHeader}>{item.title}</div>
                  </li>
                );
              }

              const isActive =
                pathname === item.href ||
                (item.href !== "/user" &&
                  pathname?.startsWith(item.href ?? ""));
              const Icon = item.icon!;

              return (
                <li key={index} className={s.navItem}>
                  <Link
                    href={item.href ?? "#"}
                    onClick={() => setMobileOpen(false)}
                    className={[s.navLink, isActive ? s.navLinkActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Icon className={s.navIcon} />
                    <span className={s.navLabel}>{item.title}</span>
                    {isActive && <span className={s.activeDot} />}
                  </Link>

                  {/* Tooltip shown only when collapsed */}
                  <div className={s.navTooltip}>{item.title}</div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer — theme toggle */}
        <div className={s.footer}>
          <span className={s.footerLabel}>Tema</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={s.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
