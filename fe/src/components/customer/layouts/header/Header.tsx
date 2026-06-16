"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Settings, LogOut, House, ChevronRight } from "lucide-react";
import { User } from "@/types/Auth";

interface UserNavbarProps {
  user?: User | null;
}

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    text: "Pesanan baru masuk dari pelanggan Budi.",
    time: "2 menit lalu",
    read: false,
  },
  {
    id: "2",
    text: "Pembayaran berhasil dikonfirmasi otomatis.",
    time: "15 menit lalu",
    read: false,
  },
  {
    id: "3",
    text: "Bot WhatsApp kamu berhasil mengirim 48 pesan.",
    time: "1 jam lalu",
    read: true,
  },
  {
    id: "4",
    text: "Langganan kamu akan berakhir dalam 3 hari.",
    time: "Kemarin",
    read: true,
  },
];

// Map segment → label yang tampil di breadcrumb
const SEGMENT_LABELS: Record<string, string> = {
  user: "Dashboard",
  admin: "Admin",
  invoice: "Invoice",
  checkout: "Checkout",
  profile: "Profil",
  subscription: "Langganan",
  history: "Riwayat",
  packages: "Paket",
  promo: "Promo",
  features: "Fitur",
  settings: "Pengaturan",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];

  segments.forEach((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // Kalau segment adalah angka (dynamic id) — skip atau tampil sebagai "Detail"
    const isId = /^\d+$/.test(seg);
    const label = isId
      ? "Detail"
      : SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href, isLast: i === segments.length - 1 });
  });

  return crumbs;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function NotifDropdown({
  notifications,
  onMarkAll,
  onClose,
}: {
  notifications: Notification[];
  onMarkAll: () => void;
  onClose: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      <div className="absolute top-[calc(100%+10px)] right-0 min-w-[300px] max-sm:min-w-0 max-sm:w-[calc(100vw-2rem)] max-sm:-right-2 rounded-2xl border border-border bg-card shadow-[0_4px_6px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.18),0_0_0_1px_rgba(34,197,94,0.08)] overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200 origin-top-right before:absolute before:-top-[5px] before:right-3.5 before:w-2.5 before:h-2.5 before:bg-card before:border-l before:border-t before:border-border before:rotate-45 before:rounded-sm">
        <div className="flex items-center justify-between pt-3.5 px-4 pb-2.5 border-b border-border">
          <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
            Notifikasi
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-green-500 text-white text-[0.65rem] font-bold">
                {unreadCount}
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <button
              className="text-[0.72rem] font-semibold text-green-500 bg-transparent border-none cursor-pointer p-0 font-jakarta hover:text-green-600"
              onClick={onMarkAll}
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center text-sm text-muted-foreground">
              <div className="text-2xl mb-2">🔔</div>
              <div>Tidak ada notifikasi</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 border-b border-border/50 transition-colors duration-150 cursor-pointer last:border-none hover:bg-green-500/10 ${!n.read ? "bg-green-500/5" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5 ${n.read ? "bg-border" : ""}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-medium text-foreground leading-snug">
                    {n.text}
                  </div>
                  <div className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {n.time}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t border-border">
          <button
            className="w-full p-2 rounded-lg bg-transparent font-jakarta text-[0.8rem] font-semibold text-green-500 cursor-pointer transition-colors duration-150 hover:bg-green-500/10"
            onClick={onClose}
          >
            Lihat semua notifikasi →
          </button>
        </div>
      </div>
    </>
  );
}

import { logout } from "@/actions/auth";

function ProfileDropdown({
  user,
  onClose,
}: {
  user?: User | null;
  onClose: () => void;
}) {
  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.status) window.location.href = "/login";
      else alert("Logout gagal! Silakan coba lagi.");
    } catch (err) {
      console.error("Error saat logout:", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      <div className="absolute top-[calc(100%+10px)] right-0 min-w-[240px] max-sm:min-w-0 max-sm:w-[220px] rounded-2xl border border-border bg-card shadow-[0_4px_6px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.18),0_0_0_1px_rgba(34,197,94,0.08)] overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200 origin-top-right before:absolute before:-top-[5px] before:right-3.5 before:w-2.5 before:h-2.5 before:bg-card before:border-l before:border-t before:border-border before:rotate-45 before:rounded-sm">
        <div className="pt-4 px-4 pb-3 flex items-center gap-3 border-b border-border">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-[1.1rem] font-bold text-white shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.name || "User"}
            </div>
            <div className="text-[0.7rem] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis mt-[1px]">
              {user?.email || "-"}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <div className="inline-flex items-center rounded-full bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 text-[0.62rem] font-bold text-slate-500 uppercase tracking-[0.06em]">
                {user?.role === "ADMIN" ? "Admin" : "Member"}
              </div>
              <div className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[0.62rem] font-bold text-green-500 uppercase tracking-[0.06em]">
                {user?.activePackageName || "Free"}
              </div>
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <Link
            href="/user/profile"
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg border-none bg-transparent cursor-pointer font-jakarta text-[0.8375rem] font-medium text-foreground no-underline transition-colors duration-150 text-left hover:bg-green-500/10 group"
            onClick={onClose}
          >
            <Settings className="w-4 h-4 text-muted-foreground shrink-0 transition-colors duration-150 group-hover:text-green-500" />
            Pengaturan Profil
          </Link>
          <Link
            href="/"
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg border-none bg-transparent cursor-pointer font-jakarta text-[0.8375rem] font-medium text-foreground no-underline transition-colors duration-150 text-left hover:bg-green-500/10 group"
            onClick={onClose}
          >
            <House className="w-4 h-4 text-muted-foreground shrink-0 transition-colors duration-150 group-hover:text-green-500" />
            Beranda
          </Link>
          <div className="h-[1px] bg-border my-1 mx-1.5" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg border-none bg-transparent cursor-pointer font-jakarta text-[0.8375rem] font-medium text-destructive no-underline transition-colors duration-150 text-left hover:bg-destructive/10 group"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-colors duration-150 text-destructive group-hover:text-destructive" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}

export function UserNavbar({ user }: UserNavbarProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const crumbs = buildBreadcrumbs(pathname);

  const handleMarkAll = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  };
  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-[39] h-16 flex items-center justify-between px-5 md:px-6 bg-background/92 border-b border-border backdrop-blur-md shadow-[0_1px_0_rgba(34,197,94,0.05),0_2px_8px_rgba(0,0,0,0.04)] font-jakarta gap-4 max-sm:px-4">
      {/* Left: breadcrumb */}
      <nav
        className="flex items-center gap-0 flex-1 min-w-0 overflow-hidden"
        aria-label="Breadcrumb"
      >
        {crumbs.map((crumb, i) => (
          <span
            key={crumb.href}
            className="flex items-center gap-0 min-w-0 shrink-0 last:shrink last:min-w-0 max-sm:[&:not(:first-child):not(:last-child):not(:nth-last-child(2))]:hidden"
          >
            {i > 0 && (
              <ChevronRight className="w-[0.85rem] h-[0.85rem] text-muted-foreground opacity-20 shrink-0 mx-0.5" />
            )}
            {crumb.isLast ? (
              <span className="text-sm font-bold text-foreground px-1.5 py-1 whitespace-nowrap overflow-hidden text-ellipsis tracking-[-0.01em]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-[0.8rem] font-medium text-muted-foreground no-underline px-1.5 py-1 rounded-md transition-colors duration-150 whitespace-nowrap hover:text-foreground hover:bg-green-500/10"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <div className="relative">
          <button
            className="relative w-[38px] h-[38px] rounded-full border border-border bg-background text-muted-foreground flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 hover:border-green-500/20 hover:bg-green-500/10 hover:text-green-500 [&>svg]:w-[17px] [&>svg]:h-[17px]"
            onClick={toggleNotif}
            aria-label="Notifikasi"
          >
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute top-[5px] right-[5px] w-2 h-2 rounded-full bg-green-500 border-2 border-background animate-pulse shadow-[0_0_0_0_rgba(34,197,94,0.4)]" />
            )}
          </button>
          {notifOpen && (
            <NotifDropdown
              notifications={notifications}
              onMarkAll={handleMarkAll}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        <div className="relative">
          <button
            className={`relative w-[38px] h-[38px] rounded-full ring-2 transition-all duration-200 shrink-0 p-0 overflow-hidden flex items-center justify-center hover:scale-105 hover:ring-green-500/20 ${profileOpen ? "ring-green-500/25 scale-105" : "ring-transparent"}`}
            onClick={toggleProfile}
            aria-label="Menu profil"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-sm font-bold text-white tracking-[-0.01em]">
              {getInitials(user?.name)}
            </div>
          </button>
          {profileOpen && (
            <ProfileDropdown
              user={user}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
